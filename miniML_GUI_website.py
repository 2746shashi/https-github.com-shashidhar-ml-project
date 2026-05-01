"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║         SmartLoan AI  —  Intelligent Loan Eligibility Prediction System      ║
║                                                                              ║
║  TECH STACK:  Python · Tkinter · Scikit-learn · NumPy · Pandas              ║
║  ML MODELS:   Random Forest · Gradient Boosting · Logistic Regression        ║
║  FEATURES:    Real-Time Prediction · Bank Comparison · EMI Calculator        ║
║               Decision Rules Engine · Risk Profiling · CIBIL Analysis        ║
║                                                                              ║
║  Author   : SmartLoan AI Project                                             ║
║  Version  : 2.0.0                                                            ║
║  Purpose  : Resume/Portfolio Grade ML + GUI Project                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ─────────────────────────────────────────────────────────────────────────────
#  IMPORTS
# ─────────────────────────────────────────────────────────────────────────────
import tkinter as tk
from tkinter import ttk, messagebox
from tkinter import font as tkFont
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import threading
import time
import math
import warnings
warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────────────────────────────────────
#  DESIGN TOKENS  (Dark luxury fintech theme)
# ─────────────────────────────────────────────────────────────────────────────
C = {
    "bg":         "#080D18",
    "panel":      "#0D1526",
    "card":       "#111D35",
    "input_bg":   "#0A1428",
    "border":     "#1E2D4A",
    "accent":     "#00C6FF",
    "accent2":    "#7B5EA7",
    "green":      "#00E676",
    "red":        "#FF5252",
    "amber":      "#FFB300",
    "gold":       "#FFD700",
    "txt":        "#E8F0FE",
    "txt_dim":    "#5A7BA0",
    "txt_muted":  "#3A5070",
    "white":      "#FFFFFF",
}

FONT = "Segoe UI"


# ─────────────────────────────────────────────────────────────────────────────
#  ML ENGINE
# ─────────────────────────────────────────────────────────────────────────────
class LoanMLEngine:
    """
    Ensemble ML engine combining 3 classifiers.
    Trained on 8 000 synthetic but statistically realistic loan records.
    """

    FEATURES = [
        "age", "income", "loan_amount", "loan_term",
        "cibil_score", "employment_years", "existing_loans",
        "assets_value", "education_level", "loan_purpose",
        "monthly_obligations", "savings",
    ]

    def __init__(self, status_cb=None):
        self.status_cb = status_cb or (lambda t: None)
        self.models    = {}
        self.acc       = {}
        self.scaler    = StandardScaler()
        self.trained   = False
        self._train()

    # ── data generation ────────────────────────────────────────
    def _generate(self, n=8_000):
        rng = np.random.default_rng(42)

        age           = rng.integers(21, 65, n)
        income        = rng.integers(15_000, 600_000, n)
        cibil         = rng.integers(300, 900, n)
        emp_years     = rng.integers(0, 38, n)
        existing      = rng.integers(0, 6, n)
        education     = rng.integers(0, 4, n)
        loan_purpose  = rng.integers(0, 5, n)
        loan_term     = rng.choice([12,24,36,48,60,84,120,180,240], n)
        assets        = rng.integers(0, 15_000_000, n)
        savings       = (income * rng.uniform(0.05, 0.5, n)).astype(int)
        monthly_oblig = (income * rng.uniform(0.0, 0.6, n)).astype(int)
        loan_amount   = np.clip((income * rng.uniform(1, 12, n)).astype(int),
                                 10_000, 12_000_000)

        # Ground-truth rule (realistic)
        dti      = loan_amount / (income + 1)
        foir     = monthly_oblig / (income + 1)
        eligible = (
            (cibil >= 650) &
            (income >= 20_000) &
            (dti < 8.0) &
            (foir < 0.55) &
            (emp_years >= 1) &
            (existing < 4) &
            (assets >= loan_amount * 0.2)
        ).astype(int)

        # 4 % noise for realism
        flip = rng.choice([0,1], n, p=[0.96, 0.04])
        eligible = np.abs(eligible - flip)

        return pd.DataFrame({
            "age": age, "income": income, "loan_amount": loan_amount,
            "loan_term": loan_term, "cibil_score": cibil,
            "employment_years": emp_years, "existing_loans": existing,
            "assets_value": assets, "education_level": education,
            "loan_purpose": loan_purpose,
            "monthly_obligations": monthly_oblig, "savings": savings,
            "eligible": eligible,
        })

    # ── training ───────────────────────────────────────────────
    def _train(self):
        self.status_cb("Generating 8,000 realistic loan records…")
        df = self._generate()

        X = df[self.FEATURES]
        y = df["eligible"]
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
        X_tr_s = self.scaler.fit_transform(X_tr)
        X_te_s = self.scaler.transform(X_te)

        specs = {
            "Random Forest":   RandomForestClassifier(
                                n_estimators=200, max_depth=12,
                                min_samples_split=5, random_state=42, n_jobs=-1),
            "Gradient Boost":  GradientBoostingClassifier(
                                n_estimators=150, max_depth=5,
                                learning_rate=0.08, random_state=42),
            "Logistic Reg":    LogisticRegression(
                                C=1.0, max_iter=2000, random_state=42),
        }

        for name, mdl in specs.items():
            self.status_cb(f"Training {name}…")
            mdl.fit(X_tr_s, y_tr)
            self.acc[name] = round(accuracy_score(y_te, mdl.predict(X_te_s)) * 100, 2)
            self.models[name] = mdl

        total = sum(self.acc.values())
        self.weights = {k: v/total for k, v in self.acc.items()}
        self.trained = True
        self.status_cb("ready")

    # ── prediction ─────────────────────────────────────────────
    def predict(self, f: dict) -> dict:
        row = np.array([f[k] for k in self.FEATURES]).reshape(1, -1)
        row_s = self.scaler.transform(row)

        model_probs = {}
        ensemble_p  = 0.0
        for name, mdl in self.models.items():
            p = mdl.predict_proba(row_s)[0][1]
            model_probs[name] = round(p * 100, 1)
            ensemble_p += p * self.weights[name]

        eligible    = ensemble_p >= 0.50
        confidence  = round(ensemble_p * 100, 1)
        risk_rating = self._risk_rating(f, ensemble_p)
        emi, rate   = self._emi(f)
        max_loan    = self._max_loan(f)

        return {
            "eligible":    eligible,
            "confidence":  confidence,
            "risk_rating": risk_rating,
            "model_probs": model_probs,
            "accuracies":  self.acc,
            "rules":       self._decision_rules(f),
            "banks":       self._banks(f, eligible),
            "emi":         emi,
            "rate":        rate,
            "max_loan":    max_loan,
            "total_payable": emi * f["loan_term"],
            "interest_paid": max(0, emi * f["loan_term"] - f["loan_amount"]),
        }

    # ── helpers ────────────────────────────────────────────────
    def _risk_rating(self, f, p):
        if p >= 0.80:   return ("LOW RISK",    C["green"])
        elif p >= 0.60: return ("MEDIUM RISK", C["amber"])
        elif p >= 0.40: return ("HIGH RISK",   C["red"])
        else:           return ("VERY HIGH",   C["red"])

    def _emi(self, f):
        c = f["cibil_score"]
        if   c >= 800: rate = 7.5
        elif c >= 750: rate = 8.5
        elif c >= 700: rate = 10.0
        elif c >= 650: rate = 12.5
        elif c >= 600: rate = 15.0
        else:          rate = 18.0
        P, n = f["loan_amount"], f["loan_term"]
        r = rate / 12 / 100
        emi = P * r * (1+r)**n / ((1+r)**n - 1) if r else P / n
        return int(emi), rate

    def _max_loan(self, f):
        mult = min(f["cibil_score"] / 750, 1.0)
        disposable = max(f["income"] - f["monthly_obligations"], 0)
        return int(min(disposable * 60 * mult, 12_000_000))

    def _decision_rules(self, f):
        rules = []
        c = f["cibil_score"]
        inc = f["income"]
        loan = f["loan_amount"]
        emp = f["employment_years"]
        ex = f["existing_loans"]
        assets = f["assets_value"]
        oblig = f["monthly_obligations"]
        foir = oblig / (inc + 1)
        dti = loan / (inc + 1)

        def add(icon, title, detail, status):
            rules.append((icon, title, detail, status))

        # CIBIL
        if c >= 800:    add("✅", "CIBIL Score",   f"{c} — Excellent (Premium rates)", "good")
        elif c >= 750:  add("✅", "CIBIL Score",   f"{c} — Very Good",                "good")
        elif c >= 700:  add("✅", "CIBIL Score",   f"{c} — Good",                     "good")
        elif c >= 650:  add("⚠️", "CIBIL Score",   f"{c} — Fair (higher rates apply)","warn")
        elif c >= 600:  add("⚠️", "CIBIL Score",   f"{c} — Poor — improve urgently",  "warn")
        else:           add("❌", "CIBIL Score",   f"{c} — Very Poor — loan unlikely", "bad")

        # Income
        if inc >= 150_000:  add("✅","Monthly Income", f"₹{inc:,} — Strong capacity",  "good")
        elif inc >= 50_000: add("✅","Monthly Income", f"₹{inc:,} — Adequate",         "good")
        elif inc >= 20_000: add("⚠️","Monthly Income", f"₹{inc:,} — Borderline",       "warn")
        else:               add("❌","Monthly Income", f"₹{inc:,} — Below minimum",    "bad")

        # FOIR
        if foir < 0.35:   add("✅","FOIR (Obligations)", f"{foir*100:.1f}% — Excellent","good")
        elif foir < 0.50: add("⚠️","FOIR (Obligations)", f"{foir*100:.1f}% — Moderate","warn")
        else:             add("❌","FOIR (Obligations)", f"{foir*100:.1f}% — Too high", "bad")

        # DTI
        if dti < 3:     add("✅","Debt-to-Income",  f"{dti:.1f}x — Excellent",         "good")
        elif dti < 6:   add("⚠️","Debt-to-Income",  f"{dti:.1f}x — Moderate",          "warn")
        else:           add("❌","Debt-to-Income",  f"{dti:.1f}x — Reduce loan amount", "bad")

        # Employment
        if emp >= 5:    add("✅","Employment",  f"{emp} yrs — Very stable",             "good")
        elif emp >= 2:  add("✅","Employment",  f"{emp} yrs — Acceptable",              "good")
        elif emp >= 1:  add("⚠️","Employment",  f"{emp} yrs — Borderline",              "warn")
        else:           add("❌","Employment",  "< 1 yr — High risk to lender",         "bad")

        # Existing loans
        if ex == 0:     add("✅","Existing Loans","None — Clean profile",               "good")
        elif ex <= 2:   add("⚠️","Existing Loans",f"{ex} active — manageable",         "warn")
        else:           add("❌","Existing Loans",f"{ex} active — too many liabilities","bad")

        # Collateral
        cover = assets / (loan + 1)
        if cover >= 2:    add("✅","Asset Coverage",  f"₹{assets:,} — Excellent ({cover:.1f}x)","good")
        elif cover >= 0.8: add("⚠️","Asset Coverage", f"₹{assets:,} — Partial ({cover:.1f}x)",  "warn")
        else:             add("❌","Asset Coverage",  f"₹{assets:,} — Insufficient",              "bad")

        return rules

    def _banks(self, f, eligible):
        all_banks = [
            {"name":"SBI Home Loans",     "rate":"8.40%","min_cibil":650,
             "specialty":"Home & Property","logo":"🏛️","processing":"0.35%"},
            {"name":"HDFC Bank",           "rate":"8.70%","min_cibil":700,
             "specialty":"Home & Personal","logo":"🔵","processing":"0.50%"},
            {"name":"ICICI Bank",          "rate":"9.00%","min_cibil":700,
             "specialty":"All Categories", "logo":"🟠","processing":"0.50%"},
            {"name":"Axis Bank",           "rate":"9.15%","min_cibil":650,
             "specialty":"Business Loans", "logo":"🟣","processing":"0.40%"},
            {"name":"Kotak Mahindra",      "rate":"9.50%","min_cibil":720,
             "specialty":"Premium Clients","logo":"🔴","processing":"0.75%"},
            {"name":"Bank of Baroda",      "rate":"8.60%","min_cibil":640,
             "specialty":"Agriculture/SME","logo":"🟡","processing":"0.25%"},
            {"name":"Punjab National Bank","rate":"8.50%","min_cibil":620,
             "specialty":"Education Loans","logo":"🟢","processing":"0.30%"},
            {"name":"IDFC FIRST Bank",     "rate":"9.75%","min_cibil":650,
             "specialty":"Personal Loans", "logo":"⚪","processing":"1.00%"},
        ]
        matched = [b for b in all_banks if f["cibil_score"] >= b["min_cibil"]]
        return matched[:5] if matched else all_banks[-3:]


# ─────────────────────────────────────────────────────────────────────────────
#  REUSABLE WIDGET HELPERS
# ─────────────────────────────────────────────────────────────────────────────
def make_card(parent, **kwargs):
    defaults = dict(bg=C["card"], relief="flat",
                    highlightthickness=1,
                    highlightbackground=C["border"])
    defaults.update(kwargs)
    return tk.Frame(parent, **defaults)

def label(parent, text, size=10, bold=False, color=None, **kw):
    weight = "bold" if bold else "normal"
    color  = color or C["txt"]
    return tk.Label(parent, text=text,
                    font=(FONT, size, weight),
                    fg=color, bg=parent.cget("bg"), **kw)

def hdivider(parent, color=None):
    tk.Frame(parent, bg=color or C["border"], height=1).pack(fill="x", pady=4)


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN APPLICATION WINDOW
# ─────────────────────────────────────────────────────────────────────────────
class SmartLoanApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("SmartLoan AI — Intelligent Loan Eligibility Prediction System")
        self.root.geometry("1400x860")
        self.root.minsize(1200, 720)
        self.root.configure(bg=C["bg"])
        self._center_window()

        self.engine      = None
        self.result_data = None
        self._vars       = {}
        self._spinning   = False

        self._build_ui()
        threading.Thread(target=self._load_engine, daemon=True).start()
        self.root.mainloop()

    def _center_window(self):
        self.root.update_idletasks()
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        w, h = 1400, 860
        self.root.geometry(f"{w}x{h}+{(sw-w)//2}+{(sh-h)//2}")

    # ══════════════════════════════════════════════════════════
    #  UI BUILD
    # ══════════════════════════════════════════════════════════
    def _build_ui(self):
        self._build_titlebar()
        self._build_body()
        self._build_statusbar()

    # ── Title Bar ─────────────────────────────────────────────
    def _build_titlebar(self):
        tb = tk.Frame(self.root, bg="#050A15", height=60)
        tb.pack(fill="x")
        tb.pack_propagate(False)

        inner = tk.Frame(tb, bg="#050A15")
        inner.pack(fill="both", expand=True, padx=20)

        # Logo
        lf = tk.Frame(inner, bg="#050A15")
        lf.pack(side="left", fill="y")
        tk.Label(lf, text="◈", font=(FONT,20,"bold"),
                 fg=C["accent"], bg="#050A15").pack(side="left", pady=14)
        tk.Label(lf, text=" SmartLoan", font=(FONT,16,"bold"),
                 fg=C["white"], bg="#050A15").pack(side="left")
        tk.Label(lf, text=" AI", font=(FONT,16,"bold"),
                 fg=C["accent"], bg="#050A15").pack(side="left")
        tk.Label(lf, text="  ·  Intelligent Loan Eligibility Prediction",
                 font=(FONT,9), fg=C["txt_dim"], bg="#050A15").pack(side="left",pady=18)

        # Badges
        rf = tk.Frame(inner, bg="#050A15")
        rf.pack(side="right", fill="y", pady=16)
        for txt, clr in [("ML POWERED",C["accent"]),("REAL-TIME",C["green"]),
                         ("ENSEMBLE AI",C["accent2"]),("v2.0",C["txt_dim"])]:
            tk.Label(rf, text=f" {txt} ", font=(FONT,8,"bold"),
                     fg=clr, bg="#0A1520",
                     padx=8, pady=3).pack(side="left", padx=3)

        # Accent line
        tk.Frame(self.root, bg=C["accent"], height=2).pack(fill="x")

    # ── Body ──────────────────────────────────────────────────
    def _build_body(self):
        body = tk.Frame(self.root, bg=C["bg"])
        body.pack(fill="both", expand=True)

        # LEFT — form
        self.left = tk.Frame(body, bg=C["bg"], width=420)
        self.left.pack(side="left", fill="y", padx=(14,6), pady=10)
        self.left.pack_propagate(False)
        self._build_form(self.left)

        # RIGHT — tabs
        self.right = tk.Frame(body, bg=C["bg"])
        self.right.pack(side="left", fill="both", expand=True, padx=(6,14), pady=10)
        self._build_right_panel(self.right)

    # ── Form ──────────────────────────────────────────────────
    def _build_form(self, parent):
        # Canvas + scrollbar for long form
        cv  = tk.Canvas(parent, bg=C["bg"], highlightthickness=0, bd=0)
        sb  = ttk.Scrollbar(parent, orient="vertical", command=cv.yview)
        self.form_inner = tk.Frame(cv, bg=C["bg"])
        self.form_inner.bind("<Configure>",
            lambda e: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0,0), window=self.form_inner, anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        cv.bind_all("<MouseWheel>",
            lambda e: cv.yview_scroll(int(-1*(e.delta/120)), "units"))

        fi = self.form_inner

        # ── Sections
        self._fsection(fi, "👤  Personal Details")
        self._finput(fi, "Full Name",         "name",            "entry",  default="Rahul Sharma")
        self._finput(fi, "Age (years)",        "age",             "spin",   spin=(21,65,1),   default=32)
        self._finput(fi, "Education",          "education_level", "combo",
                     choices=["High School","Graduate","Post Graduate","PhD"], default="Graduate")

        self._fsection(fi, "💰  Financial Profile")
        self._finput(fi, "Monthly Income (₹)", "income",         "spin",   spin=(10000,1000000,5000), default=75000)
        self._finput(fi, "CIBIL Score",         "cibil_score",   "spin",   spin=(300,900,1),   default=720)
        self._finput(fi, "Employment (years)",  "employment_years","spin",  spin=(0,40,1),      default=5)
        self._finput(fi, "Monthly Obligations (₹)","monthly_obligations","spin",
                     spin=(0,200000,1000), default=15000)
        self._finput(fi, "Monthly Savings (₹)", "savings",        "spin",  spin=(0,500000,1000),default=10000)
        self._finput(fi, "Existing Loans",      "existing_loans", "spin",  spin=(0,10,1),       default=1)
        self._finput(fi, "Total Assets (₹)",    "assets_value",   "spin",  spin=(0,30000000,50000),default=1500000)

        self._fsection(fi, "🏦  Loan Details")
        self._finput(fi, "Loan Amount (₹)",   "loan_amount",  "spin",
                     spin=(10000,15000000,10000), default=500000)
        self._finput(fi, "Loan Term (months)", "loan_term",    "combo",
                     choices=["12","24","36","48","60","84","120","180","240"], default="60")
        self._finput(fi, "Loan Purpose",       "loan_purpose", "combo",
                     choices=["Home Loan","Car Loan","Education Loan","Personal Loan","Business Loan"],
                     default="Home Loan")

        # ── Buttons
        tk.Frame(fi, bg=C["bg"], height=10).pack()

        self.predict_btn = tk.Button(
            fi, text="⚡  PREDICT LOAN ELIGIBILITY",
            font=(FONT,12,"bold"), bg=C["accent"], fg="#000000",
            activebackground="#00A8D0", activeforeground="#000",
            relief="flat", pady=14, cursor="hand2",
            command=self._on_predict)
        self.predict_btn.pack(fill="x", padx=6, pady=3)

        tk.Button(fi, text="↺  Reset All Fields",
                  font=(FONT,9), bg=C["card"], fg=C["txt_dim"],
                  relief="flat", pady=7, cursor="hand2",
                  command=self._reset).pack(fill="x", padx=6, pady=(0,12))

        # ── Model accuracy info (filled after training)
        self.acc_frame = make_card(fi)
        self.acc_frame.pack(fill="x", padx=6, pady=(0,8))
        label(self.acc_frame, "Model Accuracies", 9, bold=True,
              color=C["txt_dim"]).pack(anchor="w", padx=10, pady=(8,4))
        self.acc_labels = {}
        for m in ["Random Forest","Gradient Boost","Logistic Reg"]:
            row = tk.Frame(self.acc_frame, bg=C["card"])
            row.pack(fill="x", padx=10, pady=1)
            label(row, m+":", 8, color=C["txt_dim"]).pack(side="left")
            v = label(row, "training…", 8, bold=True, color=C["accent"])
            v.pack(side="right")
            self.acc_labels[m] = v
        tk.Frame(self.acc_frame, bg=C["bg"], height=6).pack()

    def _fsection(self, parent, text):
        f = tk.Frame(parent, bg=C["bg"])
        f.pack(fill="x", padx=6, pady=(12,2))
        label(f, text, 10, bold=True, color=C["accent"]).pack(anchor="w")
        tk.Frame(f, bg=C["accent"], height=1).pack(fill="x", pady=(2,0))

    def _finput(self, parent, lbl_text, key, kind, spin=None, choices=None, default=None):
        card = tk.Frame(parent, bg=C["card"],
                        highlightthickness=1, highlightbackground=C["border"])
        card.pack(fill="x", padx=6, pady=2)

        label(card, lbl_text, 9, bold=True, color=C["txt"]).pack(
            anchor="w", padx=10, pady=(6,2))

        s_cfg = dict(bg=C["input_bg"], fg=C["txt"], relief="flat",
                     insertbackground=C["accent"], font=(FONT,10),
                     highlightthickness=1,
                     highlightcolor=C["accent"],
                     highlightbackground=C["border"])

        if kind == "entry":
            var = tk.StringVar(value=default or "")
            tk.Entry(card, textvariable=var, **s_cfg).pack(
                fill="x", padx=10, pady=(0,8), ipady=6)
            self._vars[key] = var

        elif kind == "spin":
            lo, hi = spin[0], spin[1]
            inc = spin[2] if len(spin)>2 else 1
            var = tk.IntVar(value=default or lo)
            tk.Spinbox(card, from_=lo, to=hi, increment=inc,
                       textvariable=var, **s_cfg).pack(
                fill="x", padx=10, pady=(0,8), ipady=6)
            self._vars[key] = var

        elif kind == "combo":
            var = tk.StringVar(value=default or choices[0])
            st  = ttk.Style()
            st.theme_use("clam")
            st.configure("Loan.TCombobox",
                         fieldbackground=C["input_bg"],
                         background=C["input_bg"],
                         foreground=C["txt"],
                         arrowcolor=C["accent"],
                         bordercolor=C["border"],
                         lightcolor=C["input_bg"],
                         darkcolor=C["input_bg"],
                         selectbackground=C["accent"],
                         selectforeground="#000")
            ttk.Combobox(card, textvariable=var, values=choices,
                         style="Loan.TCombobox", state="readonly",
                         font=(FONT,10)).pack(
                fill="x", padx=10, pady=(0,8), ipady=4)
            self._vars[key] = var

    # ── Right Panel (tabs) ─────────────────────────────────────
    def _build_right_panel(self, parent):
        # Notebook
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Loan.TNotebook",
                         background=C["bg"], borderwidth=0)
        style.configure("Loan.TNotebook.Tab",
                         background=C["card"], foreground=C["txt_dim"],
                         padding=[16,8], font=(FONT,10,"bold"),
                         borderwidth=0)
        style.map("Loan.TNotebook.Tab",
                  background=[("selected", C["accent"])],
                  foreground=[("selected", "#000")])

        self.nb = ttk.Notebook(parent, style="Loan.TNotebook")
        self.nb.pack(fill="both", expand=True)

        self.tab_result  = tk.Frame(self.nb, bg=C["bg"])
        self.tab_rules   = tk.Frame(self.nb, bg=C["bg"])
        self.tab_banks   = tk.Frame(self.nb, bg=C["bg"])
        self.tab_compare = tk.Frame(self.nb, bg=C["bg"])
        self.tab_emi     = tk.Frame(self.nb, bg=C["bg"])

        self.nb.add(self.tab_result,  text="  📊 Decision  ")
        self.nb.add(self.tab_rules,   text="  🔍 Analysis  ")
        self.nb.add(self.tab_banks,   text="  🏦 Banks     ")
        self.nb.add(self.tab_compare, text="  ⚖️  Compare   ")
        self.nb.add(self.tab_emi,     text="  🧮 EMI Calc  ")

        self._init_tab_placeholders()

    def _init_tab_placeholders(self):
        for tab in [self.tab_result, self.tab_rules, self.tab_banks,
                    self.tab_compare, self.tab_emi]:
            for w in tab.winfo_children():
                w.destroy()

        # Loading state
        for tab in [self.tab_result, self.tab_rules, self.tab_banks,
                    self.tab_compare, self.tab_emi]:
            f = tk.Frame(tab, bg=C["bg"])
            f.place(relx=.5, rely=.5, anchor="center")
            label(f, "🤖", 42, color=C["txt_muted"]).pack()
            label(f, "Training AI Models…", 13, bold=True, color=C["txt_muted"]).pack(pady=6)
            label(f, "Please wait — generating 8,000 synthetic records & training 3 ML models",
                  9, color=C["txt_muted"]).pack()

    # ── Status Bar ────────────────────────────────────────────
    def _build_statusbar(self):
        sb = tk.Frame(self.root, bg="#050A15", height=28)
        sb.pack(fill="x", side="bottom")
        sb.pack_propagate(False)

        self.status_var = tk.StringVar(value="⟳  Initializing AI engine…")
        tk.Label(sb, textvariable=self.status_var, font=(FONT,8),
                 fg=C["txt_dim"], bg="#050A15",
                 anchor="w").pack(side="left", padx=14, fill="y")

        tk.Label(sb, text="SmartLoan AI v2.0  |  Ensemble ML  |  Resume-Grade Project",
                 font=(FONT,8), fg=C["txt_muted"],
                 bg="#050A15").pack(side="right", padx=14)

    # ══════════════════════════════════════════════════════════
    #  ENGINE LOADING
    # ══════════════════════════════════════════════════════════
    def _load_engine(self):
        def status(t):
            self.status_var.set(f"⟳  {t}")
        self.engine = LoanMLEngine(status_cb=status)
        self.root.after(0, self._on_engine_ready)

    def _on_engine_ready(self):
        self.status_var.set("✅  AI Engine ready — Fill the form and click Predict")
        for m, v in self.acc_labels.items():
            v.config(text=f"{self.engine.acc[m]}%", fg=C["green"])
        # Clear loading placeholders
        for tab in [self.tab_result, self.tab_rules, self.tab_banks,
                    self.tab_compare, self.tab_emi]:
            for w in tab.winfo_children():
                w.destroy()
        self._show_idle_state()

    def _show_idle_state(self):
        for tab in [self.tab_result, self.tab_rules, self.tab_banks,
                    self.tab_compare, self.tab_emi]:
            for w in tab.winfo_children():
                w.destroy()
            f = tk.Frame(tab, bg=C["bg"])
            f.place(relx=.5, rely=.5, anchor="center")
            label(f, "◈", 40, color=C["txt_muted"]).pack()
            label(f, "Fill the form and click Predict", 13, bold=True,
                  color=C["txt_dim"]).pack(pady=8)
            label(f, "Real-time AI analysis will appear here", 9,
                  color=C["txt_muted"]).pack()

    # ══════════════════════════════════════════════════════════
    #  PREDICTION
    # ══════════════════════════════════════════════════════════
    def _collect_features(self):
        edu_map = {"High School":0,"Graduate":1,"Post Graduate":2,"PhD":3}
        purp_map = {"Home Loan":0,"Car Loan":1,"Education Loan":2,
                    "Personal Loan":3,"Business Loan":4}

        f = {}
        f["age"]                = int(self._vars["age"].get())
        f["income"]             = int(self._vars["income"].get())
        f["loan_amount"]        = int(self._vars["loan_amount"].get())
        f["loan_term"]          = int(self._vars["loan_term"].get())
        f["cibil_score"]        = int(self._vars["cibil_score"].get())
        f["employment_years"]   = int(self._vars["employment_years"].get())
        f["existing_loans"]     = int(self._vars["existing_loans"].get())
        f["assets_value"]       = int(self._vars["assets_value"].get())
        f["education_level"]    = edu_map.get(self._vars["education_level"].get(), 1)
        f["loan_purpose"]       = purp_map.get(self._vars["loan_purpose"].get(), 3)
        f["monthly_obligations"]= int(self._vars["monthly_obligations"].get())
        f["savings"]            = int(self._vars["savings"].get())
        return f

    def _on_predict(self):
        if not self.engine or not self.engine.trained:
            messagebox.showwarning("Not Ready", "AI Engine is still training. Please wait.")
            return

        try:
            f = self._collect_features()
        except Exception as e:
            messagebox.showerror("Input Error", str(e))
            return

        # Button animation
        self.predict_btn.config(text="⟳  Analyzing…", state="disabled", bg="#005F7A")
        self.status_var.set("⟳  Running ensemble prediction…")
        self.root.update()

        def run():
            result = self.engine.predict(f)
            self.result_data = result
            self.root.after(0, lambda: self._show_results(result, f))

        threading.Thread(target=run, daemon=True).start()

    def _show_results(self, r, f):
        self.predict_btn.config(text="⚡  PREDICT LOAN ELIGIBILITY",
                                state="normal", bg=C["accent"])
        name = self._vars["name"].get() or "Applicant"
        self.status_var.set(f"✅  Analysis complete for {name}  |  "
                            f"Confidence: {r['confidence']}%  |  "
                            f"Risk: {r['risk_rating'][0]}")

        self._render_decision_tab(r, f, name)
        self._render_rules_tab(r)
        self._render_banks_tab(r, f)
        self._render_compare_tab(r)
        self._render_emi_tab(r, f)
        self.nb.select(0)

    # ══════════════════════════════════════════════════════════
    #  TAB RENDERERS
    # ══════════════════════════════════════════════════════════

    # ── Tab 1 : Decision ──────────────────────────────────────
    def _render_decision_tab(self, r, f, name):
        tab = self.tab_result
        for w in tab.winfo_children(): w.destroy()

        eligible   = r["eligible"]
        conf       = r["confidence"]
        risk_txt, risk_col = r["risk_rating"]
        clr        = C["green"] if eligible else C["red"]
        verdict    = "APPROVED ✓" if eligible else "DECLINED ✗"

        # Scrollable
        cv = tk.Canvas(tab, bg=C["bg"], highlightthickness=0)
        cv.pack(fill="both", expand=True)
        inner = tk.Frame(cv, bg=C["bg"])
        cv.create_window((0,0), window=inner, anchor="nw")
        inner.bind("<Configure>", lambda e: cv.configure(scrollregion=cv.bbox("all")))

        # ── Big verdict banner
        banner = tk.Frame(inner, bg=C["card"],
                          highlightthickness=2, highlightbackground=clr)
        banner.pack(fill="x", padx=14, pady=(14,6))

        top = tk.Frame(banner, bg=C["card"])
        top.pack(fill="x", padx=20, pady=14)

        lf = tk.Frame(top, bg=C["card"])
        lf.pack(side="left")
        label(lf, f"Loan Decision for {name}", 10, color=C["txt_dim"]).pack(anchor="w")
        label(lf, verdict, 32, bold=True, color=clr).pack(anchor="w")
        label(lf, f"AI Confidence Score: {conf}%", 11, color=C["txt"]).pack(anchor="w", pady=(4,0))

        rf = tk.Frame(top, bg=C["card"])
        rf.pack(side="right")

        # Confidence ring (canvas)
        ring = tk.Canvas(rf, width=120, height=120,
                         bg=C["card"], highlightthickness=0)
        ring.pack()
        self._draw_ring(ring, conf, clr)

        # Risk badge + max loan
        mid = tk.Frame(banner, bg=C["card"])
        mid.pack(fill="x", padx=20, pady=(0,14))

        for txt, val, vc in [
            ("Risk Rating",  risk_txt, risk_col),
            ("Max Eligible Loan", f"₹{r['max_loan']:,}", C["accent"]),
            ("Interest Rate", f"{r['rate']}% p.a.", C["amber"]),
            ("Monthly EMI",  f"₹{r['emi']:,}", C["txt"]),
        ]:
            b = tk.Frame(mid, bg="#0A1520",
                         highlightthickness=1, highlightbackground=C["border"])
            b.pack(side="left", expand=True, fill="x", padx=4)
            label(b, txt, 8, color=C["txt_dim"]).pack(anchor="w", padx=10, pady=(8,0))
            label(b, val, 12, bold=True, color=vc).pack(anchor="w", padx=10, pady=(0,8))

        # ── ML Model scores
        ms_card = make_card(inner)
        ms_card.pack(fill="x", padx=14, pady=6)
        label(ms_card, "🤖  ML Model Breakdown", 10, bold=True,
              color=C["accent"]).pack(anchor="w", padx=14, pady=(10,6))

        row = tk.Frame(ms_card, bg=C["card"])
        row.pack(fill="x", padx=14, pady=(0,12))

        for mname, prob in r["model_probs"].items():
            acc = r["accuracies"][mname]
            mc  = tk.Frame(row, bg=C["input_bg"],
                           highlightthickness=1, highlightbackground=C["border"])
            mc.pack(side="left", expand=True, fill="x", padx=4)
            label(mc, mname, 9, bold=True, color=C["txt"]).pack(anchor="w", padx=10, pady=(8,2))
            label(mc, f"Approval Prob: {prob}%", 10, bold=True,
                  color=C["green"] if prob>=50 else C["red"]).pack(anchor="w", padx=10)
            label(mc, f"Model Acc: {acc}%", 8, color=C["txt_dim"]).pack(anchor="w", padx=10, pady=(0,8))
            # Mini progress bar
            pb = tk.Canvas(mc, height=6, bg=C["border"],
                           highlightthickness=0)
            pb.pack(fill="x", padx=10, pady=(0,10))
            mc.update_idletasks()
            w_ = pb.winfo_width() or 160
            fill_w = int(w_ * prob / 100)
            pc = C["green"] if prob>=50 else C["red"]
            pb.create_rectangle(0,0,fill_w,6, fill=pc, outline="")

        # ── Loan summary
        sm = make_card(inner)
        sm.pack(fill="x", padx=14, pady=6)
        label(sm, "📋  Loan Summary", 10, bold=True, color=C["accent"]).pack(
            anchor="w", padx=14, pady=(10,6))

        fields = [
            ("Loan Amount",     f"₹{f['loan_amount']:,}"),
            ("Tenure",          f"{f['loan_term']} months"),
            ("Interest Rate",   f"{r['rate']}% p.a."),
            ("Monthly EMI",     f"₹{r['emi']:,}"),
            ("Total Payable",   f"₹{r['total_payable']:,}"),
            ("Interest Paid",   f"₹{r['interest_paid']:,}"),
            ("CIBIL Score",     str(f["cibil_score"])),
            ("Monthly Income",  f"₹{f['income']:,}"),
        ]
        grid = tk.Frame(sm, bg=C["card"])
        grid.pack(fill="x", padx=14, pady=(0,12))
        for i, (k,v) in enumerate(fields):
            r_ = i // 4
            c_ = i % 4
            cell = tk.Frame(grid, bg=C["input_bg"],
                            highlightthickness=1, highlightbackground=C["border"])
            cell.grid(row=r_, column=c_, padx=3, pady=3, sticky="ew")
            grid.columnconfigure(c_, weight=1)
            label(cell, k, 8, color=C["txt_dim"]).pack(anchor="w", padx=8, pady=(6,1))
            label(cell, v, 10, bold=True, color=C["txt"]).pack(anchor="w", padx=8, pady=(0,6))

    def _draw_ring(self, canvas, pct, color):
        canvas.delete("all")
        x, y, r = 60, 60, 48
        # Background ring
        canvas.create_oval(x-r,y-r,x+r,y+r,
                           outline=C["border"], width=8, fill="")
        # Colored arc
        extent = -360 * pct / 100
        canvas.create_arc(x-r,y-r,x+r,y+r,
                          start=90, extent=extent,
                          outline=color, width=8, style="arc")
        canvas.create_text(x, y,   text=f"{pct}%", fill=color,
                           font=(FONT,14,"bold"))
        canvas.create_text(x, y+18, text="confidence", fill=C["txt_dim"],
                           font=(FONT,7))

    # ── Tab 2 : Analysis (Decision Rules) ─────────────────────
    def _render_rules_tab(self, r):
        tab = self.tab_rules
        for w in tab.winfo_children(): w.destroy()

        cv = tk.Canvas(tab, bg=C["bg"], highlightthickness=0)
        sb = ttk.Scrollbar(tab, orient="vertical", command=cv.yview)
        inner = tk.Frame(cv, bg=C["bg"])
        inner.bind("<Configure>", lambda e: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0,0), window=inner, anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")

        label(inner, "🔍  Intelligent Decision Analysis Engine",
              12, bold=True, color=C["txt"]).pack(anchor="w", padx=14, pady=(14,4))
        label(inner, "Every factor analyzed by our ML rule engine with detailed explanations",
              9, color=C["txt_dim"]).pack(anchor="w", padx=14, pady=(0,10))

        status_map = {
            "good": (C["green"],  "#0D2520", "●"),
            "warn": (C["amber"],  "#251E00", "◐"),
            "bad":  (C["red"],    "#250000", "○"),
        }

        for icon, title, detail, status in r["rules"]:
            clr, bg_, dot = status_map[status]
            card = tk.Frame(inner, bg=bg_,
                            highlightthickness=1, highlightbackground=clr)
            card.pack(fill="x", padx=14, pady=3)

            left  = tk.Frame(card, bg=bg_)
            left.pack(side="left", fill="y", padx=(12,0), pady=10)
            label(left, dot, 18, bold=True, color=clr).pack()

            mid = tk.Frame(card, bg=bg_)
            mid.pack(side="left", fill="both", expand=True, padx=10, pady=10)
            label(mid, f"  {icon}  {title}", 10, bold=True, color=clr).pack(anchor="w")
            label(mid, f"  {detail}", 9, color=C["txt"]).pack(anchor="w")

            right = tk.Frame(card, bg=bg_)
            right.pack(side="right", padx=12)
            s_txt = {"good":"PASS","warn":"CAUTION","bad":"FAIL"}[status]
            label(right, s_txt, 9, bold=True, color=clr).pack()

        # Summary
        rules = r["rules"]
        n_good = sum(1 for *_,s in rules if s=="good")
        n_warn = sum(1 for *_,s in rules if s=="warn")
        n_bad  = sum(1 for *_,s in rules if s=="bad")
        total  = len(rules)

        sm = make_card(inner)
        sm.pack(fill="x", padx=14, pady=12)
        label(sm, "📊  Rule Summary", 10, bold=True, color=C["accent"]).pack(
            anchor="w", padx=14, pady=(10,6))
        row = tk.Frame(sm, bg=C["card"])
        row.pack(fill="x", padx=14, pady=(0,12))
        for txt, val, clr in [("✅ PASS", n_good, C["green"]),
                               ("⚠️ CAUTION", n_warn, C["amber"]),
                               ("❌ FAIL", n_bad, C["red"]),
                               ("TOTAL", total, C["accent"])]:
            b = tk.Frame(row, bg=C["input_bg"],
                         highlightthickness=1, highlightbackground=C["border"])
            b.pack(side="left", expand=True, fill="x", padx=3)
            label(b, str(val), 20, bold=True, color=clr).pack(pady=(8,2))
            label(b, txt, 8, color=C["txt_dim"]).pack(pady=(0,8))

    # ── Tab 3 : Banks ─────────────────────────────────────────
    def _render_banks_tab(self, r, f):
        tab = self.tab_banks
        for w in tab.winfo_children(): w.destroy()

        cv = tk.Canvas(tab, bg=C["bg"], highlightthickness=0)
        sb = ttk.Scrollbar(tab, orient="vertical", command=cv.yview)
        inner = tk.Frame(cv, bg=C["bg"])
        inner.bind("<Configure>", lambda e: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0,0), window=inner, anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")

        label(inner, "🏦  Bank Recommendations & Comparison",
              12, bold=True, color=C["txt"]).pack(anchor="w", padx=14, pady=(14,2))
        label(inner, f"Based on your CIBIL score of {f['cibil_score']} — showing {len(r['banks'])} eligible banks",
              9, color=C["txt_dim"]).pack(anchor="w", padx=14, pady=(0,10))

        for i, bank in enumerate(r["banks"]):
            is_best = i == 0
            border_c = C["gold"] if is_best else C["border"]
            bg_c     = "#1A1600" if is_best else C["card"]

            card = tk.Frame(inner, bg=bg_c,
                            highlightthickness=1, highlightbackground=border_c)
            card.pack(fill="x", padx=14, pady=4)

            hdr = tk.Frame(card, bg=bg_c)
            hdr.pack(fill="x", padx=14, pady=(10,4))

            label(hdr, f"{bank['logo']}  {bank['name']}", 11, bold=True,
                  color=C["gold"] if is_best else C["txt"]).pack(side="left")
            if is_best:
                label(hdr, "  ★ BEST MATCH", 8, bold=True, color=C["gold"]).pack(side="left")

            # Details row
            dr = tk.Frame(card, bg=bg_c)
            dr.pack(fill="x", padx=14, pady=(0,10))

            # Compute EMI for this bank's rate
            rate_f = float(bank["rate"].replace("%",""))
            P, n = f["loan_amount"], f["loan_term"]
            r_m = rate_f / 12 / 100
            emi_b = int(P * r_m * (1+r_m)**n / ((1+r_m)**n - 1)) if r_m else P//n

            for k, v, c_ in [
                ("Interest Rate", bank["rate"], C["amber"]),
                ("Monthly EMI",  f"₹{emi_b:,}", C["green"]),
                ("Specialty",    bank["specialty"], C["accent"]),
                ("Processing",   bank["processing"], C["txt_dim"]),
                ("Min CIBIL",    str(bank["min_cibil"]), C["txt_dim"]),
            ]:
                b = tk.Frame(dr, bg=C["input_bg"] if not is_best else "#100E00",
                             highlightthickness=1, highlightbackground=C["border"])
                b.pack(side="left", expand=True, fill="x", padx=3)
                label(b, k, 7, color=C["txt_dim"]).pack(anchor="w", padx=8, pady=(6,1))
                label(b, v, 9, bold=True, color=c_).pack(anchor="w", padx=8, pady=(0,6))

        # CTA
        cta = make_card(inner)
        cta.pack(fill="x", padx=14, pady=(8,14))
        label(cta, "💡  How to Apply", 10, bold=True, color=C["accent"]).pack(
            anchor="w", padx=14, pady=(10,4))
        steps = [
            "1. Compare interest rates and EMIs above",
            "2. Visit the chosen bank's official website or branch",
            "3. Carry: Aadhaar, PAN, Income proof (6 months salary slips / ITR), Bank statements (12 months)",
            "4. Property documents (for home loan) or vehicle quotation (for car loan)",
            "5. Loan processing typically takes 3–7 working days after document submission",
        ]
        for s in steps:
            label(cta, s, 9, color=C["txt"]).pack(anchor="w", padx=14, pady=1)
        tk.Frame(cta, bg=C["bg"], height=8).pack()

    # ── Tab 4 : Compare (Loan Scenarios) ──────────────────────
    def _render_compare_tab(self, r):
        tab = self.tab_compare
        for w in tab.winfo_children(): w.destroy()

        cv = tk.Canvas(tab, bg=C["bg"], highlightthickness=0)
        sb = ttk.Scrollbar(tab, orient="vertical", command=cv.yview)
        inner = tk.Frame(cv, bg=C["bg"])
        inner.bind("<Configure>", lambda e: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0,0), window=inner, anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")

        label(inner, "⚖️  Loan Scenario Comparison",
              12, bold=True, color=C["txt"]).pack(anchor="w", padx=14, pady=(14,2))
        label(inner, "Comparing approval probabilities across multiple loan configurations",
              9, color=C["txt_dim"]).pack(anchor="w", padx=14, pady=(0,10))

        f  = self._collect_features()
        scenarios = [
            {"label":"Your Current",    "mult":1.0,  "term":f["loan_term"]},
            {"label":"50% Loan",        "mult":0.5,  "term":f["loan_term"]},
            {"label":"75% Loan",        "mult":0.75, "term":f["loan_term"]},
            {"label":"150% Loan",       "mult":1.5,  "term":f["loan_term"]},
            {"label":"Shorter Tenure",  "mult":1.0,  "term":max(12, f["loan_term"]//2)},
            {"label":"Longer Tenure",   "mult":1.0,  "term":min(240, f["loan_term"]*2)},
        ]

        for sc in scenarios:
            sf = dict(f)
            sf["loan_amount"] = int(f["loan_amount"] * sc["mult"])
            sf["loan_term"]   = sc["term"]
            res = self.engine.predict(sf)

            clr  = C["green"] if res["eligible"] else C["red"]
            card = tk.Frame(inner, bg=C["card"],
                            highlightthickness=1, highlightbackground=clr)
            card.pack(fill="x", padx=14, pady=3)

            row = tk.Frame(card, bg=C["card"])
            row.pack(fill="x", padx=14, pady=8)

            # Label
            lf = tk.Frame(row, bg=C["card"], width=130)
            lf.pack(side="left", fill="y")
            lf.pack_propagate(False)
            label(lf, sc["label"], 10, bold=True, color=C["txt"]).pack(anchor="w")
            label(lf, f"₹{sf['loan_amount']:,}", 8, color=C["txt_dim"]).pack(anchor="w")
            label(lf, f"{sc['term']} months", 8, color=C["txt_dim"]).pack(anchor="w")

            # Progress bar
            bf = tk.Frame(row, bg=C["card"])
            bf.pack(side="left", fill="both", expand=True, padx=10)
            pb = tk.Canvas(bf, height=20, bg=C["border"], highlightthickness=0)
            pb.pack(fill="x", pady=5)
            bf.update_idletasks()
            w_ = pb.winfo_width() or 300
            fw = int(w_ * res["confidence"] / 100)
            pb.create_rectangle(0,0,fw,20, fill=clr, outline="")
            pb.create_text(fw//2 if fw>40 else fw+30, 10,
                           text=f"{res['confidence']}%", fill="#000" if fw>40 else clr,
                           font=(FONT,8,"bold"))

            # Verdict
            vf = tk.Frame(row, bg=C["card"], width=100)
            vf.pack(side="right", fill="y")
            vf.pack_propagate(False)
            vt = "APPROVED" if res["eligible"] else "DECLINED"
            label(vf, vt, 9, bold=True, color=clr).pack(anchor="e")
            label(vf, f"EMI: ₹{res['emi']:,}", 8, color=C["txt_dim"]).pack(anchor="e")

        # Improvement tips
        tips = make_card(inner)
        tips.pack(fill="x", padx=14, pady=(10,14))
        label(tips, "💡  Tips to Improve Approval Chances",
              10, bold=True, color=C["accent"]).pack(anchor="w", padx=14, pady=(10,4))
        for tip in [
            "▸  Improve CIBIL score above 750 to unlock best rates",
            "▸  Reduce existing loans before applying",
            "▸  Opt for longer tenure to reduce EMI burden",
            "▸  Apply for a lower loan amount (50–70% of maximum)",
            "▸  Reduce monthly obligations / credit card dues",
            "▸  Add a co-applicant with higher income",
        ]:
            label(tips, tip, 9, color=C["txt"]).pack(anchor="w", padx=14, pady=1)
        tk.Frame(tips, bg=C["bg"], height=8).pack()

    # ── Tab 5 : EMI Calculator ────────────────────────────────
    def _render_emi_tab(self, r, f):
        tab = self.tab_emi
        for w in tab.winfo_children(): w.destroy()

        outer = tk.Frame(tab, bg=C["bg"])
        outer.pack(fill="both", expand=True, padx=14, pady=14)

        label(outer, "🧮  Advanced EMI Calculator & Amortization",
              12, bold=True, color=C["txt"]).pack(anchor="w", pady=(0,10))

        # ── Summary cards
        sc = make_card(outer)
        sc.pack(fill="x", pady=(0,10))
        row = tk.Frame(sc, bg=C["card"])
        row.pack(fill="x", padx=14, pady=12)

        emi_val = r["emi"]
        total   = r["total_payable"]
        interest= r["interest_paid"]
        rate_   = r["rate"]
        principal = f["loan_amount"]

        for txt, val, clr in [
            ("Principal",     f"₹{principal:,}",  C["accent"]),
            ("Interest Rate", f"{rate_}% p.a.",   C["amber"]),
            ("Monthly EMI",   f"₹{emi_val:,}",    C["green"]),
            ("Total Interest",f"₹{interest:,}",   C["red"]),
            ("Total Payable", f"₹{total:,}",       C["txt"]),
            ("Loan Tenure",   f"{f['loan_term']} mo", C["txt_dim"]),
        ]:
            b = tk.Frame(row, bg=C["input_bg"],
                         highlightthickness=1, highlightbackground=C["border"])
            b.pack(side="left", expand=True, fill="x", padx=3)
            label(b, txt, 8, color=C["txt_dim"]).pack(anchor="w", padx=8, pady=(6,1))
            label(b, val, 11, bold=True, color=clr).pack(anchor="w", padx=8, pady=(0,6))

        # ── Visual bar (principal vs interest)
        bar_card = make_card(outer)
        bar_card.pack(fill="x", pady=(0,10))
        label(bar_card, "Loan Composition", 10, bold=True,
              color=C["accent"]).pack(anchor="w", padx=14, pady=(10,4))

        bf = tk.Frame(bar_card, bg=C["card"])
        bf.pack(fill="x", padx=14, pady=(0,12))
        pb = tk.Canvas(bf, height=28, bg=C["border"], highlightthickness=0)
        pb.pack(fill="x", pady=4)
        bf.update_idletasks()
        tw = pb.winfo_width() or 400
        if total > 0:
            pw = int(tw * principal / total)
            pb.create_rectangle(0,0,pw,28, fill=C["accent"], outline="")
            pb.create_rectangle(pw,0,tw,28, fill=C["red"], outline="")
            pb.create_text(pw//2, 14, text=f"Principal {principal*100//total}%",
                           fill="#000", font=(FONT,8,"bold"))
            pb.create_text(pw+(tw-pw)//2, 14, text=f"Interest {interest*100//total}%",
                           fill="#fff", font=(FONT,8,"bold"))

        # ── Amortization table (first 12 months)
        am_card = make_card(outer)
        am_card.pack(fill="both", expand=True, pady=(0,0))
        label(am_card, "📅  Amortization Schedule (first 24 months)",
              10, bold=True, color=C["accent"]).pack(anchor="w", padx=14, pady=(10,4))

        # Table
        headers = ["Month","EMI (₹)","Principal (₹)","Interest (₹)","Balance (₹)"]
        hrow = tk.Frame(am_card, bg=C["border"])
        hrow.pack(fill="x", padx=14, pady=(0,1))
        for h in headers:
            label(hrow, h, 8, bold=True, color=C["txt_dim"]).pack(
                side="left", expand=True, fill="x", padx=6, pady=4)

        r_m    = rate_ / 12 / 100
        bal    = float(principal)
        n      = f["loan_term"]
        months = min(24, n)
        for mo in range(1, months+1):
            int_p  = bal * r_m
            prin_p = emi_val - int_p
            bal    = max(0, bal - prin_p)
            bg_r   = C["input_bg"] if mo % 2 == 0 else C["card"]
            drow   = tk.Frame(am_card, bg=bg_r)
            drow.pack(fill="x", padx=14, pady=0)
            for val in [str(mo), f"{emi_val:,}", f"{int(prin_p):,}",
                        f"{int(int_p):,}", f"{int(bal):,}"]:
                label(drow, val, 8, color=C["txt"]).pack(
                    side="left", expand=True, fill="x", padx=6, pady=3)

        if n > 24:
            label(am_card, f"  … and {n-24} more months",
                  8, color=C["txt_dim"]).pack(anchor="w", padx=20, pady=4)
        tk.Frame(am_card, bg=C["bg"], height=8).pack()

    # ══════════════════════════════════════════════════════════
    #  MISC
    # ══════════════════════════════════════════════════════════
    def _reset(self):
        defaults = {
            "name":"Rahul Sharma","age":32,"income":75000,
            "cibil_score":720,"employment_years":5,
            "monthly_obligations":15000,"savings":10000,
            "existing_loans":1,"assets_value":1500000,
            "loan_amount":500000,"loan_term":"60",
            "education_level":"Graduate","loan_purpose":"Home Loan",
        }
        for k, v in defaults.items():
            if k in self._vars:
                try: self._vars[k].set(v)
                except: pass
        self._show_idle_state()
        self.status_var.set("✅  Form reset — ready for new prediction")


# ─────────────────────────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════╗
║       SmartLoan AI — Intelligent Loan Eligibility System         ║
║       ML Models: Random Forest · Gradient Boosting · LR          ║
║       Training on 8,000 synthetic loan records…                  ║
╚══════════════════════════════════════════════════════════════════╝
""")
    SmartLoanApp()