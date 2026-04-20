import logging
import pandas as pd
import io
from app.core.config import settings

logger = logging.getLogger(__name__)

# Try to import GCP libraries, but don't fail if they aren't installed/configured yet
try:
    from google.cloud import storage
    from google.cloud import bigquery
    GCP_AVAILABLE = True
except ImportError:
    GCP_AVAILABLE = False
    logger.warning("Google Cloud libraries not installed. GCP integration will be disabled.")


def import_from_gcs(bucket_name: str, file_name: str) -> pd.DataFrame:
    """
    Downloads a CSV file from Google Cloud Storage and loads it into a DataFrame.
    """
    if not GCP_AVAILABLE or not settings.GCP_PROJECT_ID:
        raise ValueError("Google Cloud integration is not configured.")

    try:
        client = storage.Client(project=settings.GCP_PROJECT_ID)
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(file_name)
        
        content = blob.download_as_bytes()
        df = pd.read_csv(io.BytesIO(content))
        return df
    except Exception as e:
        logger.error(f"Failed to import from GCS: {e}")
        raise ValueError(f"Failed to read from Google Cloud Storage: {str(e)}")


def import_from_bigquery(query: str) -> pd.DataFrame:
    """
    Executes a BigQuery query and loads the result into a DataFrame.
    """
    if not GCP_AVAILABLE or not settings.GCP_PROJECT_ID:
        raise ValueError("Google Cloud integration is not configured.")

    try:
        client = bigquery.Client(project=settings.GCP_PROJECT_ID)
        query_job = client.query(query)
        df = query_job.to_dataframe()
        return df
    except Exception as e:
        logger.error(f"Failed to import from BigQuery: {e}")
        raise ValueError(f"Failed to execute BigQuery query: {str(e)}")
