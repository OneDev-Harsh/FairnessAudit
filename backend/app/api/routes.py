"""
Main API routes for the FairnessAudit backend.
"""
import json
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse, Response

from app.core.config import settings
from app.core.errors import AppError
from app.models.schemas import (
    HealthResponse, UploadResponse, SampleDatasetsResponse,
    AnalysisRequest, AnalysisResponse,
    ExplainRequest, ExplainResponse,
    MitigationRequest, MitigationResponse,
    ReportRequest, BiasSeverity,
)
from app.services.data_service import (
    process_upload, get_sample_datasets_meta, load_sample_dataset,
    get_or_load_df, store_session,
)
from app.services.fairness_service import (
    compute_fairness_metrics, build_policy_compliance,
    generate_recommendations, build_bias_explanation,
)
from app.services.explainability_service import compute_explanations
from app.services.mitigation_service import run_mitigation
from app.services.report_service import generate_json_report, generate_pdf_report

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Health ───────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        services={"database": "ok", "fairness": "ok", "shap": "ok"},
    )


# ── Upload ───────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise AppError("Only CSV files are accepted.", status_code=400)

    contents = await file.read()
    if len(contents) == 0:
        raise AppError("Uploaded file is empty.", status_code=400)

    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise AppError(
            f"File too large ({size_mb:.1f} MB). Maximum allowed is {settings.MAX_FILE_SIZE_MB} MB.",
            status_code=413,
        )

    try:
        result = await process_upload(contents, file.filename)
        return result
    except ValueError as e:
        raise AppError(str(e), status_code=422)
    except Exception as e:
        logger.error(f"Upload failed: {e}", exc_info=True)
        raise AppError("Failed to process uploaded file.", status_code=500)


# ── Sample Datasets ──────────────────────────────────────────────────────────

@router.get("/sample-datasets", response_model=SampleDatasetsResponse)
async def list_sample_datasets():
    datasets = get_sample_datasets_meta()
    return SampleDatasetsResponse(datasets=datasets)


# ── Analysis ─────────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(req: AnalysisRequest):
    if not req.session_id and not req.sample_dataset_id:
        raise AppError("Either session_id or sample_dataset_id must be provided.", status_code=400)
    if not req.sensitive_columns:
        raise AppError("At least one sensitive column must be specified.", status_code=400)
    if not req.target_column:
        raise AppError("Target column must be specified.", status_code=400)

    try:
        df = get_or_load_df(req.session_id, req.sample_dataset_id)
    except ValueError as e:
        raise AppError(str(e), status_code=404)

    # Persist loaded sample dataset with session_id for reuse
    session_id = req.session_id or req.sample_dataset_id
    store_session(df, session_id)

    try:
        metrics, overall_accuracy = compute_fairness_metrics(
            df=df,
            target_col=req.target_column,
            sensitive_cols=req.sensitive_columns,
            prediction_col=req.prediction_column,
            feature_cols=req.feature_columns,
            positive_label=req.positive_label,
        )
    except ValueError as e:
        raise AppError(str(e), status_code=422)
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise AppError("Fairness analysis failed unexpectedly.", status_code=500)

    # Overall scores
    if metrics:
        scores = [m.fairness_score for m in metrics]
        overall_score = round(sum(scores) / len(scores), 1)
        severities = [m.bias_severity for m in metrics]
        if any(s == BiasSeverity.HIGH for s in severities):
            overall_severity = BiasSeverity.HIGH
        elif any(s == BiasSeverity.MEDIUM for s in severities):
            overall_severity = BiasSeverity.MEDIUM
        else:
            overall_severity = BiasSeverity.LOW
    else:
        overall_score = 100.0
        overall_severity = BiasSeverity.LOW

    policy = build_policy_compliance(metrics)
    recs = generate_recommendations(metrics, bool(req.prediction_column))
    bias_exp = build_bias_explanation(metrics)

    dataset_summary = {
        "num_rows": len(df),
        "num_cols": len(df.columns),
        "target_column": req.target_column,
        "prediction_column": req.prediction_column,
        "sensitive_columns": req.sensitive_columns,
        "feature_columns": req.feature_columns,
        "overall_accuracy": round(overall_accuracy, 4) if overall_accuracy else None,
    }

    warnings = []
    for m in metrics:
        warnings.extend(m.warnings)

    return AnalysisResponse(
        session_id=session_id,
        dataset_summary=dataset_summary,
        metrics=metrics,
        overall_fairness_score=overall_score,
        overall_bias_severity=overall_severity,
        bias_explanation=bias_exp,
        policy_compliance=policy,
        recommendations=recs,
        warnings=list(set(warnings)),
    )


# ── Explain ──────────────────────────────────────────────────────────────────

@router.post("/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    if not req.session_id and not req.sample_dataset_id:
        raise AppError("Either session_id or sample_dataset_id must be provided.", status_code=400)

    try:
        df = get_or_load_df(req.session_id, req.sample_dataset_id)
    except ValueError as e:
        raise AppError(str(e), status_code=404)

    if not req.feature_columns:
        raise AppError("At least one feature column must be specified for explainability.", status_code=400)

    try:
        result = compute_explanations(
            df=df,
            target_col=req.target_column,
            feature_cols=req.feature_columns,
            sensitive_cols=req.sensitive_columns,
            prediction_col=req.prediction_column,
            positive_label=req.positive_label,
        )
        result.session_id = req.session_id or req.sample_dataset_id or "explain"
        return result
    except Exception as e:
        logger.error(f"Explain failed: {e}", exc_info=True)
        raise AppError(f"Explainability computation failed: {str(e)}", status_code=500)


# ── Mitigate ─────────────────────────────────────────────────────────────────

@router.post("/mitigate", response_model=MitigationResponse)
async def mitigate(req: MitigationRequest):
    if not req.session_id and not req.sample_dataset_id:
        raise AppError("Either session_id or sample_dataset_id must be provided.", status_code=400)

    try:
        df = get_or_load_df(req.session_id, req.sample_dataset_id)
    except ValueError as e:
        raise AppError(str(e), status_code=404)

    if not req.feature_columns:
        raise AppError("Feature columns are required for mitigation.", status_code=400)

    methods = ["reweighing", "exponentiated_gradient"]

    try:
        result = run_mitigation(
            df=df,
            target_col=req.target_column,
            feature_cols=req.feature_columns,
            sensitive_cols=req.sensitive_columns,
            methods=methods,
            positive_label=req.positive_label,
        )
        result.session_id = req.session_id or req.sample_dataset_id or "mitigate"
        return result
    except ValueError as e:
        raise AppError(str(e), status_code=422)
    except Exception as e:
        logger.error(f"Mitigation failed: {e}", exc_info=True)
        raise AppError(f"Mitigation failed: {str(e)}", status_code=500)


# ── Report ───────────────────────────────────────────────────────────────────

@router.post("/dataset/mitigated/download")
async def download_mitigated_dataset(req: MitigationRequest):
    if not req.session_id and not req.sample_dataset_id:
        raise AppError("Either session_id or sample_dataset_id must be provided.", status_code=400)

    try:
        df = get_or_load_df(req.session_id, req.sample_dataset_id)
    except ValueError as e:
        raise AppError(str(e), status_code=404)

    if not req.feature_columns:
        raise AppError("Feature columns are required for mitigation.", status_code=400)

    from app.services.mitigation_service import get_mitigated_dataset
    try:
        mitigated_df = get_mitigated_dataset(
            df=df,
            target_col=req.target_column,
            feature_cols=req.feature_columns,
            sensitive_cols=req.sensitive_columns,
            method=req.method,
            positive_label=req.positive_label,
        )
        import io
        stream = io.StringIO()
        mitigated_df.to_csv(stream, index=False)
        response = Response(content=stream.getvalue(), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=mitigated_dataset.csv"
        return response
    except Exception as e:
        logger.error(f"Download mitigated dataset failed: {e}", exc_info=True)
        raise AppError(f"Failed to generate mitigated dataset: {str(e)}", status_code=500)


# ── Report ───────────────────────────────────────────────────────────────────

@router.post("/report")
async def generate_report(req: ReportRequest):
    report = generate_json_report(
        analysis=req.analysis_response,
        explain=req.explain_response,
        mitigation=req.mitigation_response,
    )

    if req.format == "pdf":
        pdf_bytes = generate_pdf_report(report)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=fairness_audit_report.pdf"},
        )

    return JSONResponse(content=report)
