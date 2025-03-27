from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import jwt
import datetime
from config import SECRET_KEY, REFRESH_SECRET_KEY, ALGORITHM
from sqlalchemy.orm import Session
from database import get_db
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
token_blacklist = set()  # Token blacklist for logout
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + (expires_delta or datetime.timedelta(minutes=30))
    to_encode.update({"exp": expire, "sub": str(data.get("sub", "user")), "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + (expires_delta or datetime.timedelta(days=7))
    to_encode.update({"exp": expire, "sub": str(data.get("sub", "user")), "type": "refresh"})

    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str):
    if token in token_blacklist:
        raise jwt.InvalidTokenError("Token is blacklisted")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            exp_datetime = datetime.datetime.fromtimestamp(exp_timestamp)
            now = datetime.datetime.now()
            print(f"🔍 Token Expiry: {exp_datetime}, Current Time: {now}")  # Debug expiration

            if now > exp_datetime:
                raise jwt.ExpiredSignatureError("Token has expired")

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def verify_refresh_token(refresh_token: str):
    if refresh_token in token_blacklist:
        return {"error": "Token is blacklisted"}

    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"error": "Refresh token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        print(f"🔍 Received Token (raw): {token}")  # ✅ Check if FastAPI gets the token
        print(f"🔑 SECRET_KEY being used: {SECRET_KEY}")
        print(f"🔑 ALGORITHM being used: {ALGORITHM}")

        if not token:
            print("❌ No token received by FastAPI!")
            raise HTTPException(status_code=401, detail="No token provided")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("🔍 Decoded Token Payload:", payload)  # ✅ See what's inside

        user_id = payload.get("sub")
        if not user_id:
            print("❌ Token does not contain a user ID")
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print("❌ User not found in database")
            raise HTTPException(status_code=401, detail="User not found")

        return {"id": user.id, "username": user.username}

    except jwt.ExpiredSignatureError:
        print("❌ Token has expired!")
        raise HTTPException(status_code=401, detail="Token has expired")

    except jwt.InvalidTokenError:
        print("❌ Invalid token format!")
        raise HTTPException(status_code=401, detail="Invalid token")
