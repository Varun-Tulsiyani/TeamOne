from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Annotated
from config import ACCESS_TOKEN_EXPIRE_MINUTES, SCANNER_URL
from database import engine, get_db
from models import Base, User, Scan
from security import (get_password_hash, verify_password, create_access_token, verify_access_token, token_blacklist,
                      get_current_user)
import requests
import datetime
import uvicorn
import tempfile
import base64
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from PyPDF2 import PdfWriter, PdfReader

from src.backend.scanner import AIVulnerabilityScanner, CNNType, AttackType

# FastAPI app
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the database tables
Base.metadata.create_all(bind=engine)


# Pydantic models
class UserRegister(BaseModel):
    username: str
    password: str
    role: str


class UserLogin(BaseModel):
    username: str
    password: str


class EmailRequest(BaseModel):
    recipient_email: EmailStr


class ScanRequest(BaseModel):
    model_url: str
    cnn_type: CNNType
    attack_type: AttackType
    target_class: int = 0


# Dependency injection
db_dependency = Annotated[Session, Depends(get_db)]


# Registration Endpoint
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister, db: db_dependency):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"msg": "User registered successfully", "user": {"id": new_user.id, "username": new_user.username}}


# Login Endpoint
@app.post("/login")
async def login(user: UserLogin, db: db_dependency):
    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Generate JWT Token
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": db_user.id}, expires_delta=access_token_expires)

    return {"msg": "Login successful", "access_token": access_token, "token_type": "bearer"}


# Logout Endpoint (Blacklist Token)
@app.post("/logout")
async def logout(token: str):
    token_blacklist.add(token)
    return {"msg": "Logout successful"}


# Delete User Endpoint
@app.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(token: str, db: db_dependency):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    username = payload["sub"]
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()
    return {"msg": "User deleted successfully"}


@app.post("/scan")
async def perform_scan(request: ScanRequest, db: db_dependency, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    try:
        print(f"Received request: {request.model_dump()}")
        scanner = AIVulnerabilityScanner(model_type=request.cnn_type)
        scanner.load_model(model_path := {
            CNNType.RESNET: "../models/Overfitted_Mammal_Classification_Model.h5",
            CNNType.MOBILENET: "../models/covid_mobilenet_model.h5",
            CNNType.EFFICIENTNET: "../models/overfitted_efficientnet_PC_parts_v2.h5"
        }.get(request.cnn_type))

        print(f"Loaded {request.cnn_type} Model")

        # Attack method mapping
        attack_map = {
            CNNType.RESNET: {
                AttackType.SCORE_BASED: scanner.score_based_resnet_attack,
                AttackType.BOUNDARY_BASED: scanner.boundary_based_resnet_attack
            },
            CNNType.MOBILENET: {
                AttackType.SCORE_BASED: scanner.score_based_mobilenet_attack,
                AttackType.BOUNDARY_BASED: scanner.boundary_based_mobilenet_attack
            },
            CNNType.EFFICIENTNET: {
                AttackType.SCORE_BASED: scanner.score_based_efficientnet_attack,
                AttackType.BOUNDARY_BASED: scanner.boundary_based_efficientnet_attack
            }
        }

        attack_fn = attack_map[request.cnn_type][request.attack_type]
        attack_result = attack_fn(request.target_class)
        print("Attack complete")

        new_scan = Scan(
            user_id=user_id,
            created_at=datetime.datetime.now(),
            scan_url=request.model_url,
            attack_type=attack_result["attack_type"],
            cnn_model=attack_result["model_type"],
            target_class=attack_result["target_class"],
            execution_time=attack_result["execution_time"],
            iterations=attack_result["iterations"],
            mitigations=attack_result["mitigations"],
        )
        db.add(new_scan)
        db.commit()

        # Generate PDF
        pdf_bytes = create_secure_pdf(attack_result, "MySecureAdminPass123!")

        # Process Image for frontend
        adv_image_b64 = None
        if 'adv_image' in attack_result:
            temp_img = tempfile.NamedTemporaryFile(suffix=".png", delete=False)  # Prevent auto-delete
            temp_img.close()  # Close the file to allow reopening
            img_path = temp_img.name

            # Normalize adversarial image
            adv_image_np = np.array(attack_result['adv_image'], dtype=np.float32)
            if adv_image_np.max() > 1.0:
                adv_image_np = adv_image_np / 255.0

            # Save image and read it as Base64
            plt.imsave(img_path, adv_image_np)
            with open(img_path, "rb") as img_file:
                adv_image_b64 = base64.b64encode(img_file.read()).decode("utf-8")

            # Cleanup: Remove file after encoding
            os.remove(img_path)

        # Return JSON with both PDF and Image
        return JSONResponse(content={
            "pdf_report": base64.b64encode(pdf_bytes).decode("utf-8"),
            "adv_image": adv_image_b64
        })
    except requests.RequestException as e:
        print(f"Request Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with scanner backend.")
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Report PDF Generation
def create_secure_pdf(report: dict, password: str) -> bytes:
    """Generate password-protected PDF report"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f"Security Report - {report.get('model_type', 'Unknown')}", styles['Title']))
    story.append(Spacer(1, 24))

    # Attack Details
    story.append(Paragraph("Attack Results", styles['Heading2']))
    details = f"""Attack Type: {report.get('attack_type', 'N/A')}"""
    story.append(Paragraph(details, styles['Normal']))

    # Attack Execution Summary
    story.append(Paragraph("Attack Execution Summary", styles['Heading2']))
    execution_summary = f"""
    CNN Model: {report.get('model_type', 'N/A')}
    Attack Type: {report.get('attack_type', 'N/A')}
    Target Class: {report.get('target_class', 'N/A')}
    Iterations: {report.get('iterations', 'N/A')}
    Execution Time: {report.get('execution_time', 'N/A')}
    """
    story.append(Paragraph(execution_summary, styles['Normal']))

    # Visualization
    if 'adv_image' in report:
        img_path = tempfile.mktemp(suffix='.png')

        # Ensure the adversarial image is correctly formatted
        adv_image_np = np.array(report['adv_image'], dtype=np.float32)
        if adv_image_np.max() > 1.0:
            adv_image_np = adv_image_np / 255.0

        plt.imsave(img_path, adv_image_np)
        story.append(Image(img_path, width=400, height=300))
        story.append(Spacer(1, 24))

    # Recommended Mitigations
    story.append(Paragraph("Recommended Mitigation Strategies", styles['Heading2']))
    for mitigation in report.get('mitigations', []):
        story.append(Paragraph(f"• {mitigation}", styles['Bullet']))

    doc.build(story)

    # Encrypt PDF
    buffer.seek(0)
    pdf_writer = PdfWriter()
    pdf_reader = PdfReader(buffer)

    for page in pdf_reader.pages:
        pdf_writer.add_page(page)

    pdf_writer.encrypt(password)

    encrypted_buffer = BytesIO()
    pdf_writer.write(encrypted_buffer)
    encrypted_buffer.seek(0)

    # Convert BytesIO to bytes before returning
    return encrypted_buffer.getvalue()


@app.get("/report/all")
async def get_all_scans(db: db_dependency, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    scans = db.query(Scan).filter(Scan.user_id == user_id).all()

    return scans


@app.get("/report")
async def get_report(db: db_dependency, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return db.query(Scan).filter(Scan.user_id == user_id).order_by(Scan.created_at.desc()).first()


@app.post("/email")
async def email_report(email_request: EmailRequest):
    try:
        # Step 1: Get the user-inputted email
        recipient_email = email_request.recipient_email

        # Step 4: Send the email with the PDF attachment
        sender_email = "example@gmail.com"
        sender_password = "password123"

        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg["Subject"] = "Your Report from Our Service"

        # Custom Email Template
        email_body = f"""
        <html>
        <body>
            <h2>Hello name,</h2>
            <p>Attached is your report.</p>
            <p>Thank you for using our service!</p>
            <br>
            <p>Best Regards,</p>
            <p>Your Company Team</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(email_body, "html"))

        # Send the email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email.__str__(), msg.as_string())

        return {"msg": f"Email sent successfully to {recipient_email}"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
