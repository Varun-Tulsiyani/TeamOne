from passlib.context import CryptContext
import jwt
import datetime
from config import SECRET_KEY, REFRESH_SECRET_KEY,  ALGORITHM

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
token_blacklist = set()  # Token blacklist for logout

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + (expires_delta or datetime.timedelta(minutes=30))
    to_encode.update({"exp": expire, "sub": data.get("sub", "user"), "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + (expires_delta or datetime.timedelta(days=7))
    to_encode.update({"exp": expire, "sub": data.get("sub", "user"), "type": "refresh"})

    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str):
    if token in token_blacklist:
        raise jwt.InvalidTokenError("Token is blacklisted")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.InvalidTokenError("Token has expired")
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError("Invalid token")

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