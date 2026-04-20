from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum


class BiasSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class ColumnType(str, Enum):
    NUMERIC = "numeric"
    CATEGORICAL = "categorical"
    BINARY = "binary"
    TEXT = "text"
    DATETIME = "datetime"


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    inferred_type: ColumnType
    missing_count: int
    missing_pct: float
    unique_count: int
    sample_values: List[Any]


class UploadResponse(BaseModel):
    session_id: str
    dataset_name: str
    num_rows: int
    num_cols: int
    columns: List[ColumnInfo]
    suggested_target: Optional[str] = None
    suggested_sensitive: List[str] = []
    suggested_prediction: Optional[str] = None
    warnings: List[str] = []


class SampleDataset(BaseModel):
    id: str
    name: str
    description: str
    num_rows: int
    num_cols: int
    sensitive_columns: List[str]
    target_column: str
    prediction_column: Optional[str] = None
    feature_columns: List[str]
    task_type: str
    bias_types: List[str]


class SampleDatasetsResponse(BaseModel):
    datasets: List[SampleDataset]


class AnalysisRequest(BaseModel):
    session_id: Optional[str] = None
    sample_dataset_id: Optional[str] = None
    target_column: str
    prediction_column: Optional[str] = None
    feature_columns: List[str] = []
    sensitive_columns: List[str]
    positive_label: Optional[Union[str, int, float]] = None


class GroupMetric(BaseModel):
    group_value: str
    count: int
    selection_rate: float
    true_positive_rate: Optional[float] = None
    false_positive_rate: Optional[float] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None


class FairnessMetrics(BaseModel):
    sensitive_column: str
    demographic_parity_difference: Optional[float] = None
    demographic_parity_ratio: Optional[float] = None
    equalized_odds_difference: Optional[float] = None
    equal_opportunity_difference: Optional[float] = None
    overall_accuracy: Optional[float] = None
    group_metrics: List[GroupMetric] = []
    bias_severity: BiasSeverity = BiasSeverity.LOW
    fairness_score: float = 100.0
    explanation: str = ""
    warnings: List[str] = []


class AnalysisResponse(BaseModel):
    session_id: str
    dataset_summary: Dict[str, Any]
    metrics: List[FairnessMetrics]
    overall_fairness_score: float
    overall_bias_severity: BiasSeverity
    bias_explanation: str
    policy_compliance: Dict[str, Any]
    recommendations: List[str]
    warnings: List[str] = []


class ExplainRequest(BaseModel):
    session_id: Optional[str] = None
    target_column: str
    feature_columns: List[str]
    sensitive_columns: List[str]
    prediction_column: Optional[str] = None
    sample_dataset_id: Optional[str] = None
    positive_label: Optional[Union[str, int, float]] = None


class FeatureImportance(BaseModel):
    feature: str
    importance: float
    mean_abs_shap: float
    is_proxy_warning: bool = False
    proxy_correlation: Optional[float] = None


class ExplainResponse(BaseModel):
    session_id: str
    top_features: List[FeatureImportance]
    shap_values_summary: List[Dict[str, Any]]
    proxy_features: List[str]
    explanation_text: str
    model_type: str


class MitigationRequest(BaseModel):
    session_id: Optional[str] = None
    target_column: str
    feature_columns: List[str]
    sensitive_columns: List[str]
    prediction_column: Optional[str] = None
    sample_dataset_id: Optional[str] = None
    method: str = "reweighing"  # "reweighing" or "exponentiated_gradient"
    positive_label: Optional[Union[str, int, float]] = None


class MitigationResult(BaseModel):
    method: str
    method_display_name: str
    before_metrics: List[FairnessMetrics]
    after_metrics: List[FairnessMetrics]
    before_accuracy: Optional[float] = None
    after_accuracy: Optional[float] = None
    accuracy_delta: Optional[float] = None
    fairness_score_before: float
    fairness_score_after: float
    fairness_improvement: float
    explanation: str
    tradeoff_summary: str


class MitigationResponse(BaseModel):
    session_id: str
    results: List[MitigationResult]
    best_method: str
    overall_recommendation: str


class ReportRequest(BaseModel):
    session_id: Optional[str] = None
    analysis_response: Optional[Dict[str, Any]] = None
    explain_response: Optional[Dict[str, Any]] = None
    mitigation_response: Optional[Dict[str, Any]] = None
    format: str = "json"  # "json" or "pdf"


class HealthResponse(BaseModel):
    status: str
    version: str
    services: Dict[str, str]
