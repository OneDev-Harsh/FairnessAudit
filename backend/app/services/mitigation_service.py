"""
Mitigation service: Reweighing + Fairlearn ExponentiatedGradient.
"""
import pandas as pd
import numpy as np
import logging
from typing import List, Optional, Dict, Any, Tuple

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score

from fairlearn.reductions import ExponentiatedGradient, DemographicParity, EqualizedOdds
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference

from app.models.schemas import (
    FairnessMetrics, MitigationResult, MitigationResponse, BiasSeverity
)
from app.services.fairness_service import (
    _encode_binary, _build_group_metrics, _get_severity,
    _fairness_score_from_metrics, _build_explanation
)

logger = logging.getLogger(__name__)

MAX_ROWS_MITIGATION = 5000


def _build_preprocessor_for_mitigation(df: pd.DataFrame, feature_cols: List[str]):
    numeric_cols = df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [c for c in feature_cols if c not in numeric_cols]

    transformers = []
    if numeric_cols:
        transformers.append(("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]), numeric_cols))
    if categorical_cols:
        transformers.append(("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]), categorical_cols))

    return ColumnTransformer(transformers, remainder="drop")


def _compute_metrics_from_predictions(
    df: pd.DataFrame, y_true: pd.Series, y_pred: np.ndarray, sensitive_cols: List[str]
) -> Tuple[List[FairnessMetrics], float]:
    y_pred_series = pd.Series(y_pred, index=y_true.index)
    accuracy = float(accuracy_score(y_true, y_pred_series))
    metrics = []

    for sens_col in sensitive_cols:
        if sens_col not in df.columns:
            continue
        valid_idx = df[sens_col].notna() & y_true.notna()
        df_v = df[valid_idx]
        yt = y_true[valid_idx]
        yp = y_pred_series[valid_idx]

        group_metrics = _build_group_metrics(df_v, sens_col, yt, yp)
        sel_rates = [g.selection_rate for g in group_metrics]
        tprs = [g.true_positive_rate for g in group_metrics if g.true_positive_rate is not None]
        fprs = [g.false_positive_rate for g in group_metrics if g.false_positive_rate is not None]

        dpd = round(max(sel_rates) - min(sel_rates), 4) if len(sel_rates) >= 2 else None
        dpr = None
        if dpd is not None and max(sel_rates) > 0:
            dpr = round(min(sel_rates) / max(sel_rates), 4)

        eqod = None
        if len(tprs) >= 2 and len(fprs) >= 2:
            eqod = round(max(max(tprs) - min(tprs), max(fprs) - min(fprs)), 4)

        eod = round(max(tprs) - min(tprs), 4) if len(tprs) >= 2 else None

        max_gap = max(abs(dpd or 0), abs(eod or 0), abs(eqod or 0))
        severity = _get_severity(max_gap)
        fairness_score = _fairness_score_from_metrics(dpd, eod, eqod)
        explanation = _build_explanation(sens_col, dpd, dpr, eod, eqod, group_metrics, severity)

        metrics.append(FairnessMetrics(
            sensitive_column=sens_col,
            demographic_parity_difference=dpd,
            demographic_parity_ratio=dpr,
            equalized_odds_difference=eqod,
            equal_opportunity_difference=eod,
            overall_accuracy=accuracy,
            group_metrics=group_metrics,
            bias_severity=severity,
            fairness_score=fairness_score,
            explanation=explanation,
        ))

    return metrics, accuracy


def _compute_sample_weights_reweighing(
    df: pd.DataFrame, y: pd.Series, sensitive_col: str
) -> np.ndarray:
    """Compute reweighing sample weights to equalize group/label distributions."""
    weights = np.ones(len(df))
    n = len(df)
    if sensitive_col not in df.columns:
        return weights

    for grp_val in df[sensitive_col].dropna().unique():
        for label in [0, 1]:
            mask = (df[sensitive_col] == grp_val) & (y == label)
            count = mask.sum()
            if count == 0:
                continue
            grp_count = (df[sensitive_col] == grp_val).sum()
            label_count = (y == label).sum()
            expected = (grp_count / n) * (label_count / n) * n
            w = expected / max(count, 1)
            weights[mask] = w

    return weights


def run_mitigation(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: List[str],
    sensitive_cols: List[str],
    methods: List[str],
    positive_label=None,
) -> MitigationResponse:
    # Subsample for speed
    if len(df) > MAX_ROWS_MITIGATION:
        df = df.sample(MAX_ROWS_MITIGATION, random_state=42).reset_index(drop=True)
        logger.info(f"Subsampled dataset to {MAX_ROWS_MITIGATION} rows for mitigation.")

    valid_features = [c for c in feature_cols if c in df.columns]
    if not valid_features:
        raise ValueError("No valid feature columns found for mitigation.")

    y_encoded, pos_label = _encode_binary(df[target_col], positive_label)
    y = y_encoded

    preprocessor = _build_preprocessor_for_mitigation(df, valid_features)
    try:
        X_transformed = preprocessor.fit_transform(df[valid_features])
    except Exception as e:
        raise ValueError(f"Feature preprocessing failed: {str(e)}")

    # Baseline model predictions (before mitigation)
    baseline_model = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)
    baseline_model.fit(X_transformed, y)
    y_pred_baseline = baseline_model.predict(X_transformed)
    before_metrics, before_accuracy = _compute_metrics_from_predictions(
        df, y, y_pred_baseline, sensitive_cols
    )

    results = []

    # ── Method 1: Reweighing ──────────────────────────────────────────────
    if "reweighing" in methods:
        try:
            # Compute weights based on first sensitive column
            primary_sensitive = sensitive_cols[0] if sensitive_cols else None
            if primary_sensitive and primary_sensitive in df.columns:
                weights = _compute_sample_weights_reweighing(df, y, primary_sensitive)
            else:
                weights = np.ones(len(df))

            rw_model = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)
            rw_model.fit(X_transformed, y, sample_weight=weights)
            y_pred_rw = rw_model.predict(X_transformed)

            after_metrics_rw, after_accuracy_rw = _compute_metrics_from_predictions(
                df, y, y_pred_rw, sensitive_cols
            )

            fs_before = np.mean([m.fairness_score for m in before_metrics]) if before_metrics else 50.0
            fs_after = np.mean([m.fairness_score for m in after_metrics_rw]) if after_metrics_rw else 50.0
            improvement = round(fs_after - fs_before, 2)

            acc_delta = round(after_accuracy_rw - before_accuracy, 4) if before_accuracy else None

            results.append(MitigationResult(
                method="reweighing",
                method_display_name="Reweighing (Pre-processing)",
                before_metrics=before_metrics,
                after_metrics=after_metrics_rw,
                before_accuracy=round(before_accuracy, 4),
                after_accuracy=round(after_accuracy_rw, 4),
                accuracy_delta=acc_delta,
                fairness_score_before=round(fs_before, 1),
                fairness_score_after=round(fs_after, 1),
                fairness_improvement=improvement,
                explanation=(
                    "Reweighing assigns higher weights to underrepresented group-label combinations "
                    "so the model learns from a more balanced distribution. "
                    "It modifies the training process without changing the original data."
                ),
                tradeoff_summary=(
                    f"Fairness improved by {improvement:+.1f} points. "
                    f"Accuracy changed by {acc_delta:+.4f}." if acc_delta else
                    f"Fairness improved by {improvement:+.1f} points."
                ),
            ))
        except Exception as e:
            logger.warning(f"Reweighing failed: {e}")
            results.append(MitigationResult(
                method="reweighing",
                method_display_name="Reweighing (Pre-processing)",
                before_metrics=before_metrics,
                after_metrics=before_metrics,
                before_accuracy=round(before_accuracy, 4),
                after_accuracy=round(before_accuracy, 4),
                accuracy_delta=0.0,
                fairness_score_before=round(np.mean([m.fairness_score for m in before_metrics]), 1),
                fairness_score_after=round(np.mean([m.fairness_score for m in before_metrics]), 1),
                fairness_improvement=0.0,
                explanation=f"Reweighing could not complete: {str(e)}",
                tradeoff_summary="Method failed. Consider using a different mitigation approach.",
            ))

    # ── Method 2: ExponentiatedGradient ──────────────────────────────────
    if "exponentiated_gradient" in methods:
        try:
            primary_sensitive = sensitive_cols[0] if sensitive_cols else None
            if primary_sensitive and primary_sensitive in df.columns:
                A = df[primary_sensitive].fillna("Unknown")
            else:
                A = pd.Series(["all"] * len(df))

            base_clf = LogisticRegression(max_iter=300, random_state=42)
            constraint = DemographicParity()
            mitigator = ExponentiatedGradient(
                estimator=base_clf,
                constraints=constraint,
                eps=0.02,
                max_iter=30,
            )
            mitigator.fit(X_transformed, y, sensitive_features=A)
            y_pred_eg = mitigator.predict(X_transformed)

            after_metrics_eg, after_accuracy_eg = _compute_metrics_from_predictions(
                df, y, y_pred_eg, sensitive_cols
            )

            fs_before = np.mean([m.fairness_score for m in before_metrics]) if before_metrics else 50.0
            fs_after = np.mean([m.fairness_score for m in after_metrics_eg]) if after_metrics_eg else 50.0
            improvement = round(fs_after - fs_before, 2)
            acc_delta = round(after_accuracy_eg - before_accuracy, 4) if before_accuracy else None

            results.append(MitigationResult(
                method="exponentiated_gradient",
                method_display_name="Exponentiated Gradient (In-processing)",
                before_metrics=before_metrics,
                after_metrics=after_metrics_eg,
                before_accuracy=round(before_accuracy, 4),
                after_accuracy=round(after_accuracy_eg, 4),
                accuracy_delta=acc_delta,
                fairness_score_before=round(fs_before, 1),
                fairness_score_after=round(fs_after, 1),
                fairness_improvement=improvement,
                explanation=(
                    "ExponentiatedGradient is an in-processing technique from Fairlearn that "
                    "directly optimizes the model to minimize fairness violations as a constraint "
                    "during training. It trades some accuracy for fairness guarantees."
                ),
                tradeoff_summary=(
                    f"Fairness improved by {improvement:+.1f} points. "
                    f"Accuracy changed by {acc_delta:+.4f}." if acc_delta else
                    f"Fairness improved by {improvement:+.1f} points."
                ),
            ))
        except Exception as e:
            logger.warning(f"ExponentiatedGradient failed: {e}")
            fs_before = round(np.mean([m.fairness_score for m in before_metrics]), 1) if before_metrics else 50.0
            results.append(MitigationResult(
                method="exponentiated_gradient",
                method_display_name="Exponentiated Gradient (In-processing)",
                before_metrics=before_metrics,
                after_metrics=before_metrics,
                before_accuracy=round(before_accuracy, 4),
                after_accuracy=round(before_accuracy, 4),
                accuracy_delta=0.0,
                fairness_score_before=fs_before,
                fairness_score_after=fs_before,
                fairness_improvement=0.0,
                explanation=f"ExponentiatedGradient could not complete: {str(e)}",
                tradeoff_summary="Method failed. Reweighing is recommended as a fallback.",
            ))

    # Pick best method
    best_result = max(results, key=lambda r: r.fairness_improvement) if results else None
    best_method = best_result.method if best_result else "reweighing"

    overall_rec = (
        f"The '{best_method.replace('_', ' ').title()}' method achieved the best fairness improvement. "
        "Both methods are effective; choose based on your deployment constraints. "
        "Reweighing is simpler and faster; ExponentiatedGradient provides stronger fairness guarantees."
    ) if results else "No mitigation results available."

    return MitigationResponse(
        session_id="mitigation",
        results=results,
        best_method=best_method,
        overall_recommendation=overall_rec,
    )

def get_mitigated_dataset(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: List[str],
    sensitive_cols: List[str],
    method: str,
    positive_label=None,
) -> pd.DataFrame:
    """Generate and return the dataset with mitigated predictions/weights."""
    valid_features = [c for c in feature_cols if c in df.columns]
    if not valid_features:
        raise ValueError("No valid feature columns found for mitigation.")

    y_encoded, pos_label = _encode_binary(df[target_col], positive_label)
    y = y_encoded

    preprocessor = _build_preprocessor_for_mitigation(df, valid_features)
    try:
        X_transformed = preprocessor.fit_transform(df[valid_features])
    except Exception as e:
        raise ValueError(f"Feature preprocessing failed: {str(e)}")
        
    df_out = df.copy()

    if method == "reweighing":
        primary_sensitive = sensitive_cols[0] if sensitive_cols else None
        if primary_sensitive and primary_sensitive in df.columns:
            weights = _compute_sample_weights_reweighing(df, y, primary_sensitive)
        else:
            weights = np.ones(len(df))
        df_out["mitigation_weight"] = weights

        rw_model = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)
        rw_model.fit(X_transformed, y, sample_weight=weights)
        df_out["mitigated_prediction"] = rw_model.predict(X_transformed)

    elif method == "exponentiated_gradient":
        primary_sensitive = sensitive_cols[0] if sensitive_cols else None
        if primary_sensitive and primary_sensitive in df.columns:
            A = df[primary_sensitive].fillna("Unknown")
        else:
            A = pd.Series(["all"] * len(df))

        base_clf = LogisticRegression(max_iter=300, random_state=42)
        constraint = DemographicParity()
        mitigator = ExponentiatedGradient(
            estimator=base_clf,
            constraints=constraint,
            eps=0.02,
            max_iter=30,
        )
        mitigator.fit(X_transformed, y, sensitive_features=A)
        df_out["mitigated_prediction"] = mitigator.predict(X_transformed)
    else:
        raise ValueError(f"Unknown mitigation method: {method}")

    # Map back encoded predictions to original labels if necessary
    # Assuming the original labels were numeric, but if they were string, we might need mapping back.
    # For simplicity, we just return the predictions as 0/1 matching the encoded target.
    
    return df_out

