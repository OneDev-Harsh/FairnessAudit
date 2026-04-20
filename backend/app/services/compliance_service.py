import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def check_compliance(metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Checks fairness metrics against EU AI Act and NIST AI Risk Framework thresholds.
    """
    violations = []
    recommendations = []
    
    # Thresholds
    DP_THRESHOLD = 0.1  # Demographic Parity Difference
    EO_THRESHOLD = 0.1  # Equalized Odds Difference
    
    for metric in metrics:
        col = metric.get("sensitive_column", "Unknown")
        dp_diff = metric.get("demographic_parity_difference")
        eo_diff = metric.get("equalized_odds_difference")
        
        if dp_diff is not None and dp_diff > DP_THRESHOLD:
            violations.append(f"EU AI Act: Demographic Parity Difference for '{col}' ({dp_diff:.3f}) exceeds threshold ({DP_THRESHOLD})")
            recommendations.append(f"Consider data rebalancing for group differences in '{col}'.")
            
        if eo_diff is not None and eo_diff > EO_THRESHOLD:
            violations.append(f"NIST Framework: Equalized Odds Difference for '{col}' ({eo_diff:.3f}) exceeds threshold ({EO_THRESHOLD})")
            recommendations.append(f"Apply post-processing mitigation to equalize error rates across '{col}' groups.")

    status = "PASS" if not violations else "FAIL"
    risk_level = "LOW"
    if len(violations) > 2:
        risk_level = "HIGH"
    elif len(violations) > 0:
        risk_level = "MEDIUM"

    return {
        "compliance_status": status,
        "risk_level": risk_level,
        "frameworks": [
            {"name": "EU AI Act (Simplified)", "status": "FAIL" if any("EU AI Act" in v for v in violations) else "PASS"},
            {"name": "NIST AI Risk Management", "status": "FAIL" if any("NIST" in v for v in violations) else "PASS"}
        ],
        "violations": violations,
        "recommendations": list(set(recommendations))
    }

def generate_compliance_report(compliance_data: Dict[str, Any]) -> str:
    """
    Generates a simple text-based compliance certificate content.
    """
    report = f"FAIRNESS COMPLIANCE CERTIFICATE\n"
    report += f"===============================\n"
    report += f"Status: {compliance_data['compliance_status']}\n"
    report += f"Risk Level: {compliance_data['risk_level']}\n\n"
    
    report += "Framework Checks:\n"
    for fw in compliance_data['frameworks']:
        report += f"- {fw['name']}: {fw['status']}\n"
    
    if compliance_data['violations']:
        report += "\nDetected Violations:\n"
        for v in compliance_data['violations']:
            report += f"- {v}\n"
            
    report += "\nRequired Actions:\n"
    for r in compliance_data['recommendations']:
        report += f"- {r}\n"
        
    return report
