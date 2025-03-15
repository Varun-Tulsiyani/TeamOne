from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Annotated
from config import ACCESS_TOKEN_EXPIRE_MINUTES, SCANNER_URL
from database import engine, get_db
from models import Base, User
from security import (
    get_password_hash, verify_password, create_access_token, verify_access_token, token_blacklist
)
import requests
import datetime
import uvicorn
import tempfile

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
    cnn_type: str
    attack_type: str
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
    access_token = create_access_token(data={"sub": db_user.username}, expires_delta=access_token_expires)

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
async def perform_scan(request: ScanRequest):
    try:
        print(f"Received request: {request.model_dump()}")
        response = requests.post(SCANNER_URL, json=request.model_dump())

        # If the response is not successful, raise an error
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Scanner backend error")

        # Check Content-Type from the response
        content_type = response.headers.get("Content-Type", "")

        if "application/pdf" in content_type:
            # Handle PDF response
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
                tmp_pdf.write(response.content)
                tmp_pdf_path = tmp_pdf.name

            pdf_bytes = response.content
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=security_report.pdf"}
            )
        else:
            # Handle JSON response
            return JSONResponse(content=response.json(), status_code=200)

    except requests.RequestException as e:
        print(f"Request Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with scanner backend.")
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
