import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

MONITOR_FILE = "monitoring_logs.json"

def track_monitoring_metrics(session_id: str, metrics: List[Dict[str, Any]]):
    """
    Stores fairness metrics with a timestamp to track drift over time.
    """
    try:
        if os.path.exists(MONITOR_FILE):
            with open(MONITOR_FILE, "r") as f:
                history = json.load(f)
        else:
            history = []
            
        entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "metrics": metrics
        }
        
        history.append(entry)
        
        # Keep last 100 entries
        if len(history) > 100:
            history = history[-100:]
            
        with open(MONITOR_FILE, "w") as f:
            json.dump(history, f, indent=2)
            
        # Alert check
        check_for_alerts(entry)
        
        return entry
    except Exception as e:
        logger.error(f"Failed to track monitoring metrics: {e}")
        return None

def get_monitoring_history():
    """
    Returns the history of monitored metrics.
    """
    if os.path.exists(MONITOR_FILE):
        with open(MONITOR_FILE, "r") as f:
            return json.load(f)
    return []

def check_for_alerts(entry: Dict[str, Any]):
    """
    Sends alerts if fairness metrics drop below threshold.
    """
    ALERT_THRESHOLD = 0.8  # If fairness score < 80
    
    # We need to calculate an overall score for this entry
    scores = [m.get("fairness_score", 100) for m in entry["metrics"]]
    avg_score = sum(scores) / len(scores) if scores else 100
    
    if avg_score < (ALERT_THRESHOLD * 100):
        msg = f"ALERT: Fairness score dropped to {avg_score:.1f} for session {entry['session_id']}"
        logger.warning(msg)
        
        if settings.ALERT_EMAIL:
            # Placeholder for sending email
            logger.info(f"Sending alert email to {settings.ALERT_EMAIL}")
            
        if settings.WEBHOOK_URL:
            # Placeholder for sending webhook
            logger.info(f"Sending webhook to {settings.WEBHOOK_URL}")

def get_drift_data():
    """
    Prepares data for time-series charts.
    """
    history = get_monitoring_history()
    chart_data = []
    
    for entry in history:
        scores = [m.get("fairness_score", 100) for m in entry["metrics"]]
        avg_score = sum(scores) / len(scores) if scores else 100
        chart_data.append({
            "timestamp": entry["timestamp"],
            "score": round(avg_score, 1)
        })
        
    return chart_data
