from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")

    scans = relationship("Scan", back_populates="user")


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

User.scans = relationship("Scan", back_populates="user")