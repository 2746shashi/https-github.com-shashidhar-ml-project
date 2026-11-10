"""ML engine ported from SmartLoan_AI.py (Tkinter removed). Trains an ensemble on startup."""
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


class LoanMLEngine:
    FEATURES = ["age", "income", "loan_amount", "loan_term", "cibil_score", "employment_years",
                "existing_loans", "assets_value", "education_level", "loan_purpose",
                "monthly_obligations", "savings"]

    def __init__(self):
        self.models, self.acc, self.scaler = {}, {}, StandardScaler()
        self._train()

    def _generate(self, n=8000):
        rng = np.random.default_rng(42)
        age = rng.integers(21, 65, n); income = rng.integers(15_000, 600_000, n)
        cibil = rng.integers(300, 900, n); emp = rng.integers(0, 38, n)
        existing = rng.integers(0, 6, n); edu = rng.integers(0, 4, n); purpose = rng.integers(0, 5, n)
        term = rng.choice([12, 24, 36, 48, 60, 84, 120, 180, 240], n)
        assets = rng.integers(0, 15_000_000, n)
        savings = (income * rng.uniform(0.05, 0.5, n)).astype(int)
        oblig = (income * rng.uniform(0.0, 0.6, n)).astype(int)
        loan = np.clip((income * rng.uniform(1, 12, n)).astype(int), 10_000, 12_000_000)
        dti, foir = loan / (income + 1), oblig / (income + 1)
        eligible = ((cibil >= 650) & (income >= 20_000) & (dti < 8.0) & (foir < 0.55) &
                    (emp >= 1) & (existing < 4) & (assets >= loan * 0.2)).astype(int)
        flip = rng.choice([0, 1], n, p=[0.96, 0.04])
        eligible = np.abs(eligible - flip)
        return pd.DataFrame({"age": age, "income": income, "loan_amount": loan, "loan_term": term,
                             "cibil_score": cibil, "employment_years": emp, "existing_loans": existing,
                             "assets_value": assets, "education_level": edu, "loan_purpose": purpose,
                             "monthly_obligations": oblig, "savings": savings, "eligible": eligible})

    def _train(self):
        df = self._generate()
        X, y = df[self.FEATURES], df["eligible"]
        Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)
        Xtr_s, Xte_s = self.scaler.fit_transform(Xtr), self.scaler.transform(Xte)
        specs = {
            "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_split=5, random_state=42, n_jobs=-1),
            "Gradient Boost": GradientBoostingClassifier(n_estimators=150, max_depth=5, learning_rate=0.08, random_state=42),
            "Logistic Reg": LogisticRegression(C=1.0, max_iter=2000, random_state=42),
        }
        for name, m in specs.items():
            m.fit(Xtr_s, ytr)
            self.acc[name] = round(accuracy_score(yte, m.predict(Xte_s)) * 100, 2)
            self.models[name] = m
        total = sum(self.acc.values())
        self.weights = {k: v / total for k, v in self.acc.items()}

    def predict(self, f: dict) -> dict:
        row = self.scaler.transform(np.array([f[k] for k in self.FEATURES]).reshape(1, -1))
        probs, ens = {}, 0.0
        for name, m in self.models.items():
            p = float(m.predict_proba(row)[0][1])
            probs[name] = round(p * 100, 1)
            ens += p * self.weights[name]
        emi, rate = self._emi(f)
        return {
            "eligible": bool(ens >= 0.5), "confidence": round(ens * 100, 1),
            "risk_rating": self._risk(ens), "model_probs": probs, "accuracies": self.acc,
            "rules": self._rules(f), "banks": self._banks(f), "emi": emi, "rate": rate,
            "max_loan": self._max_loan(f), "total_payable": emi * f["loan_term"],
            "interest_paid": max(0, emi * f["loan_term"] - f["loan_amount"]),
        }

    @staticmethod
    def _risk(p):
        return "LOW RISK" if p >= .8 else "MEDIUM RISK" if p >= .6 else "HIGH RISK" if p >= .4 else "VERY HIGH"

    @staticmethod
    def _emi(f):
        c = f["cibil_score"]
        rate = 7.5 if c >= 800 else 8.5 if c >= 750 else 10.0 if c >= 700 else 12.5 if c >= 650 else 15.0 if c >= 600 else 18.0
        P, n, r = f["loan_amount"], f["loan_term"], rate / 1200
        return int(P * r * (1 + r) ** n / ((1 + r) ** n - 1)) if r else int(P / n), rate

    @staticmethod
    def _max_loan(f):
        mult = min(f["cibil_score"] / 750, 1.0)
        return int(min(max(f["income"] - f["monthly_obligations"], 0) * 60 * mult, 12_000_000))

    @staticmethod
    def _rules(f):
        out, c, inc, loan = [], f["cibil_score"], f["income"], f["loan_amount"]
        emp, ex, assets = f["employment_years"], f["existing_loans"], f["assets_value"]
        foir, dti, cover = f["monthly_obligations"] / (inc + 1), loan / (inc + 1), f["assets_value"] / (loan + 1)
        def add(title, detail, status): out.append({"title": title, "detail": detail, "status": status})
        add("CIBIL Score", f"{c}", "good" if c >= 700 else "warn" if c >= 600 else "bad")
        add("Monthly Income", f"₹{inc:,}", "good" if inc >= 50_000 else "warn" if inc >= 20_000 else "bad")
        add("FOIR", f"{foir*100:.1f}%", "good" if foir < .35 else "warn" if foir < .5 else "bad")
        add("Debt-to-Income", f"{dti:.1f}x", "good" if dti < 3 else "warn" if dti < 6 else "bad")
        add("Employment", f"{emp} yrs", "good" if emp >= 2 else "warn" if emp >= 1 else "bad")
        add("Existing Loans", f"{ex} active", "good" if ex == 0 else "warn" if ex <= 2 else "bad")
        add("Asset Coverage", f"{cover:.1f}x (₹{assets:,})", "good" if cover >= 2 else "warn" if cover >= .8 else "bad")
        return out

    @staticmethod
    def _banks(f):
        banks = [
            {"name": "SBI Home Loans", "rate": "8.40%", "min_cibil": 650, "specialty": "Home & Property", "processing": "0.35%"},
            {"name": "HDFC Bank", "rate": "8.70%", "min_cibil": 700, "specialty": "Home & Personal", "processing": "0.50%"},
            {"name": "ICICI Bank", "rate": "9.00%", "min_cibil": 700, "specialty": "All Categories", "processing": "0.50%"},
            {"name": "Axis Bank", "rate": "9.15%", "min_cibil": 650, "specialty": "Business Loans", "processing": "0.40%"},
            {"name": "Kotak Mahindra", "rate": "9.50%", "min_cibil": 720, "specialty": "Premium Clients", "processing": "0.75%"},
            {"name": "Bank of Baroda", "rate": "8.60%", "min_cibil": 640, "specialty": "Agriculture/SME", "processing": "0.25%"},
            {"name": "Punjab National Bank", "rate": "8.50%", "min_cibil": 620, "specialty": "Education Loans", "processing": "0.30%"},
            {"name": "IDFC FIRST Bank", "rate": "9.75%", "min_cibil": 650, "specialty": "Personal Loans", "processing": "1.00%"},
        ]
        m = [b for b in banks if f["cibil_score"] >= b["min_cibil"]]
        return m[:5] if m else banks[-3:]


_engine = None
def get_engine() -> LoanMLEngine:
    global _engine
    if _engine is None:
        _engine = LoanMLEngine()
    return _engine
