from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import uuid

SQLALCHEMY_DATABASE_URL = "sqlite:///./grievance_portal.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    department = Column(String)
    status = Column(String, default="Active") # Active, Busy, Offline
    avatar = Column(String, nullable=True) # URL to avatar
    resolved_count = Column(Integer, default=0)
    
    complaints = relationship("Complaint", back_populates="agent")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True)
    category = Column(String, index=True) # Roads, Water, Electricity, Garbage, etc.
    description = Column(Text)
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="Pending") # Pending, In Progress, Resolved
    urgency = Column(String, default="Medium") # High, Medium, Low
    sentiment = Column(String, default="Neutral")
    department = Column(String, nullable=True) # Routed based on category
    agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    remark = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    images = Column(JSON, nullable=True) # List of image URLs/paths

    agent = relationship("Agent", back_populates="complaints")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, index=True, nullable=True)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, index=True, nullable=True)
    action = Column(String) # Submission, Status Update, Admin Action
    performed_by = Column(String) # User/Admin name
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String) # Hashed
    role = Column(String, default="Citizen") # Citizen, Admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)
