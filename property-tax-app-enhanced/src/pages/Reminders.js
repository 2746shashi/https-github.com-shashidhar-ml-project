import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { taxReminders, formatCurrency } from '../utils/data';

const channelData = [
  { channel: 'SMS', sent: 840, opened: 680, paid: 320 },
  { channel: 'Email', sent: 1240, opened: 720, paid: 280 },
  { channel: 'Push', sent: 560, opened: 490, paid: 210 },
  { channel: 'Call', sent: 120, opened: 115, paid: 98 },
];

export default function Reminders() {
  const [sent, setSent] = useState({});
  const [running, setRunning] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);
  const [preview, setPreview] = useState(null);

  const sendReminder = (id) => {
    setSent(s => ({ ...s, [id]: 'sending' }));
    setTimeout(() => setSent(s => ({ ...s, [id]: 'sent' })), 1400);
  };

  const runBulk = () => {
    setRunning(true); setBulkDone(false);
    setTimeout(() => {
      const allSent = {};
      taxReminders.forEach(r => allSent[r.id] = 'sent');
      setSent(allSent); setRunning(false); setBulkDone(true);
    }, 2200);
  };

  return (
    <div>
      <div className="stats-grid">
        {[
          { label: 'Total Overdue', value: '₹18.2 Cr', icon: '⚠️', sub: '148 properties' },
          { label: 'Sent Today', value: '1,240', icon: '📤', sub: '↑ 12% delivery rate' },
          { label: 'AI Prediction Accuracy', value: '89.3%', icon: '🤖', sub: 'Risk model precision' },
          { label: 'Collected via Reminders', value: '₹4.2 Cr', icon: '💰', sub: 'This month' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3>🤖 AI Reminder Engine</h3>
              <span className="badge badge-info">Intelligent</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                AI predicts overdue risk per property and selects the optimal communication channel and send time for maximum collection effectiveness.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Risk Model', value: 'XGBoost v2.1' },
                  { label: 'Training Data', value: '3.2M records' },
                  { label: 'Channels', value: 'SMS, Email, Push, Call' },
                  { label: 'Optimal Send Time', value: 'AI Selected' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {running ? (
                <div className="ai-thinking"><span className="spinner" /><span>AI dispatching smart reminders...</span></div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={runBulk}>
                  🚀 Send All AI-Optimized Reminders
                </button>
              )}
              {bulkDone && (
                <div style={{ background: '#f3faf7', border: '1px solid #84e1bc', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
                  <div style={{ fontWeight: 600, color: '#057a55', fontSize: 13 }}>✅ All {taxReminders.length} reminders dispatched via AI-selected channels!</div>
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 3 }}>Expected collection improvement: +24% based on historical data</div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="card">
            <div className="card-header"><h3>📊 Risk Score Distribution</h3></div>
            <div className="card-body">
              {[
                { label: 'Critical (80-100)', count: 23, pct: 15, color: '#e02424' },
                { label: 'High (60-79)', count: 58, pct: 39, color: '#f59e0b' },
                { label: 'Medium (40-59)', count: 45, pct: 30, color: '#1a56db' },
                { label: 'Low (0-39)', count: 22, pct: 15, color: '#057a55' },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.count} ({r.pct}%)</span>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{ width: `${r.pct}%`, background: r.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="card">
          <div className="card-header">
            <h3>🔔 Reminder Queue</h3>
            <span className="badge badge-warning">{taxReminders.length} pending</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {taxReminders.map((r, i) => (
              <div key={r.id} style={{ padding: '16px 20px', borderBottom: i < taxReminders.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.owner}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Property: {r.property} &bull; {r.phone}</div>
                  </div>
                  <span className={`badge ${r.riskScore > 80 ? 'badge-danger' : r.riskScore > 60 ? 'badge-warning' : 'badge-gray'}`}>
                    Risk: {r.riskScore}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>Amount Due</div>
                    <div style={{ fontWeight: 700, color: '#e02424' }}>{formatCurrency(r.amount)}</div>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>Due Date</div>
                    <div style={{ fontWeight: 600 }}>{r.dueDate}</div>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: '#9ca3af', marginBottom: 2 }}>AI Channel</div>
                    <div style={{ fontWeight: 600, color: '#1a56db' }}>{r.channel}</div>
                  </div>
                </div>
                {r.daysOverdue > 0 && (
                  <div style={{ background: '#fdf2f2', borderRadius: 6, padding: '5px 10px', marginBottom: 10, fontSize: 12, color: '#b91c1c' }}>
                    ⚠️ {r.daysOverdue} days overdue
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sent[r.id] === 'sent' ? (
                    <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>✅ Sent</span>
                  ) : sent[r.id] === 'sending' ? (
                    <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: 12 }}>
                      <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Sending...
                    </span>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => sendReminder(r.id)}>📤 Send</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setPreview(preview?.id === r.id ? null : r)}>
                        {preview?.id === r.id ? '▲ Close' : '👁 Preview AI Message'}
                      </button>
                    </>
                  )}
                </div>
                {preview?.id === r.id && (
                  <div style={{ marginTop: 10, padding: 12, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e429f', marginBottom: 6 }}>🤖 AI-Generated Message Preview</div>
                    <div style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.6 }}>{r.aiMessage}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="card">
        <div className="card-header">
          <h3>📡 AI Channel Performance Analysis</h3>
          <span className="badge badge-info">Last 30 Days</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sent" fill="#e5e7eb" name="Sent" radius={[2, 2, 0, 0]} />
              <Bar dataKey="opened" fill="#1a56db" name="Opened" radius={[2, 2, 0, 0]} />
              <Bar dataKey="paid" fill="#057a55" name="Paid After" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
