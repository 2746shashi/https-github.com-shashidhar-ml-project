import { useState } from "react";

const C = { bg: "#080D18", panel: "#0D1526", card: "#111D35", border: "#1E2D4A", accent: "#00C6FF", green: "#00E676",
  red: "#FF5252", amber: "#FFB300", txt: "#E8F0FE", dim: "#5A7BA0" };
const EDU = ["High School", "Graduate", "Post Graduate", "PhD"];
const PURPOSE = ["Home Loan", "Car Loan", "Education Loan", "Personal Loan", "Business Loan"];
const TERMS = [12, 24, 36, 48, 60, 84, 120, 180, 240];
const DEFAULTS = { name: "Rahul Sharma", age: 32, education: "Graduate", income: 75000, cibil_score: 720, employment_years: 5,
  monthly_obligations: 15000, savings: 10000, existing_loans: 1, assets_value: 1500000, loan_amount: 500000, loan_term: 60, purpose: "Home Loan" };
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const statusColor = { good: C.green, warn: C.amber, bad: C.red };
const statusIcon = { good: "✅", warn: "⚠️", bad: "❌" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@500&display=swap');
*{box-sizing:border-box} body{margin:0;background:${C.bg};color:${C.txt};font-family:'Outfit',sans-serif}
input,select{width:100%;background:#0A1428;border:1px solid ${C.border};color:${C.txt};padding:9px 11px;border-radius:8px;font:inherit;outline:none}
input:focus,select:focus{border-color:${C.accent}}
label{display:block;font-size:11px;color:${C.dim};margin:12px 0 5px;letter-spacing:.06em;text-transform:uppercase}
.card{background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:18px}
.tab{padding:8px 16px;border-radius:99px;border:1px solid ${C.border};background:transparent;color:${C.dim};cursor:pointer;font:inherit;font-size:13px}
.tab.on{background:${C.accent};color:#001018;border-color:${C.accent};font-weight:600}
.btn{width:100%;padding:14px;margin-top:18px;border:0;border-radius:10px;background:${C.accent};color:#001018;font:600 15px 'Outfit';cursor:pointer}
.btn:disabled{opacity:.5} .mono{font-family:'JetBrains Mono',monospace}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}} .up{animation:up .4s ease both}
@media(max-width:860px){.layout{grid-template-columns:1fr!important}}
`;

function Field({ label, children }) { return (<div><label>{label}</label>{children}</div>); }

function Ring({ pct, color }) {
  const r = 54, c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke={C.border} strokeWidth="11" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1s" }} />
      <text x="70" y="68" textAnchor="middle" fill={C.txt} fontSize="26" fontWeight="700">{pct}%</text>
      <text x="70" y="88" textAnchor="middle" fill={C.dim} fontSize="10">CONFIDENCE</text>
    </svg>
  );
}

function Bar({ label, value, color = C.accent }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
        <span>{label}</span><span className="mono" style={{ color }}>{value}%</span>
      </div>
      <div style={{ height: 7, background: C.border, borderRadius: 4 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4, transition: "width .8s" }} />
      </div>
    </div>
  );
}

export default function App() {
  const [f, setF] = useState(DEFAULTS);
  const [res, setRes] = useState(null);
  const [tab, setTab] = useState("decision");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const num = (k, props = {}) => <input type="number" value={f[k]} onChange={set(k)} {...props} />;

  async function predict() {
    setLoading(true); setErr("");
    try {
      const body = {
        age: +f.age, income: +f.income, loan_amount: +f.loan_amount, loan_term: +f.loan_term, cibil_score: +f.cibil_score,
        employment_years: +f.employment_years, existing_loans: +f.existing_loans, assets_value: +f.assets_value,
        education_level: EDU.indexOf(f.education), loan_purpose: PURPOSE.indexOf(f.purpose),
        monthly_obligations: +f.monthly_obligations, savings: +f.savings,
      };
      const r = await fetch("/api/ml/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) throw new Error(Array.isArray(data.detail) ? data.detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(", ") : data.detail || "Request failed");
      setRes(data); setTab("decision");
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }

  const riskColor = res ? (res.confidence >= 80 ? C.green : res.confidence >= 60 ? C.amber : C.red) : C.accent;
  const tabs = [["decision", "Decision"], ["rules", "Rules"], ["banks", "Banks"], ["compare", "Models"], ["emi", "EMI"]];

  return (
    <>
      <style>{css}</style>
      <header style={{ padding: "18px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Smart<span style={{ color: C.accent }}>Loan</span> AI</div>
        <div style={{ fontSize: 12, color: C.dim }}>Random Forest · Gradient Boosting · Logistic Regression ensemble</div>
      </header>

      <div className="layout" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 22, padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div className="card">
          <div style={{ fontWeight: 700 }}>👤 Personal</div>
          <Field label="Full Name"><input value={f.name} onChange={set("name")} /></Field>
          <Field label="Age">{num("age", { min: 21, max: 65 })}</Field>
          <Field label="Education"><select value={f.education} onChange={set("education")}>{EDU.map((e) => <option key={e}>{e}</option>)}</select></Field>
          <div style={{ fontWeight: 700, marginTop: 20 }}>💰 Financial</div>
          <Field label="Monthly Income (₹)">{num("income", { step: 5000 })}</Field>
          <Field label="CIBIL Score">{num("cibil_score", { min: 300, max: 900 })}</Field>
          <Field label="Employment (years)">{num("employment_years", { min: 0, max: 40 })}</Field>
          <Field label="Monthly Obligations (₹)">{num("monthly_obligations", { step: 1000 })}</Field>
          <Field label="Monthly Savings (₹)">{num("savings", { step: 1000 })}</Field>
          <Field label="Existing Loans">{num("existing_loans", { min: 0, max: 10 })}</Field>
          <Field label="Total Assets (₹)">{num("assets_value", { step: 50000 })}</Field>
          <div style={{ fontWeight: 700, marginTop: 20 }}>🏦 Loan</div>
          <Field label="Loan Amount (₹)">{num("loan_amount", { step: 10000 })}</Field>
          <Field label="Term (months)"><select value={f.loan_term} onChange={set("loan_term")}>{TERMS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Purpose"><select value={f.purpose} onChange={set("purpose")}>{PURPOSE.map((p) => <option key={p}>{p}</option>)}</select></Field>
          <button className="btn" onClick={predict} disabled={loading}>{loading ? "Analysing…" : "⚡ Predict Eligibility"}</button>
          <button className="tab" style={{ width: "100%", marginTop: 8 }} onClick={() => { setF(DEFAULTS); setRes(null); setErr(""); }}>↺ Reset</button>
          {err && <div style={{ marginTop: 12, color: C.red, fontSize: 13 }}>{err}</div>}
        </div>

        <div>
          {!res ? (
            <div className="card" style={{ textAlign: "center", padding: 70, color: C.dim }}>
              <div style={{ fontSize: 46 }}>🤖</div>
              <div style={{ fontSize: 18, color: C.txt, marginTop: 8 }}>Ready to analyse</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Fill in the profile and press Predict.</div>
            </div>
          ) : (
            <div className="up">
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {tabs.map(([id, l]) => <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{l}</button>)}
              </div>

              {tab === "decision" && (
                <div className="card" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
                  <Ring pct={Math.round(res.confidence)} color={riskColor} />
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 13, color: C.dim }}>{f.name}</div>
                    <div style={{ fontSize: 30, fontWeight: 700, color: res.eligible ? C.green : C.red }}>{res.eligible ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}</div>
                    <div style={{ color: riskColor, fontWeight: 600, marginBottom: 14 }}>{res.risk_rating}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[["Interest rate", res.rate + "% p.a."], ["Monthly EMI", inr(res.emi)], ["Max loan", inr(res.max_loan)], ["Total payable", inr(res.total_payable)]].map(([a, b]) => (
                        <div key={a}><div style={{ fontSize: 11, color: C.dim }}>{a}</div><div className="mono">{b}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "rules" && (
                <div className="card">
                  {res.rules.map((r) => (
                    <div key={r.title} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span>{statusIcon[r.status]}</span>
                      <div style={{ flex: 1 }}>{r.title}</div>
                      <div className="mono" style={{ color: statusColor[r.status], fontSize: 13 }}>{r.detail}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "banks" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
                  {res.banks.map((b) => (
                    <div key={b.name} className="card">
                      <div style={{ fontWeight: 700 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: C.dim, marginBottom: 10 }}>{b.specialty}</div>
                      <div className="mono" style={{ color: C.accent, fontSize: 20 }}>{b.rate}</div>
                      <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>Min CIBIL {b.min_cibil} · Fee {b.processing}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "compare" && (
                <div className="card">
                  <div style={{ fontWeight: 700, marginBottom: 14 }}>Approval probability by model</div>
                  {Object.entries(res.model_probs).map(([m, p]) => <Bar key={m} label={m} value={p} color={p >= 50 ? C.green : C.red} />)}
                  <div style={{ fontWeight: 700, margin: "22px 0 14px" }}>Test-set accuracy</div>
                  {Object.entries(res.accuracies).map(([m, a]) => <Bar key={m} label={m} value={a} />)}
                </div>
              )}

              {tab === "emi" && (
                <div className="card">
                  {[["Principal", inr(f.loan_amount)], ["Rate", res.rate + "% p.a."], ["Tenure", f.loan_term + " months"], ["Monthly EMI", inr(res.emi)],
                    ["Total interest", inr(res.interest_paid)], ["Total payable", inr(res.total_payable)]].map(([a, b]) => (
                    <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ color: C.dim }}>{a}</span><span className="mono">{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
