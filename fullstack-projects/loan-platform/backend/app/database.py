import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./loans.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, default="")
    role = Column(String, default="user")  # user | admin
    city = Column(String, default="")
    pan = Column(String, default="")
    annual_income = Column(Float, default=0)
    employment_type = Column(String, default="salaried")
    cibil_score = Column(Integer, default=742)
    kyc_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class OTP(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True)
    phone = Column(String, index=True)
    code = Column(String)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)


class KYCDocument(Base):
    __tablename__ = "kyc_documents"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    doc_type = Column(String)  # pan | aadhaar | selfie | income
    filename = Column(String)
    status = Column(String, default="verified")
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True)
    loan_ref = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    applicant_name = Column(String)
    city = Column(String, default="")
    loan_type = Column(String)
    amount = Column(Float)
    tenure = Column(Integer)
    purpose = Column(String, default="")
    income = Column(Float, default=0)
    cibil_score = Column(Integer, default=700)
    rate = Column(Float, default=14.0)
    emi = Column(Float, default=0)
    risk = Column(String, default="medium")
    status = Column(String, default="pending")  # pending | approved | rejected | disbursed
    created_at = Column(DateTime, default=datetime.utcnow)
    emis = relationship("EMIPayment", back_populates="loan", cascade="all, delete-orphan")


class EMIPayment(Base):
    __tablename__ = "emi_payments"
    id = Column(Integer, primary_key=True)
    loan_id = Column(Integer, ForeignKey("loans.id"))
    month = Column(Integer)
    due_date = Column(String)
    principal = Column(Float)
    interest = Column(Float)
    status = Column(String, default="upcoming")  # paid | due | upcoming
    loan = relationship("Loan", back_populates="emis")


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"
    id = Column(Integer, primary_key=True)
    alert_ref = Column(String)
    user_label = Column(String)
    alert_type = Column(String)
    severity = Column(String)
    description = Column(Text)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
