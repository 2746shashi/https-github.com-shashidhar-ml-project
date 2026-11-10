import os, random, secrets
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import Base, engine, get_db, SessionLocal, User, OTP, KYCDocument, Loan, EMIPayment, FraudAlert
from .ml_engine import get_engine

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
DEBUG_OTP = os.getenv("DEBUG_OTP", "true").lower() == "true"
ADMIN_PHONE = os.getenv("ADMIN_PHONE", "9999999999")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175").split(",")

app = FastAPI(title="LoanPlatform API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
bearer = HTTPBearer(auto_error=False)


# ───────────────────────── helpers ─────────────────────────
def calc_emi(P: float, annual_rate: float, n: int) -> int:
    r = annual_rate / 1200
    if r == 0: return round(P / n)
    return round(P * r * (1 + r) ** n / ((1 + r) ** n - 1))

def rate_for_score(score: int) -> float:
    return 9.5 if score >= 750 else 11.5 if score >= 700 else 14.0 if score >= 650 else 18.0

def risk_for_score(score: int) -> str:
    return "low" if score >= 720 else "medium" if score >= 650 else "high"

def make_token(user: User) -> str:
    payload = {"sub": str(user.id), "role": user.role, "exp": datetime.utcnow() + timedelta(hours=12)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def current_user(cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if not cred: raise HTTPException(401, "Not authenticated")
    try:
        data = jwt.decode(cred.credentials, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = db.get(User, int(data["sub"]))
    if not user: raise HTTPException(401, "User not found")
    return user

def admin_only(user: User = Depends(current_user)) -> User:
    if user.role != "admin": raise HTTPException(403, "Admin access required")
    return user

def loan_dict(l: Loan) -> dict:
    return {"id": l.loan_ref, "name": l.applicant_name, "city": l.city, "type": l.loan_type, "amount": l.amount,
            "tenure": l.tenure, "status": l.status, "score": l.cibil_score, "emi": l.emi, "rate": l.rate,
            "risk": l.risk, "purpose": l.purpose, "date": l.created_at.strftime("%Y-%m-%d")}

def build_schedule(db: Session, loan: Loan, paid_months: int = 0):
    r = loan.rate / 1200
    balance, months = loan.amount, loan.tenure
    for m in range(1, months + 1):
        interest = round(balance * r)
        principal = round(loan.emi - interest)
        balance -= principal
        status = "paid" if m <= paid_months else "due" if m == paid_months + 1 else "upcoming"
        due = (loan.created_at + timedelta(days=30 * m)).strftime("%Y-%m-%d")
        db.add(EMIPayment(loan_id=loan.id, month=m, due_date=due, principal=principal, interest=interest, status=status))


# ───────────────────────── startup + seed ─────────────────────────
@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(phone=ADMIN_PHONE, name="Admin", role="admin", kyc_complete=True)
            demo = User(phone="9876543210", name="Arjun Kumar", city="Mumbai", pan="ABCDE1234F",
                        annual_income=1200000, cibil_score=742, kyc_complete=False)
            db.add_all([admin, demo]); db.commit()
            seed = [("Arjun Sharma", 500000, "Personal", "approved", 742, 48, "Mumbai"),
                    ("Priya Mehta", 1200000, "Home", "pending", 698, 84, "Bengaluru"),
                    ("Rahul Gupta", 300000, "Education", "rejected", 612, 36, "Delhi"),
                    ("Sneha Reddy", 750000, "Business", "approved", 768, 60, "Hyderabad"),
                    ("Vikram Patel", 200000, "Personal", "disbursed", 731, 36, "Ahmedabad"),
                    ("Ananya Singh", 450000, "Vehicle", "pending", 672, 60, "Pune")]
            for i, (n, amt, t, st, sc, ten, city) in enumerate(seed, 1):
                rate = rate_for_score(sc)
                loan = Loan(loan_ref=f"LN-2024-{i:03d}", applicant_name=n, city=city, loan_type=t, amount=amt, tenure=ten,
                            status=st, cibil_score=sc, rate=rate, emi=0 if st == "rejected" else calc_emi(amt, rate, ten),
                            risk=risk_for_score(sc), user_id=demo.id if i == 1 else None)
                db.add(loan); db.flush()
                if i == 1: build_schedule(db, loan, paid_months=4)
            for ref, u, t, s, d in [
                ("FA-001", "Ravi M.", "Multiple applications", "high", "5 applications from same device in 24hrs"),
                ("FA-002", "Ankit S.", "Document mismatch", "high", "PAN photo differs from selfie — face mismatch"),
                ("FA-003", "Sunita P.", "Income inflation", "medium", "Declared income 3x higher than bureau data"),
                ("FA-004", "Dev K.", "Velocity check", "medium", "3 loan apps across different lenders this week"),
                ("FA-005", "Nisha T.", "Location anomaly", "low", "Application from IP in different state than KYC")]:
                db.add(FraudAlert(alert_ref=ref, user_label=u, alert_type=t, severity=s, description=d))
            db.commit()
    finally:
        db.close()
    get_engine()  # warm up / train ML models once


# ───────────────────────── schemas ─────────────────────────
class OtpRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=15)

class OtpVerify(BaseModel):
    phone: str
    otp: str = Field(min_length=6, max_length=6)

class ApplyIn(BaseModel):
    loan_type: str = "Personal"
    amount: float = Field(gt=10000, le=12_000_000)
    tenure: int = Field(ge=6, le=240)
    purpose: str = ""
    income: float = 0
    employer: str = ""

class EligibilityIn(BaseModel):
    annual_income: float = Field(gt=0)
    cibil_score: int = Field(ge=300, le=900)
    existing_emi: float = Field(ge=0, default=0)

class RiskIn(BaseModel):
    cibil: int = Field(ge=300, le=900)
    income: float
    foir: float
    age: int
    employment: str = "salaried"
    existing: int = 0
    bankVintage: int = 0

class MLPredictIn(BaseModel):
    age: int = Field(ge=18, le=80); income: int = Field(ge=0); loan_amount: int = Field(ge=10000)
    loan_term: int = Field(ge=6, le=360); cibil_score: int = Field(ge=300, le=900)
    employment_years: int = Field(ge=0, le=50); existing_loans: int = Field(ge=0, le=10)
    assets_value: int = Field(ge=0); education_level: int = Field(ge=0, le=3); loan_purpose: int = Field(ge=0, le=4)
    monthly_obligations: int = Field(ge=0); savings: int = Field(ge=0)

class ProfileIn(BaseModel):
    name: Optional[str] = None; city: Optional[str] = None; pan: Optional[str] = None
    annual_income: Optional[float] = None; employment_type: Optional[str] = None


# ───────────────────────── auth ─────────────────────────
@app.get("/api/health")
def health(): return {"ok": True}

@app.post("/api/auth/send-otp")
def send_otp(body: OtpRequest, db: Session = Depends(get_db)):
    code = f"{random.randint(0, 999999):06d}"
    db.add(OTP(phone=body.phone, code=code, expires_at=datetime.utcnow() + timedelta(minutes=5)))
    db.commit()
    print(f"[OTP] {body.phone} -> {code}")  # replace with SMS provider (Twilio / MSG91) in production
    return {"sent": True, **({"debug_otp": code} if DEBUG_OTP else {})}

@app.post("/api/auth/verify-otp")
def verify_otp(body: OtpVerify, db: Session = Depends(get_db)):
    rec = (db.query(OTP).filter(OTP.phone == body.phone, OTP.used == False)  # noqa: E712
           .order_by(OTP.id.desc()).first())
    if not rec or rec.expires_at < datetime.utcnow() or not secrets.compare_digest(rec.code, body.otp):
        raise HTTPException(400, "Invalid or expired OTP")
    rec.used = True
    user = db.query(User).filter(User.phone == body.phone).first()
    if not user:
        user = User(phone=body.phone, name="New User"); db.add(user)
    db.commit(); db.refresh(user)
    return {"token": make_token(user), "role": user.role, "user": {"id": user.id, "name": user.name, "phone": user.phone}}

@app.get("/api/me")
def me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    docs = [d.doc_type for d in db.query(KYCDocument).filter_by(user_id=user.id)]
    return {"id": user.id, "name": user.name, "phone": user.phone, "role": user.role, "city": user.city, "pan": user.pan,
            "annual_income": user.annual_income, "employment_type": user.employment_type,
            "cibil_score": user.cibil_score, "kyc_complete": user.kyc_complete, "kyc_docs": docs}

@app.put("/api/me")
def update_me(body: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    for k, v in body.model_dump(exclude_none=True).items(): setattr(user, k, v)
    db.commit(); return {"ok": True}


# ───────────────────────── KYC ─────────────────────────
KYC_REQUIRED = {"pan", "aadhaar", "selfie"}
KYC_TYPES = KYC_REQUIRED | {"income"}  # income proof is optional

@app.post("/api/kyc/upload")
async def kyc_upload(doc_type: str = Form(...), file: UploadFile = File(...),
                     user: User = Depends(current_user), db: Session = Depends(get_db)):
    if doc_type not in KYC_TYPES: raise HTTPException(400, "Unknown document type")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024: raise HTTPException(413, "File too large (max 5 MB)")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = f"{UPLOAD_DIR}/{user.id}_{doc_type}_{secrets.token_hex(4)}_{os.path.basename(file.filename or 'doc')}"
    with open(path, "wb") as fh: fh.write(data)
    db.query(KYCDocument).filter_by(user_id=user.id, doc_type=doc_type).delete()
    db.add(KYCDocument(user_id=user.id, doc_type=doc_type, filename=path))
    db.flush()
    have = {d.doc_type for d in db.query(KYCDocument).filter_by(user_id=user.id)}
    user.kyc_complete = KYC_REQUIRED <= have
    db.commit()
    return {"uploaded": doc_type, "docs": sorted(have), "kyc_complete": user.kyc_complete}

@app.post("/api/kyc/mark")  # lets the demo UI tick a document without a real file
def kyc_mark(doc_type: str = Form(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    if doc_type not in KYC_TYPES: raise HTTPException(400, "Unknown document type")
    if not db.query(KYCDocument).filter_by(user_id=user.id, doc_type=doc_type).first():
        db.add(KYCDocument(user_id=user.id, doc_type=doc_type, filename="demo"))
    db.flush()
    have = {d.doc_type for d in db.query(KYCDocument).filter_by(user_id=user.id)}
    user.kyc_complete = KYC_REQUIRED <= have
    db.commit()
    return {"docs": sorted(have), "kyc_complete": user.kyc_complete}


# ───────────────────────── eligibility / EMI / ML ─────────────────────────
@app.post("/api/eligibility")
def eligibility(body: EligibilityIn):
    monthly = body.annual_income / 12
    foir = body.existing_emi / monthly * 100
    max_emi = monthly * 0.5 - body.existing_emi
    r, n = 0.14 / 12, 60
    raw = max_emi * ((1 + r) ** n - 1) / (r * (1 + r) ** n) if max_emi > 0 else 0
    cap = 1_500_000 if body.cibil_score > 750 else 1_000_000 if body.cibil_score > 700 else 600_000
    s = body.cibil_score
    return {"eligible_amount": max(0, round(min(raw, cap))), "foir": round(foir), "max_emi": round(max(max_emi, 0)),
            "score_grade": "Excellent" if s >= 750 else "Good" if s >= 700 else "Fair" if s >= 650 else "Poor",
            "pre_qualified": s >= 650 and foir < 50}

@app.get("/api/emi/calculate")
def emi_calc(amount: float, rate: float, tenure: int):
    emi = calc_emi(amount, rate, tenure)
    return {"emi": emi, "total_payable": emi * tenure, "total_interest": emi * tenure - amount}

@app.post("/api/ml/predict")
def ml_predict(body: MLPredictIn):
    return get_engine().predict(body.model_dump())

@app.post("/api/risk/evaluate")
def risk_evaluate(s: RiskIn):
    pts, flags = 0, []
    if s.cibil >= 750: pts += 30
    elif s.cibil >= 700: pts += 20
    elif s.cibil >= 650: pts += 10
    else: pts -= 20; flags.append("Low CIBIL score (<650)")
    if s.income >= 50000: pts += 20
    elif s.income >= 25000: pts += 10
    else: flags.append("Low income")
    if s.foir < 30: pts += 20
    elif s.foir < 40: pts += 10
    elif s.foir >= 50: pts -= 15; flags.append("High FOIR (>50%)")
    pts += 15 if s.employment == "govt" else 10 if s.employment == "salaried" else 5
    if 25 <= s.age <= 45: pts += 10
    elif s.age < 21 or s.age > 60: pts -= 20; flags.append("Age outside preferred band")
    if s.bankVintage >= 3: pts += 5
    score = max(0, min(100, pts))
    decision = "approve" if score >= 70 else "review" if score >= 50 else "reject"
    return {"score": score, "decision": decision, "flags": flags,
            "rate": 12 if score >= 70 else 16 if score >= 50 else 0,
            "maxLoan": s.income * 36 if score >= 70 else s.income * 18 if score >= 50 else 0}


# ───────────────────────── loans (user) ─────────────────────────
@app.post("/api/loans")
def apply_loan(body: ApplyIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if not user.kyc_complete: raise HTTPException(400, "Complete KYC before applying")
    rate = rate_for_score(user.cibil_score)
    count = db.query(func.count(Loan.id)).scalar() + 1
    loan = Loan(loan_ref=f"LN-{datetime.utcnow().year}-{count:03d}", user_id=user.id, applicant_name=user.name,
                city=user.city, loan_type=body.loan_type, amount=body.amount, tenure=body.tenure, purpose=body.purpose,
                income=body.income, cibil_score=user.cibil_score, rate=rate, emi=calc_emi(body.amount, rate, body.tenure),
                risk=risk_for_score(user.cibil_score))
    db.add(loan); db.commit(); db.refresh(loan)
    return loan_dict(loan)

@app.get("/api/loans/mine")
def my_loans(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return [loan_dict(l) for l in db.query(Loan).filter_by(user_id=user.id).order_by(Loan.id.desc())]

@app.get("/api/loans/{ref}/emis")
def loan_emis(ref: str, user: User = Depends(current_user), db: Session = Depends(get_db)):
    loan = db.query(Loan).filter_by(loan_ref=ref).first()
    if not loan or (loan.user_id != user.id and user.role != "admin"): raise HTTPException(404, "Loan not found")
    if loan.status in ("approved", "disbursed") and not loan.emis:
        build_schedule(db, loan); db.commit(); db.refresh(loan)
    rows = [{"month": e.month, "due_date": e.due_date, "principal": e.principal, "interest": e.interest, "status": e.status}
            for e in sorted(loan.emis, key=lambda e: e.month)]
    paid = sum(r["principal"] + r["interest"] for r in rows if r["status"] == "paid")
    rest = sum(r["principal"] + r["interest"] for r in rows if r["status"] != "paid")
    return {"loan": loan_dict(loan), "schedule": rows, "total_paid": paid, "total_remaining": rest}

@app.post("/api/emis/{ref}/{month}/pay")
def pay_emi(ref: str, month: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    loan = db.query(Loan).filter_by(loan_ref=ref, user_id=user.id).first()
    if not loan: raise HTTPException(404, "Loan not found")
    emi = db.query(EMIPayment).filter_by(loan_id=loan.id, month=month).first()
    if not emi: raise HTTPException(404, "EMI not found")
    emi.status = "paid"
    nxt = db.query(EMIPayment).filter_by(loan_id=loan.id, month=month + 1).first()
    if nxt and nxt.status == "upcoming": nxt.status = "due"
    db.commit(); return {"paid": month}


# ───────────────────────── admin ─────────────────────────
@app.get("/api/admin/loans")
def admin_loans(status: Optional[str] = None, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    q = db.query(Loan)
    if status and status != "all": q = q.filter(Loan.status == status)
    return [loan_dict(l) for l in q.order_by(Loan.id)]

@app.post("/api/admin/loans/{ref}/{action}")
def admin_decide(ref: str, action: str, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    if action not in ("approve", "reject", "disburse"): raise HTTPException(400, "Invalid action")
    loan = db.query(Loan).filter_by(loan_ref=ref).first()
    if not loan: raise HTTPException(404, "Loan not found")
    loan.status = {"approve": "approved", "reject": "rejected", "disburse": "disbursed"}[action]
    db.commit(); return loan_dict(loan)

@app.get("/api/admin/stats")
def admin_stats(_: User = Depends(admin_only), db: Session = Depends(get_db)):
    total = db.query(func.count(Loan.id)).scalar()
    by = dict(db.query(Loan.status, func.count(Loan.id)).group_by(Loan.status).all())
    avg = db.query(func.avg(Loan.cibil_score)).scalar() or 0
    disb = db.query(func.coalesce(func.sum(Loan.amount), 0)).filter(Loan.status == "disbursed").scalar()
    rej = by.get("rejected", 0)
    funnel = [("Applications Received", total), ("KYC Verified", round(total * .89)),
              ("Credit Score Passed", total - rej), ("Approved", by.get("approved", 0) + by.get("disbursed", 0))]
    risk = dict(db.query(Loan.risk, func.count(Loan.id)).group_by(Loan.risk).all())
    return {"total": total, "pending": by.get("pending", 0), "approved": by.get("approved", 0), "rejected": rej,
            "disbursed": by.get("disbursed", 0), "disbursed_amount": disb, "avg_score": round(avg),
            "default_rate": round(rej / total * 100, 1) if total else 0,
            "funnel": [{"label": l, "count": c, "pct": round(c / total * 100) if total else 0} for l, c in funnel],
            "risk_distribution": {k: risk.get(k, 0) for k in ("low", "medium", "high")}}

@app.get("/api/admin/fraud-alerts")
def fraud_alerts(_: User = Depends(admin_only), db: Session = Depends(get_db)):
    return [{"id": a.alert_ref, "user": a.user_label, "type": a.alert_type, "severity": a.severity,
             "desc": a.description, "resolved": a.resolved,
             "time": a.created_at.strftime("%Y-%m-%d %H:%M")} for a in db.query(FraudAlert).order_by(FraudAlert.id)]

@app.post("/api/admin/fraud-alerts/{ref}/resolve")
def resolve_alert(ref: str, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    a = db.query(FraudAlert).filter_by(alert_ref=ref).first()
    if not a: raise HTTPException(404, "Alert not found")
    a.resolved = True; db.commit(); return {"ok": True}
