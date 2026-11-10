import React, { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { fraudAlerts } from '../utils/data';

const sevColor = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-gray' };

export default function FraudDetection() {
  const [filter, setFilter] = useState('all');
  const [running, setRunning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [selected, setSelected] = useState(null);
  const [resolved, setResolved] = useState({});

  const scanSteps = [
    'Connecting to property database (12,847 records)...',
    'Checking for duplicate survey numbers...',
    'Verifying area vs. satellite imagery...',
    'Analyzing ownership transfer patterns...',
    'Cross-referencing PAN & Aadhaar records...',
    'Running exemption claim audit...',
    'Generating anomaly detection report...',
  ];

  const filtered = filter === 'all' ? fraudAlerts : fraudAlerts.filter(f => f.severity === filter);

  const runScan = () => {
    setRunning(true); setScanned(false); setScanStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setScanStep(s);
      if (s >= scanSteps.length - 1) {
        clearInterval(iv);
        setTimeout(() => { setRunning(false); setScanned(true); }, 500);
      }
    }, 380);
  };

  const radialData = [
    { name: 'High', value: 8, fill: '#e02424' },
    { name: 'Medium', value: 11, fill: '#f59e0b' },
    { name: 'Low', value: 4, fill: '#057a55' },
  ];

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total Alerts', value: 23, icon: '🔍', color: '#1a56db' },
          { label: 'High Priority', value: 8, icon: '🔴', color: '#e02424' },
          { label: 'Under Review', value: 11, icon: '⏳', color: '#b45309' },
          { label: 'Resolved Today', value: 4, icon: '✅', color: '#057a55' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          {/* Scanner */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3>🔍 AI Fraud Scanner</h3>
              <span className="badge badge-danger">Live</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                AI engine scans all property records for anomalies, duplicate registrations, suspicious area values, and fraudulent ownership patterns in real time.
              </p>
              {running ? (
                <div>
                  <div className="ai-thinking" style={{ marginBottom: 12 }}>
                    <span className="spinner" />
                    <span style={{ fontWeight: 600 }}>AI scanning 12,847 properties...</span>
                  </div>
                  {scanSteps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < scanSteps.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: 12, color: i <= scanStep ? '#1a56db' : '#9ca3af', fontWeight: i <= scanStep ? 600 : 400 }}>
                      {i < scanStep ? <span style={{ color: '#057a55', fontSize: 14 }}>✅</span> : i === scanStep ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, flexShrink: 0 }} /> : <span style={{ width: 12, display: 'inline-block' }} />}
                      {s}
                    </div>
                  ))}
                </div>
              ) : (
                <button className="btn btn-danger" style={{ width: '100%' }} onClick={runScan}>
                  🤖 Run Full AI Fraud Scan
                </button>
              )}
              {scanned && (
                <div style={{ background: '#f3faf7', border: '1px solid #84e1bc', borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
                  <div style={{ fontWeight: 600, color: '#057a55', marginBottom: 4 }}>✅ Scan Complete — {new Date().toLocaleTimeString()}</div>
                  <div style={{ fontSize: 12, color: '#374151' }}>12,847 records scanned &bull; <strong style={{ color: '#e02424' }}>5 new anomalies</strong> detected &bull; 3 duplicates flagged</div>
                </div>
              )}
            </div>
          </div>

          {/* Severity Chart */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h3>📊 Severity Distribution</h3></div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart innerRadius={25} outerRadius={65} data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} />
                  <Tooltip formatter={(v, n) => [`${v} cases`, n]} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {[{ label: 'High Risk', count: 8, color: '#e02424' }, { label: 'Medium Risk', count: 11, color: '#f59e0b' }, { label: 'Low Risk', count: 4, color: '#057a55' }].map(r => (
                  <div key={r.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{r.count}</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${(r.count / 23) * 100}%`, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detection Methods */}
          <div className="card">
            <div className="card-header"><h3>🛡️ AI Detection Methods</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {[
                { icon: '📋', name: 'Duplicate Detection', desc: 'Survey no., owner & area cross-matching', status: 'Active' },
                { icon: '🛰️', name: 'Satellite Area Verify', desc: 'AI compares records vs aerial imagery', status: 'Active' },
                { icon: '🔄', name: 'Ownership Pattern AI', desc: 'Detects rapid / suspicious transfers', status: 'Active' },
                { icon: '💰', name: 'Value Anomaly Model', desc: 'Flags under-assessed properties', status: 'Active' },
                { icon: '📄', name: 'Exemption Audit', desc: 'Verifies agricultural/other exemptions', status: 'Active' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.desc}</div>
                  </div>
                  <span className="badge badge-success">{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div className="card">
          <div className="card-header">
            <h3>⚠️ Active Fraud Alerts</h3>
            <div style={{ display: 'flex', gap: 5 }}>
              {['all', 'high', 'medium', 'low'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {filtered.map((alert, i) => (
              <div key={alert.id} style={{ padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', opacity: resolved[alert.id] ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{alert.type}</span>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Property: <strong>{alert.property}</strong> &bull; {alert.area} &bull; {alert.detected}</div>
                  </div>
                  <span className={`badge ${sevColor[alert.severity]}`}>{alert.severity}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{alert.details}</div>

                {/* Risk Score Bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>
                    <span>AI Risk Score</span><span style={{ fontWeight: 700, color: alert.score > 80 ? '#e02424' : alert.score > 60 ? '#f59e0b' : '#057a55' }}>{alert.score}/100</span>
                  </div>
                  <div className="progress">
                    <div className={`progress-bar ${alert.score > 80 ? 'progress-danger' : alert.score > 60 ? 'progress-warning' : 'progress-success'}`} style={{ width: `${alert.score}%` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {resolved[alert.id] ? (
                    <span className="badge badge-success" style={{ padding: '5px 10px' }}>✅ Resolved</span>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-danger" onClick={() => setSelected(selected?.id === alert.id ? null : alert)}>
                        {selected?.id === alert.id ? '▲ Close' : '📋 AI Report'}
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setResolved(r => ({ ...r, [alert.id]: true }))}>✅ Resolve</button>
                    </>
                  )}
                  <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>{alert.action}</span>
                </div>

                {selected?.id === alert.id && (
                  <div style={{ marginTop: 12, padding: 14, background: '#fdf2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>🤖 AI Analysis Report</div>
                    <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6 }}>
                      <div><strong>Owner:</strong> {alert.owner}</div>
                      <div><strong>Detected:</strong> {alert.detected}</div>
                      <div><strong>Risk Score:</strong> {alert.score}/100</div>
                      <div><strong>Current Action:</strong> {alert.action}</div>
                      <div style={{ marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 6 }}>{alert.details}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
