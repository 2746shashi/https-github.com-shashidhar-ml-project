import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateAITax, formatCurrency } from '../utils/data';

const init = { type: 'Residential', area: '', location: 'Koramangala', usage: 'Self-occupied', age: 0, floors: 1 };

const steps = [
  'Analyzing property type & zone classification...',
  'Applying location zone multipliers...',
  'Computing usage & floor surcharges...',
  'Calculating depreciation factors...',
  'Running AI anomaly checks...',
  'Generating final tax liability + cesses...',
];

export default function TaxCalculator() {
  const [form, setForm] = useState(init);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = () => {
    if (!form.area) return alert('Please enter property area');
    setLoading(true); setResult(null); setStep(0);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setStep(s);
      if (s >= steps.length - 1) {
        clearInterval(interval);
        setTimeout(() => { setResult(calculateAITax(form)); setLoading(false); }, 400);
      }
    }, 220);
  };

  const breakdownChart = result ? [
    { name: 'Base Tax', value: result.baseTax, color: '#1a56db' },
    { name: 'Adjusted Tax', value: result.adjustedTax, color: '#7c3aed' },
    { name: 'Swachh Bharat', value: result.swachBharat, color: '#b45309' },
    { name: 'Education Cess', value: result.educationCess, color: '#057a55' },
  ] : [];

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      {/* LEFT */}
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>🧮 AI Tax Calculator</h3>
            <span className="badge badge-info">AI Powered</span>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select className="form-control" value={form.type} onChange={e => update('type', e.target.value)}>
                  {['Residential', 'Commercial', 'Industrial', 'Vacant Land', 'Agricultural'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Built-up Area (sq ft)</label>
                <input className="form-control" type="number" placeholder="e.g. 1200" value={form.area} onChange={e => update('area', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location / Zone</label>
                <select className="form-control" value={form.location} onChange={e => update('location', e.target.value)}>
                  {['MG Road', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Electronic City', 'Sarjapur', 'Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Property Usage</label>
                <select className="form-control" value={form.usage} onChange={e => update('usage', e.target.value)}>
                  {['Self-occupied', 'Rented', 'Vacant', 'Commercial'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Property Age (years)</label>
                <select className="form-control" value={form.age} onChange={e => update('age', Number(e.target.value))}>
                  {[0, 5, 10, 20, 30].map(a => <option key={a} value={a}>{a === 0 ? 'New (0-4 yrs)' : `${a}+ years`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Floors</label>
                <input className="form-control" type="number" min="1" max="20" value={form.floors} onChange={e => update('floors', e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} onClick={calculate} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> AI Calculating...</> : '🤖 Calculate Tax with AI'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>📋 Tax Rate Reference</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Type</th><th>Base Rate</th><th>Usage Factor</th></tr></thead>
              <tbody>
                {[['Residential', '0.4%', '1.0x – 1.5x'], ['Commercial', '0.8%', '1.25x – 1.5x'], ['Industrial', '1.0%', '1.0x – 1.25x'], ['Vacant Land', '0.5%', '0.75x'], ['Agricultural', '0.1%', '0.5x']].map(r => (
                  <tr key={r[0]}><td>{r[0]}</td><td><strong>{r[1]}</strong></td><td>{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div>
        {loading && (
          <div className="card">
            <div className="card-body">
              <div className="ai-thinking" style={{ marginBottom: 16 }}>
                <span className="spinner" />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>AI analyzing property data...</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>Applying BBMP 2024 tax rules & location trends</div>
                </div>
              </div>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < steps.length - 1 ? '1px solid #f3f4f6' : 'none', color: i <= step ? '#1a56db' : '#9ca3af', fontSize: 12, fontWeight: i <= step ? 600 : 400 }}>
                  {i <= step ? <span style={{ color: '#057a55' }}>✅</span> : <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <>
            <div className="ai-panel" style={{ marginBottom: 16 }}>
              <div className="ai-panel-title">🤖 AI Tax Calculation Result — Confidence {result.confidence}%</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Total Annual Tax', value: formatCurrency(result.total), bg: '#1a56db' },
                  { label: 'Market Value (Est.)', value: formatCurrency(result.estimatedValue), bg: '#7c3aed' },
                  { label: 'Swachh Bharat Cess', value: formatCurrency(result.swachBharat), bg: '#b45309' },
                  { label: 'Effective Tax Rate', value: result.effectiveRate + '%', bg: '#057a55' },
                ].map(m => (
                  <div key={m.label} style={{ background: m.bg, borderRadius: 8, padding: '12px 14px', color: 'white' }}>
                    <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {result.aiInsights.map((ins, i) => (
                <div key={i} style={{ fontSize: 12, color: '#1e429f', background: '#eff6ff', borderRadius: 6, padding: '7px 10px', marginBottom: 6 }}>{ins}</div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><h3>📊 Tax Component Breakdown</h3></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={breakdownChart} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={v => formatCurrency(v)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {breakdownChart.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>📅 Quarterly Payment Schedule</h3></div>
              <div className="card-body" style={{ padding: 0 }}>
                <table>
                  <thead><tr><th>Quarter</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {[['Q1', 'Apr 30, 2024'], ['Q2', 'Jul 31, 2024'], ['Q3', 'Oct 31, 2024'], ['Q4', 'Jan 31, 2025']].map(([q, d], i) => (
                      <tr key={q}>
                        <td>{q}</td>
                        <td style={{ color: '#6b7280' }}>{d}</td>
                        <td><strong>{formatCurrency(Math.round(result.total / 4))}</strong></td>
                        <td><span className={`badge ${i === 0 ? 'badge-success' : 'badge-gray'}`}>{i === 0 ? '✅ Paid' : 'Upcoming'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!result && !loading && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: 54, marginBottom: 16 }}>🧮</div>
              <h3 style={{ marginBottom: 8 }}>AI Tax Calculation Ready</h3>
              <p style={{ color: '#6b7280', fontSize: 13 }}>Fill in property details and click "Calculate Tax with AI" for instant, accurate computation using BBMP 2024 rules with AI confidence scoring.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
