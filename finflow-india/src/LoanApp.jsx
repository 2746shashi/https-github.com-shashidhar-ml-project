import { useState, useEffect, useCallback } from "react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
const DS = {
  colors: {
    bg: "#0B0F1A",
    surface: "#111827",
    surfaceAlt: "#1A2236",
    border: "#1E2D45",
    accent: "#00D4FF",
    accentGlow: "rgba(0,212,255,0.15)",
    accentDark: "#0099BB",
    gold: "#F59E0B",
    goldGlow: "rgba(245,158,11,0.15)",
    green: "#10B981",
    greenGlow: "rgba(16,185,129,0.15)",
    red: "#EF4444",
    redGlow: "rgba(239,68,68,0.15)",
    yellow: "#FBBF24",
    text: "#F1F5F9",
    textMuted: "#64748B",
    textSub: "#94A3B8",
  },
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${DS.colors.bg};
      color: ${DS.colors.text};
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${DS.colors.bg}; }
    ::-webkit-scrollbar-thumb { background: ${DS.colors.border}; border-radius: 2px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.3); }
      50% { box-shadow: 0 0 0 8px rgba(0,212,255,0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes progressFill {
      from { width: 0; }
      to { width: var(--target-width); }
    }

    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
    .fade-up-4 { animation: fadeUp 0.5s 0.4s ease both; }

    .btn-primary {
      background: linear-gradient(135deg, ${DS.colors.accent}, ${DS.colors.accentDark});
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.5px;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,212,255,0.3); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    .btn-secondary {
      background: transparent;
      color: ${DS.colors.accent};
      border: 1px solid ${DS.colors.border};
      border-radius: 10px;
      padding: 11px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: ${DS.colors.accent}; background: ${DS.colors.accentGlow}; }

    .btn-danger {
      background: linear-gradient(135deg, ${DS.colors.red}, #cc2222);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(239,68,68,0.3); }

    .btn-success {
      background: linear-gradient(135deg, ${DS.colors.green}, #0d9668);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-success:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,0.3); }

    input, select, textarea {
      background: ${DS.colors.surfaceAlt};
      border: 1px solid ${DS.colors.border};
      border-radius: 10px;
      color: ${DS.colors.text};
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      padding: 12px 16px;
      width: 100%;
      transition: all 0.2s;
      outline: none;
    }
    input:focus, select:focus, textarea:focus {
      border-color: ${DS.colors.accent};
      box-shadow: 0 0 0 3px ${DS.colors.accentGlow};
    }
    input::placeholder { color: ${DS.colors.textMuted}; }
    select option { background: ${DS.colors.surface}; }

    .card {
      background: ${DS.colors.surface};
      border: 1px solid ${DS.colors.border};
      border-radius: 16px;
      padding: 24px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      font-family: 'Syne', sans-serif;
      letter-spacing: 0.5px;
    }
    .tag-green { background: ${DS.colors.greenGlow}; color: ${DS.colors.green}; border: 1px solid rgba(16,185,129,0.3); }
    .tag-red { background: ${DS.colors.redGlow}; color: ${DS.colors.red}; border: 1px solid rgba(239,68,68,0.3); }
    .tag-yellow { background: rgba(251,191,36,0.1); color: ${DS.colors.yellow}; border: 1px solid rgba(251,191,36,0.3); }
    .tag-blue { background: ${DS.colors.accentGlow}; color: ${DS.colors.accent}; border: 1px solid rgba(0,212,255,0.3); }
    .tag-gold { background: ${DS.colors.goldGlow}; color: ${DS.colors.gold}; border: 1px solid rgba(245,158,11,0.3); }

    .mono { font-family: 'JetBrains Mono', monospace; }

    .section-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -0.5px;
    }

    .progress-bar {
      height: 4px;
      background: ${DS.colors.border};
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${DS.colors.accent}, ${DS.colors.accentDark});
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }

    .divider {
      height: 1px;
      background: ${DS.colors.border};
      margin: 20px 0;
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(0,212,255,0.2);
      border-top-color: ${DS.colors.accent};
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .otp-input {
      width: 52px !important;
      height: 56px;
      text-align: center;
      font-size: 22px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      border-radius: 12px;
    }

    .upload-zone {
      border: 2px dashed ${DS.colors.border};
      border-radius: 14px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-zone:hover {
      border-color: ${DS.colors.accent};
      background: ${DS.colors.accentGlow};
    }
    .upload-zone.uploaded {
      border-color: ${DS.colors.green};
      background: ${DS.colors.greenGlow};
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
      color: ${DS.colors.textSub};
      white-space: nowrap;
    }
    .nav-item:hover { background: ${DS.colors.surfaceAlt}; color: ${DS.colors.text}; }
    .nav-item.active {
      background: ${DS.colors.accentGlow};
      color: ${DS.colors.accent};
      border: 1px solid rgba(0,212,255,0.2);
    }

    .metric-card {
      background: ${DS.colors.surface};
      border: 1px solid ${DS.colors.border};
      border-radius: 14px;
      padding: 20px;
      transition: all 0.2s;
    }
    .metric-card:hover { border-color: ${DS.colors.accent}; transform: translateY(-2px); }

    .loan-step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }
    .step-num {
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      flex-shrink: 0;
    }
    .step-active { background: ${DS.colors.accent}; color: #000; }
    .step-done { background: ${DS.colors.green}; color: #fff; }
    .step-pending { background: ${DS.colors.border}; color: ${DS.colors.textMuted}; }

    .emi-bar {
      display: flex;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 6px;
    }

    .risk-meter {
      display: flex;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      gap: 2px;
    }

    .table-row {
      display: grid;
      padding: 14px 0;
      border-bottom: 1px solid ${DS.colors.border};
      align-items: center;
      transition: background 0.1s;
      cursor: pointer;
    }
    .table-row:hover { background: ${DS.colors.surfaceAlt}; border-radius: 8px; padding-left: 8px; }
    .table-header {
      display: grid;
      padding: 10px 0;
      border-bottom: 1px solid ${DS.colors.border};
      font-size: 11px;
      font-weight: 600;
      color: ${DS.colors.textMuted};
      letter-spacing: 0.8px;
      text-transform: uppercase;
      font-family: 'Syne', sans-serif;
    }
  `}</style>
);

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_LOANS = [
  { id: "LN-2024-001", name: "Arjun Sharma", amount: 500000, type: "Personal", status: "approved", score: 742, emi: 11200, tenure: 48, date: "2024-01-15", city: "Mumbai", risk: "low" },
  { id: "LN-2024-002", name: "Priya Mehta", amount: 1200000, type: "Home", status: "pending", score: 698, emi: 18500, tenure: 84, date: "2024-01-18", city: "Bengaluru", risk: "medium" },
  { id: "LN-2024-003", name: "Rahul Gupta", amount: 300000, type: "Education", status: "rejected", score: 612, emi: 0, tenure: 0, date: "2024-01-20", city: "Delhi", risk: "high" },
  { id: "LN-2024-004", name: "Sneha Reddy", amount: 750000, type: "Business", status: "approved", score: 768, emi: 16800, tenure: 60, date: "2024-01-22", city: "Hyderabad", risk: "low" },
  { id: "LN-2024-005", name: "Vikram Patel", amount: 200000, type: "Personal", status: "disbursed", score: 731, emi: 5600, tenure: 36, date: "2024-01-10", city: "Ahmedabad", risk: "low" },
  { id: "LN-2024-006", name: "Ananya Singh", amount: 450000, type: "Vehicle", status: "pending", score: 672, emi: 9800, tenure: 60, date: "2024-01-23", city: "Pune", risk: "medium" },
];

const MOCK_EMI_SCHEDULE = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  label: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i],
  principal: 7800 + Math.floor(Math.random() * 200),
  interest: 3400 - i * 80,
  status: i < 4 ? "paid" : i === 4 ? "due" : "upcoming",
}));

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const Icons = {
  Home: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  User: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  Document: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  CreditCard: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  TrendingUp: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Shield: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  Bell: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  Check: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevronRight: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Upload: () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
  Rupee: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4.5 4.5 0 000-9H6v9z"/></svg>,
  Admin: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>,
  List: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Alert: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  Logout: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  Eye: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  Pie: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>,
};

// ─── HELPER ────────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const fmtRs = (n) => `₹${fmt(n)}`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatusTag({ status }) {
  const map = { approved: ["tag-green", "● Approved"], rejected: ["tag-red", "● Rejected"], pending: ["tag-yellow", "● Pending"], disbursed: ["tag-blue", "● Disbursed"], paid: ["tag-green", "✓ Paid"], due: ["tag-yellow", "⚡ Due"], upcoming: ["", "upcoming"] };
  const [cls, label] = map[status] || ["", status];
  return <span className={`tag ${cls}`} style={!cls ? { color: DS.colors.textMuted, fontSize: 12 } : {}}>{label}</span>;
}

function MetricCard({ label, value, sub, accent, icon: IconComp }) {
  return (
    <div className="metric-card fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: DS.colors.textMuted, marginBottom: 8, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: accent || DS.colors.text, letterSpacing: "-1px" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: DS.colors.textSub, marginTop: 4 }}>{sub}</div>}
        </div>
        {IconComp && (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: accent ? `${accent}22` : DS.colors.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", color: accent || DS.colors.textSub }}>
            <IconComp />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

// LOGIN SCREEN
function LoginScreen({ onLogin }) {
  const [phase, setPhase] = useState("phone"); // phone | otp | role
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("user");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const sendOtp = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setPhase("otp"); setTimer(30); }, 1200);
  };

  const verifyOtp = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setPhase("role"); }, 1000);
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const fullOtp = otp.join("");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: DS.colors.bg }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${DS.colors.border} 1px, transparent 1px), linear-gradient(90deg, ${DS.colors.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3 }} />
      {/* Glow blob */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />

      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: DS.colors.surface, border: `1px solid ${DS.colors.border}`, borderRadius: 14, padding: "10px 20px", marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${DS.colors.accent}, ${DS.colors.accentDark})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16 }}>₹</span>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>FinFlow <span style={{ color: DS.colors.accent }}>India</span></span>
          </div>
          <div style={{ fontSize: 12, color: DS.colors.textMuted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Syne', sans-serif" }}>RBI Compliant Lending Platform</div>
        </div>

        <div className="card fade-up-1" style={{ background: DS.colors.surface, border: `1px solid ${DS.colors.border}` }}>
          {phase === "phone" && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Welcome back</h2>
              <p style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Enter your mobile number to continue</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>MOBILE NUMBER</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ background: DS.colors.surfaceAlt, border: `1px solid ${DS.colors.border}`, borderRadius: 10, padding: "12px 14px", color: DS.colors.textSub, fontSize: 14, whiteSpace: "nowrap" }}>🇮🇳 +91</div>
                  <input placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} style={{ flex: 1 }} />
                </div>
              </div>
              <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={sendOtp} disabled={phone.length < 10 || loading}>
                {loading ? <><span className="spinner" /> &nbsp;Sending OTP...</> : "Send OTP →"}
              </button>
            </>
          )}

          {phase === "otp" && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Verify OTP</h2>
              <p style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Sent to +91 {phone} · <span style={{ color: DS.colors.accent, cursor: "pointer" }} onClick={() => setPhase("phone")}>Change</span></p>
              <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
                {otp.map((v, i) => (
                  <input key={i} id={`otp-${i}`} className="otp-input" maxLength={1} value={v} onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => e.key === "Backspace" && !v && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()} />
                ))}
              </div>
              <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={verifyOtp} disabled={fullOtp.length < 6 || loading}>
                {loading ? <><span className="spinner" /> &nbsp;Verifying...</> : "Verify & Continue →"}
              </button>
              <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: DS.colors.textMuted }}>
                {timer > 0 ? `Resend in ${timer}s` : <span style={{ color: DS.colors.accent, cursor: "pointer" }} onClick={() => { setTimer(30); }}>Resend OTP</span>}
              </div>
              <div style={{ marginTop: 12, padding: 10, background: DS.colors.accentGlow, borderRadius: 8, textAlign: "center", fontSize: 12, color: DS.colors.accent }}>
                Demo OTP: <span className="mono" style={{ fontWeight: 600 }}>123456</span>
              </div>
            </>
          )}

          {phase === "role" && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Select Mode</h2>
              <p style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 24 }}>How would you like to sign in?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {[{ id: "user", label: "Customer", desc: "Apply for loans, track EMIs, manage KYC", icon: "👤" },
                  { id: "admin", label: "Admin", desc: "Approve loans, risk monitoring, analytics", icon: "🛡️" }].map(r => (
                  <div key={r.id} onClick={() => setRole(r.id)} style={{ padding: 16, borderRadius: 12, border: `2px solid ${role === r.id ? DS.colors.accent : DS.colors.border}`, cursor: "pointer", background: role === r.id ? DS.colors.accentGlow : "transparent", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{r.icon}</span>
                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: DS.colors.textSub, marginTop: 2 }}>{r.desc}</div>
                      </div>
                      {role === r.id && <div style={{ marginLeft: "auto", color: DS.colors.accent }}><Icons.Check /></div>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={() => onLogin(role)}>Enter Dashboard →</button>
            </>
          )}
        </div>

        <div className="fade-up-2" style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: DS.colors.textMuted, lineHeight: 1.8 }}>
          🔒 256-bit AES encrypted · RBI regulated · ISO 27001<br />
          By continuing you agree to our <span style={{ color: DS.colors.accent }}>Terms</span> & <span style={{ color: DS.colors.accent }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDashboard({ onLogout }) {
  const [screen, setScreen] = useState("home");
  const [loanData, setLoanData] = useState(null);

  const nav = [
    { id: "home", label: "Dashboard", icon: Icons.Home },
    { id: "kyc", label: "KYC & Profile", icon: Icons.Shield },
    { id: "apply", label: "Apply for Loan", icon: Icons.CreditCard },
    { id: "emi", label: "EMI Tracker", icon: Icons.TrendingUp },
    { id: "eligibility", label: "Eligibility Check", icon: Icons.Document },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: DS.colors.bg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: DS.colors.surface, borderRight: `1px solid ${DS.colors.border}`, padding: "24px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${DS.colors.accent}, ${DS.colors.accentDark})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>₹</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>FinFlow</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map(n => (
            <div key={n.id} className={`nav-item ${screen === n.id ? "active" : ""}`} onClick={() => setScreen(n.id)}>
              <n.icon />{n.label}
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 16, borderTop: `1px solid ${DS.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${DS.colors.accent}44, ${DS.colors.accentDark}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>AK</div>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Arjun Kumar</div><div style={{ fontSize: 11, color: DS.colors.textMuted }}>+91 98765 43210</div></div>
          </div>
          <div className="nav-item" onClick={onLogout} style={{ color: DS.colors.red }}><Icons.Logout />Logout</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: "32px 28px", maxWidth: 960 }}>
        {screen === "home" && <UserHome setScreen={setScreen} />}
        {screen === "kyc" && <KYCScreen />}
        {screen === "apply" && <LoanApplicationScreen setLoanData={setLoanData} setScreen={setScreen} />}
        {screen === "emi" && <EMITracker />}
        {screen === "eligibility" && <EligibilityCheck />}
      </div>
    </div>
  );
}

function UserHome({ setScreen }) {
  const loan = MOCK_LOANS[0];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title fade-up" style={{ marginBottom: 4 }}>Good morning, Arjun 👋</h1>
        <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14 }}>Here's your financial overview for today</p>
      </div>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <MetricCard label="Active Loan" value={fmtRs(500000)} sub="Personal Loan · LN-2024-001" accent={DS.colors.accent} icon={Icons.CreditCard} />
        <MetricCard label="Next EMI Due" value={fmtRs(11200)} sub="Due on Feb 5, 2024 — 8 days" accent={DS.colors.gold} icon={Icons.TrendingUp} />
        <MetricCard label="Credit Score" value="742" sub="↑ 12 pts since last month" accent={DS.colors.green} icon={Icons.Shield} />
      </div>

      {/* Loan summary card */}
      <div className="card fade-up-2" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Loan Repayment Progress</div>
            <div style={{ fontSize: 13, color: DS.colors.textSub }}>₹5,04,800 / ₹5,00,000 total · 4 of 48 EMIs paid</div>
          </div>
          <StatusTag status="approved" />
        </div>
        <div className="progress-bar" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: "8.3%" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: DS.colors.textMuted }}>
          <span>8.3% complete</span><span>44 EMIs remaining</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card fade-up-3">
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[["💳 Pay EMI", "emi"], ["📋 Apply New Loan", "apply"], ["🔍 Check Eligibility", "eligibility"], ["📄 KYC & Docs", "kyc"]].map(([label, s]) => (
            <button key={s} className="btn-secondary" style={{ flex: "1 1 140px" }} onClick={() => setScreen(s)}>{label}</button>
          ))}
        </div>
      </div>

      {/* RBI Notice */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: DS.colors.goldGlow, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>🏛️</span>
        <div style={{ fontSize: 13, color: DS.colors.yellow, lineHeight: 1.6 }}>
          <strong>RBI Compliance Notice:</strong> This platform operates under RBI Master Direction – Reserve Bank of India (Non-Banking Financial Company – Scale Based Regulation) Directions, 2023. Your data is protected under the Digital Personal Data Protection Act, 2023.
        </div>
      </div>
    </div>
  );
}

function KYCScreen() {
  const [docs, setDocs] = useState({ pan: null, aadhaar: null, selfie: null, income: null });
  const [step, setStep] = useState(0);

  const docList = [
    { key: "pan", label: "PAN Card", desc: "Permanent Account Number card", icon: "🪪" },
    { key: "aadhaar", label: "Aadhaar Card", desc: "Both sides of Aadhaar card", icon: "📋" },
    { key: "selfie", label: "Live Selfie", desc: "Face verification photo", icon: "🤳" },
    { key: "income", label: "Income Proof", desc: "Salary slips / ITR documents", icon: "💰" },
  ];

  const allUploaded = Object.values(docs).every(Boolean);

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>KYC Verification</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Complete your KYC to unlock full loan eligibility. Required by RBI regulations.</p>

      {/* Steps */}
      <div className="card fade-up-1" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Verification Progress</div>
          <span style={{ fontSize: 13, color: DS.colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{Object.values(docs).filter(Boolean).length}/4 documents</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(Object.values(docs).filter(Boolean).length / 4) * 100}%` }} />
        </div>
      </div>

      <div className="grid-2 fade-up-2">
        {docList.map(({ key, label, desc, icon }) => (
          <div key={key} className={`upload-zone ${docs[key] ? "uploaded" : ""}`} onClick={() => setDocs(d => ({ ...d, [key]: true }))}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{docs[key] ? "✅" : icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: DS.colors.textSub, marginBottom: 12 }}>{desc}</div>
            {docs[key]
              ? <span className="tag tag-green">Uploaded · Verified</span>
              : <span className="tag tag-blue">Click to Upload</span>}
          </div>
        ))}
      </div>

      {allUploaded && (
        <div className="fade-up" style={{ marginTop: 20, padding: 20, background: DS.colors.greenGlow, border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 14, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>🎉</span>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: DS.colors.green }}>KYC Verification Complete!</div>
            <div style={{ fontSize: 13, color: DS.colors.textSub, marginTop: 4 }}>Your documents have been verified. You're now eligible for loans up to ₹15,00,000.</div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="card fade-up-3" style={{ marginTop: 24 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Personal Profile</div>
        <div className="grid-2">
          {[["Full Name", "Arjun Kumar"], ["Date of Birth", "15 March 1990"], ["PAN Number", "ABCDE1234F"], ["Aadhaar", "XXXX-XXXX-7890"], ["Annual Income", "₹12,00,000"], ["Employment Type", "Salaried"]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 11, color: DS.colors.textMuted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
              <div className="divider" style={{ margin: "12px 0" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoanApplicationScreen({ setScreen }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ loanType: "Personal", amount: 500000, tenure: 36, purpose: "", income: 1200000, employer: "", bankAcc: "" });
  const [submitted, setSubmitted] = useState(false);

  const emi = Math.round((form.amount * (0.14 / 12) * Math.pow(1 + 0.14 / 12, form.tenure)) / (Math.pow(1 + 0.14 / 12, form.tenure) - 1));

  if (submitted) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎊</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 10 }}>Application Submitted!</h2>
      <p style={{ color: DS.colors.textSub, fontSize: 15, marginBottom: 8 }}>Your loan application <span className="mono" style={{ color: DS.colors.accent }}>LN-2024-007</span> is under review.</p>
      <p style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Expected decision within 2–4 business hours</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-primary" onClick={() => { setSubmitted(false); setStep(1); }}>Apply Another</button>
        <button className="btn-secondary" onClick={() => setScreen("emi")}>View EMI Plan</button>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>Loan Application</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Quick, digital, RBI-compliant loan processing</p>

      {/* Step indicator */}
      <div className="card fade-up-1" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {["Loan Details", "Income Info", "Bank Account", "Review"].map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <div className={`step-num ${step > i + 1 ? "step-done" : step === i + 1 ? "step-active" : "step-pending"}`}>
                  {step > i + 1 ? <Icons.Check /> : i + 1}
                </div>
                <div style={{ fontSize: 12, fontWeight: step === i + 1 ? 700 : 400, color: step >= i + 1 ? DS.colors.text : DS.colors.textMuted, display: window.innerWidth < 600 ? "none" : "block" }}>{s}</div>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? DS.colors.accent : DS.colors.border, maxWidth: 40, margin: "0 8px" }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="card fade-up-2">
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Loan Details</h3>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>LOAN TYPE</label>
                <select value={form.loanType} onChange={e => setForm(f => ({ ...f, loanType: e.target.value }))}>
                  <option>Personal</option><option>Home</option><option>Vehicle</option><option>Education</option><option>Business</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>PURPOSE</label>
                <input placeholder="Medical emergency, travel, etc." value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>LOAN AMOUNT: <span style={{ color: DS.colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{fmtRs(form.amount)}</span></label>
              <input type="range" min={50000} max={5000000} step={50000} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} style={{ padding: 0, background: "transparent", border: "none", accentColor: DS.colors.accent }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DS.colors.textMuted, marginTop: 4 }}><span>₹50K</span><span>₹50L</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>TENURE: <span style={{ color: DS.colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{form.tenure} months</span></label>
              <input type="range" min={6} max={84} step={6} value={form.tenure} onChange={e => setForm(f => ({ ...f, tenure: +e.target.value }))} style={{ padding: 0, background: "transparent", border: "none", accentColor: DS.colors.accent }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DS.colors.textMuted, marginTop: 4 }}><span>6 months</span><span>84 months</span></div>
            </div>
            {/* EMI preview */}
            <div style={{ marginTop: 20, padding: 16, background: DS.colors.accentGlow, border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ fontSize: 12, color: DS.colors.textMuted }}>Estimated EMI</div><div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: DS.colors.accent }}>{fmtRs(emi)}<span style={{ fontSize: 13, color: DS.colors.textSub }}>/month</span></div></div>
                <div><div style={{ fontSize: 12, color: DS.colors.textMuted }}>Interest Rate</div><div style={{ fontSize: 18, fontWeight: 700, color: DS.colors.text }}>14% p.a.</div></div>
                <div><div style={{ fontSize: 12, color: DS.colors.textMuted }}>Total Payable</div><div style={{ fontSize: 18, fontWeight: 700, color: DS.colors.text }}>{fmtRs(emi * form.tenure)}</div></div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Income & Employment</h3>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>ANNUAL INCOME (₹)</label>
                <input type="number" placeholder="1200000" value={form.income} onChange={e => setForm(f => ({ ...f, income: +e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>EMPLOYMENT TYPE</label>
                <select><option>Salaried</option><option>Self-Employed</option><option>Business Owner</option></select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>EMPLOYER NAME</label>
                <input placeholder="Infosys Ltd." value={form.employer} onChange={e => setForm(f => ({ ...f, employer: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>YEARS OF EMPLOYMENT</label>
                <input type="number" placeholder="3" />
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "14px 16px", background: DS.colors.surfaceAlt, borderRadius: 10, fontSize: 13, color: DS.colors.textSub, lineHeight: 1.7 }}>
              <strong style={{ color: DS.colors.text }}>Income Validation:</strong> We use RBI-approved bureau integration (CIBIL + Experian) to verify income. No manual verification needed for amounts under ₹10L.
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Bank Account Details</h3>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>ACCOUNT NUMBER</label>
                <input placeholder="XXXXXXXX1234" className="mono" value={form.bankAcc} onChange={e => setForm(f => ({ ...f, bankAcc: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>IFSC CODE</label>
                <input placeholder="HDFC0001234" className="mono" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>BANK NAME</label>
                <select><option>HDFC Bank</option><option>SBI</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra</option></select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>DISBURSEMENT MODE</label>
                <select><option>IMPS (Instant)</option><option>NEFT</option><option>UPI</option></select>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "14px 16px", background: DS.colors.greenGlow, border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 10, display: "flex", gap: 10, alignItems: "center" }}>
              <span>🏦</span>
              <div style={{ fontSize: 13, color: DS.colors.green }}>Account verified via Penny Drop. ₹1 test transaction sent and confirmed automatically.</div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Review & Submit</h3>
            {[["Loan Type", form.loanType], ["Amount", fmtRs(form.amount)], ["Tenure", `${form.tenure} months`], ["Monthly EMI", fmtRs(emi)], ["Annual Income", fmtRs(form.income)], ["Interest Rate", "14% p.a."]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${DS.colors.border}` }}>
                <span style={{ fontSize: 14, color: DS.colors.textSub }}>{l}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: "14px 16px", background: DS.colors.surfaceAlt, borderRadius: 10, fontSize: 13, color: DS.colors.textSub, lineHeight: 1.8 }}>
              ☑ I confirm all information provided is accurate<br />
              ☑ I consent to credit bureau check (CIBIL/Experian)<br />
              ☑ I agree to RBI's Fair Practices Code & KFS disclosure<br />
              ☑ I authorize auto-debit for EMI payments (NACH mandate)
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "space-between" }}>
          {step > 1 && <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
          <button className="btn-primary" style={{ marginLeft: "auto" }}
            onClick={() => step < 4 ? setStep(s => s + 1) : setSubmitted(true)}>
            {step < 4 ? "Continue →" : "🚀 Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EMITracker() {
  const [selected, setSelected] = useState(null);
  const totalPaid = MOCK_EMI_SCHEDULE.filter(e => e.status === "paid").reduce((a, e) => a + e.principal + e.interest, 0);
  const totalRemaining = MOCK_EMI_SCHEDULE.filter(e => e.status !== "paid").reduce((a, e) => a + e.principal + e.interest, 0);

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>EMI Tracker</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Personal Loan · LN-2024-001 · ₹5,00,000 @ 14% p.a.</p>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <MetricCard label="Amount Paid" value={fmtRs(totalPaid)} sub="4 EMIs cleared" accent={DS.colors.green} icon={Icons.Check} />
        <MetricCard label="Remaining" value={fmtRs(totalRemaining)} sub="44 EMIs left" accent={DS.colors.accent} icon={Icons.CreditCard} />
        <MetricCard label="Next Due" value="Feb 5" sub={fmtRs(11200) + " · HDFC Auto-debit"} accent={DS.colors.gold} icon={Icons.Bell} />
      </div>

      {/* EMI schedule */}
      <div className="card fade-up-2">
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>EMI Schedule — 2024</div>
        <div className="table-header" style={{ gridTemplateColumns: "60px 1fr 1fr 1fr 100px" }}>
          <span>#</span><span>Month</span><span>Principal</span><span>Interest</span><span>Status</span>
        </div>
        {MOCK_EMI_SCHEDULE.map((e, i) => (
          <div key={i} className="table-row" style={{ gridTemplateColumns: "60px 1fr 1fr 1fr 100px" }} onClick={() => setSelected(selected === i ? null : i)}>
            <span className="mono" style={{ fontSize: 13, color: DS.colors.textMuted }}>{String(e.month).padStart(2, "0")}</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{e.label} 2024</span>
            <span className="mono" style={{ fontSize: 13 }}>{fmtRs(e.principal)}</span>
            <span className="mono" style={{ fontSize: 13, color: DS.colors.textMuted }}>{fmtRs(e.interest)}</span>
            <StatusTag status={e.status} />
          </div>
        ))}
      </div>

      {/* Breakdown viz */}
      <div className="card fade-up-3" style={{ marginTop: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Principal vs Interest Breakdown</div>
        <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: DS.colors.accent }} /><span style={{ fontSize: 12, color: DS.colors.textSub }}>Principal</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: DS.colors.gold }} /><span style={{ fontSize: 12, color: DS.colors.textSub }}>Interest</span></div>
          </div>
        </div>
        {MOCK_EMI_SCHEDULE.slice(0, 6).map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: DS.colors.textMuted, marginBottom: 4 }}>
              <span>{e.label}</span><span>{fmtRs(e.principal + e.interest)}</span>
            </div>
            <div className="emi-bar">
              <div style={{ width: `${(e.principal / (e.principal + e.interest)) * 100}%`, background: DS.colors.accent, borderRadius: "4px 0 0 4px" }} />
              <div style={{ flex: 1, background: DS.colors.gold, borderRadius: "0 4px 4px 0" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EligibilityCheck() {
  const [income, setIncome] = useState(1200000);
  const [score, setScore] = useState(742);
  const [existing, setExisting] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = () => {
    setLoading(true);
    setTimeout(() => {
      const foir = (existing / (income / 12)) * 100;
      const maxEmi = (income / 12) * 0.5 - existing;
      const r = 0.14 / 12;
      const n = 60;
      const eligible = Math.round((maxEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)));
      setResult({ eligible: Math.min(eligible, score > 750 ? 1500000 : score > 700 ? 1000000 : 600000), foir: Math.round(foir), maxEmi: Math.round(maxEmi), scoreGrade: score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Poor" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>Eligibility Check</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Instant pre-qualification using rule-based underwriting engine</p>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card fade-up-1">
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Your Details</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>ANNUAL INCOME: <span style={{ color: DS.colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{fmtRs(income)}</span></label>
            <input type="range" min={200000} max={5000000} step={100000} value={income} onChange={e => setIncome(+e.target.value)} style={{ padding: 0, background: "transparent", border: "none", accentColor: DS.colors.accent }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>CREDIT SCORE (CIBIL): <span style={{ color: score >= 700 ? DS.colors.green : DS.colors.yellow, fontFamily: "'JetBrains Mono', monospace" }}>{score}</span></label>
            <input type="range" min={300} max={900} step={1} value={score} onChange={e => setScore(+e.target.value)} style={{ padding: 0, background: "transparent", border: "none", accentColor: DS.colors.accent }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: DS.colors.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>EXISTING EMI OBLIGATIONS: <span style={{ color: DS.colors.accent, fontFamily: "'JetBrains Mono', monospace" }}>{fmtRs(existing)}/mo</span></label>
            <input type="range" min={0} max={50000} step={1000} value={existing} onChange={e => setExisting(+e.target.value)} style={{ padding: 0, background: "transparent", border: "none", accentColor: DS.colors.accent }} />
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: 14 }} onClick={check} disabled={loading}>
            {loading ? <><span className="spinner" /> &nbsp;Analyzing...</> : "🔍 Check Eligibility"}
          </button>
        </div>

        <div>
          {result && (
            <div className="fade-up">
              <div className="card" style={{ marginBottom: 16, border: `1px solid ${DS.colors.green}`, background: DS.colors.greenGlow }}>
                <div style={{ fontSize: 13, color: DS.colors.green, marginBottom: 8, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>✅ PRE-QUALIFIED</div>
                <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: DS.colors.text, letterSpacing: -1 }}>{fmtRs(result.eligible)}</div>
                <div style={{ fontSize: 14, color: DS.colors.textSub, marginTop: 4 }}>Maximum loan eligibility · 5 year tenure</div>
              </div>
              <div className="card">
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16 }}>Underwriting Summary</div>
                {[["Credit Score", `${score} — ${result.scoreGrade}`, score >= 700 ? DS.colors.green : DS.colors.yellow],
                  ["FOIR (Fixed Obligations Ratio)", `${result.foir}% — ${result.foir < 50 ? "Within limit" : "High"}`, result.foir < 50 ? DS.colors.green : DS.colors.red],
                  ["Max EMI Capacity", fmtRs(result.maxEmi) + "/mo", DS.colors.accent],
                  ["Debt-to-Income Ratio", `${Math.round((existing / (income / 12)) * 100)}%`, DS.colors.textSub]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${DS.colors.border}` }}>
                    <span style={{ fontSize: 13, color: DS.colors.textSub }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credit score explanation */}
          <div className="card fade-up-2" style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>CIBIL Score Guide</div>
            {[["750–900", "Excellent", DS.colors.green, "Best rates, high eligibility"],
              ["700–749", "Good", DS.colors.accent, "Standard rates available"],
              ["650–699", "Fair", DS.colors.yellow, "Higher interest rates"],
              ["300–649", "Poor", DS.colors.red, "Loan likely rejected"]].map(([range, grade, color, desc]) => (
              <div key={range} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${DS.colors.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span className="mono" style={{ fontSize: 13, color: DS.colors.textSub, minWidth: 70 }}>{range}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 70 }}>{grade}</span>
                <span style={{ fontSize: 12, color: DS.colors.textMuted }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [screen, setScreen] = useState("overview");
  const [selectedLoan, setSelectedLoan] = useState(null);

  const nav = [
    { id: "overview", label: "Overview", icon: Icons.Home },
    { id: "applications", label: "Applications", icon: Icons.List },
    { id: "risk", label: "Risk Monitor", icon: Icons.Alert },
    { id: "fraud", label: "Fraud Alerts", icon: Icons.Shield },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: DS.colors.bg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: DS.colors.surface, borderRight: `1px solid ${DS.colors.border}`, padding: "24px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${DS.colors.gold}, #d97706)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡️</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>Admin Portal</span>
        </div>
        <div style={{ fontSize: 11, color: DS.colors.textMuted, marginBottom: 28, paddingLeft: 42 }}>FinFlow India · Risk Team</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map(n => (
            <div key={n.id} className={`nav-item ${screen === n.id ? "active" : ""}`} onClick={() => setScreen(n.id)}>
              <n.icon />{n.label}
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 16, borderTop: `1px solid ${DS.colors.border}` }}>
          <div className="nav-item" onClick={onLogout} style={{ color: DS.colors.red }}><Icons.Logout />Logout</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: "32px 28px", maxWidth: 1100 }}>
        {screen === "overview" && <AdminOverview setScreen={setScreen} />}
        {screen === "applications" && <AdminApplications setSelectedLoan={setSelectedLoan} selectedLoan={selectedLoan} />}
        {screen === "risk" && <RiskMonitor />}
        {screen === "fraud" && <FraudAlerts />}
      </div>
    </div>
  );
}

function AdminOverview({ setScreen }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title fade-up">Admin Dashboard</h1>
        <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginTop: 4 }}>Real-time loan portfolio overview · Last updated 2 min ago</p>
      </div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard label="Total Applications" value="1,284" sub="↑ 12% this week" accent={DS.colors.accent} icon={Icons.Document} />
        <MetricCard label="Pending Review" value="47" sub="Avg. 3.2hr resolution" accent={DS.colors.yellow} icon={Icons.Bell} />
        <MetricCard label="Disbursed Today" value="₹2.4Cr" sub="18 loans · IMPS/NEFT" accent={DS.colors.green} icon={Icons.Rupee} />
        <MetricCard label="Default Rate" value="1.8%" sub="↓ 0.3% vs last month" accent={DS.colors.red} icon={Icons.Alert} />
      </div>

      {/* Approval funnel */}
      <div className="card fade-up-2" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Approval Funnel · January 2024</div>
        {[["Applications Received", 1284, 100, DS.colors.accent],
          ["KYC Verified", 1142, 89, DS.colors.accent],
          ["Credit Score Passed", 987, 77, DS.colors.green],
          ["Income Validated", 843, 66, DS.colors.green],
          ["Approved & Disbursed", 721, 56, DS.colors.gold]].map(([label, count, pct, color]) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: DS.colors.textSub }}>{label}</span>
              <span className="mono" style={{ color: DS.colors.textSub }}>{fmt(count)} <span style={{ color }}>{pct}%</span></span>
            </div>
            <div className="progress-bar">
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card fade-up-3">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Recent Applications</div>
          <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setScreen("applications")}>View All</button>
        </div>
        <div className="table-header" style={{ gridTemplateColumns: "110px 1fr 100px 80px 100px" }}>
          <span>LOAN ID</span><span>APPLICANT</span><span>AMOUNT</span><span>SCORE</span><span>STATUS</span>
        </div>
        {MOCK_LOANS.slice(0, 4).map(l => (
          <div key={l.id} className="table-row" style={{ gridTemplateColumns: "110px 1fr 100px 80px 100px" }}>
            <span className="mono" style={{ fontSize: 12, color: DS.colors.textMuted }}>{l.id}</span>
            <div><div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div><div style={{ fontSize: 12, color: DS.colors.textMuted }}>{l.city} · {l.type}</div></div>
            <span className="mono" style={{ fontSize: 13 }}>{fmtRs(l.amount)}</span>
            <span className="mono" style={{ fontSize: 13, color: l.score >= 700 ? DS.colors.green : DS.colors.yellow }}>{l.score}</span>
            <StatusTag status={l.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminApplications({ setSelectedLoan, selectedLoan }) {
  const [filter, setFilter] = useState("all");
  const [loans, setLoans] = useState(MOCK_LOANS);

  const filtered = filter === "all" ? loans : loans.filter(l => l.status === filter);

  const approve = (id) => setLoans(ls => ls.map(l => l.id === id ? { ...l, status: "approved" } : l));
  const reject = (id) => setLoans(ls => ls.map(l => l.id === id ? { ...l, status: "rejected" } : l));

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>Loan Applications</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 24 }}>Review, approve, or reject loan applications</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "pending", "approved", "rejected", "disbursed"].map(f => (
          <button key={f} className={filter === f ? "btn-primary" : "btn-secondary"} style={{ padding: "8px 16px", fontSize: 13, textTransform: "capitalize" }} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && <span style={{ marginLeft: 6, background: DS.colors.yellow, color: "#000", borderRadius: 20, padding: "1px 7px", fontSize: 11 }}>{loans.filter(l => l.status === "pending").length}</span>}
          </button>
        ))}
      </div>

      <div className="card fade-up-2">
        <div className="table-header" style={{ gridTemplateColumns: "110px 1fr 100px 70px 90px 1fr" }}>
          <span>LOAN ID</span><span>APPLICANT</span><span>AMOUNT</span><span>SCORE</span><span>RISK</span><span>STATUS / ACTION</span>
        </div>
        {filtered.map(l => (
          <div key={l.id} className="table-row" style={{ gridTemplateColumns: "110px 1fr 100px 70px 90px 1fr" }}>
            <span className="mono" style={{ fontSize: 12, color: DS.colors.textMuted }}>{l.id}</span>
            <div><div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div><div style={{ fontSize: 12, color: DS.colors.textMuted }}>{l.city} · {l.type}</div></div>
            <span className="mono" style={{ fontSize: 13 }}>{fmtRs(l.amount)}</span>
            <span className="mono" style={{ fontSize: 13, color: l.score >= 700 ? DS.colors.green : l.score >= 650 ? DS.colors.yellow : DS.colors.red }}>{l.score}</span>
            <span className={`tag tag-${l.risk === "low" ? "green" : l.risk === "medium" ? "yellow" : "red"}`} style={{ textTransform: "uppercase" }}>{l.risk}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {l.status === "pending" ? (
                <>
                  <button className="btn-success" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => approve(l.id)}>✓ Approve</button>
                  <button className="btn-danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => reject(l.id)}>✗ Reject</button>
                </>
              ) : <StatusTag status={l.status} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskMonitor() {
  const portfolioData = [
    { label: "Low Risk (750+)", pct: 56, color: DS.colors.green },
    { label: "Medium Risk (650-750)", pct: 31, color: DS.colors.yellow },
    { label: "High Risk (<650)", pct: 13, color: DS.colors.red },
  ];

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>Risk Monitoring</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>Real-time risk analytics — rule-based underwriting engine</p>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard label="NPA Rate" value="1.8%" sub="< 2% target ✓" accent={DS.colors.green} />
        <MetricCard label="Avg Credit Score" value="728" sub="Portfolio avg" accent={DS.colors.accent} />
        <MetricCard label="FOIR Breach" value="3 cases" sub="Auto-flagged today" accent={DS.colors.yellow} />
        <MetricCard label="Bureau Alerts" value="7" sub="CIBIL + Experian" accent={DS.colors.red} />
      </div>

      {/* Portfolio risk distribution */}
      <div className="card fade-up-2" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Portfolio Risk Distribution</div>
        <div className="risk-meter" style={{ marginBottom: 16 }}>
          {portfolioData.map(d => (
            <div key={d.label} style={{ flex: d.pct, background: d.color, transition: "flex 0.5s ease" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {portfolioData.map(d => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
              <div><div style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.pct}%</div><div style={{ fontSize: 11, color: DS.colors.textMuted }}>{d.label}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Underwriting rules */}
      <div className="card fade-up-3">
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Underwriting Rules Engine</div>
        {[
          { rule: "CIBIL Score ≥ 650", status: "active", desc: "Hard reject below 650" },
          { rule: "FOIR ≤ 50%", status: "active", desc: "Fixed Obligation to Income Ratio" },
          { rule: "Min. Income ₹2,40,000/yr", status: "active", desc: "Salaried employees" },
          { rule: "Loan-to-Income ≤ 5x", status: "active", desc: "Maximum loan exposure" },
          { rule: "No active NPA/write-off", status: "active", desc: "Bureau check required" },
          { rule: "Age 21–65 years", status: "active", desc: "Eligibility criteria" },
          { rule: "Min. 12mo employment history", status: "active", desc: "For salaried applicants" },
          { rule: "AI Fraud Score < 0.7", status: "beta", desc: "ML-based fraud detection" },
        ].map(r => (
          <div key={r.rule} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${DS.colors.border}` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.rule}</div>
              <div style={{ fontSize: 12, color: DS.colors.textMuted, marginTop: 2 }}>{r.desc}</div>
            </div>
            <span className={`tag ${r.status === "active" ? "tag-green" : "tag-blue"}`}>{r.status === "active" ? "ACTIVE" : "BETA"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FraudAlerts() {
  const alerts = [
    { id: "FA-001", user: "Ravi M.", type: "Multiple applications", severity: "high", desc: "5 applications from same device in 24hrs", time: "2 hrs ago" },
    { id: "FA-002", user: "Ankit S.", type: "Document mismatch", severity: "high", desc: "PAN photo differs from selfie — face mismatch", time: "4 hrs ago" },
    { id: "FA-003", user: "Sunita P.", type: "Income inflation", severity: "medium", desc: "Declared income 3x higher than bureau data", time: "6 hrs ago" },
    { id: "FA-004", user: "Dev K.", type: "Velocity check", severity: "medium", desc: "3 loan apps across different lenders this week", time: "1 day ago" },
    { id: "FA-005", user: "Nisha T.", type: "Location anomaly", severity: "low", desc: "Application from IP in different state than KYC", time: "2 days ago" },
  ];

  return (
    <div>
      <h1 className="section-title fade-up" style={{ marginBottom: 6 }}>Fraud Alerts</h1>
      <p className="fade-up-1" style={{ color: DS.colors.textSub, fontSize: 14, marginBottom: 28 }}>AI-powered fraud detection engine — real-time monitoring</p>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <MetricCard label="Active Alerts" value="5" sub="2 high severity" accent={DS.colors.red} icon={Icons.Alert} />
        <MetricCard label="Fraud Rate" value="0.4%" sub="↓ from 0.6% last month" accent={DS.colors.yellow} icon={Icons.Shield} />
        <MetricCard label="Blocked Today" value="₹12.3L" sub="Prevented losses" accent={DS.colors.green} icon={Icons.Check} />
      </div>

      <div className="card fade-up-2">
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Active Fraud Alerts</div>
        {alerts.map(a => (
          <div key={a.id} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: `1px solid ${DS.colors.border}`, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: a.severity === "high" ? DS.colors.redGlow : a.severity === "medium" ? "rgba(251,191,36,0.1)" : DS.colors.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: a.severity === "high" ? DS.colors.red : a.severity === "medium" ? DS.colors.yellow : DS.colors.accent }}>
              <Icons.Alert />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>{a.user}</span>
                  <span className={`tag tag-${a.severity === "high" ? "red" : a.severity === "medium" ? "yellow" : "blue"}`}>{a.severity.toUpperCase()}</span>
                </div>
                <span style={{ fontSize: 12, color: DS.colors.textMuted }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DS.colors.textSub, marginBottom: 2 }}>{a.type}</div>
              <div style={{ fontSize: 13, color: DS.colors.textMuted }}>{a.desc}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn-secondary" style={{ padding: "6px 10px", fontSize: 12 }}>Review</button>
              <button className="btn-danger" style={{ padding: "6px 10px", fontSize: 12 }}>Block</button>
            </div>
          </div>
        ))}
      </div>

      {/* AI model info */}
      <div className="card fade-up-3" style={{ marginTop: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🤖 AI Fraud Detection Model</div>
        <div className="grid-2">
          {[["Model", "XGBoost + Rule Engine"], ["Accuracy", "94.7%"], ["False Positive Rate", "1.2%"], ["Features Used", "87 signals"], ["Data Sources", "CIBIL, Experian, Device, Geo"], ["Last Retrained", "Jan 15, 2024"]].map(([l, v]) => (
            <div key={l} style={{ padding: "10px 0", borderBottom: `1px solid ${DS.colors.border}` }}>
              <div style={{ fontSize: 11, color: DS.colors.textMuted, fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ARCHITECTURE SCREEN ─────────────────────────────────────────────────────
function ArchitectureModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 1000, overflow: "auto", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: DS.colors.surface, border: `1px solid ${DS.colors.border}`, borderRadius: 20, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22 }}>System Architecture</h2>
          <button className="btn-secondary" style={{ padding: "8px 14px" }} onClick={onClose}>✕ Close</button>
        </div>

        {/* Architecture diagram */}
        <div style={{ background: DS.colors.bg, borderRadius: 14, padding: 24, marginBottom: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2.2, color: DS.colors.textSub, overflowX: "auto" }}>
          <pre style={{ color: DS.colors.textSub }}>{`
  ┌─────────────────────────────────────────────────────────────────┐
  │                    CLIENT LAYER                                  │
  │   React Web App          Flutter Mobile App                     │
  └──────────────────────────┬──────────────────────────────────────┘
                             │ HTTPS/TLS 1.3
  ┌──────────────────────────▼──────────────────────────────────────┐
  │              AWS API GATEWAY (Kong / AWS API GW)                 │
  │        Rate Limiting · JWT Auth · SSL Termination · WAF         │
  └──┬──────────┬───────────┬────────────┬─────────────┬───────────┘
     │          │           │            │             │
  ┌──▼──┐   ┌──▼──┐    ┌───▼──┐   ┌────▼───┐   ┌────▼────┐
  │AUTH │   │USER │    │ LOAN │   │  RISK  │   │PAYMENT  │
  │SVC  │   │SVC  │    │  SVC │   │ENGINE  │   │  SVC    │
  │8001 │   │8002 │    │ 8003 │   │  8004  │   │  8005   │
  └──┬──┘   └──┬──┘    └───┬──┘   └────┬───┘   └────┬────┘
     │          │           │            │             │
  ┌──▼──────────▼───────────▼────────────▼─────────────▼───────────┐
  │                    MESSAGE BROKER (AWS SQS / Kafka)              │
  └──┬──────────────────────────────────────────────────────────────┘
     │
  ┌──▼──────────────────────────────────────────────────────────────┐
  │  PostgreSQL (RDS)  │  Redis Cache  │  S3 (KYC Docs)  │ CloudWatch│
  └─────────────────────────────────────────────────────────────────┘
          `}</pre>
        </div>

        {/* Tech stack */}
        <div className="grid-3">
          {[
            { title: "🔐 Auth Service", items: ["Node.js + Express", "JWT + Refresh tokens", "OTP via MSG91/Twilio", "Redis session store", "bcrypt password hash"] },
            { title: "🏦 Loan Engine", items: ["Python FastAPI", "EMI calculation (reducing)", "Rule-based underwriting", "CIBIL/Experian API", "Loan lifecycle FSM"] },
            { title: "💸 Payment Service", items: ["Node.js", "Razorpay/RazorpayX API", "IMPS/NEFT/UPI", "NACH e-mandate", "Webhook handler"] },
            { title: "🛡️ Risk Engine", items: ["Python ML service", "XGBoost fraud model", "Rule engine (Drools)", "Bureau integration", "Real-time scoring"] },
            { title: "📄 KYC Service", items: ["Python + OpenCV", "AWS Rekognition", "Digio/Karza API", "OCR (PAN/Aadhaar)", "Face liveness check"] },
            { title: "☁️ Infrastructure", items: ["AWS EKS (Kubernetes)", "RDS PostgreSQL", "ElastiCache Redis", "S3 + KMS encryption", "CloudWatch + Grafana"] },
          ].map(({ title, items }) => (
            <div key={title} style={{ background: DS.colors.surfaceAlt, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{title}</div>
              {items.map(item => <div key={item} style={{ fontSize: 12, color: DS.colors.textSub, padding: "3px 0", display: "flex", gap: 6 }}><span style={{ color: DS.colors.accent }}>›</span>{item}</div>)}
            </div>
          ))}
        </div>

        {/* RBI Compliance */}
        <div style={{ marginTop: 20, padding: 20, background: DS.colors.goldGlow, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: DS.colors.gold, marginBottom: 12 }}>🏛️ RBI Compliance Checklist</div>
          <div className="grid-2">
            {["Fair Practices Code adherence", "KFS (Key Fact Statement) disclosure", "Annual Percentage Rate (APR) display", "Digital Lending Guidelines 2022", "Data localization (India servers)", "User consent logging", "Grievance redressal portal", "CERSAI lien recording", "NACH mandate registration", "Digital personal data protection"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: DS.colors.textSub, padding: "4px 0" }}>
                <span style={{ color: DS.colors.green }}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null); // null | "user" | "admin"
  const [showArch, setShowArch] = useState(false);

  if (!auth) return (
    <>
      <GlobalStyle />
      <LoginScreen onLogin={setAuth} />
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
        <button className="btn-secondary" style={{ fontSize: 12, padding: "8px 14px" }} onClick={() => setShowArch(true)}>
          🏗️ View Architecture
        </button>
      </div>
      {showArch && <ArchitectureModal onClose={() => setShowArch(false)} />}
    </>
  );

  return (
    <>
      <GlobalStyle />
      {auth === "user" && <UserDashboard onLogout={() => setAuth(null)} />}
      {auth === "admin" && <AdminDashboard onLogout={() => setAuth(null)} />}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
        <button className="btn-secondary" style={{ fontSize: 12, padding: "8px 14px" }} onClick={() => setShowArch(true)}>
          🏗️ Architecture
        </button>
      </div>
      {showArch && <ArchitectureModal onClose={() => setShowArch(false)} />}
    </>
  );
}
