"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║         SmartLoan AI  v3.0  --  Intelligent Loan Eligibility System         ║
║                                                                              ║
║  ML MODELS  : Random Forest · Gradient Boosting · Logistic Regression       ║
║  ALGORITHMS : A* Search · BFS · DFS · Dijkstra · Greedy Best-First          ║
║  FEATURES   : Real-Time Prediction · Bank Comparison · EMI Calculator        ║
║               Decision Rules · Risk Profiling · Algorithm Visualizer         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ---------------------------------------------------------------------------
#  IMPORTS
# ---------------------------------------------------------------------------
import tkinter as tk
from tkinter import ttk, messagebox
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
import heapq
from collections import deque
import warnings
warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
#  DESIGN TOKENS
# ---------------------------------------------------------------------------
C = {
    "bg":        "#080D18",
    "panel":     "#0D1526",
    "card":      "#111D35",
    "input_bg":  "#0A1428",
    "border":    "#1E2D4A",
    "accent":    "#00C6FF",
    "accent2":   "#7B5EA7",
    "green":     "#00E676",
    "red":       "#FF5252",
    "amber":     "#FFB300",
    "gold":      "#FFD700",
    "txt":       "#E8F0FE",
    "txt_dim":   "#5A7BA0",
    "txt_muted": "#3A5070",
    "white":     "#FFFFFF",
    # Algorithm-specific
    "alg_a":     "#FF6B9D",   # A*
    "alg_bfs":   "#00E676",   # BFS
    "alg_dfs":   "#FFB300",   # DFS
    "alg_dijk":  "#00C6FF",   # Dijkstra
    "alg_grdy":  "#7B5EA7",   # Greedy
    "node_def":  "#1E2D4A",
    "node_visit":"#1A3A2A",
    "node_path": "#0A2A40",
    "node_start":"#002200",
    "node_goal": "#220000",
}

FONT = "Segoe UI"


# ===========================================================================
#  ALGORITHM ENGINE  (A*, BFS, DFS, Dijkstra, Greedy)
# ===========================================================================
class AlgorithmEngine:
    """
    Loan-domain graph where NODES are financial states and
    EDGES represent improvement actions (improve CIBIL, reduce debt, etc.)
    Each algorithm finds the OPTIMAL PATH from a poor-credit state
    to an approved-loan state.
    """

    # --- Build the loan-domain state graph ----------------------------------
    @staticmethod
    def build_loan_graph():
        """
        Nodes  : (cibil_band, foir_band, income_band)
                  cibil_band  : 0=<600, 1=600-650, 2=650-700, 3=700-750, 4=750+
                  foir_band   : 0=>60%, 1=50-60%, 2=40-50%, 3=<40%
                  income_band : 0=<20k, 1=20-50k, 2=50-100k, 3=100k+
        Edges  : (action_label, cost, neighbour_node)
        Goal   : cibil_band>=3 AND foir_band>=2 AND income_band>=1
        """
        graph = {}
        def node(c, f, i): return (c, f, i)

        # All possible states
        for c in range(5):
            for f in range(4):
                for i in range(4):
                    n = node(c, f, i)
                    edges = []

                    # Improve CIBIL (pay dues, clear defaults) cost=3 months
                    if c < 4:
                        edges.append(("Improve CIBIL (+1 band)", 3, node(c+1, f, i)))

                    # Reduce FOIR (prepay loans / reduce dues) cost=2 months
                    if f < 3:
                        edges.append(("Reduce Obligations (-band)", 2, node(c, f+1, i)))

                    # Increase income (new job / freelance) cost=4 months
                    if i < 3:
                        edges.append(("Increase Income (+band)", 4, node(c, f, i+1)))

                    # Close existing loan (reduces FOIR + CIBIL boost)
                    if f < 3 and c < 4:
                        edges.append(("Close Existing Loan", 4, node(c+1, f+1, i)))

                    # Co-applicant (income band jump)
                    if i < 3:
                        edges.append(("Add Co-applicant", 1, node(c, f, i+1)))

                    graph[n] = edges
        return graph

    # --- Heuristic for A* --------------------------------------------------
    @staticmethod
    def heuristic(node, goal=(3, 2, 1)):
        c, f, i = node
        gc, gf, gi = goal
        return max(0, gc - c) + max(0, gf - f) + max(0, gi - i)

    # --- Goal test ----------------------------------------------------------
    @staticmethod
    def is_goal(node):
        c, f, i = node
        return c >= 3 and f >= 2 and i >= 1

    # --- NODE LABEL ---------------------------------------------------------
    @staticmethod
    def node_label(node):
        c, f, i = node
        cb = ["<600", "600-650", "650-700", "700-750", "750+"][c]
        fb = [">60%", "50-60%", "40-50%", "<40%"][f]
        ib = ["<20k", "20-50k", "50-100k", "100k+"][i]
        return f"C:{cb}\nF:{fb}\nI:{ib}"

    # ========================================================================
    #  A*  SEARCH
    # ========================================================================
    def astar(self, start, graph):
        """
        A* = Dijkstra + heuristic.
        Priority queue ordered by f(n) = g(n) + h(n).
        Guarantees OPTIMAL path.
        """
        open_set  = [(self.heuristic(start), 0, start, [start], [])]
        visited   = set()
        explored  = []   # for visualization: list of (node, g, h, f, action)

        while open_set:
            f_val, g_val, current, path, actions = heapq.heappop(open_set)

            if current in visited:
                continue
            visited.add(current)

            h_val = self.heuristic(current)
            explored.append({
                "node": current, "g": g_val, "h": h_val,
                "f": g_val + h_val, "action": actions[-1] if actions else "START",
                "path": list(path)
            })

            if self.is_goal(current):
                return {
                    "path": path, "actions": actions,
                    "cost": g_val, "explored": explored,
                    "algorithm": "A* Search"
                }

            for action, cost, neighbour in graph.get(current, []):
                if neighbour not in visited:
                    new_g  = g_val + cost
                    new_h  = self.heuristic(neighbour)
                    new_f  = new_g + new_h
                    heapq.heappush(open_set,
                        (new_f, new_g, neighbour,
                         path + [neighbour], actions + [action]))

        return {"path": [], "actions": [], "cost": 999, "explored": explored,
                "algorithm": "A* Search"}

    # ========================================================================
    #  BFS  (Breadth-First Search)
    # ========================================================================
    def bfs(self, start, graph):
        """
        BFS explores all nodes level by level.
        Finds SHORTEST PATH (fewest edges), NOT minimum cost.
        """
        queue    = deque([(start, [start], [])])
        visited  = set([start])
        explored = []

        while queue:
            current, path, actions = queue.popleft()
            explored.append({
                "node": current, "g": len(path)-1, "h": self.heuristic(current),
                "f": "-", "action": actions[-1] if actions else "START",
                "path": list(path)
            })

            if self.is_goal(current):
                return {
                    "path": path, "actions": actions,
                    "cost": len(path) - 1, "explored": explored,
                    "algorithm": "BFS (Breadth-First Search)"
                }

            for action, cost, neighbour in graph.get(current, []):
                if neighbour not in visited:
                    visited.add(neighbour)
                    queue.append((neighbour, path + [neighbour],
                                  actions + [action]))

        return {"path": [], "actions": [], "cost": 999, "explored": explored,
                "algorithm": "BFS"}

    # ========================================================================
    #  DFS  (Depth-First Search)
    # ========================================================================
    def dfs(self, start, graph, max_depth=12):
        """
        DFS goes deep before backtracking.
        NOT guaranteed optimal - used here for exploration/reachability.
        Uses iterative approach with explicit stack.
        """
        stack    = [(start, [start], [], 0)]
        visited  = set()
        explored = []

        while stack:
            current, path, actions, depth = stack.pop()

            if current in visited or depth > max_depth:
                continue
            visited.add(current)

            explored.append({
                "node": current, "g": depth, "h": self.heuristic(current),
                "f": "-", "action": actions[-1] if actions else "START",
                "path": list(path)
            })

            if self.is_goal(current):
                return {
                    "path": path, "actions": actions,
                    "cost": depth, "explored": explored,
                    "algorithm": "DFS (Depth-First Search)"
                }

            for action, cost, neighbour in reversed(graph.get(current, [])):
                if neighbour not in visited:
                    stack.append((neighbour, path + [neighbour],
                                  actions + [action], depth + 1))

        return {"path": [], "actions": [], "cost": 999, "explored": explored,
                "algorithm": "DFS"}

    # ========================================================================
    #  DIJKSTRA'S  ALGORITHM
    # ========================================================================
    def dijkstra(self, start, graph):
        """
        Dijkstra finds MINIMUM COST path.
        No heuristic -- explores all directions uniformly by cost.
        """
        dist     = {start: 0}
        prev     = {start: (None, None)}
        pq       = [(0, start)]
        visited  = set()
        explored = []

        while pq:
            cost, current = heapq.heappop(pq)

            if current in visited:
                continue
            visited.add(current)

            # Reconstruct path
            path = []
            acts = []
            node = current
            while node is not None:
                path.append(node)
                p, a = prev[node]
                if a:
                    acts.append(a)
                node = p
            path.reverse()
            acts.reverse()

            explored.append({
                "node": current, "g": cost, "h": self.heuristic(current),
                "f": cost, "action": acts[-1] if acts else "START",
                "path": list(path)
            })

            if self.is_goal(current):
                return {
                    "path": path, "actions": acts,
                    "cost": cost, "explored": explored,
                    "algorithm": "Dijkstra's Algorithm"
                }

            for action, edge_cost, neighbour in graph.get(current, []):
                new_cost = cost + edge_cost
                if neighbour not in dist or new_cost < dist[neighbour]:
                    dist[neighbour] = new_cost
                    prev[neighbour] = (current, action)
                    heapq.heappush(pq, (new_cost, neighbour))

        return {"path": [], "actions": [], "cost": 999, "explored": explored,
                "algorithm": "Dijkstra"}

    # ========================================================================
    #  GREEDY BEST-FIRST SEARCH
    # ========================================================================
    def greedy(self, start, graph):
        """
        Greedy uses ONLY heuristic h(n) -- no cost tracking.
        Fast but NOT guaranteed optimal.
        """
        open_set = [(self.heuristic(start), start, [start], [])]
        visited  = set()
        explored = []

        while open_set:
            h_val, current, path, actions = heapq.heappop(open_set)

            if current in visited:
                continue
            visited.add(current)

            explored.append({
                "node": current, "g": len(path)-1, "h": h_val,
                "f": h_val, "action": actions[-1] if actions else "START",
                "path": list(path)
            })

            if self.is_goal(current):
                return {
                    "path": path, "actions": actions,
                    "cost": len(path) - 1, "explored": explored,
                    "algorithm": "Greedy Best-First Search"
                }

            for action, cost, neighbour in graph.get(current, []):
                if neighbour not in visited:
                    h = self.heuristic(neighbour)
                    heapq.heappush(open_set,
                        (h, neighbour, path + [neighbour], actions + [action]))

        return {"path": [], "actions": [], "cost": 999, "explored": explored,
                "algorithm": "Greedy Best-First"}

    # ========================================================================
    #  MAP applicant features -> graph start node
    # ========================================================================
    @staticmethod
    def features_to_start(f):
        c = f["cibil_score"]
        if   c >= 750: cb = 4
        elif c >= 700: cb = 3
        elif c >= 650: cb = 2
        elif c >= 600: cb = 1
        else:          cb = 0

        inc = f["income"]
        oblig = f["monthly_obligations"]
        foir = oblig / (inc + 1)
        if   foir < 0.40: fb = 3
        elif foir < 0.50: fb = 2
        elif foir < 0.60: fb = 1
        else:              fb = 0

        if   inc >= 100_000: ib = 3
        elif inc >= 50_000:  ib = 2
        elif inc >= 20_000:  ib = 1
        else:                ib = 0

        return (cb, fb, ib)

    # ========================================================================
    #  Run all 5 algorithms and return comparison
    # ========================================================================
    def run_all(self, features):
        graph  = self.build_loan_graph()
        start  = self.features_to_start(features)
        goal   = AlgorithmEngine.is_goal(start)

        results = {}
        for name, fn in [
            ("A*",       self.astar),
            ("BFS",      self.bfs),
            ("DFS",      self.dfs),
            ("Dijkstra", self.dijkstra),
            ("Greedy",   self.greedy),
        ]:
            t0 = time.perf_counter()
            res = fn(start, graph)
            elapsed = (time.perf_counter() - t0) * 1000
            res["time_ms"]  = round(elapsed, 3)
            res["start"]    = start
            res["already_eligible"] = goal
            results[name] = res

        return results, start, goal


# ===========================================================================
#  ML ENGINE  (unchanged from v2)
# ===========================================================================
class LoanMLEngine:
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
        dti     = loan_amount / (income + 1)
        foir    = monthly_oblig / (income + 1)
        eligible = (
            (cibil >= 650) & (income >= 20_000) & (dti < 8.0) &
            (foir < 0.55) & (emp_years >= 1) & (existing < 4) &
            (assets >= loan_amount * 0.2)
        ).astype(int)
        flip = rng.choice([0,1], n, p=[0.96, 0.04])
        eligible = np.abs(eligible - flip)
        return pd.DataFrame({
            "age":age,"income":income,"loan_amount":loan_amount,
            "loan_term":loan_term,"cibil_score":cibil,
            "employment_years":emp_years,"existing_loans":existing,
            "assets_value":assets,"education_level":education,
            "loan_purpose":loan_purpose,"monthly_obligations":monthly_oblig,
            "savings":savings,"eligible":eligible,
        })

    def _train(self):
        self.status_cb("Generating 8,000 realistic loan records...")
        df = self._generate()
        X  = df[self.FEATURES];  y = df["eligible"]
        X_tr,X_te,y_tr,y_te = train_test_split(X,y,test_size=0.2,random_state=42)
        X_tr_s = self.scaler.fit_transform(X_tr)
        X_te_s = self.scaler.transform(X_te)
        specs = {
            "Random Forest":  RandomForestClassifier(n_estimators=200,max_depth=12,
                               min_samples_split=5,random_state=42,n_jobs=-1),
            "Gradient Boost": GradientBoostingClassifier(n_estimators=150,max_depth=5,
                               learning_rate=0.08,random_state=42),
            "Logistic Reg":   LogisticRegression(C=1.0,max_iter=2000,random_state=42),
        }
        for name,mdl in specs.items():
            self.status_cb(f"Training {name}...")
            mdl.fit(X_tr_s, y_tr)
            self.acc[name] = round(accuracy_score(y_te,mdl.predict(X_te_s))*100,2)
            self.models[name] = mdl
        total = sum(self.acc.values())
        self.weights = {k:v/total for k,v in self.acc.items()}
        self.trained = True
        self.status_cb("ready")

    def predict(self, f):
        row   = np.array([f[k] for k in self.FEATURES]).reshape(1,-1)
        row_s = self.scaler.transform(row)
        model_probs = {}
        ensemble_p  = 0.0
        for name,mdl in self.models.items():
            p = mdl.predict_proba(row_s)[0][1]
            model_probs[name] = round(p*100,1)
            ensemble_p += p * self.weights[name]
        eligible   = ensemble_p >= 0.50
        confidence = round(ensemble_p*100,1)
        emi,rate   = self._emi(f)
        max_loan   = self._max_loan(f)
        return {
            "eligible":eligible,"confidence":confidence,
            "risk_rating":self._risk(ensemble_p),
            "model_probs":model_probs,"accuracies":self.acc,
            "rules":self._rules(f),"banks":self._banks(f,eligible),
            "emi":emi,"rate":rate,"max_loan":max_loan,
            "total_payable":emi*f["loan_term"],
            "interest_paid":max(0,emi*f["loan_term"]-f["loan_amount"]),
        }

    def _risk(self,p):
        if   p>=0.80: return ("LOW RISK",   C["green"])
        elif p>=0.60: return ("MEDIUM RISK",C["amber"])
        elif p>=0.40: return ("HIGH RISK",  C["red"])
        else:         return ("VERY HIGH",  C["red"])

    def _emi(self,f):
        c=f["cibil_score"]
        rate={800:7.5,750:8.5,700:10.0,650:12.5,600:15.0}.get(
            next((k for k in sorted([800,750,700,650,600],reverse=True) if c>=k),0),18.0)
        P,n=f["loan_amount"],f["loan_term"]
        r=rate/12/100
        emi=P*r*(1+r)**n/((1+r)**n-1) if r else P/n
        return int(emi),rate

    def _max_loan(self,f):
        mult=min(f["cibil_score"]/750,1.0)
        disp=max(f["income"]-f["monthly_obligations"],0)
        return int(min(disp*60*mult,12_000_000))

    def _rules(self,f):
        rules=[]
        c=f["cibil_score"]; inc=f["income"]; loan=f["loan_amount"]
        emp=f["employment_years"]; ex=f["existing_loans"]; assets=f["assets_value"]
        oblig=f["monthly_obligations"]
        foir=oblig/(inc+1); dti=loan/(inc+1)
        def add(icon,title,detail,status): rules.append((icon,title,detail,status))
        if   c>=800: add("OK","CIBIL Score",f"{c} -- Excellent","good")
        elif c>=750: add("OK","CIBIL Score",f"{c} -- Very Good","good")
        elif c>=700: add("OK","CIBIL Score",f"{c} -- Good","good")
        elif c>=650: add("WN","CIBIL Score",f"{c} -- Fair","warn")
        elif c>=600: add("WN","CIBIL Score",f"{c} -- Poor","warn")
        else:        add("NG","CIBIL Score",f"{c} -- Very Poor","bad")
        if   inc>=150000: add("OK","Income",f"Rs{inc:,} -- Strong","good")
        elif inc>=50000:  add("OK","Income",f"Rs{inc:,} -- Adequate","good")
        elif inc>=20000:  add("WN","Income",f"Rs{inc:,} -- Borderline","warn")
        else:             add("NG","Income",f"Rs{inc:,} -- Below minimum","bad")
        if   foir<0.35: add("OK","FOIR",f"{foir*100:.1f}% -- Excellent","good")
        elif foir<0.50: add("WN","FOIR",f"{foir*100:.1f}% -- Moderate","warn")
        else:           add("NG","FOIR",f"{foir*100:.1f}% -- Too high","bad")
        if   dti<3:  add("OK","Debt-to-Income",f"{dti:.1f}x -- Excellent","good")
        elif dti<6:  add("WN","Debt-to-Income",f"{dti:.1f}x -- Moderate","warn")
        else:        add("NG","Debt-to-Income",f"{dti:.1f}x -- Reduce amount","bad")
        if   emp>=5: add("OK","Employment",f"{emp} yrs -- Stable","good")
        elif emp>=2: add("OK","Employment",f"{emp} yrs -- Acceptable","good")
        elif emp>=1: add("WN","Employment",f"{emp} yrs -- Borderline","warn")
        else:        add("NG","Employment","< 1 yr -- High risk","bad")
        if   ex==0: add("OK","Existing Loans","None -- Clean profile","good")
        elif ex<=2: add("WN","Existing Loans",f"{ex} active","warn")
        else:       add("NG","Existing Loans",f"{ex} active -- too many","bad")
        cov=assets/(loan+1)
        if   cov>=2:   add("OK","Assets",f"Rs{assets:,} -- Excellent","good")
        elif cov>=0.8: add("WN","Assets",f"Rs{assets:,} -- Partial","warn")
        else:          add("NG","Assets",f"Rs{assets:,} -- Insufficient","bad")
        return rules

    def _banks(self,f,eligible):
        all_banks=[
            {"name":"SBI Home Loans","rate":"8.40%","min_cibil":650,
             "specialty":"Home & Property","logo":"[SBI]","processing":"0.35%"},
            {"name":"HDFC Bank","rate":"8.70%","min_cibil":700,
             "specialty":"Home & Personal","logo":"[HDFC]","processing":"0.50%"},
            {"name":"ICICI Bank","rate":"9.00%","min_cibil":700,
             "specialty":"All Categories","logo":"[ICICI]","processing":"0.50%"},
            {"name":"Axis Bank","rate":"9.15%","min_cibil":650,
             "specialty":"Business Loans","logo":"[AXIS]","processing":"0.40%"},
            {"name":"Kotak Mahindra","rate":"9.50%","min_cibil":720,
             "specialty":"Premium Clients","logo":"[KMB]","processing":"0.75%"},
            {"name":"Bank of Baroda","rate":"8.60%","min_cibil":640,
             "specialty":"Agriculture/SME","logo":"[BOB]","processing":"0.25%"},
            {"name":"PNB","rate":"8.50%","min_cibil":620,
             "specialty":"Education Loans","logo":"[PNB]","processing":"0.30%"},
            {"name":"IDFC FIRST","rate":"9.75%","min_cibil":650,
             "specialty":"Personal Loans","logo":"[IDFC]","processing":"1.00%"},
        ]
        matched=[b for b in all_banks if f["cibil_score"]>=b["min_cibil"]]
        return matched[:5] if matched else all_banks[-3:]


# ===========================================================================
#  WIDGET HELPERS
# ===========================================================================
def make_card(parent, **kw):
    d=dict(bg=C["card"],relief="flat",highlightthickness=1,
           highlightbackground=C["border"])
    d.update(kw); return tk.Frame(parent,**d)

def lbl(parent, text, size=10, bold=False, color=None, **kw):
    w="bold" if bold else "normal"; color=color or C["txt"]
    return tk.Label(parent,text=text,font=(FONT,size,w),
                    fg=color,bg=parent.cget("bg"),**kw)

def scrollable(parent):
    """Returns (canvas, inner_frame, scrollbar)."""
    cv = tk.Canvas(parent, bg=C["bg"], highlightthickness=0)
    sb = ttk.Scrollbar(parent, orient="vertical", command=cv.yview)
    inner = tk.Frame(cv, bg=C["bg"])
    inner.bind("<Configure>",
        lambda e: cv.configure(scrollregion=cv.bbox("all")))
    cv.create_window((0,0), window=inner, anchor="nw")
    cv.configure(yscrollcommand=sb.set)
    cv.pack(side="left", fill="both", expand=True)
    sb.pack(side="right", fill="y")
    cv.bind_all("<MouseWheel>",
        lambda e: cv.yview_scroll(int(-1*(e.delta/120)), "units"))
    return cv, inner, sb


# ===========================================================================
#  MAIN APPLICATION
# ===========================================================================
class SmartLoanApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("SmartLoan AI v3.0 -- ML + A* BFS DFS Dijkstra Greedy")
        self.root.geometry("1480x900")
        self.root.minsize(1280,760)
        self.root.configure(bg=C["bg"])
        self._center()

        self.engine     = None
        self.alg_engine = AlgorithmEngine()
        self.result_data= None
        self._vars      = {}

        self._build_ui()
        threading.Thread(target=self._load_engine, daemon=True).start()
        self.root.mainloop()

    def _center(self):
        self.root.update_idletasks()
        sw=self.root.winfo_screenwidth(); sh=self.root.winfo_screenheight()
        w,h=1480,900
        self.root.geometry(f"{w}x{h}+{(sw-w)//2}+{(sh-h)//2}")

    # -----------------------------------------------------------------------
    #  BUILD UI
    # -----------------------------------------------------------------------
    def _build_ui(self):
        self._build_titlebar()
        self._build_body()
        self._build_statusbar()

    def _build_titlebar(self):
        tb=tk.Frame(self.root,bg="#050A15",height=62)
        tb.pack(fill="x"); tb.pack_propagate(False)
        inner=tk.Frame(tb,bg="#050A15")
        inner.pack(fill="both",expand=True,padx=20)
        lf=tk.Frame(inner,bg="#050A15"); lf.pack(side="left",fill="y")
        tk.Label(lf,text="[*]",font=(FONT,14,"bold"),fg=C["accent"],
                 bg="#050A15").pack(side="left",pady=16)
        tk.Label(lf,text=" SmartLoan",font=(FONT,15,"bold"),
                 fg=C["white"],bg="#050A15").pack(side="left")
        tk.Label(lf,text=" AI",font=(FONT,15,"bold"),
                 fg=C["accent"],bg="#050A15").pack(side="left")
        tk.Label(lf,text="  v3.0  |  ML + A* / BFS / DFS / Dijkstra / Greedy",
                 font=(FONT,9),fg=C["txt_dim"],bg="#050A15").pack(side="left",pady=20)
        rf=tk.Frame(inner,bg="#050A15"); rf.pack(side="right",fill="y",pady=16)
        for txt,clr in [("A* SEARCH",C["alg_a"]),("BFS",C["alg_bfs"]),
                        ("DFS",C["alg_dfs"]),("DIJKSTRA",C["alg_dijk"]),
                        ("GREEDY",C["alg_grdy"]),("ML v3",C["accent"])]:
            tk.Label(rf,text=f" {txt} ",font=(FONT,8,"bold"),fg=clr,
                     bg="#0A1520",padx=8,pady=3).pack(side="left",padx=3)
        tk.Frame(self.root,bg=C["accent"],height=2).pack(fill="x")

    def _build_body(self):
        body=tk.Frame(self.root,bg=C["bg"])
        body.pack(fill="both",expand=True)
        self.left=tk.Frame(body,bg=C["bg"],width=420)
        self.left.pack(side="left",fill="y",padx=(14,6),pady=10)
        self.left.pack_propagate(False)
        self._build_form(self.left)
        self.right=tk.Frame(body,bg=C["bg"])
        self.right.pack(side="left",fill="both",expand=True,padx=(6,14),pady=10)
        self._build_right_panel(self.right)

    # -----------------------------------------------------------------------
    #  FORM
    # -----------------------------------------------------------------------
    def _build_form(self, parent):
        cv=tk.Canvas(parent,bg=C["bg"],highlightthickness=0,bd=0)
        sb=ttk.Scrollbar(parent,orient="vertical",command=cv.yview)
        self.fi=tk.Frame(cv,bg=C["bg"])
        self.fi.bind("<Configure>",
            lambda e: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0,0),window=self.fi,anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left",fill="both",expand=True)
        sb.pack(side="right",fill="y")
        cv.bind_all("<MouseWheel>",
            lambda e: cv.yview_scroll(int(-1*(e.delta/120)),"units"))

        fi=self.fi
        self._fsec(fi,"[Person]  Personal Details")
        self._finp(fi,"Full Name","name","entry",default="Rahul Sharma")
        self._finp(fi,"Age (years)","age","spin",spin=(21,65,1),default=32)
        self._finp(fi,"Education","education_level","combo",
                   choices=["High School","Graduate","Post Graduate","PhD"],
                   default="Graduate")

        self._fsec(fi,"[Money]  Financial Profile")
        self._finp(fi,"Monthly Income (Rs)","income","spin",
                   spin=(10000,1000000,5000),default=75000)
        self._finp(fi,"CIBIL Score","cibil_score","spin",
                   spin=(300,900,1),default=720)
        self._finp(fi,"Employment (years)","employment_years","spin",
                   spin=(0,40,1),default=5)
        self._finp(fi,"Monthly Obligations (Rs)","monthly_obligations","spin",
                   spin=(0,200000,1000),default=15000)
        self._finp(fi,"Monthly Savings (Rs)","savings","spin",
                   spin=(0,500000,1000),default=10000)
        self._finp(fi,"Existing Loans","existing_loans","spin",
                   spin=(0,10,1),default=1)
        self._finp(fi,"Total Assets (Rs)","assets_value","spin",
                   spin=(0,30000000,50000),default=1500000)

        self._fsec(fi,"[Bank]  Loan Details")
        self._finp(fi,"Loan Amount (Rs)","loan_amount","spin",
                   spin=(10000,15000000,10000),default=500000)
        self._finp(fi,"Loan Term (months)","loan_term","combo",
                   choices=["12","24","36","48","60","84","120","180","240"],
                   default="60")
        self._finp(fi,"Loan Purpose","loan_purpose","combo",
                   choices=["Home Loan","Car Loan","Education Loan",
                            "Personal Loan","Business Loan"],
                   default="Home Loan")

        tk.Frame(fi,bg=C["bg"],height=10).pack()
        self.predict_btn=tk.Button(fi,text="[>>] PREDICT + RUN ALGORITHMS",
            font=(FONT,12,"bold"),bg=C["accent"],fg="#000",
            activebackground="#00A8D0",relief="flat",pady=14,
            cursor="hand2",command=self._on_predict)
        self.predict_btn.pack(fill="x",padx=6,pady=3)
        tk.Button(fi,text="[R] Reset All Fields",font=(FONT,9),
                  bg=C["card"],fg=C["txt_dim"],relief="flat",pady=7,
                  cursor="hand2",command=self._reset).pack(fill="x",padx=6,pady=(0,10))

        self.acc_frame=make_card(fi)
        self.acc_frame.pack(fill="x",padx=6,pady=(0,8))
        lbl(self.acc_frame,"Model Accuracies",9,bold=True,
            color=C["txt_dim"]).pack(anchor="w",padx=10,pady=(8,4))
        self.acc_labels={}
        for m in ["Random Forest","Gradient Boost","Logistic Reg"]:
            row=tk.Frame(self.acc_frame,bg=C["card"]); row.pack(fill="x",padx=10,pady=1)
            lbl(row,m+":",8,color=C["txt_dim"]).pack(side="left")
            v=lbl(row,"training...",8,bold=True,color=C["accent"])
            v.pack(side="right"); self.acc_labels[m]=v
        tk.Frame(self.acc_frame,bg=C["bg"],height=6).pack()

    def _fsec(self, parent, text):
        f=tk.Frame(parent,bg=C["bg"]); f.pack(fill="x",padx=6,pady=(12,2))
        lbl(f,text,10,bold=True,color=C["accent"]).pack(anchor="w")
        tk.Frame(f,bg=C["accent"],height=1).pack(fill="x",pady=(2,0))

    def _finp(self, parent, lbl_text, key, kind,
              spin=None, choices=None, default=None):
        card=tk.Frame(parent,bg=C["card"],highlightthickness=1,
                      highlightbackground=C["border"])
        card.pack(fill="x",padx=6,pady=2)
        lbl(card,lbl_text,9,bold=True,color=C["txt"]).pack(
            anchor="w",padx=10,pady=(6,2))
        s=dict(bg=C["input_bg"],fg=C["txt"],relief="flat",
               insertbackground=C["accent"],font=(FONT,10),
               highlightthickness=1,highlightcolor=C["accent"],
               highlightbackground=C["border"])
        if kind=="entry":
            var=tk.StringVar(value=default or "")
            tk.Entry(card,textvariable=var,**s).pack(
                fill="x",padx=10,pady=(0,8),ipady=6)
            self._vars[key]=var
        elif kind=="spin":
            var=tk.IntVar(value=default or spin[0])
            tk.Spinbox(card,from_=spin[0],to=spin[1],increment=spin[2],
                       textvariable=var,**s).pack(
                fill="x",padx=10,pady=(0,8),ipady=6)
            self._vars[key]=var
        elif kind=="combo":
            var=tk.StringVar(value=default or choices[0])
            st=ttk.Style(); st.theme_use("clam")
            st.configure("L.TCombobox",
                fieldbackground=C["input_bg"],background=C["input_bg"],
                foreground=C["txt"],arrowcolor=C["accent"],
                bordercolor=C["border"],lightcolor=C["input_bg"],
                darkcolor=C["input_bg"],selectbackground=C["accent"],
                selectforeground="#000")
            ttk.Combobox(card,textvariable=var,values=choices,
                style="L.TCombobox",state="readonly",
                font=(FONT,10)).pack(fill="x",padx=10,pady=(0,8),ipady=4)
            self._vars[key]=var

    # -----------------------------------------------------------------------
    #  RIGHT PANEL  (tabs)
    # -----------------------------------------------------------------------
    def _build_right_panel(self, parent):
        st=ttk.Style(); st.theme_use("clam")
        st.configure("Loan.TNotebook",background=C["bg"],borderwidth=0)
        st.configure("Loan.TNotebook.Tab",background=C["card"],
            foreground=C["txt_dim"],padding=[14,7],
            font=(FONT,9,"bold"),borderwidth=0)
        st.map("Loan.TNotebook.Tab",
            background=[("selected",C["accent"])],
            foreground=[("selected","#000")])

        self.nb=ttk.Notebook(parent,style="Loan.TNotebook")
        self.nb.pack(fill="both",expand=True)

        self.tab_result  = tk.Frame(self.nb,bg=C["bg"])
        self.tab_rules   = tk.Frame(self.nb,bg=C["bg"])
        self.tab_banks   = tk.Frame(self.nb,bg=C["bg"])
        self.tab_alg     = tk.Frame(self.nb,bg=C["bg"])   # NEW ALGORITHMS TAB
        self.tab_compare = tk.Frame(self.nb,bg=C["bg"])
        self.tab_emi     = tk.Frame(self.nb,bg=C["bg"])

        self.nb.add(self.tab_result,  text="  [D] Decision  ")
        self.nb.add(self.tab_rules,   text="  [A] Analysis  ")
        self.nb.add(self.tab_banks,   text="  [B] Banks     ")
        self.nb.add(self.tab_alg,     text="  [*] Algorithms")  # NEW
        self.nb.add(self.tab_compare, text="  [C] Compare   ")
        self.nb.add(self.tab_emi,     text="  [E] EMI Calc  ")

        self._show_loading()

    def _show_loading(self):
        for tab in [self.tab_result,self.tab_rules,self.tab_banks,
                    self.tab_alg,self.tab_compare,self.tab_emi]:
            for w in tab.winfo_children(): w.destroy()
            f=tk.Frame(tab,bg=C["bg"])
            f.place(relx=.5,rely=.5,anchor="center")
            lbl(f,"[AI]",40,color=C["txt_muted"]).pack()
            lbl(f,"Training AI Models...",13,bold=True,
                color=C["txt_muted"]).pack(pady=6)
            lbl(f,"Generating 8,000 synthetic records + 3 ML models",9,
                color=C["txt_muted"]).pack()

    def _show_idle(self):
        for tab in [self.tab_result,self.tab_rules,self.tab_banks,
                    self.tab_alg,self.tab_compare,self.tab_emi]:
            for w in tab.winfo_children(): w.destroy()
            f=tk.Frame(tab,bg=C["bg"])
            f.place(relx=.5,rely=.5,anchor="center")
            lbl(f,"[*]",40,color=C["txt_muted"]).pack()
            lbl(f,"Fill the form and click Predict",13,bold=True,
                color=C["txt_dim"]).pack(pady=8)
            lbl(f,"ML prediction + Algorithm search will appear here",9,
                color=C["txt_muted"]).pack()

    def _build_statusbar(self):
        sb=tk.Frame(self.root,bg="#050A15",height=28)
        sb.pack(fill="x",side="bottom"); sb.pack_propagate(False)
        self.status_var=tk.StringVar(value="Initializing AI engine...")
        tk.Label(sb,textvariable=self.status_var,font=(FONT,8),
                 fg=C["txt_dim"],bg="#050A15",anchor="w").pack(
            side="left",padx=14,fill="y")
        tk.Label(sb,text="SmartLoan AI v3.0  |  ML + A* BFS DFS Dijkstra Greedy",
                 font=(FONT,8),fg=C["txt_muted"],bg="#050A15").pack(
            side="right",padx=14)

    # -----------------------------------------------------------------------
    #  ENGINE LOAD
    # -----------------------------------------------------------------------
    def _load_engine(self):
        self.engine=LoanMLEngine(status_cb=lambda t: self.status_var.set(f"  {t}"))
        self.root.after(0,self._on_ready)

    def _on_ready(self):
        self.status_var.set("AI Engine ready -- Fill form and click Predict")
        for m,v in self.acc_labels.items():
            v.config(text=f"{self.engine.acc[m]}%",fg=C["green"])
        self._show_idle()

    # -----------------------------------------------------------------------
    #  COLLECT FEATURES
    # -----------------------------------------------------------------------
    def _collect(self):
        edu={"High School":0,"Graduate":1,"Post Graduate":2,"PhD":3}
        purp={"Home Loan":0,"Car Loan":1,"Education Loan":2,
              "Personal Loan":3,"Business Loan":4}
        return {
            "age":              int(self._vars["age"].get()),
            "income":           int(self._vars["income"].get()),
            "loan_amount":      int(self._vars["loan_amount"].get()),
            "loan_term":        int(self._vars["loan_term"].get()),
            "cibil_score":      int(self._vars["cibil_score"].get()),
            "employment_years": int(self._vars["employment_years"].get()),
            "existing_loans":   int(self._vars["existing_loans"].get()),
            "assets_value":     int(self._vars["assets_value"].get()),
            "education_level":  edu.get(self._vars["education_level"].get(),1),
            "loan_purpose":     purp.get(self._vars["loan_purpose"].get(),3),
            "monthly_obligations": int(self._vars["monthly_obligations"].get()),
            "savings":          int(self._vars["savings"].get()),
        }

    def _on_predict(self):
        if not self.engine or not self.engine.trained:
            messagebox.showwarning("Not Ready","AI is still training. Please wait.")
            return
        try: f=self._collect()
        except Exception as e:
            messagebox.showerror("Input Error",str(e)); return

        self.predict_btn.config(text="[>>] Analyzing...",state="disabled",
                                bg="#005F7A")
        self.status_var.set("Running ensemble ML + 5 search algorithms...")
        self.root.update()

        def run():
            result   = self.engine.predict(f)
            alg_res, start, already = self.alg_engine.run_all(f)
            self.result_data = result
            self.root.after(0, lambda: self._show_results(result,f,alg_res,start,already))

        threading.Thread(target=run,daemon=True).start()

    def _show_results(self, r, f, alg_res, start, already):
        self.predict_btn.config(text="[>>] PREDICT + RUN ALGORITHMS",
                                state="normal",bg=C["accent"])
        name=self._vars["name"].get() or "Applicant"
        self.status_var.set(
            f"Analysis complete for {name}  |  "
            f"ML Confidence: {r['confidence']}%  |  "
            f"A* Cost: {alg_res['A*']['cost']} months")

        self._render_decision(r,f,name)
        self._render_rules(r)
        self._render_banks(r,f)
        self._render_algorithms(alg_res,start,already,f)   # NEW
        self._render_compare(r,f)
        self._render_emi(r,f)
        self.nb.select(0)

    # =======================================================================
    #  TAB: DECISION
    # =======================================================================
    def _render_decision(self, r, f, name):
        tab=self.tab_result
        for w in tab.winfo_children(): w.destroy()
        _,inner,_=scrollable(tab)

        eligible=r["eligible"]
        clr=C["green"] if eligible else C["red"]
        verdict="APPROVED" if eligible else "DECLINED"

        # Banner
        banner=tk.Frame(inner,bg=C["card"],highlightthickness=2,
                        highlightbackground=clr)
        banner.pack(fill="x",padx=14,pady=(14,6))
        top=tk.Frame(banner,bg=C["card"]); top.pack(fill="x",padx=20,pady=14)
        lf=tk.Frame(top,bg=C["card"]); lf.pack(side="left")
        lbl(lf,f"Loan Decision for {name}",10,color=C["txt_dim"]).pack(anchor="w")
        lbl(lf,verdict,30,bold=True,color=clr).pack(anchor="w")
        lbl(lf,f"AI Confidence: {r['confidence']}%",11,color=C["txt"]).pack(anchor="w",pady=(4,0))
        rf=tk.Frame(top,bg=C["card"]); rf.pack(side="right")
        ring=tk.Canvas(rf,width=110,height=110,bg=C["card"],highlightthickness=0)
        ring.pack(); self._draw_ring(ring,r["confidence"],clr)

        mid=tk.Frame(banner,bg=C["card"]); mid.pack(fill="x",padx=20,pady=(0,14))
        risk_txt,risk_col=r["risk_rating"]
        for txt,val,vc in [
            ("Risk",       risk_txt,         risk_col),
            ("Max Loan",   f"Rs{r['max_loan']:,}",  C["accent"]),
            ("Rate",       f"{r['rate']}% pa",C["amber"]),
            ("EMI/month",  f"Rs{r['emi']:,}", C["txt"]),
        ]:
            b=tk.Frame(mid,bg="#0A1520",highlightthickness=1,
                       highlightbackground=C["border"])
            b.pack(side="left",expand=True,fill="x",padx=4)
            lbl(b,txt,8,color=C["txt_dim"]).pack(anchor="w",padx=10,pady=(8,0))
            lbl(b,val,11,bold=True,color=vc).pack(anchor="w",padx=10,pady=(0,8))

        # Model breakdown
        mc=make_card(inner); mc.pack(fill="x",padx=14,pady=6)
        lbl(mc,"ML Model Breakdown",10,bold=True,color=C["accent"]).pack(
            anchor="w",padx=14,pady=(10,6))
        row=tk.Frame(mc,bg=C["card"]); row.pack(fill="x",padx=14,pady=(0,12))
        for mname,prob in r["model_probs"].items():
            acc=r["accuracies"][mname]
            cell=tk.Frame(row,bg=C["input_bg"],highlightthickness=1,
                          highlightbackground=C["border"])
            cell.pack(side="left",expand=True,fill="x",padx=4)
            lbl(cell,mname,9,bold=True,color=C["txt"]).pack(anchor="w",padx=10,pady=(8,2))
            pc=C["green"] if prob>=50 else C["red"]
            lbl(cell,f"{prob}%",13,bold=True,color=pc).pack(anchor="w",padx=10)
            lbl(cell,f"Acc: {acc}%",8,color=C["txt_dim"]).pack(anchor="w",padx=10,pady=(0,8))

        # Summary grid
        sm=make_card(inner); sm.pack(fill="x",padx=14,pady=6)
        lbl(sm,"Loan Summary",10,bold=True,color=C["accent"]).pack(
            anchor="w",padx=14,pady=(10,6))
        fields=[
            ("Loan Amount",   f"Rs{f['loan_amount']:,}"),
            ("Tenure",        f"{f['loan_term']} months"),
            ("Interest Rate", f"{r['rate']}% pa"),
            ("Monthly EMI",   f"Rs{r['emi']:,}"),
            ("Total Payable", f"Rs{r['total_payable']:,}"),
            ("Interest Paid", f"Rs{r['interest_paid']:,}"),
            ("CIBIL Score",   str(f["cibil_score"])),
            ("Income",        f"Rs{f['income']:,}"),
        ]
        grid=tk.Frame(sm,bg=C["card"]); grid.pack(fill="x",padx=14,pady=(0,12))
        for i,(k,v) in enumerate(fields):
            r_=i//4; c_=i%4
            cell=tk.Frame(grid,bg=C["input_bg"],highlightthickness=1,
                          highlightbackground=C["border"])
            cell.grid(row=r_,column=c_,padx=3,pady=3,sticky="ew")
            grid.columnconfigure(c_,weight=1)
            lbl(cell,k,8,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(6,1))
            lbl(cell,v,10,bold=True,color=C["txt"]).pack(anchor="w",padx=8,pady=(0,6))

    def _draw_ring(self, canvas, pct, color):
        canvas.delete("all")
        x,y,r=55,55,44
        canvas.create_oval(x-r,y-r,x+r,y+r,outline=C["border"],width=7,fill="")
        extent=-360*pct/100
        canvas.create_arc(x-r,y-r,x+r,y+r,start=90,extent=extent,
                          outline=color,width=7,style="arc")
        canvas.create_text(x,y,   text=f"{pct}%",fill=color,font=(FONT,13,"bold"))
        canvas.create_text(x,y+16,text="confidence",fill=C["txt_dim"],font=(FONT,7))

    # =======================================================================
    #  TAB: ANALYSIS
    # =======================================================================
    def _render_rules(self, r):
        tab=self.tab_rules
        for w in tab.winfo_children(): w.destroy()
        _,inner,_=scrollable(tab)
        lbl(inner,"Decision Analysis Engine",12,bold=True,
            color=C["txt"]).pack(anchor="w",padx=14,pady=(14,4))
        sm={"good":(C["green"],"#0D2520","PASS"),
            "warn":(C["amber"],"#251E00","CAUTION"),
            "bad": (C["red"],  "#250000","FAIL")}
        for icon,title,detail,status in r["rules"]:
            clr,bg_,verdict=sm[status]
            card=tk.Frame(inner,bg=bg_,highlightthickness=1,
                          highlightbackground=clr)
            card.pack(fill="x",padx=14,pady=3)
            row=tk.Frame(card,bg=bg_); row.pack(fill="x",padx=12,pady=8)
            lbl(row,f"[{icon}] {title}",10,bold=True,color=clr).pack(side="left")
            lbl(row,verdict,9,bold=True,color=clr).pack(side="right")
            lbl(card,f"  {detail}",9,color=C["txt"]).pack(anchor="w",padx=12,pady=(0,8))

    # =======================================================================
    #  TAB: BANKS
    # =======================================================================
    def _render_banks(self, r, f):
        tab=self.tab_banks
        for w in tab.winfo_children(): w.destroy()
        _,inner,_=scrollable(tab)
        lbl(inner,"Bank Recommendations",12,bold=True,
            color=C["txt"]).pack(anchor="w",padx=14,pady=(14,4))
        for i,bank in enumerate(r["banks"]):
            is_best=i==0
            bc=C["gold"] if is_best else C["border"]
            bg_="#1A1600" if is_best else C["card"]
            card=tk.Frame(inner,bg=bg_,highlightthickness=1,highlightbackground=bc)
            card.pack(fill="x",padx=14,pady=4)
            hdr=tk.Frame(card,bg=bg_); hdr.pack(fill="x",padx=14,pady=(10,4))
            lbl(hdr,f"{bank['logo']}  {bank['name']}",11,bold=True,
                color=C["gold"] if is_best else C["txt"]).pack(side="left")
            if is_best: lbl(hdr,"  BEST MATCH",8,bold=True,color=C["gold"]).pack(side="left")
            rate_f=float(bank["rate"].replace("%",""))
            P,n=f["loan_amount"],f["loan_term"]
            rm=rate_f/12/100
            emi_b=int(P*rm*(1+rm)**n/((1+rm)**n-1)) if rm else P//n
            dr=tk.Frame(card,bg=bg_); dr.pack(fill="x",padx=14,pady=(0,10))
            for k,v,c_ in [("Rate",bank["rate"],C["amber"]),
                           ("EMI",f"Rs{emi_b:,}",C["green"]),
                           ("Type",bank["specialty"],C["accent"]),
                           ("Fee",bank["processing"],C["txt_dim"]),
                           ("Min CIBIL",str(bank["min_cibil"]),C["txt_dim"])]:
                b=tk.Frame(dr,bg=C["input_bg"],highlightthickness=1,
                           highlightbackground=C["border"])
                b.pack(side="left",expand=True,fill="x",padx=3)
                lbl(b,k,7,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(6,1))
                lbl(b,v,9,bold=True,color=c_).pack(anchor="w",padx=8,pady=(0,6))

    # =======================================================================
    #  TAB: ALGORITHMS  (THE NEW BIG TAB)
    # =======================================================================
    def _render_algorithms(self, alg_res, start, already, f):
        tab=self.tab_alg
        for w in tab.winfo_children(): w.destroy()
        _,inner,_=scrollable(tab)

        # Header
        hdr=tk.Frame(inner,bg=C["bg"]); hdr.pack(fill="x",padx=14,pady=(14,4))
        lbl(hdr,"Search & Optimization Algorithms",14,bold=True,
            color=C["txt"]).pack(anchor="w")
        lbl(hdr,
            "Finding OPTIMAL PATH from your current financial state to LOAN APPROVAL",
            9,color=C["txt_dim"]).pack(anchor="w",pady=(2,0))

        # --- Current state banner -------------------------------------------
        cb=["<600","600-650","650-700","700-750","750+"][start[0]]
        fb=[">60%","50-60%","40-50%","<40%"][start[1]]
        ib=["<20k","20-50k","50-100k","100k+"][start[2]]

        state_card=tk.Frame(inner,bg="#050D20",highlightthickness=2,
                            highlightbackground=C["accent2"])
        state_card.pack(fill="x",padx=14,pady=(8,4))
        sr=tk.Frame(state_card,bg="#050D20"); sr.pack(fill="x",padx=16,pady=12)
        lbl(sr,"Your Current Financial State:",10,bold=True,
            color=C["accent2"]).pack(side="left")
        for txt,val,clr in [
            ("CIBIL",cb,C["alg_bfs"]),
            ("FOIR",fb,C["alg_dfs"]),
            ("Income",ib,C["alg_dijk"]),
        ]:
            b=tk.Frame(sr,bg="#0A1030",highlightthickness=1,
                       highlightbackground=C["border"])
            b.pack(side="left",padx=8)
            lbl(b,txt,7,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(5,0))
            lbl(b,val,10,bold=True,color=clr).pack(anchor="w",padx=8,pady=(0,5))

        if already:
            ag=tk.Frame(inner,bg="#002200",highlightthickness=2,
                        highlightbackground=C["green"])
            ag.pack(fill="x",padx=14,pady=4)
            lbl(ag,"  ALREADY AT GOAL STATE -- Your profile meets approval criteria!",
                11,bold=True,color=C["green"]).pack(anchor="w",padx=16,pady=12)

        # --- Algorithm Explanation Legend -----------------------------------
        legend=make_card(inner); legend.pack(fill="x",padx=14,pady=(6,4))
        lbl(legend,"Algorithm Reference Guide",10,bold=True,
            color=C["accent"]).pack(anchor="w",padx=14,pady=(10,6))
        alg_info=[
            ("A*",       C["alg_a"],   "A* Search",
             "f(n)=g(n)+h(n). Combines actual cost + heuristic.",
             "OPTIMAL + COMPLETE. Best for finding shortest weighted path.",
             "Used for: Finding cheapest improvement plan to approval."),
            ("BFS",      C["alg_bfs"], "Breadth-First Search",
             "Explores all neighbors level by level using a queue.",
             "OPTIMAL for unweighted graphs (fewest steps).",
             "Used for: Minimum number of actions to reach approval."),
            ("DFS",      C["alg_dfs"], "Depth-First Search",
             "Explores as deep as possible before backtracking (stack).",
             "NOT optimal but very low memory usage.",
             "Used for: Checking reachability of approval state."),
            ("Dijkstra", C["alg_dijk"],"Dijkstra's Algorithm",
             "Like A* but h(n)=0. Explores all paths by cost uniformly.",
             "OPTIMAL for weighted graphs. Slower than A*.",
             "Used for: Finding minimum total months cost to approval."),
            ("Greedy",   C["alg_grdy"],"Greedy Best-First",
             "Uses only heuristic h(n), ignores actual cost g(n).",
             "FAST but NOT optimal. May find suboptimal path.",
             "Used for: Quick approximate direction toward approval."),
        ]
        lg=tk.Frame(legend,bg=C["card"]); lg.pack(fill="x",padx=14,pady=(0,12))
        for short,clr,full,desc,prop,use in alg_info:
            ac=tk.Frame(lg,bg=C["input_bg"],highlightthickness=1,
                        highlightbackground=clr)
            ac.pack(side="left",expand=True,fill="x",padx=3)
            lbl(ac,short,14,bold=True,color=clr).pack(anchor="w",padx=8,pady=(8,2))
            lbl(ac,full,8,bold=True,color=C["txt"]).pack(anchor="w",padx=8)
            lbl(ac,desc,7,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(2,0))
            lbl(ac,prop,7,bold=True,color=clr).pack(anchor="w",padx=8,pady=(2,0))
            lbl(ac,use,7,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(0,8))

        # --- Comparison Table -----------------------------------------------
        cmp=make_card(inner); cmp.pack(fill="x",padx=14,pady=(6,4))
        lbl(cmp,"Algorithm Comparison Results",11,bold=True,
            color=C["accent"]).pack(anchor="w",padx=14,pady=(10,6))

        # Table header
        hrow=tk.Frame(cmp,bg=C["border"]); hrow.pack(fill="x",padx=14,pady=(0,2))
        for h,w_ in [("Algorithm",130),("Steps Found",90),("Cost (months)",100),
                     ("Nodes Explored",100),("Time (ms)",80),
                     ("Path Length",80),("Optimal?",70)]:
            tk.Label(hrow,text=h,font=(FONT,8,"bold"),fg=C["txt_dim"],
                     bg=C["border"],width=w_//8,anchor="w").pack(
                side="left",padx=6,pady=5)

        alg_order=[("A*",C["alg_a"]),("BFS",C["alg_bfs"]),("DFS",C["alg_dfs"]),
                   ("Dijkstra",C["alg_dijk"]),("Greedy",C["alg_grdy"])]
        optimal_map={"A*":"YES","BFS":"YES*","DFS":"NO",
                     "Dijkstra":"YES","Greedy":"NO"}

        for i,(aname,aclr) in enumerate(alg_order):
            res=alg_res[aname]
            bg_=C["input_bg"] if i%2==0 else C["card"]
            drow=tk.Frame(cmp,bg=bg_,highlightthickness=1,
                          highlightbackground=aclr)
            drow.pack(fill="x",padx=14,pady=1)
            vals=[
                (aname,         aclr,  True),
                (str(len(res["actions"])), C["txt"], False),
                (str(res["cost"]),         C["amber"],False),
                (str(len(res["explored"])),C["txt_dim"],False),
                (str(res["time_ms"]),      C["green"], False),
                (str(len(res["path"])),    C["txt"],   False),
                (optimal_map[aname],
                 C["green"] if optimal_map[aname].startswith("Y") else C["red"],True),
            ]
            for val,vc,bld in vals:
                lbl(drow,val,9,bold=bld,color=vc).pack(
                    side="left",expand=True,fill="x",padx=6,pady=6)

        # --- Individual Algorithm Detail Panels ----------------------------
        for aname,aclr in alg_order:
            res=alg_res[aname]
            self._render_alg_detail(inner, aname, aclr, res, already)

        # --- Graph Visualization (Canvas) ----------------------------------
        self._render_graph_canvas(inner, alg_res, start)

    # -----------------------------------------------------------------------
    #  Individual algorithm detail panel
    # -----------------------------------------------------------------------
    def _render_alg_detail(self, parent, name, color, res, already):
        panel=tk.Frame(parent,bg="#070F20",highlightthickness=2,
                       highlightbackground=color)
        panel.pack(fill="x",padx=14,pady=6)

        # Header
        hdr=tk.Frame(panel,bg="#070F20"); hdr.pack(fill="x",padx=14,pady=(10,4))
        lbl(hdr,f"[ {name} ]",13,bold=True,color=color).pack(side="left")
        lbl(hdr,res["algorithm"],10,color=C["txt_dim"]).pack(side="left",padx=10)
        lbl(hdr,f"Time: {res['time_ms']} ms",9,color=C["txt_dim"]).pack(side="right")
        lbl(hdr,f"Cost: {res['cost']} months",9,bold=True,color=color).pack(side="right",padx=12)

        tk.Frame(panel,bg=color,height=1).pack(fill="x",padx=14)

        if not res["path"]:
            lbl(panel,"  No path found from current state",9,
                color=C["red"]).pack(anchor="w",padx=14,pady=10)
            return

        if already:
            lbl(panel,"  Already at goal state -- no actions needed!",9,
                color=C["green"]).pack(anchor="w",padx=14,pady=10)
            return

        # Action path
        lbl(panel,"  Recommended Action Path:",9,bold=True,
            color=C["txt_dim"]).pack(anchor="w",padx=14,pady=(8,4))

        steps_frame=tk.Frame(panel,bg="#070F20")
        steps_frame.pack(fill="x",padx=14,pady=(0,8))

        for i, action in enumerate(res["actions"]):
            sf=tk.Frame(steps_frame,bg="#0A1530",highlightthickness=1,
                        highlightbackground=color)
            sf.pack(fill="x",pady=2)
            row=tk.Frame(sf,bg="#0A1530"); row.pack(fill="x",padx=10,pady=5)
            # Step number bubble
            tk.Label(row,text=str(i+1),font=(FONT,9,"bold"),
                     fg="#000",bg=color,padx=7,pady=2).pack(side="left")
            lbl(row,f"  {action}",9,bold=True,color=C["txt"]).pack(side="left")

            # Show state after this step
            if i+1 < len(res["path"]):
                ns=res["path"][i+1]
                cb=["<600","600-650","650-700","700-750","750+"][ns[0]]
                fb=[">60%","50-60%","40-50%","<40%"][ns[1]]
                ib=["<20k","20-50k","50-100k","100k+"][ns[2]]
                state_str=f"  -> CIBIL:{cb}  FOIR:{fb}  Income:{ib}"
                lbl(row,state_str,8,color=C["txt_dim"]).pack(side="right",padx=8)

        # Stats row
        sr=tk.Frame(panel,bg="#070F20"); sr.pack(fill="x",padx=14,pady=(4,12))
        for txt,val,c_ in [
            ("Total Steps", len(res["actions"]),  color),
            ("Total Cost",  f"{res['cost']} months", C["amber"]),
            ("Nodes Explored", len(res["explored"]), C["txt_dim"]),
            ("Path Length",    len(res["path"]),   C["txt"]),
        ]:
            b=tk.Frame(sr,bg="#0A1428",highlightthickness=1,
                       highlightbackground=C["border"])
            b.pack(side="left",expand=True,fill="x",padx=4)
            lbl(b,str(val),12,bold=True,color=c_).pack(anchor="w",padx=8,pady=(6,2))
            lbl(b,txt,7,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(0,6))

    # -----------------------------------------------------------------------
    #  Graph Canvas Visualization
    # -----------------------------------------------------------------------
    def _render_graph_canvas(self, parent, alg_res, start):
        gc=make_card(parent)
        gc.pack(fill="x",padx=14,pady=(8,14))
        lbl(gc,"Graph Exploration Visualization (A* vs BFS vs DFS)",
            10,bold=True,color=C["accent"]).pack(anchor="w",padx=14,pady=(10,6))
        lbl(gc,
            "Each circle = a financial state node.  "
            "Colored path = route found by each algorithm.  "
            "S=Start  G=Goal",
            8,color=C["txt_dim"]).pack(anchor="w",padx=14,pady=(0,4))

        cv=tk.Canvas(gc,bg="#030810",height=320,highlightthickness=0)
        cv.pack(fill="x",padx=14,pady=(0,14))
        gc.update_idletasks()
        W=cv.winfo_width() or 800
        H=320

        # Layout: 5 columns (cibil bands) x 3 rows (income bands)
        # foir fixed at middle for clarity
        node_pos={}
        margin_x=60; margin_y=40
        cols=5; rows=4
        cw=(W-margin_x*2)//(cols-1)
        rh=(H-margin_y*2)//(rows-1)

        for c in range(cols):
            for ib in range(rows):
                x=margin_x+c*cw
                y=margin_y+ib*rh
                node=(c,2,ib)   # fix foir_band=2 for visualization
                node_pos[node]=(x,y)

        # Draw edges first (light gray)
        graph=AlgorithmEngine.build_loan_graph()
        drawn_edges=set()
        for nd,(nx,ny) in node_pos.items():
            for action,cost,nb in graph.get(nd,[]):
                if nb in node_pos:
                    eid=tuple(sorted([nd,nb]))
                    if eid not in drawn_edges:
                        drawn_edges.add(eid)
                        bx,by=node_pos[nb]
                        cv.create_line(nx,ny,bx,by,fill="#1A2A3A",width=1)

        # Draw paths for each algorithm
        path_colors=[
            ("A*",      C["alg_a"]),
            ("BFS",     C["alg_bfs"]),
            ("DFS",     C["alg_dfs"]),
            ("Dijkstra",C["alg_dijk"]),
        ]
        for offset,(aname,aclr) in enumerate(path_colors):
            path=alg_res[aname]["path"]
            # Filter path nodes to those in our visualized plane
            vis_path=[n for n in path if n in node_pos]
            for i in range(len(vis_path)-1):
                n1=vis_path[i]; n2=vis_path[i+1]
                if n1 in node_pos and n2 in node_pos:
                    x1,y1=node_pos[n1]; x2,y2=node_pos[n2]
                    cv.create_line(x1,y1,x2,y2,fill=aclr,width=3,
                                   dash=(8,3) if offset>0 else ())

        # Draw nodes
        for nd,(nx,ny) in node_pos.items():
            r_=14
            is_start=nd==start or (nd[0]==start[0] and nd[2]==start[2])
            is_goal=AlgorithmEngine.is_goal(nd)
            if is_goal:
                fc="#1A0000"; oc=C["red"]; tw=C["red"]
            elif is_start:
                fc="#001A00"; oc=C["green"]; tw=C["green"]
            else:
                fc=C["node_def"]; oc=C["border"]; tw=C["txt_muted"]
            cv.create_oval(nx-r_,ny-r_,nx+r_,ny+r_,fill=fc,outline=oc,width=2)
            label_c=["<600","600+","650+","700+","750+"][nd[0]]
            cv.create_text(nx,ny,text=label_c,fill=tw,font=(FONT,6))

        # Draw legend
        lx=14; ly=H-24
        for i,(aname,aclr) in enumerate(path_colors):
            cv.create_line(lx,ly,lx+20,ly,fill=aclr,width=3)
            cv.create_text(lx+30,ly,text=aname,fill=aclr,
                           font=(FONT,7),anchor="w")
            lx+=80

        cv.create_oval(2,2,12,12,fill="#001A00",outline=C["green"],width=2)
        cv.create_text(18,7,text="Start",fill=C["green"],font=(FONT,7),anchor="w")
        cv.create_oval(60,2,70,12,fill="#1A0000",outline=C["red"],width=2)
        cv.create_text(76,7,text="Goal",fill=C["red"],font=(FONT,7),anchor="w")

    # =======================================================================
    #  TAB: COMPARE
    # =======================================================================
    def _render_compare(self, r, f):
        tab=self.tab_compare
        for w in tab.winfo_children(): w.destroy()
        _,inner,_=scrollable(tab)
        lbl(inner,"Loan Scenario Comparison",12,bold=True,
            color=C["txt"]).pack(anchor="w",padx=14,pady=(14,4))
        scenarios=[
            {"label":"Current",   "mult":1.0,"term":f["loan_term"]},
            {"label":"50% Loan",  "mult":0.5,"term":f["loan_term"]},
            {"label":"75% Loan",  "mult":0.75,"term":f["loan_term"]},
            {"label":"150% Loan", "mult":1.5,"term":f["loan_term"]},
            {"label":"Shorter T", "mult":1.0,"term":max(12,f["loan_term"]//2)},
            {"label":"Longer T",  "mult":1.0,"term":min(240,f["loan_term"]*2)},
        ]
        for sc in scenarios:
            sf=dict(f)
            sf["loan_amount"]=int(f["loan_amount"]*sc["mult"])
            sf["loan_term"]=sc["term"]
            res=self.engine.predict(sf)
            clr=C["green"] if res["eligible"] else C["red"]
            card=tk.Frame(inner,bg=C["card"],highlightthickness=1,
                          highlightbackground=clr)
            card.pack(fill="x",padx=14,pady=3)
            row=tk.Frame(card,bg=C["card"]); row.pack(fill="x",padx=14,pady=8)
            lf=tk.Frame(row,bg=C["card"],width=120)
            lf.pack(side="left",fill="y"); lf.pack_propagate(False)
            lbl(lf,sc["label"],10,bold=True,color=C["txt"]).pack(anchor="w")
            lbl(lf,f"Rs{sf['loan_amount']:,}",8,color=C["txt_dim"]).pack(anchor="w")
            bf=tk.Frame(row,bg=C["card"]); bf.pack(side="left",fill="both",expand=True,padx=10)
            pb=tk.Canvas(bf,height=20,bg=C["border"],highlightthickness=0)
            pb.pack(fill="x",pady=5); bf.update_idletasks()
            pw=pb.winfo_width() or 300
            fw=int(pw*res["confidence"]/100)
            pb.create_rectangle(0,0,fw,20,fill=clr,outline="")
            pb.create_text(max(fw//2,30),10,text=f"{res['confidence']}%",
                           fill="#000" if fw>40 else clr,font=(FONT,8,"bold"))
            vf=tk.Frame(row,bg=C["card"],width=90)
            vf.pack(side="right",fill="y"); vf.pack_propagate(False)
            vt="APPROVED" if res["eligible"] else "DECLINED"
            lbl(vf,vt,9,bold=True,color=clr).pack(anchor="e")
            lbl(vf,f"EMI: Rs{res['emi']:,}",8,color=C["txt_dim"]).pack(anchor="e")

        tips=make_card(inner); tips.pack(fill="x",padx=14,pady=(10,14))
        lbl(tips,"Tips to Improve Approval",10,bold=True,
            color=C["accent"]).pack(anchor="w",padx=14,pady=(10,4))
        for tip in [
            "-> Improve CIBIL above 750 for best rates",
            "-> Reduce existing loans before applying",
            "-> Choose longer tenure to lower EMI",
            "-> Apply for 50-70% of maximum eligible amount",
            "-> Add a co-applicant with higher income",
        ]:
            lbl(tips,tip,9,color=C["txt"]).pack(anchor="w",padx=14,pady=1)
        tk.Frame(tips,bg=C["bg"],height=8).pack()

    # =======================================================================
    #  TAB: EMI
    # =======================================================================
    def _render_emi(self, r, f):
        tab=self.tab_emi
        for w in tab.winfo_children(): w.destroy()
        outer=tk.Frame(tab,bg=C["bg"])
        outer.pack(fill="both",expand=True,padx=14,pady=14)
        lbl(outer,"EMI Calculator & Amortization",12,bold=True,
            color=C["txt"]).pack(anchor="w",pady=(0,10))
        sc=make_card(outer); sc.pack(fill="x",pady=(0,10))
        row=tk.Frame(sc,bg=C["card"]); row.pack(fill="x",padx=14,pady=12)
        for txt,val,clr in [
            ("Principal",     f"Rs{f['loan_amount']:,}", C["accent"]),
            ("Rate",          f"{r['rate']}% pa",        C["amber"]),
            ("Monthly EMI",   f"Rs{r['emi']:,}",         C["green"]),
            ("Total Interest",f"Rs{r['interest_paid']:,}",C["red"]),
            ("Total Payable", f"Rs{r['total_payable']:,}",C["txt"]),
            ("Tenure",        f"{f['loan_term']} mo",    C["txt_dim"]),
        ]:
            b=tk.Frame(row,bg=C["input_bg"],highlightthickness=1,
                       highlightbackground=C["border"])
            b.pack(side="left",expand=True,fill="x",padx=3)
            lbl(b,txt,8,color=C["txt_dim"]).pack(anchor="w",padx=8,pady=(6,1))
            lbl(b,val,10,bold=True,color=clr).pack(anchor="w",padx=8,pady=(0,6))

        # Bar
        bc=make_card(outer); bc.pack(fill="x",pady=(0,10))
        lbl(bc,"Loan Composition",10,bold=True,color=C["accent"]).pack(
            anchor="w",padx=14,pady=(10,4))
        bf=tk.Frame(bc,bg=C["card"]); bf.pack(fill="x",padx=14,pady=(0,12))
        pb=tk.Canvas(bf,height=28,bg=C["border"],highlightthickness=0)
        pb.pack(fill="x",pady=4); bf.update_idletasks()
        tw=pb.winfo_width() or 400
        total=r["total_payable"]; principal=f["loan_amount"]
        interest=r["interest_paid"]
        if total>0:
            pw=int(tw*principal/total)
            pb.create_rectangle(0,0,pw,28,fill=C["accent"],outline="")
            pb.create_rectangle(pw,0,tw,28,fill=C["red"],outline="")
            pb.create_text(pw//2,14,text=f"Principal {principal*100//total}%",
                           fill="#000",font=(FONT,8,"bold"))
            pb.create_text(pw+(tw-pw)//2,14,
                           text=f"Interest {interest*100//total}%",
                           fill="#fff",font=(FONT,8,"bold"))

        # Amortization table
        am=make_card(outer); am.pack(fill="both",expand=True)
        lbl(am,"Amortization Schedule (first 24 months)",10,bold=True,
            color=C["accent"]).pack(anchor="w",padx=14,pady=(10,4))
        hrow=tk.Frame(am,bg=C["border"]); hrow.pack(fill="x",padx=14,pady=(0,1))
        for h in ["Month","EMI (Rs)","Principal (Rs)","Interest (Rs)","Balance (Rs)"]:
            lbl(hrow,h,8,bold=True,color=C["txt_dim"]).pack(
                side="left",expand=True,fill="x",padx=6,pady=4)
        r_m=r["rate"]/12/100; bal=float(principal); n=f["loan_term"]
        emi=r["emi"]
        for mo in range(1,min(25,n+1)):
            ip=bal*r_m; pp=emi-ip; bal=max(0,bal-pp)
            bg_=C["input_bg"] if mo%2==0 else C["card"]
            dr=tk.Frame(am,bg=bg_); dr.pack(fill="x",padx=14,pady=0)
            for val in [str(mo),f"{emi:,}",f"{int(pp):,}",
                        f"{int(ip):,}",f"{int(bal):,}"]:
                lbl(dr,val,8,color=C["txt"]).pack(
                    side="left",expand=True,fill="x",padx=6,pady=3)
        if n>24:
            lbl(am,f"  ... and {n-24} more months",8,
                color=C["txt_dim"]).pack(anchor="w",padx=20,pady=4)
        tk.Frame(am,bg=C["bg"],height=8).pack()

    # -----------------------------------------------------------------------
    #  RESET
    # -----------------------------------------------------------------------
    def _reset(self):
        defaults={"name":"Rahul Sharma","age":32,"income":75000,
                  "cibil_score":720,"employment_years":5,
                  "monthly_obligations":15000,"savings":10000,
                  "existing_loans":1,"assets_value":1500000,
                  "loan_amount":500000,"loan_term":"60",
                  "education_level":"Graduate","loan_purpose":"Home Loan"}
        for k,v in defaults.items():
            if k in self._vars:
                try: self._vars[k].set(v)
                except: pass
        self._show_idle()
        self.status_var.set("Form reset -- ready for new prediction")


# ---------------------------------------------------------------------------
#  ENTRY POINT
# ---------------------------------------------------------------------------
if __name__=="__main__":
    print("""
+------------------------------------------------------------------+
|   SmartLoan AI v3.0 -- ML + Search Algorithms                   |
|   ML  : Random Forest, Gradient Boosting, Logistic Regression   |
|   ALG : A* Search, BFS, DFS, Dijkstra, Greedy Best-First        |
|   Training on 8,000 synthetic records...                         |
+------------------------------------------------------------------+
""")
    SmartLoanApp()