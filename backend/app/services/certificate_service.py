import io
import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)

def generate_compliance_certificate(compliance_data: Dict[str, Any]) -> bytes:
    """
    Generates a high-quality, professional PDF Compliance Certificate.
    """
    try:
        from reportlab.lib.pagesizes import landscape, letter
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
        from reportlab.lib.units import inch

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(letter))
        width, height = landscape(letter)

        # 1. Background
        # Main background
        c.setFillColor(colors.HexColor("#FAFAFA"))
        c.rect(0, 0, width, height, fill=1, stroke=0)

        # Left accent panel
        c.setFillColor(colors.HexColor("#0f172a")) # Dark navy
        c.rect(0, 0, 0.4 * inch, height, fill=1, stroke=0)
        
        # Top right accent shape (triangle)
        c.setFillColor(colors.HexColor("#1f6feb")) # Bright blue
        p = c.beginPath()
        p.moveTo(width, height)
        p.lineTo(width - 3 * inch, height)
        p.lineTo(width, height - 3 * inch)
        c.drawPath(p, fill=1, stroke=0)

        # 2. Borders
        c.setStrokeColor(colors.HexColor("#d4af37")) # Gold
        c.setLineWidth(2)
        c.rect(0.6 * inch, 0.4 * inch, width - 1 * inch, height - 0.8 * inch, stroke=1, fill=0)
        
        c.setStrokeColor(colors.HexColor("#1e293b")) # Dark gray inner border
        c.setLineWidth(0.5)
        c.rect(0.65 * inch, 0.45 * inch, width - 1.1 * inch, height - 0.9 * inch, stroke=1, fill=0)

        # 3. Seal/Badge (Bottom Right)
        seal_x = width - 2.5 * inch
        seal_y = 2.5 * inch
        
        # Outer ring
        c.setFillColor(colors.HexColor("#d4af37"))
        c.circle(seal_x, seal_y, 1.2 * inch, fill=1, stroke=0)
        # Inner ring
        c.setFillColor(colors.HexColor("#FAFAFA"))
        c.circle(seal_x, seal_y, 1.1 * inch, fill=1, stroke=0)
        # Inner dark circle
        c.setFillColor(colors.HexColor("#0f172a"))
        c.circle(seal_x, seal_y, 1.0 * inch, fill=1, stroke=0)
        
        c.setFont("Times-Bold", 14)
        c.setFillColor(colors.HexColor("#d4af37"))
        c.drawCentredString(seal_x, seal_y + 0.1 * inch, "CERTIFIED")
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.white)
        c.drawCentredString(seal_x, seal_y - 0.15 * inch, "FAIRNESS AUDIT")
        c.drawCentredString(seal_x, seal_y - 0.35 * inch, "PLATFORM")

        # 4. Header & Title
        c.setFont("Times-Bold", 42)
        c.setFillColor(colors.HexColor("#0f172a"))
        c.drawCentredString(width / 2.0, height - 2.0 * inch, "Certificate of Compliance")
        
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#64748b"))
        c.drawCentredString(width / 2.0, height - 2.5 * inch, "AWARDED TO THE AUTOMATED DECISION-MAKING SYSTEM")
        
        c.setStrokeColor(colors.HexColor("#cbd5e1"))
        c.setLineWidth(1)
        c.line(width / 2.0 - 2 * inch, height - 2.8 * inch, width / 2.0 + 2 * inch, height - 2.8 * inch)

        c.setFont("Times-Italic", 18)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawCentredString(width / 2.0, height - 3.2 * inch, "For undergoing rigorous algorithmic fairness evaluation")
        c.drawCentredString(width / 2.0, height - 3.5 * inch, "and meeting established bias mitigation thresholds.")

        # 5. Status & Risk Level
        status = compliance_data.get("compliance_status", "UNKNOWN")
        risk = compliance_data.get("risk_level", "UNKNOWN")
        
        c.setFont("Helvetica-Bold", 20)
        if status.upper() == "PASS":
            c.setFillColor(colors.HexColor("#10b981"))
            status_text = "STATUS: COMPLIANT"
        else:
            c.setFillColor(colors.HexColor("#ef4444"))
            status_text = "STATUS: NON-COMPLIANT"
            
        c.drawCentredString(width / 2.0, height - 4.5 * inch, status_text)
        
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.HexColor("#ef4444") if risk.upper() == "HIGH" else colors.HexColor("#f59e0b") if risk.upper() == "MEDIUM" else colors.HexColor("#10b981"))
        c.drawCentredString(width / 2.0, height - 4.8 * inch, f"RISK LEVEL: {risk.upper()}")

        # 6. Evaluation Details
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(colors.HexColor("#0f172a"))
        c.drawString(1.5 * inch, height - 5.5 * inch, "EVALUATION CRITERIA")
        
        c.setStrokeColor(colors.HexColor("#0f172a"))
        c.setLineWidth(2)
        c.line(1.5 * inch, height - 5.6 * inch, 3.5 * inch, height - 5.6 * inch)

        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor("#334155"))
        start_y = height - 6.0 * inch
        
        frameworks = compliance_data.get("frameworks", [])
        for i, fw in enumerate(frameworks):
            fw_name = fw.get("name", "")
            is_pass = fw.get("status", "").upper() == "PASS"
            fw_status = "PASS" if is_pass else "FAIL"
            
            # Draw a tiny box indicator
            c.setFillColor(colors.HexColor("#10b981") if is_pass else colors.HexColor("#ef4444"))
            c.rect(1.5 * inch, start_y - (0.3 * inch * i), 0.1 * inch, 0.1 * inch, fill=1, stroke=0)
            
            c.setFillColor(colors.HexColor("#334155"))
            c.drawString(1.7 * inch, start_y - (0.3 * inch * i), fw_name)
            
            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(colors.HexColor("#10b981") if is_pass else colors.HexColor("#ef4444"))
            c.drawString(4.0 * inch, start_y - (0.3 * inch * i), fw_status)
            c.setFont("Helvetica", 12)

        # 7. Signatures and Meta
        date_str = datetime.utcnow().strftime("%B %d, %Y")
        cert_id = f"CERT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        # Signature line
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        c.line(1.5 * inch, 1.5 * inch, 3.5 * inch, 1.5 * inch)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(colors.HexColor("#0f172a"))
        c.drawCentredString(2.5 * inch, 1.2 * inch, "DATE OF ISSUANCE")
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawCentredString(2.5 * inch, 1.6 * inch, date_str)

        # Footer id
        c.setFont("Courier", 9)
        c.setFillColor(colors.HexColor("#94a3b8"))
        c.drawString(1.5 * inch, 0.6 * inch, f"Certificate ID: {cert_id}")
        c.drawString(1.5 * inch, 0.4 * inch, "Issued by FairnessAudit Platform | Google Solution Challenge 2026")

        c.showPage()
        c.save()
        
        return buffer.getvalue()

    except ImportError:
        logger.error("ReportLab not available. Cannot generate PDF certificate.")
        raise ValueError("ReportLab is required for PDF generation.")
    except Exception as e:
        logger.error(f"Certificate generation failed: {e}")
        raise ValueError(f"Failed to generate certificate: {str(e)}")
