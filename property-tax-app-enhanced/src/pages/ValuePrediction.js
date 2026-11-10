import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { predictPropertyValue, formatCurrency } from '../utils/data';

export default function ValuePrediction() {
  const [form, setForm] = useState({ type: 'Residential', area: '', location: 'Koramangala', age: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const predict = () => {
    if (!form.area) return alert('Enter property area');
    setLoading(true); setResult(null);
    setTimeout(() => { setResult(predictPropertyValue(form)); setLoading(false); }, 1800);
  };

  const chartData = result ? [
    { year: '2021', value: Math.round(result.currentValue * 0.78), phase: 'hist' },
    { year: '2022', value: Math.round(result.currentValue * 0.86), phase: 'hist' },
    { year: '2023', value: Math.round(result.currentValue * 0.93), phase: 'hist' },
    { year: '2024', value: result.currentValue, phase: 'current' },
    { year: '2025', value: result.oneYear, phase: 'pred' },
    { year: '2026', value: Math.round(result.oneYear * (1 + result.growthRate)), phase: 'pred' },
    { year: '2027', value: result.threeYear, phase: 'pred' },
    { year: '2028', value: Math.round(result.threeYear * (1 + result.growthRate)), phase: 'pred' },
    { year: '2029', value: result.fiveYear, phase: 'pred' },
  ] : [];

  const radarData = result ? result.factors.map(f => ({ subject: f.name, score: f.score })) : [];

  return (
    <div>
      <div className="grid-2" style={{ alignItems: 'start', marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>📈 Property Value Predictor</h3>
            <span className="badge badge-info">AI Powered</span>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              {[
                { label: 'Property Type', key: 'type', type: 'select', options: ['Residential', 'Commercial', 'Industrial', 'Vacant Land'] },
                { label: 'Area (sq ft)', key: 'area', type: 'number', placeholder: 'e.g. 1500' },
                { label: 'Location', key: 'location', type: 'select', options: ['MG Road', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Electronic City', 'Sarjapur', 'Other'] },
                { label: 'Property Age', key: 'age', type: 'select', options: [0, 5, 10, 20, 30], labels: ['New', '5+ yrs', '10+ yrs', '20+ yrs', '30+ yrs'] },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="form-control" value={form[f.key]} onChange={e => update(f.key, f.key === 'age' ? Number(e.target.value) : e.target.value)}>
                      {f.options.map((o, i) => <option key={o} value={o}>{f.labels ? f.labels[i] : o}</option>)}
                    </select>
                  ) : (
                    <input className="form-control" type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e => update(f.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={predict} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> AI Predicting...</> : '🤖 Predict Property Value'}
            </button>
          </div>
        </div>

        {result ? (
          <div className="ai-panel">
            <div className="ai-panel-title">🤖 AI Prediction — {result.confidence}% Confidence</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Current Value', value: formatCurrency(result.currentValue), color: '#374151' },
                { label: '1-Year Forecast', value: formatCurrency(result.oneYear), color: '#1a56db' },
                { label: '3-Year Forecast', value: formatCurrency(result.threeYear), color: '#7c3aed' },
                { label: '5-Year Forecast', value: formatCurrency(result.fiveYear), color: '#057a55' },
              ].map(m => (
                <div key={m.label} style={{ background: 'white', borderRadius: 8, padding: '10px 12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div className="ai-result-row"><span className="ai-result-label">Annual Growth Rate</span><span className="ai-result-value" style={{ color: '#057a55' }}>{result.annualGrowth}</span></div>
            <div className="ai-result-row"><span className="ai-result-label">Market Trend</span><span className="ai-result-value">{result.marketTrend}</span></div>
            <div className="ai-result-row"><span className="ai-result-label">Demand Index</span><span className="ai-result-value">{result.demandIndex}/100</span></div>
            <div className="ai-result-row"><span className="ai-result-label">Investment Risk</span><span className="ai-result-value"><span className={`badge ${result.riskLevel === 'Low' ? 'badge-success' : result.riskLevel === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{result.riskLevel}</span></span></div>
            <div className="ai-result-row"><span className="ai-result-label">Tax Trend (5yr)</span><span className="ai-result-value">{result.taxTrend}</span></div>
          </div>
        ) : loading ? (
          <div className="card">
            <div className="card-body">
              <div className="ai-thinking" style={{ marginBottom: 16 }}><span className="spinner" /><div>AI analyzing market data & trends...</div></div>
              {['Scanning 5-year historical transactions...', 'Analyzing neighborhood demand index...', 'Checking infrastructure development plans...', 'Applying ML gradient boosting model...', 'Generating 5-year forecast with confidence intervals...'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none', color: '#6b7280', fontSize: 12 }}>
                  <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, flexShrink: 0 }} />{s}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📈</div>
              <h3 style={{ marginBottom: 8 }}>AI Value Prediction Engine</h3>
              <p style={{ color: '#6b7280', fontSize: 13 }}>Enter property details to get AI-powered 5-year value forecasts, market trend analysis, and investment risk scoring.</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3>📊 5-Year Value Trend</h3>
              <span className="badge badge-success">Historical + Predicted</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <ReferenceLine x="2024" stroke="#e5e7eb" strokeDasharray="4 4" label={{ value: 'Today', fontSize: 11, fill: '#9ca3af' }} />
                  <Line type="monotone" dataKey="value" stroke="#1a56db" strokeWidth={2.5} dot={({ cx, cy, payload }) => (
                    <circle key={cx} cx={cx} cy={cy} r={4} fill={payload.phase === 'pred' ? '#7c3aed' : '#1a56db'} stroke="white" strokeWidth={2} />
                  )} name="Property Value" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#1a56db', display: 'inline-block' }} /> Historical</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} /> AI Predicted</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>🎯 Location Score Factors</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="#1a56db" fill="#1a56db" fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip formatter={v => `${v}/100`} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {result.factors.map(f => (
                  <div key={f.name} style={{ background: '#f9fafb', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{f.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{f.score}/100</div>
                    <div className="progress" style={{ marginTop: 4 }}>
                      <div className="progress-bar progress-primary" style={{ width: `${f.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
