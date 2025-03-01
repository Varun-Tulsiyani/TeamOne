from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Annotated
import jwt
import datetime
import os

DATABASE_URL = "postgresql://postgres:root@localhost:5432/Protego"
SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Dependency for getting a database session
class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    username: str = Column(String, unique=True, index=True, nullable=False)
    hashed_password: str = Column(String, nullable=False)
    role = Column(String, default="user")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scan_url = Column(String, nullable=False)
    attack_type = Column(String, nullable=False)
    cnn_model = Column(String, nullable=False)
    risk_level = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=True)

    user = relationship("User", back_populates="scans")


# Create the database tables
Base.metadata.create_all(bind=engine)


# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


User.scans = relationship("Scan", back_populates="user")


# Pydantic models
class UserRegister(BaseModel):
    username: str
    password: str
    role: str


class UserLogin(BaseModel):
    username: str
    password: str


# Utility functions for password handling
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + (expires_delta or datetime.timedelta(minutes=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    if token in token_blacklist:
        raise jwt.InvalidTokenError("Token is blacklisted")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.InvalidTokenError("Token has expired")
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError("Invalid token")


# Token Blacklist for Logout
token_blacklist = set()

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
    payload = verify_token(token)
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
