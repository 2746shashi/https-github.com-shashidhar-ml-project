import { useState, useEffect, useRef } from "react";
import { api, pickFile } from "./api";

// ============================================================
// DESIGN SYSTEM & GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0a0e1a;
      --ink-soft: #1c2136;
      --ink-muted: #2e3550;
      --surface: #f4f6ff;
      --surface-2: #eaedfa;
      --surface-3: #dde2f5;
      --white: #ffffff;
      --primary: #2563ff;
      --primary-dark: #1a45cc;
      --primary-light: #5b8aff;
      --primary-ghost: rgba(37,99,255,0.08);
      --primary-glow: rgba(37,99,255,0.25);
      --accent: #00d4aa;
      --accent-dark: #00a886;
      --accent-ghost: rgba(0,212,170,0.1);
      --warning: #f59e0b;
      --warning-ghost: rgba(245,158,11,0.1);
      --danger: #ef4444;
      --danger-ghost: rgba(239,68,68,0.1);
      --success: #10b981;
      --success-ghost: rgba(16,185,129,0.1);
      --gold: #f0b429;
      --border: rgba(37,99,255,0.12);
      --border-soft: rgba(0,0,0,0.06);
      --shadow-sm: 0 1px 3px rgba(10,14,26,0.08), 0 1px 2px rgba(10,14,26,0.04);
      --shadow-md: 0 4px 16px rgba(10,14,26,0.10), 0 2px 6px rgba(10,14,26,0.06);
      --shadow-lg: 0 12px 40px rgba(10,14,26,0.14), 0 4px 12px rgba(10,14,26,0.08);
      --shadow-primary: 0 8px 24px rgba(37,99,255,0.30);
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 22px;
      --radius-xl: 32px;
      --font-display: 'Instrument Serif', Georgia, serif;
      --font-ui: 'Sora', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
      --transition-bounce: 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-ui);
      background: var(--surface);
      color: var(--ink);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--surface-2); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes countUp {
      from { transform: translateY(10px); opacity:0; }
      to   { transform: translateY(0); opacity:1; }
    }
    @keyframes drawLine {
      from { stroke-dashoffset: 1000; }
      to   { stroke-dashoffset: 0; }
    }

    .animate-fadeUp   { animation: fadeUp 0.5s ease both; }
    .animate-fadeIn   { animation: fadeIn 0.4s ease both; }
    .animate-slideRight { animation: slideRight 0.4s ease both; }

    /* Layout helpers */
    .flex  { display: flex; }
    .grid  { display: grid; }
    .hidden { display: none !important; }

    /* Button base */
    button { cursor: pointer; border: none; outline: none; font-family: var(--font-ui); }
    input, select, textarea { font-family: var(--font-ui); outline: none; }

    /* Skeleton shimmer */
    .skeleton {
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }

    /* Glassmorphism card */
    .glass {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.7);
    }

    /* Progress bar animation */
    @keyframes progressFill {
      from { width: 0%; }
      to   { width: var(--target-width, 100%); }
    }

    /* Chart line animation */
    .chart-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 1.5s ease forwards;
    }
  `}</style>
);

// ============================================================
// MOCK DATA & CONSTANTS
// ============================================================
// API loans -> shape used by this UI
const adaptLoan = (l) => ({ ...l, applicant: l.name, risk: l.risk ? l.risk[0].toUpperCase() + l.risk.slice(1) : "Medium" });

const RISK_METRICS = [
  { label:"NPA Ratio", value:"2.3%", delta:"-0.4%", trend:"down", good:true },
  { label:"Avg Credit Score", value:"712", delta:"+18", trend:"up", good:true },
  { label:"Fraud Alerts", value:"7", delta:"+2", trend:"up", good:false },
  { label:"Approval Rate", value:"68%", delta:"+5%", trend:"up", good:true },
];

const CHART_DATA = [42,58,65,71,68,79,85,91,88,95,102,110].map((v,i)=>({
  month:["J","F","M","A","M","J","J","A","S","O","N","D"][i], value:v
}));

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatINR(n){
  if(n>=10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if(n>=100000) return `₹${(n/100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function calcEMI(P,r,n){
  const R = r/(12*100);
  return Math.round(P*R*Math.pow(1+R,n)/(Math.pow(1+R,n)-1));
}

function creditBand(score){
  if(score>=750) return {label:"Excellent",color:"var(--success)"};
  if(score>=700) return {label:"Good",color:"var(--accent)"};
  if(score>=650) return {label:"Fair",color:"var(--warning)"};
  return {label:"Poor",color:"var(--danger)"};
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================
function Badge({status}){
  const map = {
    approved:{bg:"var(--success-ghost)",color:"var(--success)",label:"Approved"},
    pending:  {bg:"var(--warning-ghost)",color:"var(--warning)",label:"Pending"},
    rejected: {bg:"var(--danger-ghost)",color:"var(--danger)",label:"Rejected"},
    processing:{bg:"var(--primary-ghost)",color:"var(--primary)",label:"Processing"},
    disbursed:{bg:"var(--primary-ghost)",color:"var(--primary)",label:"Disbursed"},
    paid:     {bg:"var(--success-ghost)",color:"var(--success)",label:"Paid"},
    upcoming: {bg:"var(--primary-ghost)",color:"var(--primary)",label:"Upcoming"},
    Low:      {bg:"var(--success-ghost)",color:"var(--success)",label:"Low"},
    Medium:   {bg:"var(--warning-ghost)",color:"var(--warning)",label:"Medium"},
    High:     {bg:"var(--danger-ghost)",color:"var(--danger)",label:"High"},
  };
  const s = map[status]||{bg:"var(--surface-3)",color:"var(--ink-muted)",label:status};
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      background:s.bg,color:s.color,
      padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,
      letterSpacing:"0.03em",textTransform:"capitalize"
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:s.color,flexShrink:0}}/>
      {s.label}
    </span>
  );
}

function StatCard({icon,label,value,delta,good,delay=0}){
  return (
    <div className="animate-fadeUp" style={{
      animationDelay:`${delay}ms`,
      background:["var(--white)"],
      border:"1px solid var(--border-soft)",
      borderRadius:var_r("--radius-lg"),
      padding:"20px 22px",
      boxShadow:"var(--shadow-sm)",
      display:"flex",flexDirection:"column",gap:8,
      position:"relative",overflow:"hidden",
      transition:"transform var(--transition), box-shadow var(--transition)",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="var(--shadow-md)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="var(--shadow-sm)";}}
    >
      <div style={{fontSize:22}}>{icon}</div>
      <div style={{fontSize:11,color:"var(--ink-muted)",fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em",fontFamily:"var(--font-display)"}}>{value}</div>
      {delta && <div style={{fontSize:11,fontWeight:600,color:good?"var(--success)":"var(--danger)"}}>
        {good?"↑":"↓"} {delta} vs last month
      </div>}
    </div>
  );
}

function var_r(v){ return `var(${v})`; }

function Btn({children,variant="primary",onClick,size="md",icon,loading,style={}}){
  const sizes = {sm:{padding:"7px 16px",fontSize:12},md:{padding:"10px 22px",fontSize:13},lg:{padding:"14px 30px",fontSize:14}};
  const variants = {
    primary:{background:"var(--primary)",color:"#fff",boxShadow:"var(--shadow-primary)"},
    secondary:{background:"var(--white)",color:"var(--primary)",border:"1.5px solid var(--border)",boxShadow:"var(--shadow-sm)"},
    ghost:{background:"var(--primary-ghost)",color:"var(--primary)"},
    danger:{background:"var(--danger)",color:"#fff"},
    success:{background:"var(--success)",color:"#fff"},
    accent:{background:"var(--accent)",color:"var(--ink)"},
  };
  return (
    <button onClick={onClick} style={{
      display:"inline-flex",alignItems:"center",gap:7,
      borderRadius:var_r("--radius-sm"),fontWeight:600,
      transition:"all var(--transition-bounce)",
      letterSpacing:"0.01em",
      ...sizes[size],...variants[variant],...style,
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.filter="brightness(1.05)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.filter="none";}}
    >
      {loading?<span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:icon}
      {children}
    </button>
  );
}

function Input({label,placeholder,type="text",value,onChange,prefix,hint,error}){
  const [focused,setFocused]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label && <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase"}}>{label}</label>}
      <div style={{
        display:"flex",alignItems:"center",
        background:"var(--white)",
        border:`1.5px solid ${error?"var(--danger)":focused?"var(--primary)":"var(--border-soft)"}`,
        borderRadius:"var(--radius-sm)",
        transition:"border-color var(--transition)",
        boxShadow: focused?"0 0 0 3px var(--primary-glow)":"none",
        overflow:"hidden",
      }}>
        {prefix && <span style={{padding:"0 12px",color:"var(--ink-muted)",fontSize:13,borderRight:"1px solid var(--border-soft)",background:"var(--surface)",height:"100%",display:"flex",alignItems:"center"}}>{prefix}</span>}
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e=>onChange(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{flex:1,padding:"10px 14px",border:"none",background:"transparent",fontSize:13,color:"var(--ink)",width:"100%"}}
        />
      </div>
      {hint && <span style={{fontSize:11,color:"var(--ink-muted)"}}>{hint}</span>}
      {error && <span style={{fontSize:11,color:"var(--danger)"}}>{error}</span>}
    </div>
  );
}

function Card({children,style={},className=""}){
  return (
    <div className={className} style={{
      background:"var(--white)",
      border:"1px solid var(--border-soft)",
      borderRadius:"var(--radius-lg)",
      boxShadow:"var(--shadow-sm)",
      ...style
    }}>{children}</div>
  );
}

function SectionHeader({title,sub,action}){
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <h2 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em",fontFamily:"var(--font-display)",lineHeight:1.2}}>{title}</h2>
        {sub && <p style={{fontSize:12,color:"var(--ink-muted)",marginTop:3}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ============================================================
// NAVIGATION
// ============================================================
function Sidebar({active,setActive,role,setRole}){
  const userItems=[
    {id:"onboard",icon:"👋",label:"Get Started"},
    {id:"kyc",icon:"🪪",label:"KYC Verification"},
    {id:"eligibility",icon:"📊",label:"Loan Eligibility"},
    {id:"apply",icon:"📝",label:"Apply for Loan"},
    {id:"emi",icon:"📅",label:"EMI Dashboard"},
    {id:"profile",icon:"👤",label:"My Profile"},
  ];
  const adminItems=[
    {id:"overview",icon:"🏠",label:"Overview"},
    {id:"applications",icon:"📋",label:"Applications"},
    {id:"risk",icon:"🛡️",label:"Risk Engine"},
    {id:"fraud",icon:"🚨",label:"Fraud Alerts"},
    {id:"docs",icon:"📄",label:"Architecture"},
  ];
  const items = role==="admin"?adminItems:userItems;
  return (
    <div style={{
      width:230,minHeight:"100vh",
      background:"var(--ink)",
      display:"flex",flexDirection:"column",
      position:"fixed",left:0,top:0,bottom:0,zIndex:100,
      fontFamily:"var(--font-ui)",
    }}>
      {/* Logo */}
      <div style={{padding:"24px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:36,height:36,borderRadius:10,
            background:"linear-gradient(135deg,var(--primary),var(--accent))",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,boxShadow:"0 4px 12px rgba(37,99,255,0.4)"
          }}>₹</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:14,letterSpacing:"-0.01em"}}>LoanSetu</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:500}}>RBI Compliant</div>
          </div>
        </div>
      </div>

      {/* Role Toggle */}
      <div style={{padding:"14px 14px 0"}}>
        <div style={{
          background:"rgba(255,255,255,0.06)",
          borderRadius:"var(--radius-sm)",
          padding:4,display:"flex",gap:0,
        }}>
          {["user","admin"].map(r=>(
            <button key={r} onClick={()=>setRole(r)} style={{
              flex:1,padding:"6px 0",borderRadius:6,fontSize:11,fontWeight:600,
              background:role===r?"var(--primary)":"transparent",
              color:role===r?"#fff":"rgba(255,255,255,0.4)",
              transition:"all var(--transition)",textTransform:"capitalize",
              letterSpacing:"0.03em",
            }}>{r==="user"?"👤 User":"⚙️ Admin"}</button>
          ))}
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{flex:1,padding:"10px 14px",display:"flex",flexDirection:"column",gap:3,marginTop:4}}>
        {items.map(it=>(
          <button key={it.id} onClick={()=>setActive(it.id)} style={{
            display:"flex",alignItems:"center",gap:11,
            padding:"9px 12px",borderRadius:var_r("--radius-sm"),
            background:active===it.id?"var(--primary)":"transparent",
            color:active===it.id?"#fff":"rgba(255,255,255,0.55)",
            fontSize:12.5,fontWeight:active===it.id?600:400,
            transition:"all var(--transition)",textAlign:"left",
            letterSpacing:"0.01em",
          }}
          onMouseEnter={e=>{ if(active!==it.id) e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ if(active!==it.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.55)";} }}
          >
            <span style={{fontSize:15,flexShrink:0}}>{it.icon}</span>
            {it.label}
            {active===it.id&&<span style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.7)"}}/>}
          </button>
        ))}
      </nav>

      {/* Compliance Badge */}
      <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{
          background:"rgba(0,212,170,0.1)",border:"1px solid rgba(0,212,170,0.2)",
          borderRadius:var_r("--radius-sm"),padding:"8px 12px",
        }}>
          <div style={{color:"var(--accent)",fontSize:10,fontWeight:600,letterSpacing:"0.05em"}}>🔒 RBI COMPLIANT</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:9,marginTop:2}}>AES-256 · TLS 1.3 · PCI-DSS</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USER ONBOARDING FLOW
// ============================================================
function OnboardingScreen({onVerified}){
  const [step,setStep]=useState(0);
  const [otp,setOtp]=useState(["","","","","",""]);
  const [debugOtp,setDebugOtp]=useState("");
  const [err,setErr]=useState("");
  const [phone,setPhone]=useState("");
  const [sentOtp,setSentOtp]=useState(false);
  const [verified,setVerified]=useState(false);
  const [timer,setTimer]=useState(0);
  const otpRefs=useRef([]);

  useEffect(()=>{
    if(timer>0){ const t=setTimeout(()=>setTimer(t=>t-1),1000); return()=>clearTimeout(t); }
  },[timer]);

  async function sendOtp(){
    if(phone.length!==10) return;
    setErr("");
    try{ const r=await api.sendOtp(phone); setDebugOtp(r.debug_otp||""); setSentOtp(true); setTimer(30); setStep(1); }
    catch(e){ setErr(e.message); }
  }
  function handleOtp(val,i){
    const n=[...otp]; n[i]=val.slice(-1); setOtp(n);
    if(val && i<5) otpRefs.current[i+1]?.focus();
    if(n.every(d=>d!=="")){ api.verifyOtp(phone,n.join("")).then(()=>{ setVerified(true); setErr(""); setTimeout(()=>setStep(2),600); }).catch(e=>{ setErr(e.message); setOtp(["","","","","",""]); otpRefs.current[0]?.focus(); }); }
  }

  const steps=[
    {icon:"📱",title:"Mobile Verification",sub:"We'll send an OTP to verify your identity"},
    {icon:"🔐",title:"Enter OTP",sub:"6-digit code sent to +91 "+phone},
    {icon:"🎉",title:"Verified!",sub:"Your account is ready"},
  ];

  return (
    <div className="animate-fadeUp" style={{maxWidth:480,margin:"0 auto",padding:"40px 20px"}}>
      {/* Progress Steps */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,marginBottom:40}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center"}}>
            <div style={{
              width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background:i<=step?"var(--primary)":"var(--surface-3)",
              color:i<=step?"#fff":"var(--ink-muted)",
              fontSize:12,fontWeight:700,transition:"all 0.3s ease",
              boxShadow:i===step?"var(--shadow-primary)":"none",
            }}>{i<step?"✓":i+1}</div>
            {i<2&&<div style={{width:60,height:2,background:i<step?"var(--primary)":"var(--surface-3)",transition:"background 0.3s ease"}}/>}
          </div>
        ))}
      </div>

      <Card style={{padding:32}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:12}}>{steps[step].icon}</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:24,marginBottom:6}}>{steps[step].title}</h2>
          <p style={{color:"var(--ink-muted)",fontSize:13}}>{steps[step].sub}</p>
        </div>

        {step===0 && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Input label="Mobile Number" placeholder="Enter 10-digit mobile" prefix="+91" value={phone} onChange={setPhone} hint="Registered with your bank account"/>
            {err&&<div style={{color:"var(--danger)",fontSize:12}}>{err}</div>}
            <Btn size="lg" onClick={sendOtp} style={{width:"100%",justifyContent:"center"}}>
              Send OTP 📲
            </Btn>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{flex:1,height:1,background:"var(--border-soft)"}}/>
              <span style={{fontSize:11,color:"var(--ink-muted)"}}>OR LOGIN WITH</span>
              <div style={{flex:1,height:1,background:"var(--border-soft)"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              {["🏦 Net Banking","📧 DigiLocker"].map(m=>(
                <button key={m} style={{flex:1,padding:"9px 10px",background:"var(--surface)",border:"1.5px solid var(--border-soft)",borderRadius:"var(--radius-sm)",fontSize:11,fontWeight:500,cursor:"pointer",transition:"all var(--transition)"}}>{m}</button>
              ))}
            </div>
          </div>
        )}

        {step===1 && (
          <div style={{display:"flex",flexDirection:"column",gap:20,alignItems:"center"}}>
            <div style={{display:"flex",gap:10}}>
              {otp.map((d,i)=>(
                <input key={i} ref={el=>otpRefs.current[i]=el}
                  value={d} onChange={e=>handleOtp(e.target.value,i)}
                  maxLength={1} type="tel"
                  style={{
                    width:52,height:56,textAlign:"center",fontSize:22,fontWeight:700,
                    border:`2px solid ${d?"var(--primary)":"var(--border-soft)"}`,
                    borderRadius:"var(--radius-sm)",background:"var(--white)",
                    color:"var(--ink)",fontFamily:"var(--font-mono)",
                    transition:"border-color 0.2s",
                    boxShadow:d?"0 0 0 3px var(--primary-glow)":"none",
                  }}
                />
              ))}
            </div>
            <div style={{fontSize:12,color:"var(--ink-muted)",textAlign:"center"}}>
              {timer>0?`Resend OTP in ${timer}s`:<button onClick={()=>{setTimer(30);api.sendOtp(phone).then(r=>setDebugOtp(r.debug_otp||"")).catch(e=>setErr(e.message));}} style={{background:"none",color:"var(--primary)",fontWeight:600,fontSize:12}}>Resend OTP</button>}
            </div>
            <div style={{
              background:"var(--warning-ghost)",border:"1px solid rgba(245,158,11,0.2)",
              borderRadius:"var(--radius-sm)",padding:"8px 14px",fontSize:11,color:"var(--warning)",width:"100%",textAlign:"center"
            }}>
              {err ? <span style={{color:"var(--danger)"}}>{err}</span> : <>💡 Dev OTP: <strong>{debugOtp||"sent by SMS"}</strong></>}
            </div>
          </div>
        )}

        {step===2 && (
          <div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:16,alignItems:"center"}}>
            <div style={{position:"relative",display:"inline-flex"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"var(--success-ghost)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>✅</div>
              <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:"2px solid var(--success)",animation:"pulse-ring 1.5s ease infinite"}}/>
            </div>
            <p style={{fontSize:13,color:"var(--ink-muted)"}}>Mobile number verified successfully.<br/>Your 24-hour KYC window is now active.</p>
            <Btn size="lg" onClick={()=>onVerified()} style={{width:"100%",justifyContent:"center"}}>
              Continue to KYC →
            </Btn>
          </div>
        )}
      </Card>

      {/* Security note */}
      <div style={{marginTop:20,textAlign:"center",fontSize:11,color:"var(--ink-muted)",display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
        🔒 256-bit SSL encrypted · RBI Compliant · Your data is safe
      </div>
    </div>
  );
}

// ============================================================
// KYC VERIFICATION
// ============================================================
function KYCScreen(){
  const [step,setStep]=useState(0);
  const [uploads,setUploads]=useState({pan:null,aadhaar:null,selfie:null});
  const [form,setForm]=useState({pan:"",aadhaar:"",dob:"",name:""});
  const [verifying,setVerifying]=useState(false);
  const [docStatus,setDocStatus]=useState({});

  useEffect(()=>{
    api.me().then(m=>{ const u={}; (m.kyc_docs||[]).forEach(k=>{u[k]=true;}); setUploads(p=>({...p,...u})); }).catch(()=>{});
  },[]);

  async function simulateUpload(key){
    const f=await pickFile();
    if(!f) return;
    setVerifying(true);
    try{
      await api.uploadKyc(key,f);
      setUploads(p=>({...p,[key]:true}));
      setDocStatus(p=>({...p,[key]:{status:"verified",score:Math.floor(92+Math.random()*8)}}));
    }catch(e){ alert(e.message); }
    setVerifying(false);
  }

  const docs=[
    {key:"pan",icon:"🪪",label:"PAN Card",desc:"Upload clear photo/scan of your PAN card",required:true},
    {key:"aadhaar",icon:"📋",label:"Aadhaar Card",desc:"Both front and back sides required",required:true},
    {key:"selfie",icon:"🤳",label:"Live Selfie",desc:"Face verification against Aadhaar photo",required:true},
  ];

  const allDone = docs.every(d=>uploads[d.key]);

  return (
    <div className="animate-fadeUp" style={{maxWidth:680,margin:"0 auto"}}>
      <SectionHeader title="KYC Verification" sub="Complete your Know Your Customer process as per RBI guidelines"/>

      {/* Step tabs */}
      <div style={{display:"flex",gap:6,marginBottom:24}}>
        {["Document Upload","PAN Details","Aadhaar Details","Face Verification"].map((t,i)=>(
          <button key={i} onClick={()=>setStep(i)} style={{
            padding:"7px 14px",borderRadius:99,fontSize:11,fontWeight:600,
            background:step===i?"var(--primary)":"var(--surface-2)",
            color:step===i?"#fff":"var(--ink-muted)",border:"none",
            transition:"all var(--transition)",cursor:"pointer",letterSpacing:"0.02em",
          }}>{t}</button>
        ))}
      </div>

      {step===0 && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {docs.map(doc=>(
            <Card key={doc.key} style={{padding:20,display:"flex",alignItems:"center",gap:20,
              border:uploads[doc.key]?"1.5px solid var(--success)":"1px solid var(--border-soft)",
              transition:"border-color 0.3s"
            }}>
              <div style={{
                width:52,height:52,borderRadius:12,
                background:uploads[doc.key]?"var(--success-ghost)":"var(--surface)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,
                border:`1px solid ${uploads[doc.key]?"var(--success)":"var(--border-soft)"}`,
              }}>{doc.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{doc.label} {doc.required&&<span style={{color:"var(--danger)"}}>*</span>}</div>
                <div style={{fontSize:11,color:"var(--ink-muted)"}}>{doc.desc}</div>
                {docStatus[doc.key] && (
                  <div style={{marginTop:6,display:"flex",gap:8,alignItems:"center"}}>
                    <Badge status="approved"/>
                    <span style={{fontSize:11,color:"var(--ink-muted)",fontFamily:"var(--font-mono)"}}>Confidence: {docStatus[doc.key].score}%</span>
                  </div>
                )}
              </div>
              <div>
                {uploads[doc.key] ? (
                  <div style={{color:"var(--success)",fontSize:22}}>✅</div>
                ) : (
                  <Btn variant={verifying?"ghost":"primary"} size="sm" loading={verifying} onClick={()=>simulateUpload(doc.key)}>
                    {verifying?"Processing...":"Upload"}
                  </Btn>
                )}
              </div>
            </Card>
          ))}
          {allDone && (
            <div className="animate-fadeUp" style={{
              background:"linear-gradient(135deg,var(--success-ghost),rgba(16,185,129,0.05))",
              border:"1.5px solid var(--success)",borderRadius:"var(--radius-md)",
              padding:"16px 20px",display:"flex",alignItems:"center",gap:12
            }}>
              <span style={{fontSize:24}}>✅</span>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"var(--success)"}}>All documents verified successfully</div>
                <div style={{fontSize:11,color:"var(--ink-muted)"}}>OCR extraction complete · Face match: 98.2% · Ready for credit check</div>
              </div>
              <Btn variant="success" size="sm" style={{marginLeft:"auto"}} onClick={()=>setStep(1)}>Continue →</Btn>
            </div>
          )}
        </div>
      )}

      {step===1 && (
        <Card style={{padding:28}}>
          <h3 style={{fontWeight:600,marginBottom:20,fontSize:15}}>🪪 PAN Card Details</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <Input label="PAN Number" placeholder="ABCDE1234F" value={form.pan} onChange={v=>setForm(p=>({...p,pan:v.toUpperCase()}))} hint="10-character alphanumeric"/>
            <Input label="Full Name (as on PAN)" placeholder="As printed on PAN card" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))}/>
            <Input label="Date of Birth" type="date" value={form.dob} onChange={v=>setForm(p=>({...p,dob:v}))}/>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase"}}>NSDL Verification</label>
              <div style={{
                background:"var(--success-ghost)",border:"1px solid var(--success)",
                borderRadius:"var(--radius-sm)",padding:"10px 14px",
                fontSize:12,color:"var(--success)",fontWeight:500,display:"flex",alignItems:"center",gap:8
              }}>✅ PAN linked with Aadhaar (UIDAI)</div>
            </div>
          </div>
          <div style={{marginTop:20,display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="secondary" onClick={()=>setStep(0)}>← Back</Btn>
            <Btn onClick={()=>setStep(2)}>Verify PAN →</Btn>
          </div>
        </Card>
      )}

      {step===2 && (
        <Card style={{padding:28}}>
          <h3 style={{fontWeight:600,marginBottom:20,fontSize:15}}>📋 Aadhaar Verification</h3>
          <div style={{
            background:"var(--warning-ghost)",border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:"var(--radius-sm)",padding:"10px 14px",marginBottom:20,
            fontSize:11,color:"var(--warning)",display:"flex",gap:8,alignItems:"center"
          }}>
            ⚠️ <strong>Privacy Notice:</strong> Only last 4 digits of Aadhaar stored as per UIDAI norms. Full number never retained.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <Input label="Aadhaar Number" placeholder="XXXX XXXX 1234" value={form.aadhaar} onChange={v=>setForm(p=>({...p,aadhaar:v}))} hint="12-digit Aadhaar number"/>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",display:"block",marginBottom:6}}>ADDRESS TYPE</label>
              <select style={{width:"100%",padding:"10px 14px",border:"1.5px solid var(--border-soft)",borderRadius:"var(--radius-sm)",fontSize:13,background:"var(--white)",color:"var(--ink)"}}>
                <option>Permanent Address</option>
                <option>Current Address</option>
              </select>
            </div>
          </div>
          <div style={{marginTop:20,padding:"14px",background:"var(--surface)",borderRadius:"var(--radius-sm)",border:"1px solid var(--border-soft)"}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",marginBottom:8,letterSpacing:"0.04em",textTransform:"uppercase"}}>CONSENT DECLARATION</div>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}>
              <input type="checkbox" defaultChecked style={{marginTop:2}}/>
              <span style={{fontSize:11,color:"var(--ink-muted)",lineHeight:1.6}}>
                I hereby provide explicit consent for Aadhaar-based KYC verification as per Section 57 of the Aadhaar Act 2016, PMLA 2002, and RBI Master Direction on KYC 2016. I confirm the documents provided are genuine.
              </span>
            </label>
          </div>
          <div style={{marginTop:16,display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="secondary" onClick={()=>setStep(1)}>← Back</Btn>
            <Btn onClick={()=>setStep(3)}>Verify Aadhaar →</Btn>
          </div>
        </Card>
      )}

      {step===3 && (
        <Card style={{padding:28,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🤳</div>
          <h3 style={{fontFamily:"var(--font-display)",fontSize:20,marginBottom:8}}>Face Verification</h3>
          <p style={{color:"var(--ink-muted)",fontSize:13,marginBottom:24}}>We'll match your live photo with your Aadhaar photo using AI liveness detection</p>
          <div style={{
            background:"var(--surface)",border:"2px dashed var(--border)",
            borderRadius:"var(--radius-lg)",padding:"40px 20px",marginBottom:20,
          }}>
            <div style={{fontSize:40,marginBottom:8}}>📷</div>
            <div style={{fontSize:13,color:"var(--ink-muted)"}}>Camera access required</div>
            <div style={{fontSize:11,color:"var(--ink-muted)",marginTop:4}}>Look directly at camera · Good lighting · Remove glasses</div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn icon="📷" onClick={()=>{}}>Open Camera</Btn>
            <Btn variant="ghost" icon="📁">Upload Photo</Btn>
          </div>
          <div style={{marginTop:20,
            background:"linear-gradient(135deg,rgba(37,99,255,0.06),rgba(0,212,170,0.06))",
            border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",padding:"12px 16px",
          }}>
            <div style={{fontSize:11,color:"var(--ink-muted)",display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
              {["✓ ISO 30107-3 Liveness","✓ UIDAI certified","✓ 99.2% accuracy","✓ No data stored"].map(f=>(
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// LOAN ELIGIBILITY
// ============================================================
function EligibilityScreen(){
  const [form,setForm]=useState({income:0,employment:"salaried",age:30,existing:0,tenure:24,amount:0});
  const [result,setResult]=useState(null);
  const [checking,setChecking]=useState(false);

  const [me,setMe]=useState(null);
  useEffect(()=>{ api.me().then(setMe).catch(()=>{}); },[]);

  async function checkEligibility(){
    setChecking(true);
    try{
      const score=me?.cibil_score||700;
      const r=await api.eligibility(Number(form.income)*12, score, Number(form.existing));
      setResult({score,foir:String(r.foir),maxEMI:r.max_emi,maxLoan:r.eligible_amount,eligible:r.pre_qualified,band:creditBand(score)});
    }catch(e){ alert(e.message); }
    setChecking(false);
  }

  return (
    <div className="animate-fadeUp" style={{maxWidth:720,margin:"0 auto"}}>
      <SectionHeader title="Loan Eligibility Check" sub="Real-time credit assessment powered by CIBIL + Experian APIs"/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card style={{padding:24}}>
          <h3 style={{fontWeight:600,fontSize:14,marginBottom:20,letterSpacing:"-0.01em"}}>📊 Financial Details</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Input label="Monthly Net Income" prefix="₹" placeholder="50000" value={form.income} onChange={v=>setForm(p=>({...p,income:v}))} hint="Take-home salary after TDS"/>
            <Input label="Existing EMIs (monthly)" prefix="₹" placeholder="0" value={form.existing} onChange={v=>setForm(p=>({...p,existing:v}))}/>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",display:"block",marginBottom:6}}>Employment Type</label>
              <select onChange={e=>setForm(p=>({...p,employment:e.target.value}))}
                style={{width:"100%",padding:"10px 14px",border:"1.5px solid var(--border-soft)",borderRadius:"var(--radius-sm)",fontSize:13,background:"var(--white)",color:"var(--ink)"}}>
                <option value="salaried">Salaried (Private)</option>
                <option value="govt">Government Employee</option>
                <option value="self">Self-Employed</option>
                <option value="business">Business Owner</option>
              </select>
            </div>
            <Input label="Age" placeholder="30" value={form.age} onChange={v=>setForm(p=>({...p,age:v}))} hint="Min 21 · Max 60 years at loan maturity"/>
            <Btn size="lg" loading={checking} onClick={checkEligibility} style={{width:"100%",justifyContent:"center"}}>
              {checking?"Fetching Credit Report...":"Check Eligibility 🔍"}
            </Btn>
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {result ? (
            <>
              {/* Credit Score Gauge */}
              <Card style={{padding:22,textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.05em",marginBottom:12,textTransform:"uppercase"}}>CIBIL Score</div>
                <div style={{position:"relative",display:"inline-flex",flexDirection:"column",alignItems:"center"}}>
                  <svg width={140} height={80} viewBox="0 0 140 80">
                    <path d="M10,70 A60,60 0 0,1 130,70" fill="none" stroke="var(--surface-3)" strokeWidth={12} strokeLinecap="round"/>
                    <path d="M10,70 A60,60 0 0,1 130,70" fill="none"
                      stroke={result.band.color} strokeWidth={12} strokeLinecap="round"
                      strokeDasharray={`${(result.score-300)/600*188} 188`}
                      style={{transition:"stroke-dasharray 1s ease"}}
                    />
                  </svg>
                  <div style={{position:"absolute",bottom:0,textAlign:"center"}}>
                    <div style={{fontSize:28,fontWeight:800,color:result.band.color,fontFamily:"var(--font-display)",lineHeight:1}}>{result.score}</div>
                    <div style={{fontSize:10,fontWeight:600,color:result.band.color}}>{result.band.label}</div>
                  </div>
                </div>
              </Card>

              {/* Metrics */}
              <Card style={{padding:20}}>
                {[
                  {label:"FOIR (Debt-to-Income)",value:`${result.foir}%`,ok:result.foir<50,threshold:"< 50%"},
                  {label:"Max Monthly EMI",value:formatINR(result.maxEMI),ok:true},
                  {label:"Max Loan Eligible",value:formatINR(result.maxLoan),ok:true},
                ].map(m=>(
                  <div key={m.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--border-soft)"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:500}}>{m.label}</div>
                      {m.threshold&&<div style={{fontSize:10,color:"var(--ink-muted)"}}>Threshold: {m.threshold}</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,fontSize:13,color:m.ok?"var(--success)":"var(--danger)",fontFamily:"var(--font-mono)"}}>{m.value}</span>
                      <span>{m.ok?"✅":"❌"}</span>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Result Banner */}
              <div style={{
                background:result.eligible?"linear-gradient(135deg,var(--success-ghost),rgba(16,185,129,0.04))":"var(--danger-ghost)",
                border:`2px solid ${result.eligible?"var(--success)":"var(--danger)"}`,
                borderRadius:"var(--radius-md)",padding:"16px 20px",textAlign:"center"
              }}>
                <div style={{fontSize:24,marginBottom:4}}>{result.eligible?"🎉":"❌"}</div>
                <div style={{fontWeight:700,color:result.eligible?"var(--success)":"var(--danger)",fontSize:15}}>
                  {result.eligible?"Congratulations! You're eligible":"Not eligible at this time"}
                </div>
                <div style={{fontSize:11,color:"var(--ink-muted)",marginTop:4}}>
                  {result.eligible?"Proceed to apply for a loan up to "+formatINR(result.maxLoan):"Improve your CIBIL score or reduce existing EMIs"}
                </div>
              </div>
            </>
          ) : (
            <Card style={{padding:30,textAlign:"center",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
              <div style={{fontSize:40}}>📈</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:18}}>Instant Credit Check</div>
              <div style={{fontSize:12,color:"var(--ink-muted)",maxWidth:220}}>Fill in your financial details to get a real-time eligibility assessment</div>
              {[
                "CIBIL Score Fetch",
                "FOIR Calculation",
                "Risk Assessment",
                "Bureau Cross-check",
              ].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"var(--ink-muted)"}}>
                  <span style={{color:"var(--accent)"}}>→</span>{f}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOAN APPLICATION
// ============================================================
function ApplyLoanScreen(){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({
    type:"Personal",amount:300000,tenure:24,purpose:"Medical",
    income:50000,bank:"SBI",accNo:"",ifsc:"",
    agree1:false,agree2:false,agree3:false
  });
  const [submitted,setSubmitted]=useState(false);
  const [appId,setAppId]=useState("");
  const [appEmi,setAppEmi]=useState(0);

  const emi=calcEMI(Number(form.amount),form.type==="Home"?8.5:form.type==="Personal"?14:12,Number(form.tenure));
  const totalPay=emi*Number(form.tenure);
  const totalInterest=totalPay-Number(form.amount);

  async function submitLoan(){
    try{
      const r=await api.applyLoan({loan_type:form.type,amount:Number(form.amount),tenure:Number(form.tenure),purpose:form.purpose,income:Number(form.income)*12});
      setAppId(r.id); setAppEmi(r.emi); setSubmitted(true);
    }catch(e){ alert(e.message); }
  }

  const loanTypes=[
    {id:"Personal",icon:"👤",rate:"12-18%",max:"₹25L",desc:"Quick personal loans"},
    {id:"Home",icon:"🏠",rate:"8.5-9.5%",max:"₹2Cr",desc:"Home purchase / renovation"},
    {id:"Business",icon:"💼",rate:"11-15%",max:"₹50L",desc:"MSME & business growth"},
    {id:"Education",icon:"🎓",rate:"9-11%",max:"₹75L",desc:"Higher education funding"},
    {id:"Vehicle",icon:"🚗",rate:"9-12%",max:"₹30L",desc:"Two-wheeler & four-wheeler"},
  ];

  if(submitted) return (
    <div className="animate-fadeUp" style={{maxWidth:480,margin:"0 auto",textAlign:"center",padding:"60px 20px"}}>
      <div style={{position:"relative",display:"inline-flex",marginBottom:24}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"var(--success-ghost)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>✅</div>
        <div style={{position:"absolute",inset:-6,borderRadius:"50%",border:"2px solid var(--success)",animation:"pulse-ring 1.5s ease infinite"}}/>
      </div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:26,marginBottom:8}}>Application Submitted!</h2>
      <p style={{color:"var(--ink-muted)",fontSize:13,marginBottom:24}}>Your loan application <strong>#{appId}</strong> has been received and is under review.</p>
      <Card style={{padding:20,textAlign:"left",marginBottom:20}}>
        {[
          {label:"Loan Amount",value:formatINR(form.amount)},
          {label:"Loan Type",value:form.type},
          {label:"Tenure",value:`${form.tenure} months`},
          {label:"EMI",value:formatINR(appEmi||emi)+"/month"},
          {label:"Status",value:<Badge status="pending"/>},
          {label:"Next Step",value:"Document verification (24 hrs)"},
        ].map(r=>(
          <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border-soft)",fontSize:12}}>
            <span style={{color:"var(--ink-muted)"}}>{r.label}</span>
            <span style={{fontWeight:600}}>{r.value}</span>
          </div>
        ))}
      </Card>
      <div style={{fontSize:11,color:"var(--ink-muted)",marginBottom:16}}>You'll receive updates via SMS & email within 24 business hours</div>
      <Btn onClick={()=>setSubmitted(false)}>Apply Another Loan</Btn>
    </div>
  );

  return (
    <div className="animate-fadeUp" style={{maxWidth:720,margin:"0 auto"}}>
      <SectionHeader title="Loan Application" sub="Apply in 3 simple steps · Instant in-principle approval"/>

      {/* Step indicator */}
      <div style={{display:"flex",gap:0,marginBottom:24,background:"var(--surface-2)",borderRadius:99,padding:4}}>
        {["Loan Details","Bank Details","Review & Submit"].map((t,i)=>(
          <button key={i} onClick={()=>setStep(i)} style={{
            flex:1,padding:"8px 12px",borderRadius:99,fontSize:11.5,fontWeight:600,
            background:step===i?"var(--white)":"transparent",
            color:step===i?"var(--primary)":"var(--ink-muted)",
            boxShadow:step===i?"var(--shadow-sm)":"none",
            transition:"all var(--transition)",border:"none",cursor:"pointer",
          }}>{i<step?"✓ ":""}{t}</button>
        ))}
      </div>

      {step===0 && (
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          {/* Loan Type Selection */}
          <Card style={{padding:20}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:14}}>Select Loan Type</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {loanTypes.map(lt=>(
                <button key={lt.id} onClick={()=>setForm(p=>({...p,type:lt.id}))} style={{
                  padding:"12px 8px",borderRadius:"var(--radius-md)",
                  border:`2px solid ${form.type===lt.id?"var(--primary)":"var(--border-soft)"}`,
                  background:form.type===lt.id?"var(--primary-ghost)":"var(--white)",
                  cursor:"pointer",transition:"all var(--transition)",textAlign:"center",
                }}>
                  <div style={{fontSize:20,marginBottom:4}}>{lt.icon}</div>
                  <div style={{fontSize:10,fontWeight:700,color:form.type===lt.id?"var(--primary)":"var(--ink)",marginBottom:2}}>{lt.id}</div>
                  <div style={{fontSize:9,color:"var(--ink-muted)"}}>{lt.rate}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Amount Slider */}
          <Card style={{padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase"}}>Loan Amount</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:700,color:"var(--primary)"}}>{formatINR(form.amount)}</div>
            </div>
            <input type="range" min="50000" max="5000000" step="10000" value={form.amount}
              onChange={e=>setForm(p=>({...p,amount:Number(e.target.value)}))}
              style={{width:"100%",accentColor:"var(--primary)",height:4}}
            />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--ink-muted)",marginTop:4}}>
              <span>₹50K</span><span>₹50L</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:20}}>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",display:"block",marginBottom:8}}>Tenure (Months)</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[12,24,36,48,60,84].map(t=>(
                    <button key={t} onClick={()=>setForm(p=>({...p,tenure:t}))} style={{
                      padding:"5px 12px",borderRadius:99,fontSize:11,fontWeight:600,
                      background:form.tenure===t?"var(--primary)":"var(--surface-2)",
                      color:form.tenure===t?"#fff":"var(--ink-muted)",border:"none",cursor:"pointer",
                      transition:"all var(--transition)",
                    }}>{t}m</button>
                  ))}
                </div>
              </div>
              <div style={{
                background:"linear-gradient(135deg,var(--primary-ghost),rgba(0,212,170,0.06))",
                border:"1px solid var(--border)",borderRadius:"var(--radius-md)",padding:"14px 16px"
              }}>
                <div style={{fontSize:10,fontWeight:600,color:"var(--ink-muted)",marginBottom:8,letterSpacing:"0.04em",textTransform:"uppercase"}}>EMI BREAKDOWN</div>
                {[
                  {l:"Monthly EMI",v:formatINR(emi),bold:true},
                  {l:"Total Interest",v:formatINR(totalInterest)},
                  {l:"Total Payable",v:formatINR(totalPay)},
                ].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0",color:r.bold?"var(--ink)":"var(--ink-muted)"}}>
                    <span>{r.l}</span>
                    <span style={{fontWeight:r.bold?700:500,fontFamily:"var(--font-mono)",color:r.bold?"var(--primary)":"inherit"}}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Btn size="lg" onClick={()=>setStep(1)} style={{alignSelf:"flex-end"}}>Next: Bank Details →</Btn>
        </div>
      )}

      {step===1 && (
        <Card style={{padding:28}}>
          <h3 style={{fontWeight:600,fontSize:14,marginBottom:20}}>🏦 Bank Account Details</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",display:"block",marginBottom:6}}>Select Bank</label>
              <select onChange={e=>setForm(p=>({...p,bank:e.target.value}))}
                style={{width:"100%",padding:"10px 14px",border:"1.5px solid var(--border-soft)",borderRadius:"var(--radius-sm)",fontSize:13,background:"var(--white)",color:"var(--ink)"}}>
                {["SBI","HDFC Bank","ICICI Bank","Axis Bank","Kotak Bank","PNB","Bank of Baroda"].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <Input label="Account Number" placeholder="Enter account number" value={form.accNo} onChange={v=>setForm(p=>({...p,accNo:v}))}/>
            <Input label="IFSC Code" placeholder="SBIN0001234" value={form.ifsc} onChange={v=>setForm(p=>({...p,ifsc:v.toUpperCase()}))} hint="11-character code"/>
            <div style={{
              background:"var(--success-ghost)",border:"1px solid var(--success)",
              borderRadius:"var(--radius-sm)",padding:"10px 14px",display:"flex",alignItems:"center",gap:10
            }}>
              <span>✅</span>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"var(--success)"}}>Penny Drop Verified</div>
                <div style={{fontSize:10,color:"var(--ink-muted)"}}>Account active · Matches PAN name</div>
              </div>
            </div>
          </div>
          <div style={{marginTop:20,background:"var(--surface)",borderRadius:"var(--radius-sm)",border:"1px solid var(--border-soft)",padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:600,marginBottom:6,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase"}}>NACH / AUTO-DEBIT MANDATE</div>
            <label style={{display:"flex",gap:8,alignItems:"flex-start",cursor:"pointer",fontSize:11,color:"var(--ink-muted)",lineHeight:1.6}}>
              <input type="checkbox" defaultChecked style={{marginTop:2}}/>
              I authorise LoanSetu to debit my account for EMI payments via NACH as per RBI Circular RBI/2021-22/117 on recurring mandates.
            </label>
          </div>
          <div style={{marginTop:20,display:"flex",gap:10,justifyContent:"space-between"}}>
            <Btn variant="secondary" onClick={()=>setStep(0)}>← Back</Btn>
            <Btn onClick={()=>setStep(2)}>Review Application →</Btn>
          </div>
        </Card>
      )}

      {step===2 && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card style={{padding:24}}>
            <h3 style={{fontWeight:600,fontSize:14,marginBottom:16}}>📋 Application Summary</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {[
                ["Loan Type",form.type],["Amount",formatINR(form.amount)],
                ["Tenure",form.tenure+" months"],["Monthly EMI",formatINR(emi)],
                ["Interest Rate",form.type==="Home"?"8.5% p.a.":"14% p.a."],["Total Interest",formatINR(totalInterest)],
                ["Bank",form.bank],["IFSC",form.ifsc||"SBIN0001234"],
              ].map(([l,v],i)=>(
                <div key={l} style={{padding:"10px 0",borderBottom:"1px solid var(--border-soft)",paddingRight:i%2===0?20:0}}>
                  <div style={{fontSize:10,color:"var(--ink-muted)",fontWeight:500,letterSpacing:"0.03em",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:600,marginTop:2,fontFamily:v.startsWith("₹")?"var(--font-mono)":"inherit",color:v.startsWith("₹")?"var(--primary)":"var(--ink)"}}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{padding:20}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {key:"agree1",text:"I confirm all information is accurate and I haven't misrepresented my financial status. False information may result in legal action."},
                {key:"agree2",text:"I consent to credit bureau enquiry with CIBIL, Experian, CRIF and Equifax as per Credit Information Companies Act 2005."},
                {key:"agree3",text:"I agree to the Loan Agreement, Key Facts Statement (KFS), and Schedule of Charges as mandated by RBI Circular 2023."},
              ].map(a=>(
                <label key={a.key} style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}>
                  <input type="checkbox" checked={form[a.key]} onChange={e=>setForm(p=>({...p,[a.key]:e.target.checked}))} style={{marginTop:3,flexShrink:0}}/>
                  <span style={{fontSize:11,color:"var(--ink-muted)",lineHeight:1.6}}>{a.text}</span>
                </label>
              ))}
            </div>
          </Card>

          <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
            <Btn variant="secondary" onClick={()=>setStep(1)}>← Back</Btn>
            <Btn onClick={submitLoan} icon="🚀"
              style={{opacity:Object.values({...form,agree1:form.agree1,agree2:form.agree2,agree3:form.agree3}).filter((v,i)=>i>8&&!v).length>0?0.5:1}}
            >
              Submit Application
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EMI DASHBOARD
// ============================================================
function EMIDashboard(){
  const [data,setData]=useState(null);
  const load=()=>api.myLoans().then(async ls=>{
    const l=ls.find(x=>["approved","disbursed"].includes(x.status));
    setData(l?await api.emis(l.id):{loan:null,schedule:[]});
  }).catch(()=>setData({loan:null,schedule:[]}));
  useEffect(()=>{ load(); },[]);
  const EMI_SCHEDULE=(data?.schedule||[]).map(e=>({month:e.due_date,principal:e.principal,interest:e.interest,_m:e.month,
    status:e.status==="due"?"upcoming":e.status==="upcoming"?"pending":e.status}));
  const nextDue=(data?.schedule||[]).find(e=>e.status==="due");
  const paid=EMI_SCHEDULE.filter(e=>e.status==="paid").length;
  const remaining=EMI_SCHEDULE.filter(e=>e.status!=="paid").length;
  const totalPaid=EMI_SCHEDULE.filter(e=>e.status==="paid").reduce((s,e)=>s+e.principal+e.interest,0);
  const outstanding=EMI_SCHEDULE.filter(e=>e.status!=="paid").reduce((s,e)=>s+e.principal+e.interest,0);

  if(!data) return <div style={{padding:40,color:"var(--ink-muted)"}}>Loading…</div>;
  if(!data.loan) return (
    <div className="animate-fadeUp" style={{maxWidth:900,margin:"0 auto"}}>
      <SectionHeader title="EMI Repayment Dashboard" sub="No approved loan yet"/>
      <Card style={{padding:24,color:"var(--ink-muted)",fontSize:13}}>Once an admin approves your application, your repayment schedule appears here.</Card>
    </div>
  );

  return (
    <div className="animate-fadeUp" style={{maxWidth:900,margin:"0 auto"}}>
      <SectionHeader title="EMI Repayment Dashboard" sub="Track your loan repayment progress and upcoming dues"/>

      {/* Summary Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {icon:"✅",label:"EMIs Paid",value:paid,sub:`of ${EMI_SCHEDULE.length} total`},
          {icon:"📅",label:"EMIs Remaining",value:remaining,sub:nextDue?`Next due: ${nextDue.due_date}`:"All EMIs paid"},
          {icon:"💸",label:"Amount Paid",value:formatINR(totalPaid),sub:"Principal + Interest"},
          {icon:"📊",label:"Outstanding",value:formatINR(outstanding),sub:"Foreclosure available"},
        ].map((s,i)=>(
          <Card key={s.label} className="animate-fadeUp" style={{padding:"16px 18px",animationDelay:`${i*80}ms`}}>
            <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:10,color:"var(--ink-muted)",fontWeight:600,letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:"-0.02em",fontFamily:"var(--font-display)"}}>{s.value}</div>
            <div style={{fontSize:10,color:"var(--ink-muted)",marginTop:3}}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card style={{padding:20,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:10}}>
          <span>Loan Repayment Progress</span>
          <span style={{color:"var(--primary)",fontFamily:"var(--font-mono)"}}>{Math.round(paid/EMI_SCHEDULE.length*100)}%</span>
        </div>
        <div style={{height:10,background:"var(--surface-3)",borderRadius:99,overflow:"hidden"}}>
          <div style={{
            height:"100%",borderRadius:99,
            background:"linear-gradient(90deg,var(--primary),var(--accent))",
            width:`${paid/EMI_SCHEDULE.length*100}%`,
            transition:"width 1s cubic-bezier(0.4,0,0.2,1)",
          }}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--ink-muted)",marginTop:6}}>
          <span>{paid} EMIs paid</span><span>{remaining} EMIs remaining</span>
        </div>
      </Card>

      {/* EMI Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border-soft)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:600,fontSize:14}}>EMI Schedule</div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" size="sm" icon="⬇️">Download PDF</Btn>
            <Btn variant="ghost" size="sm" icon="📧">Email Statement</Btn>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"var(--surface)"}}>
                {["#","Month","Principal","Interest","Total EMI","Outstanding","Status"].map(h=>(
                  <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMI_SCHEDULE.map((e,i)=>{
                const total=e.principal+e.interest;
                const outstanding=EMI_SCHEDULE.slice(i).reduce((s,r)=>s+r.principal+r.interest,0);
                return (
                  <tr key={i} style={{borderTop:"1px solid var(--border-soft)",background:e.status==="upcoming"?"rgba(37,99,255,0.03)":"transparent",transition:"background var(--transition)"}}
                  onMouseEnter={ev=>ev.currentTarget.style.background="var(--surface)"}
                  onMouseLeave={ev=>ev.currentTarget.style.background=e.status==="upcoming"?"rgba(37,99,255,0.03)":"transparent"}>
                    <td style={{padding:"10px 16px",fontFamily:"var(--font-mono)",fontSize:11,color:"var(--ink-muted)"}}>{String(i+1).padStart(2,"0")}</td>
                    <td style={{padding:"10px 16px",fontWeight:500}}>{e.month}</td>
                    <td style={{padding:"10px 16px",fontFamily:"var(--font-mono)"}}>₹{e.principal.toLocaleString()}</td>
                    <td style={{padding:"10px 16px",fontFamily:"var(--font-mono)",color:"var(--ink-muted)"}}>₹{e.interest.toLocaleString()}</td>
                    <td style={{padding:"10px 16px",fontFamily:"var(--font-mono)",fontWeight:700}}>₹{total.toLocaleString()}</td>
                    <td style={{padding:"10px 16px",fontFamily:"var(--font-mono)",color:"var(--ink-muted)",fontSize:11}}>₹{outstanding.toLocaleString()}</td>
                    <td style={{padding:"10px 16px"}}>{e.status==="upcoming"?<Btn size="sm" onClick={()=>api.payEmi(data.loan.id,e._m).then(load).catch(x=>alert(x.message))}>Pay</Btn>:<Badge status={e.status}/>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// ADMIN: OVERVIEW DASHBOARD
// ============================================================
function AdminOverview(){
  const [loans,setLoans]=useState([]);
  const [stats,setStats]=useState(null);
  useEffect(()=>{ api.adminLoans().then(r=>setLoans(r.map(adaptLoan))).catch(()=>{}); api.adminStats().then(setStats).catch(()=>{}); },[]);
  const totalDisbursed = loans.filter(l=>["approved","disbursed"].includes(l.status)).reduce((s,l)=>s+l.amount,0);
  const pending = loans.filter(l=>l.status==="pending").length;
  const approvalRate = stats ? Math.round((stats.approved+stats.disbursed)/Math.max(stats.total,1)*100) : 0;
  const riskMetrics = [
    { label:"Rejection Rate", value:`${stats?.default_rate ?? 0}%`, delta:"live", trend:"down", good:true },
    { label:"Avg Credit Score", value:String(stats?.avg_score ?? "—"), delta:"live", trend:"up", good:true },
    { label:"Pending Review", value:String(pending), delta:"live", trend:"up", good:false },
    { label:"Approval Rate", value:`${approvalRate}%`, delta:"live", trend:"up", good:true },
  ];

  return (
    <div className="animate-fadeUp" style={{maxWidth:1000,margin:"0 auto"}}>
      {/* Ticker */}
      <div style={{
        background:"var(--ink)",color:"rgba(255,255,255,0.7)",
        borderRadius:"var(--radius-sm)",padding:"8px 0",marginBottom:20,overflow:"hidden",fontSize:11,
        fontFamily:"var(--font-mono)",letterSpacing:"0.03em",
      }}>
        <div style={{display:"flex",animation:"ticker 18s linear infinite",whiteSpace:"nowrap",gap:40}}>
          {[...Array(2)].map((_,ri)=>(
            <span key={ri} style={{display:"flex",gap:40,paddingRight:40}}>
              <span>🏦 REPO RATE: 6.50%</span>
              <span>📊 CIBIL CONNECT: ONLINE</span>
              <span>🔒 ENCRYPTION: AES-256</span>
              <span>⚡ NACH UPTIME: 99.97%</span>
              <span>💳 RBI NORMS: COMPLIANT</span>
              <span>🛡️ FRAUD SCORE: LOW RISK</span>
            </span>
          ))}
        </div>
      </div>

      <SectionHeader
        title="Loan Portfolio Overview"
        sub="Real-time monitoring · FY 2024-25"
        action={<Btn variant="accent" size="sm" icon="⬇️">Export Report</Btn>}
      />

      {/* Stat Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {icon:"💰",label:"Total Disbursed",value:formatINR(totalDisbursed),delta:"₹12.4L",good:true,delay:0},
          {icon:"📋",label:"Pending Review",value:pending,delta:"3",good:false,delay:80},
          {icon:"📈",label:"Approval Rate",value:`${approvalRate}%`,delta:"live",good:true,delay:160},
          {icon:"⭐",label:"Avg CIBIL Score",value:String(stats?.avg_score ?? "—"),delta:"live",good:true,delay:240},
        ].map(s=><StatCard key={s.label} {...s}/>)}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:18}}>
        {/* Chart */}
        <Card style={{padding:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontWeight:600,fontSize:14}}>Disbursement Trend (₹ Crore)</div>
            <div style={{display:"flex",gap:6}}>
              {["1M","3M","6M","1Y"].map(p=>(
                <button key={p} style={{padding:"4px 10px",borderRadius:99,fontSize:10,fontWeight:600,background:p==="1Y"?"var(--primary)":"var(--surface-2)",color:p==="1Y"?"#fff":"var(--ink-muted)",border:"none",cursor:"pointer"}}>{p}</button>
              ))}
            </div>
          </div>
          <svg width="100%" height={150} viewBox="0 0 480 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25,0.5,0.75].map(f=>(
              <line key={f} x1="0" y1={150*f} x2="480" y2={150*f} stroke="var(--border-soft)" strokeWidth="1"/>
            ))}
            {/* Area fill */}
            <path
              d={`M0,${150-(CHART_DATA[0].value/120)*120} ${CHART_DATA.map((d,i)=>`L${i*(480/11)},${150-(d.value/120)*120}`).join(" ")} L480,150 L0,150 Z`}
              fill="url(#chartGrad)"
            />
            {/* Line */}
            <path
              className="chart-line"
              d={`M0,${150-(CHART_DATA[0].value/120)*120} ${CHART_DATA.map((d,i)=>`L${i*(480/11)},${150-(d.value/120)*120}`).join(" ")}`}
              fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Dots */}
            {CHART_DATA.map((d,i)=>(
              <circle key={i} cx={i*(480/11)} cy={150-(d.value/120)*120} r="4" fill="var(--white)" stroke="var(--primary)" strokeWidth="2"/>
            ))}
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--ink-muted)",marginTop:4}}>
            {CHART_DATA.map(d=><span key={d.month}>{d.month}</span>)}
          </div>
        </Card>

        {/* Risk Metrics */}
        <Card style={{padding:22}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>🛡️ Portfolio Health</div>
          {riskMetrics.map(m=>(
            <div key={m.label} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
                <span style={{color:"var(--ink-muted)"}}>{m.label}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontWeight:700,fontFamily:"var(--font-mono)"}}>{m.value}</span>
                  <span style={{fontSize:10,color:m.good?"var(--success)":"var(--danger)",fontWeight:600}}>{m.trend==="up"?"↑":"↓"}{m.delta}</span>
                </div>
              </div>
              <div style={{height:5,background:"var(--surface-3)",borderRadius:99,overflow:"hidden"}}>
                <div style={{
                  height:"100%",borderRadius:99,
                  background:m.good?"linear-gradient(90deg,var(--success),var(--accent))":"linear-gradient(90deg,var(--danger),var(--warning))",
                  width:`${Math.min(Number(m.value.replace(/[^0-9.]/g,""))*3,100)}%`,
                  transition:"width 1s ease",
                }}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:4,padding:"12px",background:"var(--accent-ghost)",borderRadius:"var(--radius-sm)",border:"1px solid rgba(0,212,170,0.2)"}}>
            <div style={{fontSize:11,color:"var(--accent)",fontWeight:600}}>✅ Portfolio within RBI thresholds</div>
            <div style={{fontSize:10,color:"var(--ink-muted)",marginTop:2}}>NPA &lt; 5% · CAR: 15.2% · LCR: 108%</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN: APPLICATIONS TABLE
// ============================================================
function ApplicationsScreen(){
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [loans,setLoans]=useState([]);
  useEffect(()=>{ api.adminLoans().then(r=>setLoans(r.map(adaptLoan))).catch(()=>{}); },[]);
  const act=(id,action)=>api.decide(id,action).then(u=>setLoans(ls=>ls.map(l=>l.id===id?adaptLoan(u):l))).catch(e=>alert(e.message));

  const filtered=loans.filter(l=>{
    if(filter!=="all"&&l.status!==filter) return false;
    if(search&&!l.applicant.toLowerCase().includes(search.toLowerCase())&&!l.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="animate-fadeUp" style={{maxWidth:1000,margin:"0 auto"}}>
      <SectionHeader title="Loan Applications" sub={`${loans.length} total · ${loans.filter(l=>l.status==="pending").length} awaiting review`}
        action={<Btn icon="⬇️" variant="secondary" size="sm">Export CSV</Btn>}
      />

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--ink-muted)"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or ID..."
              style={{width:"100%",padding:"9px 14px 9px 36px",border:"1.5px solid var(--border-soft)",borderRadius:"var(--radius-sm)",fontSize:12,background:"var(--white)",color:"var(--ink)"}}
            />
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["all","pending","approved","rejected","disbursed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:"7px 14px",borderRadius:99,fontSize:11,fontWeight:600,
              background:filter===f?"var(--ink)":"var(--surface-2)",
              color:filter===f?"#fff":"var(--ink-muted)",border:"none",cursor:"pointer",
              textTransform:"capitalize",transition:"all var(--transition)",
            }}>{f}</button>
          ))}
        </div>
      </div>

      <Card style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:"var(--surface)"}}>
              {["Loan ID","Applicant","Type","Amount","EMI","Tenure","Score","Risk","Status","Actions"].map(h=>(
                <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l,i)=>{
              const band=creditBand(l.score);
              return (
                <tr key={l.id} className="animate-fadeUp" style={{borderTop:"1px solid var(--border-soft)",animationDelay:`${i*50}ms`,transition:"background var(--transition)",cursor:"pointer"}}
                onClick={()=>setSelected(selected===l.id?null:l.id)}
                onMouseEnter={e=>e.currentTarget.style.background="var(--surface)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"12px 16px",fontFamily:"var(--font-mono)",fontSize:11,color:"var(--primary)",fontWeight:600}}>{l.id}</td>
                  <td style={{padding:"12px 16px",fontWeight:500}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:`hsl(${l.applicant.charCodeAt(0)*7%360},70%,85%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--ink)",flexShrink:0}}>{l.applicant[0]}</div>
                      {l.applicant}
                    </div>
                  </td>
                  <td style={{padding:"12px 16px"}}><span style={{padding:"2px 8px",background:"var(--surface-2)",borderRadius:99,fontSize:10,fontWeight:500}}>{l.type}</span></td>
                  <td style={{padding:"12px 16px",fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--primary)"}}>{formatINR(l.amount)}</td>
                  <td style={{padding:"12px 16px",fontFamily:"var(--font-mono)",fontSize:11}}>{l.emi>0?`₹${l.emi.toLocaleString()}`:"—"}</td>
                  <td style={{padding:"12px 16px",fontSize:11,color:"var(--ink-muted)"}}>{l.tenure}m</td>
                  <td style={{padding:"12px 16px"}}>
                    <span style={{fontFamily:"var(--font-mono)",fontWeight:700,color:band.color,fontSize:13}}>{l.score}</span>
                  </td>
                  <td style={{padding:"12px 16px"}}><Badge status={l.risk}/></td>
                  <td style={{padding:"12px 16px"}}><Badge status={l.status}/></td>
                  <td style={{padding:"12px 16px"}}>
                    {l.status==="pending" && (
                      <div style={{display:"flex",gap:5}}>
                        <Btn variant="success" size="sm" onClick={(ev)=>{ev.stopPropagation();act(l.id,"approve");}}>✓</Btn>
                        <Btn variant="danger" size="sm" onClick={(ev)=>{ev.stopPropagation();act(l.id,"reject");}}>✗</Btn>
                      </div>
                    )}
                    {l.status==="approved" && <Btn variant="secondary" size="sm" onClick={(ev)=>{ev.stopPropagation();act(l.id,"disburse");}}>Disburse</Btn>}
                    {l.status!=="pending" && l.status!=="approved" && <Btn variant="ghost" size="sm">View</Btn>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{padding:40,textAlign:"center",color:"var(--ink-muted)",fontSize:13}}>No applications found</div>}
      </Card>
    </div>
  );
}

// ============================================================
// ADMIN: RISK ENGINE
// ============================================================
function RiskEngineScreen(){
  const [score,setScore]=useState({cibil:720,income:55000,foir:38,age:32,employment:"salaried",existing:1,bankVintage:5});
  const [result,setResult]=useState(null);

  async function runEngine(){
    try{ setResult(await api.riskEvaluate(score)); }
    catch(e){ alert(e.message); }
  }

  return (
    <div className="animate-fadeUp" style={{maxWidth:860,margin:"0 auto"}}>
      <SectionHeader title="Risk Engine & Underwriting" sub="Rule-based credit decisioning with AI overlay"/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Input Parameters */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card style={{padding:22}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>📊 Input Parameters</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[
                {label:"CIBIL Score",key:"cibil",min:300,max:900},
                {label:"Monthly Income (₹)",key:"income",min:10000,max:500000},
                {label:"FOIR (%)",key:"foir",min:0,max:80},
                {label:"Age",key:"age",min:21,max:65},
                {label:"Bank Vintage (years)",key:"bankVintage",min:0,max:20},
              ].map(p=>(
                <div key={p.key}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
                    <span style={{fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.03em",textTransform:"uppercase"}}>{p.label}</span>
                    <span style={{fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--primary)"}}>{p.key==="income"?"₹"+Number(score[p.key]).toLocaleString():score[p.key]}{p.key==="foir"?"%":""}</span>
                  </div>
                  <input type="range" min={p.min} max={p.max} value={score[p.key]}
                    onChange={e=>setScore(s=>({...s,[p.key]:Number(e.target.value)}))}
                    style={{width:"100%",accentColor:"var(--primary)"}}
                  />
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"var(--ink-muted)",letterSpacing:"0.04em",textTransform:"uppercase",display:"block",marginBottom:6}}>Employment</label>
                <select value={score.employment} onChange={e=>setScore(s=>({...s,employment:e.target.value}))}
                  style={{width:"100%",padding:"8px 12px",border:"1.5px solid var(--border-soft)",borderRadius:"var(--radius-sm)",fontSize:12,background:"var(--white)"}}>
                  {["salaried","govt","self","business"].map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
              <Btn onClick={runEngine} style={{width:"100%",justifyContent:"center"}} icon="⚡">Run Underwriting Engine</Btn>
            </div>
          </Card>

          {/* Rule Matrix */}
          <Card style={{padding:20}}>
            <div style={{fontWeight:600,fontSize:13,marginBottom:14}}>📋 Underwriting Rules</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {rule:"CIBIL ≥ 750",pts:"+30",met:score.cibil>=750},
                {rule:"CIBIL 700-749",pts:"+20",met:score.cibil>=700&&score.cibil<750},
                {rule:"Income ≥ ₹50,000",pts:"+20",met:score.income>=50000},
                {rule:"FOIR < 30%",pts:"+20",met:score.foir<30},
                {rule:"Govt Employee",pts:"+15",met:score.employment==="govt"},
                {rule:"Age 25-45 yrs",pts:"+10",met:score.age>=25&&score.age<=45},
              ].map(r=>(
                <div key={r.rule} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",
                  background:r.met?"var(--success-ghost)":"var(--surface)",borderRadius:6,fontSize:11,
                  border:`1px solid ${r.met?"rgba(16,185,129,0.2)":"var(--border-soft)"}`,
                }}>
                  <span style={{display:"flex",gap:7,alignItems:"center",color:r.met?"var(--success)":"var(--ink-muted)"}}><span>{r.met?"✅":"⬜"}</span>{r.rule}</span>
                  <span style={{fontFamily:"var(--font-mono)",fontWeight:700,color:r.met?"var(--success)":"var(--ink-muted)"}}>{r.pts}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Result */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {result ? (
            <>
              <Card style={{padding:24,textAlign:"center",
                border:`2px solid ${result.decision==="approve"?"var(--success)":result.decision==="review"?"var(--warning)":"var(--danger)"}`,
              }}>
                <div style={{fontSize:40,marginBottom:8}}>{result.decision==="approve"?"✅":result.decision==="review"?"⚠️":"❌"}</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:700,
                  color:result.decision==="approve"?"var(--success)":result.decision==="review"?"var(--warning)":"var(--danger)",
                  textTransform:"capitalize",marginBottom:4,
                }}>
                  {result.decision==="approve"?"Approve Loan":result.decision==="review"?"Manual Review Required":"Reject Application"}
                </div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:36,fontWeight:800,margin:"16px 0",
                  color:result.decision==="approve"?"var(--success)":result.decision==="review"?"var(--warning)":"var(--danger)"
                }}>{result.score}/100</div>
                <div style={{height:8,background:"var(--surface-3)",borderRadius:99,overflow:"hidden",marginBottom:12}}>
                  <div style={{
                    height:"100%",borderRadius:99,width:`${result.score}%`,
                    background:result.decision==="approve"?"linear-gradient(90deg,var(--success),var(--accent))":result.decision==="review"?"linear-gradient(90deg,var(--warning),#f97316)":"var(--danger)",
                    transition:"width 0.8s ease",
                  }}/>
                </div>
                <div style={{fontSize:11,color:"var(--ink-muted)"}}>Risk Score · Threshold: 70 (Approve) · 50 (Review)</div>
              </Card>

              {result.decision!=="reject" && (
                <Card style={{padding:20}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:14}}>📋 Approved Terms</div>
                  {[
                    {l:"Interest Rate",v:`${result.rate}% p.a.`},
                    {l:"Max Loan Amount",v:formatINR(result.maxLoan)},
                    {l:"Processing Fee",v:"1% of loan amount"},
                    {l:"Pre-closure Charges",v:"2% after 6 months"},
                  ].map(r=>(
                    <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border-soft)",fontSize:12}}>
                      <span style={{color:"var(--ink-muted)"}}>{r.l}</span>
                      <span style={{fontWeight:700,color:"var(--primary)",fontFamily:"var(--font-mono)"}}>{r.v}</span>
                    </div>
                  ))}
                </Card>
              )}

              {result.flags.length>0 && (
                <Card style={{padding:20,border:"1.5px solid rgba(245,158,11,0.3)"}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:12,color:"var(--warning)"}}>⚠️ Risk Flags ({result.flags.length})</div>
                  {result.flags.map(f=>(
                    <div key={f} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",fontSize:11}}>
                      <span style={{color:"var(--warning)"}}>→</span><span style={{color:"var(--ink-muted)"}}>{f}</span>
                    </div>
                  ))}
                </Card>
              )}

              <Card style={{padding:18,background:"linear-gradient(135deg,rgba(37,99,255,0.05),rgba(0,212,170,0.05))"}}>
                <div style={{fontWeight:600,fontSize:12,marginBottom:10}}>🤖 AI Overlay Recommendation</div>
                <div style={{fontSize:11,color:"var(--ink-muted)",lineHeight:1.7}}>
                  Behavioural analytics and alternative data sources (UPI patterns, utility payments) suggest <strong>{result.score>=70?"low-moderate":"moderate-high"} default probability</strong>. Recommended bureau cross-check with Experian + CRIF before final disbursement.
                </div>
              </Card>
            </>
          ) : (
            <Card style={{padding:32,textAlign:"center",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
              <div style={{fontSize:40}}>⚡</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:20}}>Rule-based Engine</div>
              <div style={{fontSize:12,color:"var(--ink-muted)",maxWidth:240,lineHeight:1.6}}>Adjust parameters and run the underwriting engine to get an instant decision</div>
              {["CIBIL Weight: 30%","Income Weight: 20%","FOIR Weight: 20%","Bureau Checks: CIBIL + Experian"].map(f=>(
                <div key={f} style={{fontSize:11,color:"var(--ink-muted)",display:"flex",gap:6,alignItems:"center"}}><span style={{color:"var(--primary)"}}>{">"}</span>{f}</div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FRAUD ALERTS
// ============================================================
function FraudAlertsScreen(){
  const [raw,setRaw]=useState([]);
  useEffect(()=>{ api.fraudAlerts().then(setRaw).catch(()=>{}); },[]);
  const alerts=raw.map(a=>({id:a.id,type:a.type,severity:a.severity[0].toUpperCase()+a.severity.slice(1),applicant:a.user,desc:a.desc,time:a.time,action:a.resolved?"Resolved":"Under Review"}));

  const sev={Critical:{bg:"var(--danger-ghost)",color:"var(--danger)"},High:{bg:"rgba(239,68,68,0.06)",color:"#dc2626"},Medium:{bg:"var(--warning-ghost)",color:"var(--warning)"},Low:{bg:"var(--success-ghost)",color:"var(--success)"}};

  return (
    <div className="animate-fadeUp" style={{maxWidth:860,margin:"0 auto"}}>
      <SectionHeader title="Fraud Detection & Alerts" sub="ML-powered anomaly detection · Real-time monitoring"
        action={<div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" size="sm">📊 Analytics</Btn>
          <Btn variant="danger" size="sm">🚨 {alerts.filter(a=>a.severity==="Critical"||a.severity==="High").length} Critical</Btn>
        </div>}
      />

      {/* Fraud Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {icon:"🚨",label:"Total Alerts",value:"47",color:"var(--danger)"},
          {icon:"🔴",label:"Critical",value:"3",color:"var(--danger)"},
          {icon:"🟡",label:"High Risk",value:"11",color:"var(--warning)"},
          {icon:"✅",label:"Resolved",value:"33",color:"var(--success)"},
        ].map(s=>(
          <Card key={s.label} style={{padding:"14px 16px"}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:10,color:"var(--ink-muted)",fontWeight:600,letterSpacing:"0.04em",textTransform:"uppercase"}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"var(--font-display)"}}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {alerts.map((a,i)=>{
          const s=sev[a.severity];
          return (
            <Card key={a.id} className="animate-slideRight" style={{padding:18,animationDelay:`${i*60}ms`,
              borderLeft:`4px solid ${s.color}`,
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--ink-muted)"}}>{a.id}</span>
                    <span style={{padding:"2px 8px",background:s.bg,color:s.color,borderRadius:99,fontSize:10,fontWeight:700}}>{a.severity}</span>
                    <span style={{padding:"2px 8px",background:"var(--surface-2)",color:"var(--ink-muted)",borderRadius:99,fontSize:10,fontWeight:500}}>{a.type}</span>
                  </div>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{a.applicant}</div>
                  <div style={{fontSize:11,color:"var(--ink-muted)",lineHeight:1.5}}>{a.desc}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0}}>
                  <span style={{fontSize:10,color:"var(--ink-muted)"}}>{a.time}</span>
                  <span style={{padding:"3px 10px",background:"var(--surface-2)",color:"var(--ink-muted)",borderRadius:99,fontSize:10,fontWeight:600}}>{a.action}</span>
                  <div style={{display:"flex",gap:5}}>
                    <Btn variant="ghost" size="sm">Investigate</Btn>
                    <Btn variant="danger" size="sm">Block</Btn>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// ARCHITECTURE DOCS
// ============================================================
function ArchitectureDocs(){
  const [tab,setTab]=useState("arch");
  const tabs=[
    {id:"arch",label:"🏗️ Architecture"},
    {id:"db",label:"🗄️ Database Schema"},
    {id:"api",label:"🔌 API Reference"},
    {id:"compliance",label:"🔐 Compliance"},
    {id:"deploy",label:"🚀 Deployment"},
  ];

  return (
    <div className="animate-fadeUp" style={{maxWidth:900,margin:"0 auto"}}>
      <SectionHeader title="System Architecture & Docs" sub="Technical documentation for LoanSetu platform"/>

      <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"8px 16px",borderRadius:"var(--radius-sm)",fontSize:11.5,fontWeight:600,
            background:tab===t.id?"var(--ink)":"var(--surface-2)",
            color:tab===t.id?"#fff":"var(--ink-muted)",border:"none",cursor:"pointer",
            transition:"all var(--transition)",letterSpacing:"0.02em",
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="arch" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card style={{padding:24}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:20,fontFamily:"var(--font-display)"}}>Microservices Architecture</div>
            {/* Architecture Diagram */}
            <div style={{background:"var(--ink)",borderRadius:"var(--radius-md)",padding:24,fontFamily:"var(--font-mono)",fontSize:11,lineHeight:2,color:"rgba(255,255,255,0.7)",overflowX:"auto"}}>
              <pre style={{color:"rgba(255,255,255,0.8)",fontSize:11,lineHeight:1.8}}>{[
  "+-----------------------------------------------+",
  "|            CLIENT LAYER                       |",
  "|   React Web App  |  Flutter Mobile            |",
  "+------------------+----------------------------+",
  "                   | HTTPS / TLS 1.3             ",
  "+------------------v----------------------------+",
  "|         API GATEWAY (Kong / AWS API GW)       |",
  "|   Rate Limiting . Auth . Load Balancing       |",
  "+---+------+------+------+------+---------------+",
  "    |      |      |      |      |                ",
  " +--v--+ +-v--+ +-v--+ +-v--+ +-v---------+    ",
  " |Auth | |User| |Loan| |Risk| | Payment   |    ",
  " |Svc  | |Svc | |Svc | |Eng | |   Svc     |    ",
  " +--+--+ +-+--+ +-+--+ +-+--+ +-+---------+    ",
  "    |      |     |      |      |                ",
  "+---v------v-----v------v------v---------------+",
  "|        MESSAGE BROKER (Apache Kafka)          |",
  "+------------------+----------------------------+",
  "                   |                             ",
  "+------------------v----------------------------+",
  "|              DATA LAYER                       |",
  "|  PostgreSQL(Primary) | Redis Cache | S3 Docs  |",
  "+-----------------------------------------------+",
  "                                                 ",
  "  EXTERNAL INTEGRATIONS:                         ",
  "  +-- CIBIL / Experian (Credit Bureau APIs)      ",
  "  +-- UIDAI (Aadhaar verification)               ",
  "  +-- NSDL (PAN verification)                    ",
  "  +-- RazorpayX / PayU (UPI/IMPS Disbursement)   ",
  "  +-- NACH / NPCI (Auto-debit mandates)           ",
  "  +-- AWS Rekognition (Face verification)         ",
].join("\n")}</pre>
            </div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {title:"🔐 Auth Service",items:["OTP via MSG91 / Twilio","JWT (RS256 algorithm)","Refresh token rotation","Session: Redis TTL 30min","Rate limit: 5 OTP/hour/IP"]},
              {title:"📋 KYC Service",items:["OCR: AWS Textract / Google Vision","Face match: AWS Rekognition","Aadhaar: UIDAI OTP API","PAN: NSDL + Income Tax Dept","Docs stored: S3 + AES-256"]},
              {title:"🏦 Loan Service",items:["EMI = P×R×(1+R)^N/((1+R)^N−1)","Loan states: applied→underwriting→approved→disbursed","Lifecycle events via Kafka","Audit trail: immutable log","Foreclosure calculator"]},
              {title:"💳 Payment Service",items:["Disbursement: UPI/IMPS/NEFT","NACH mandate registration","EMI auto-debit on due date","Webhook: payment confirmation","Reconciliation: T+1 EOD"]},
            ].map(s=>(
              <Card key={s.title} style={{padding:18}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>{s.title}</div>
                {s.items.map(it=>(
                  <div key={it} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"4px 0",fontSize:11,color:"var(--ink-muted)"}}>
                    <span style={{color:"var(--primary)",flexShrink:0}}>→</span>{it}
                  </div>
                ))}
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="db" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[
            {table:"users",fields:[
              "id UUID PRIMARY KEY","phone VARCHAR(10) UNIQUE NOT NULL","name VARCHAR(100)","email VARCHAR(150)",
              "pan_hash VARCHAR(64)","aadhaar_last4 CHAR(4)","kyc_status ENUM('pending','verified','rejected')","created_at TIMESTAMPTZ",
            ]},
            {table:"loans",fields:[
              "id UUID PRIMARY KEY","user_id UUID REFERENCES users(id)","amount NUMERIC(12,2) NOT NULL","type ENUM('personal','home','business','education','vehicle')",
              "status ENUM('applied','underwriting','approved','disbursed','active','closed','npa')","interest_rate NUMERIC(5,2)","tenure_months INTEGER",
              "emi_amount NUMERIC(10,2)","disbursement_date DATE","account_id UUID REFERENCES bank_accounts(id)","cibil_score INTEGER","risk_score NUMERIC(5,2)",
            ]},
            {table:"emi_schedule",fields:[
              "id UUID PRIMARY KEY","loan_id UUID REFERENCES loans(id)","due_date DATE NOT NULL","principal NUMERIC(10,2)",
              "interest NUMERIC(10,2)","total NUMERIC(10,2)","status ENUM('pending','paid','overdue','partial')","paid_date DATE","late_fee NUMERIC(8,2)",
            ]},
            {table:"kyc_documents",fields:[
              "id UUID PRIMARY KEY","user_id UUID REFERENCES users(id)","doc_type ENUM('pan','aadhaar','selfie','income_proof')","s3_key VARCHAR(255)",
              "ocr_data JSONB","verified_at TIMESTAMPTZ","confidence_score NUMERIC(5,2)","verified_by ENUM('system','manual')",
            ]},
          ].map(({table,fields})=>(
            <Card key={table} style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 20px",background:"var(--ink)",display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"var(--accent)",fontFamily:"var(--font-mono)",fontSize:13,fontWeight:600}}>TABLE</span>
                <span style={{color:"#fff",fontFamily:"var(--font-mono)",fontSize:14,fontWeight:700}}>{table}</span>
              </div>
              <div style={{padding:"12px 20px",display:"flex",flexDirection:"column",gap:0}}>
                {fields.map(f=>{
                  const [name,...rest]=f.split(" ");
                  return (
                    <div key={f} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid var(--border-soft)",fontFamily:"var(--font-mono)",fontSize:11}}>
                      <span style={{color:"var(--primary)",minWidth:180,fontWeight:600}}>{name}</span>
                      <span style={{color:"var(--ink-muted)"}}>{rest.join(" ")}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab==="api" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {method:"POST",path:"/api/v1/auth/send-otp",desc:"Send OTP to mobile",body:'{"phone": "9876543210"}',resp:'{"message":"OTP sent","expires_in":300}'},
            {method:"POST",path:"/api/v1/auth/verify-otp",desc:"Verify OTP & issue JWT",body:'{"phone":"9876543210","otp":"123456"}',resp:'{"token":"eyJhbG...","refresh_token":"...","expires_in":1800}'},
            {method:"POST",path:"/api/v1/kyc/upload",desc:"Upload KYC document",body:'FormData: file + doc_type',resp:'{"doc_id":"uuid","status":"processing","confidence":null}'},
            {method:"GET",path:"/api/v1/loans/eligibility",desc:"Check loan eligibility",body:'{"income":50000,"existing_emi":0,"employment":"salaried"}',resp:'{"eligible":true,"max_amount":1800000,"max_emi":25000,"cibil_score":720}'},
            {method:"POST",path:"/api/v1/loans/apply",desc:"Submit loan application",body:'{"amount":500000,"type":"personal","tenure":36,"bank_account_id":"uuid"}',resp:'{"loan_id":"L001","status":"applied","in_principle_approval":true}'},
            {method:"GET",path:"/api/v1/loans/:id/schedule",desc:"Fetch EMI schedule",body:"—",resp:'{"schedule":[{"month":1,"principal":8200,"interest":5833,"total":14033},...]}'},
            {method:"POST",path:"/api/v1/payments/disbursement",desc:"Initiate disbursement [Admin]",body:'{"loan_id":"L001","mode":"IMPS"}',resp:'{"txn_id":"TXN123","utr":"UTR456","status":"initiated"}'},
          ].map(ep=>{
            const colors={GET:"var(--success)",POST:"var(--primary)",PUT:"var(--warning)",DELETE:"var(--danger)"};
            return (
              <Card key={ep.path} style={{padding:0,overflow:"hidden"}}>
                <div style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid var(--border-soft)"}}>
                  <span style={{
                    padding:"3px 8px",borderRadius:4,fontSize:10,fontWeight:700,
                    background:colors[ep.method]+"1a",color:colors[ep.method],
                    fontFamily:"var(--font-mono)",letterSpacing:"0.04em",
                  }}>{ep.method}</span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600,color:"var(--ink)"}}>{ep.path}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"var(--ink-muted)"}}>{ep.desc}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                  <div style={{padding:"10px 16px",borderRight:"1px solid var(--border-soft)"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"var(--ink-muted)",letterSpacing:"0.06em",marginBottom:6,textTransform:"uppercase"}}>Request Body</div>
                    <code style={{fontSize:10,color:"var(--primary)",fontFamily:"var(--font-mono)",lineHeight:1.5,display:"block"}}>{ep.body}</code>
                  </div>
                  <div style={{padding:"10px 16px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"var(--ink-muted)",letterSpacing:"0.06em",marginBottom:6,textTransform:"uppercase"}}>Response</div>
                    <code style={{fontSize:10,color:"var(--success)",fontFamily:"var(--font-mono)",lineHeight:1.5,display:"block"}}>{ep.resp}</code>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab==="compliance" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[
            {icon:"🏦",title:"RBI Master Direction on KYC 2016",items:["Video KYC (V-CIP) for digital onboarding","Re-KYC every 2 years for high-risk customers","CKYC upload within 3 days of onboarding","Periodic updation for existing customers"]},
            {icon:"🔒",title:"Data Security & Encryption",items:["AES-256-GCM for data at rest","TLS 1.3 for data in transit","PAN/Aadhaar masked in logs","HSM for key management","SOC 2 Type II audit annually"]},
            {icon:"📋",title:"Lending Regulations",items:["FLDG (First Loss Default Guarantee) capped at 5%","Key Fact Statement (KFS) mandatory","Annual Percentage Rate (APR) disclosure","No hidden charges per RBI Circular 2023","Fair Practices Code adherence"]},
            {icon:"🛡️",title:"Consumer Protection",items:["Grievance redressal: max 30-day TAT","Ombudsman escalation path (RBI BO)","Consent withdrawal mechanism","Right to data portability (DPDP Act)","Credit information dispute process"]},
            {icon:"💻",title:"DPDP Act 2023 Compliance",items:["Explicit informed consent collection","Data minimisation principles","Purpose limitation enforcement","Data deletion on request","DPO appointed & registered"]},
            {icon:"🚫",title:"AML/KYC/CFT Controls",items:["PMLA 2002 reporting obligations","STR filing for suspicious transactions","FATF watchlist screening","Politically Exposed Persons (PEP) check","Beneficial ownership verification"]},
          ].map(s=>(
            <Card key={s.title} style={{padding:20}}>
              <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
              <div style={{fontWeight:600,fontSize:12,marginBottom:12,lineHeight:1.4}}>{s.title}</div>
              {s.items.map(it=>(
                <div key={it} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"3px 0",fontSize:11,color:"var(--ink-muted)",lineHeight:1.5}}>
                  <span style={{color:"var(--success)",flexShrink:0}}>✓</span>{it}
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {tab==="deploy" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card style={{padding:22}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🚀 AWS Deployment Guide</div>
            {[
              {step:"1",title:"Infrastructure Setup",cmd:"terraform init && terraform apply -var-file=prod.tfvars",desc:"Provision VPC, subnets, EKS cluster, RDS PostgreSQL, ElastiCache Redis, S3 buckets"},
              {step:"2",title:"Database Migration",cmd:"npm run migrate:prod",desc:"Run Prisma/Knex migrations. Create read replicas. Enable RDS encryption at rest."},
              {step:"3",title:"Docker & ECR",cmd:"docker build -t loansetu-api . && docker push 123456.dkr.ecr.ap-south-1.amazonaws.com/loansetu-api",desc:"Build and push container images to AWS Elastic Container Registry"},
              {step:"4",title:"Kubernetes Deploy",cmd:"kubectl apply -f k8s/ --namespace=production",desc:"Deploy microservices with HPA auto-scaling. Min 2 pods per service, max 20."},
              {step:"5",title:"SSL & Domain",cmd:"aws acm request-certificate --domain-name api.loansetu.in",desc:"Issue ACM certificate. Configure Route53. Enable CloudFront CDN for frontend."},
              {step:"6",title:"Monitoring",cmd:"helm install prometheus kube-prometheus-stack/kube-prometheus-stack",desc:"Prometheus + Grafana dashboards. PagerDuty alerts. CloudWatch logs."},
            ].map(s=>(
              <div key={s.step} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:"1px solid var(--border-soft)"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"var(--primary)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{s.step}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:12,marginBottom:4}}>{s.title}</div>
                  <div style={{background:"var(--ink)",borderRadius:6,padding:"7px 12px",fontFamily:"var(--font-mono)",fontSize:10,color:"var(--accent)",marginBottom:5,overflowX:"auto",whiteSpace:"nowrap"}}>{s.cmd}</div>
                  <div style={{fontSize:11,color:"var(--ink-muted)"}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{padding:20}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:14}}>⚡ Scale to 1M Users Strategy</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {icon:"🔄",title:"Horizontal Scaling",desc:"EKS auto-scaling groups with KEDA for event-driven scaling"},
                {icon:"💾",title:"Caching Layer",desc:"Redis Cluster for sessions, eligibility results, bureau responses (TTL: 1hr)"},
                {icon:"🗃️",title:"Database Sharding",desc:"Shard by user_id. Read replicas for reporting. Vitess for MySQL sharding"},
                {icon:"📨",title:"Async Processing",desc:"Kafka for loan state transitions, payment webhooks, notification queue"},
                {icon:"🌐",title:"CDN & Edge",desc:"CloudFront for static assets. Lambda@Edge for auth. 99.99% SLA"},
                {icon:"🤖",title:"AI Credit Scoring",desc:"SageMaker ML model: 150+ features, XGBoost, replaces pure rule engine"},
              ].map(f=>(
                <div key={f.title} style={{display:"flex",gap:10,padding:"10px 12px",background:"var(--surface)",borderRadius:"var(--radius-sm)"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{f.icon}</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:11,marginBottom:3}}>{f.title}</div>
                    <div style={{fontSize:10,color:"var(--ink-muted)",lineHeight:1.5}}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================
// USER PROFILE
// ============================================================
function ProfileScreen({me}){
  const [loans,setLoans]=useState([]);
  useEffect(()=>{ api.myLoans().then(setLoans).catch(()=>{}); },[]);
  const active=loans.filter(l=>["approved","disbursed"].includes(l.status));
  return (
    <div className="animate-fadeUp" style={{maxWidth:640,margin:"0 auto"}}>
      <SectionHeader title="My Profile" sub="Account settings and loan summary"/>
      <Card style={{padding:28,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24}}>
          <div style={{
            width:72,height:72,borderRadius:"50%",
            background:"linear-gradient(135deg,var(--primary),var(--accent))",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:28,color:"#fff",fontFamily:"var(--font-display)",fontWeight:700,
            boxShadow:"var(--shadow-primary)",
          }}>{(me?.name||"U")[0]}</div>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:700}}>{me?.name||"—"}</div>
            <div style={{fontSize:12,color:"var(--ink-muted)",marginTop:2}}>+91 {me?.phone}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <Badge status={me?.kyc_complete?"approved":"pending"}/><span style={{fontSize:11,color:"var(--ink-muted)"}}>{me?.kyc_complete?"KYC Verified":"KYC Pending"}</span>
            </div>
          </div>
          <Btn variant="ghost" size="sm" style={{marginLeft:"auto"}}>Edit Profile</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          {[
            {label:"Active Loans",value:String(active.length)},
            {label:"Total Borrowed",value:formatINR(active.reduce((t,l)=>t+l.amount,0))},
            {label:"CIBIL Score",value:String(me?.cibil_score??"—")},
            {label:"Total EMI/Month",value:formatINR(active.reduce((t,l)=>t+l.emi,0))},
            {label:"Applications",value:String(loans.length)},
            {label:"KYC",value:me?.kyc_complete?"Verified":"Pending"},
          ].map(s=>(
            <div key={s.label} style={{padding:"14px 16px",background:"var(--surface)",borderRadius:"var(--radius-md)",textAlign:"center"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:700,color:"var(--primary)"}}>{s.value}</div>
              <div style={{fontSize:10,color:"var(--ink-muted)",fontWeight:500,marginTop:4,letterSpacing:"0.03em",textTransform:"uppercase"}}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{padding:22}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>🔒 Security Settings</div>
        {[
          {label:"Two-Factor Authentication",sub:"OTP via SMS",status:true},
          {label:"Biometric Login",sub:"Fingerprint / Face ID",status:true},
          {label:"Login Notifications",sub:"Email + SMS alerts",status:true},
          {label:"Data Sharing Consent",sub:"Manage bureau permissions",status:false},
        ].map(s=>(
          <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--border-soft)"}}>
            <div>
              <div style={{fontWeight:500,fontSize:13}}>{s.label}</div>
              <div style={{fontSize:11,color:"var(--ink-muted)",marginTop:2}}>{s.sub}</div>
            </div>
            <div style={{
              width:40,height:22,borderRadius:99,
              background:s.status?"var(--success)":"var(--surface-3)",
              position:"relative",cursor:"pointer",transition:"background 0.2s",
            }}>
              <div style={{
                position:"absolute",top:3,left:s.status?20:3,
                width:16,height:16,borderRadius:"50%",background:"#fff",
                boxShadow:"var(--shadow-sm)",transition:"left 0.2s",
              }}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App(){
  const [active,setActive]=useState("kyc");
  const [role,setRole]=useState("user");
  const [me,setMe]=useState(null);
  const [checking,setChecking]=useState(api.hasToken());

  const loadMe=()=>api.me().then(m=>{ setMe(m); setRole(m.role); });
  useEffect(()=>{
    if(api.hasToken()) loadMe().catch(()=>api.logout()).finally(()=>setChecking(false));
  },[]);
  useEffect(()=>{
    const defaults={user:"kyc",admin:"overview"};
    setActive(defaults[role]);
  },[role]);
  // Only real admins may switch to the admin view (the API also enforces this)
  const switchRole=(r)=>{ if(r==="user"||me?.role==="admin") setRole(r); };

  const screens={
    // User
    onboard:<OnboardingScreen onVerified={loadMe}/>,
    kyc:<KYCScreen/>,
    eligibility:<EligibilityScreen/>,
    apply:<ApplyLoanScreen/>,
    emi:<EMIDashboard/>,
    profile:<ProfileScreen me={me}/>,
    // Admin
    overview:<AdminOverview/>,
    applications:<ApplicationsScreen/>,
    risk:<RiskEngineScreen/>,
    fraud:<FraudAlertsScreen/>,
    docs:<ArchitectureDocs/>,
  };

  if(checking) return <><GlobalStyles/><div style={{padding:40,color:"var(--ink-muted)"}}>Loading…</div></>;
  if(!me) return <><GlobalStyles/><OnboardingScreen onVerified={loadMe}/></>;

  return (
    <>
      <GlobalStyles/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar active={active} setActive={setActive} role={role} setRole={switchRole}/>
        {/* Main Content */}
        <div style={{marginLeft:230,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          {/* Top Bar */}
          <div style={{
            position:"sticky",top:0,zIndex:50,
            background:"rgba(244,246,255,0.92)",backdropFilter:"blur(12px)",
            borderBottom:"1px solid var(--border-soft)",
            padding:"12px 32px",
            display:"flex",alignItems:"center",justifyContent:"space-between",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:12,color:"var(--ink-muted)"}}>
                <span style={{fontWeight:500,color:"var(--primary)"}}>LoanSetu</span>
                <span style={{margin:"0 6px",opacity:0.4}}>/</span>
                <span style={{textTransform:"capitalize",fontWeight:600,color:"var(--ink)"}}>{active}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{
                background:"var(--success-ghost)",border:"1px solid rgba(16,185,129,0.2)",
                borderRadius:99,padding:"4px 12px",fontSize:10,fontWeight:600,color:"var(--success)",
                display:"flex",alignItems:"center",gap:5,
              }}>
                <span style={{width:5,height:5,borderRadius:"50%",background:"var(--success)",display:"inline-block",animation:"pulse-ring 2s ease infinite"}}/>
                System Operational
              </div>
              <div style={{
                width:34,height:34,borderRadius:"50%",
                background:"linear-gradient(135deg,var(--primary),var(--accent))",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",
              }} title="Click to log out" onClick={()=>{ api.logout(); setMe(null); }}>{role==="admin"?"A":"U"}</div>
            </div>
          </div>

          {/* Page Content */}
          <main style={{flex:1,padding:"28px 32px",maxWidth:1100,width:"100%"}}>
            {screens[active]||<div style={{color:"var(--ink-muted)",padding:40,textAlign:"center"}}>Coming soon</div>}
          </main>
        </div>
      </div>
    </>
  );
}
