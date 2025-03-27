from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import json
import datetime

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
    created_at = Column(DateTime, default=datetime.datetime.now(datetime.UTC))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scan_url = Column(String, nullable=False)
    attack_type = Column(String, nullable=False)
    cnn_model = Column(String, nullable=False)
    target_class = Column(Integer, nullable=False)
    execution_time = Column(String, nullable=False)
    iterations = Column(Integer, nullable=False)
    mitigations = Column(Text, nullable=True)

    user = relationship("User", back_populates="scans")

    def set_mitigations(self, mitigations_list):
        """Stores a list as a JSON string."""
        self.mitigations = json.dumps(mitigations_list)

    def get_mitigations(self):
        """Retrieves the stored JSON string as a list."""
        return json.loads(self.mitigations) if self.mitigations else []

User.scans = relationship("Scan", back_populates="user")