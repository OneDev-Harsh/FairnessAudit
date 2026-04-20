import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def detect_proxy_features(df: pd.DataFrame, sensitive_cols: List[str], feature_cols: List[str]) -> List[Dict[str, Any]]:
    """
    Detects potential proxy features by calculating correlation/association between 
    sensitive columns and other features.
    """
    proxy_warnings = []
    CORR_THRESHOLD = 0.3  # Threshold for warning
    
    for sensitive in sensitive_cols:
        if sensitive not in df.columns:
            continue
            
        for feature in feature_cols:
            if feature == sensitive or feature not in df.columns:
                continue
            
            score = 0.0
            assoc_type = ""
            
            try:
                # Determine relationship type
                s_type = df[sensitive].dtype
                f_type = df[feature].dtype
                
                if np.issubdtype(s_type, np.number) and np.issubdtype(f_type, np.number):
                    # Numeric-Numeric: Pearson
                    score = abs(df[sensitive].corr(df[feature]))
                    assoc_type = "Pearson Correlation"
                elif not np.issubdtype(s_type, np.number) and not np.issubdtype(f_type, np.number):
                    # Categorical-Categorical: Cramer's V
                    score = cramers_v(df[sensitive], df[feature])
                    assoc_type = "Cramér's V"
                else:
                    # Mixed: Simple correlation after encoding
                    score = abs(df[sensitive].astype('category').cat.codes.corr(df[feature].astype('category').cat.codes))
                    assoc_type = "Correlation (Encoded)"
                    
                if score > CORR_THRESHOLD:
                    proxy_warnings.append({
                        "feature": feature,
                        "sensitive_column": sensitive,
                        "association_score": round(score, 3),
                        "association_type": assoc_type,
                        "severity": "High" if score > 0.6 else "Medium"
                    })
            except Exception as e:
                logger.error(f"Error computing proxy for {feature} vs {sensitive}: {e}")
                
    return proxy_warnings

def cramers_v(x, y):
    """
    Calculates Cramér's V for two categorical series.
    """
    confusion_matrix = pd.crosstab(x, y)
    chi2 = chi2_contingency(confusion_matrix)[0]
    n = confusion_matrix.sum().sum()
    phi2 = chi2 / n
    r, k = confusion_matrix.shape
    phi2corr = max(0, phi2 - ((k-1)*(r-1))/(n-1))
    rcorr = r - ((r-1)**2)/(n-1)
    kcorr = k - ((k-1)**2)/(n-1)
    return np.sqrt(phi2corr / min((kcorr-1), (rcorr-1)))
