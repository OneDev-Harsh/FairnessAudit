"""
Explainability service: SHAP-based feature importance and proxy detection.
"""
import pandas as pd
import numpy as np
import logging
from typing import List, Optional, Dict, Any, Union

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
import shap

from app.models.schemas import FeatureImportance, ExplainResponse
from app.services.fairness_service import _encode_binary

logger = logging.getLogger(__name__)

SHAP_SAMPLE_SIZE = 300  # max rows for SHAP background


def _build_preprocessor(df: pd.DataFrame, feature_cols: List[str]):
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

    return ColumnTransformer(transformers, remainder="drop"), numeric_cols, categorical_cols


def _train_model(X_transformed: np.ndarray, y: np.ndarray):
    clf = GradientBoostingClassifier(n_estimators=80, max_depth=3, random_state=42)
    clf.fit(X_transformed, y)
    return clf


def _get_feature_names(preprocessor, numeric_cols, categorical_cols, df, feature_cols):
    names = list(numeric_cols)
    if categorical_cols:
        ohe = preprocessor.named_transformers_.get("cat")
        if ohe:
            ohe_enc = ohe.named_steps["ohe"]
            cats = ohe_enc.get_feature_names_out(categorical_cols)
            names += list(cats)
    return names


def _compute_proxy_correlation(df: pd.DataFrame, feature_col: str,
                                 sensitive_cols: List[str]) -> float:
    """Compute max correlation between a feature and sensitive attributes."""
    max_corr = 0.0
    for sens in sensitive_cols:
        if sens not in df.columns:
            continue
        try:
            if pd.api.types.is_numeric_dtype(df[feature_col]) and pd.api.types.is_numeric_dtype(df[sens]):
                corr = abs(df[feature_col].corr(df[sens]))
            else:
                # Cramér's V via crosstab
                ct = pd.crosstab(df[feature_col].fillna("NA"), df[sens].fillna("NA"))
                chi2 = 0.0
                n = ct.sum().sum()
                expected = np.outer(ct.sum(axis=1), ct.sum(axis=0)) / n
                chi2 = ((ct.values - expected) ** 2 / (expected + 1e-9)).sum()
                k = min(ct.shape) - 1
                corr = np.sqrt(chi2 / (n * max(k, 1))) if n > 0 else 0.0
            max_corr = max(max_corr, float(corr) if not np.isnan(corr) else 0.0)
        except Exception:
            pass
    return round(max_corr, 4)


def compute_explanations(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: List[str],
    sensitive_cols: List[str],
    prediction_col: Optional[str] = None,
    positive_label=None,
) -> ExplainResponse:
    session_id = "explain"
    warnings = []

    if not feature_cols:
        return ExplainResponse(
            session_id=session_id,
            top_features=[],
            shap_values_summary=[],
            proxy_features=[],
            explanation_text="No feature columns specified for explainability.",
            model_type="none",
        )

    # Prepare data
    valid_cols = [c for c in feature_cols if c in df.columns]
    if not valid_cols:
        return ExplainResponse(
            session_id=session_id,
            top_features=[],
            shap_values_summary=[],
            proxy_features=[],
            explanation_text="None of the specified feature columns were found.",
            model_type="none",
        )

    y_raw = df[target_col].copy()
    y_encoded, pos_label = _encode_binary(y_raw, positive_label)
    y = y_encoded.values

    X = df[valid_cols].copy()

    # Build preprocessor
    preprocessor, numeric_cols, categorical_cols = _build_preprocessor(X, valid_cols)

    try:
        X_transformed = preprocessor.fit_transform(X)
    except Exception as e:
        logger.warning(f"Preprocessing failed: {e}")
        return ExplainResponse(
            session_id=session_id,
            top_features=[],
            shap_values_summary=[],
            proxy_features=[],
            explanation_text=f"Feature preprocessing failed: {str(e)}",
            model_type="none",
        )

    # Train model
    try:
        model = _train_model(X_transformed, y)
    except Exception as e:
        logger.warning(f"Model training failed: {e}")
        return ExplainResponse(
            session_id=session_id,
            top_features=[],
            shap_values_summary=[],
            proxy_features=[],
            explanation_text=f"Model training failed: {str(e)}",
            model_type="none",
        )

    # SHAP explanations
    try:
        sample_size = min(SHAP_SAMPLE_SIZE, X_transformed.shape[0])
        idx = np.random.RandomState(42).choice(X_transformed.shape[0], sample_size, replace=False)
        X_sample = X_transformed[idx]

        # Use background data for TreeExplainer
        bg_size = min(100, sample_size)
        bg_idx = np.random.RandomState(0).choice(X_sample.shape[0], bg_size, replace=False)
        X_bg = X_sample[bg_idx]

        explainer = shap.TreeExplainer(model, data=X_bg, feature_perturbation="interventional")
        shap_values = explainer.shap_values(X_sample)

        # For binary, use class 1 shap values
        if isinstance(shap_values, list) and len(shap_values) > 1:
            sv = shap_values[1]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            sv = shap_values[:, :, 1]
        else:
            sv = shap_values if isinstance(shap_values, np.ndarray) else np.array(shap_values)

        if sv.ndim == 1:
            sv = sv.reshape(1, -1)

        # Get feature names
        feature_names = _get_feature_names(preprocessor, numeric_cols, categorical_cols, X, valid_cols)

        # Aggregate OHE features back to original
        mean_abs_shap = np.abs(sv).mean(axis=0)
        agg_shap: Dict[str, float] = {}

        for i, fname in enumerate(feature_names):
            orig = fname
            for cat in categorical_cols:
                if fname.startswith(cat + "_"):
                    orig = cat
                    break
            agg_shap[orig] = agg_shap.get(orig, 0.0) + float(mean_abs_shap[i])

        # Sort by importance
        sorted_features = sorted(agg_shap.items(), key=lambda x: x[1], reverse=True)[:10]

    except Exception as e:
        logger.warning(f"SHAP computation failed: {e}, using feature importances instead")
        # Fallback to feature importances
        fi = model.feature_importances_
        feature_names_fb = _get_feature_names(preprocessor, numeric_cols, categorical_cols, X, valid_cols)
        agg_shap_fb: Dict[str, float] = {}
        for i, fname in enumerate(feature_names_fb):
            orig = fname
            for cat in categorical_cols:
                if fname.startswith(cat + "_"):
                    orig = cat
                    break
            agg_shap_fb[orig] = agg_shap_fb.get(orig, 0.0) + float(fi[i])
        sorted_features = sorted(agg_shap_fb.items(), key=lambda x: x[1], reverse=True)[:10]

    # Build feature importance list with proxy detection
    proxy_features = []
    top_features = []
    total_importance = sum(v for _, v in sorted_features) or 1.0

    for rank, (feat, importance) in enumerate(sorted_features):
        proxy_corr = _compute_proxy_correlation(df, feat, sensitive_cols)
        is_proxy = proxy_corr > 0.5 and feat not in sensitive_cols
        if is_proxy:
            proxy_features.append(feat)

        top_features.append(FeatureImportance(
            feature=feat,
            importance=round(importance / total_importance, 4),
            mean_abs_shap=round(importance, 4),
            is_proxy_warning=is_proxy,
            proxy_correlation=proxy_corr if proxy_corr > 0.3 else None,
        ))

    # Build explanation text
    top3 = [f.feature for f in top_features[:3]]
    explanation_parts = [
        f"The model's decisions are most influenced by: {', '.join(top3)}.",
    ]
    if proxy_features:
        explanation_parts.append(
            f"⚠️ Proxy feature warning: '{', '.join(proxy_features)}' may be acting as a "
            "hidden proxy for a sensitive attribute. Consider removing or de-biasing these features."
        )
    else:
        explanation_parts.append(
            "No strong proxy features detected between the top features and sensitive attributes."
        )
    explanation_parts.append(
        "SHAP values measure each feature's average contribution to the model's predictions. "
        "Higher SHAP importance = more influence on the outcome."
    )

    shap_summary = [
        {"feature": f.feature, "importance": f.importance, "mean_abs_shap": f.mean_abs_shap,
         "is_proxy": f.is_proxy_warning}
        for f in top_features
    ]

    return ExplainResponse(
        session_id=session_id,
        top_features=top_features,
        shap_values_summary=shap_summary,
        proxy_features=proxy_features,
        explanation_text=" ".join(explanation_parts),
        model_type="GradientBoostingClassifier",
    )
