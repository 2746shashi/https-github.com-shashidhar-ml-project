import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { areaStats } from '../utils/data';

const usageData = [
  { type: 'Self-occ Residential', count: 4820, revenue: 62.4, color: '#1a56db', pct: 55 },
  { type: 'Rented Residential', count: 2310, revenue: 38.2, color: '#7c3aed', pct: 26 },
  { type: 'Commercial Rented', count: 1240, revenue: 98.6, color: '#b45309', pct: 14 },
  { type: 'Commercial Owned', count: 680, revenue: 54.1, color: '#057a55', pct: 8 },
  { type: 'Industrial', count: 420, revenue: 76.8, color: '#e02424', pct: 5 },
  { type: 'Vacant Land', count: 760, revenue: 12.4, color: '#9ca3af', pct: 9 },
];

const trendData = [
  { quarter: 'Q1 23', residential: 42.1, commercial: 28.4, industrial: 18.2 },
  { quarter: 'Q2 23', residential: 44.8, commercial: 31.2, industrial: 19.4 },
  { quarter: 'Q3 23', residential: 46.2, commercial: 29.8, industrial: 21.1 },
  { quarter: 'Q4 23', residential: 48.9, commercial: 33.6, industrial: 22.8 },
  { quarter: 'Q1 24', residential: 51.2, commercial: 35.4, industrial: 23.6 },
  { quarter: 'Q2 24', residential: 53.8, commercial: 38.2, industrial: 25.1 },
];

const aiInsights = [
  { icon: '💡', title: 'Revenue Opportunity', desc: 'Commercial rented properties generate 3.2× more revenue per sq ft than residential. AI identified 240 under-assessed commercial properties worth ₹2.1 Cr additional annual revenue.', color: '#dbeafe', border: '#93c5fd' },
  { icon: '⚠️', title: 'Compliance Gap', desc: 'Electronic City and Sarjapur zones show 30% lower collection rates. AI recommends targeted enforcement + reminder campaigns projected to recover ₹3.4 Cr.', color: '#fef3c7', border: '#fcd34d' },
  { icon: '📊', title: 'Growth Pattern', desc: 'Whitefield and Electronic City show 14-17% YoY property growth. AI flagged 340 new constructions requiring proactive assessment before next FY.', color: '#d1fae5', border: '#6ee7b7' },
];

export default function UsageAnalysis() {
  const [activeInsight, setActiveInsight] = useState(null);

  return (
    <div>
      <div className="stats-grid">
        {[
          { label: 'Residential', value: '7,130', icon: '🏠', sub: '55.5% of total' },
          { label: 'Commercial', value: '1,920', icon: '🏢', sub: '14.9% of total' },
          { label: 'Industrial', value: '420', icon: '🏭', sub: '3.3% of total' },
          { label: 'Vacant Lands', value: '760', icon: '🌿', sub: '5.9% of total' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>🏗️ Usage Type vs Revenue</h3>
            <span className="badge badge-info">AI Analysis</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={usageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}Cr`} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={v => `₹${v} Cr`} />
                <Bar dataKey="revenue" name="Revenue (Cr)" radius={[0, 4, 4, 0]}>
                  {usageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>📈 Quarterly Collection Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}Cr`} />
                <Tooltip formatter={v => `₹${v} Cr`} />
                <Legend />
                <Line type="monotone" dataKey="residential" stroke="#1a56db" strokeWidth={2} dot={{ r: 3 }} name="Residential" />
                <Line type="monotone" dataKey="commercial" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Commercial" />
                <Line type="monotone" dataKey="industrial" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} name="Industrial" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Area Table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>📍 Area-wise Statistics</h3>
          <span className="badge badge-info">AI Insights</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Area</th><th>Properties</th><th>Collection Rate</th><th>Avg Tax/Property</th><th>YoY Growth</th><th>AI Trend</th><th>Status</th></tr>
              </thead>
              <tbody>
                {areaStats.map(a => (
                  <tr key={a.area}>
                    <td><strong>{a.area}</strong></td>
                    <td>{a.properties.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1 }}>
                          <div className={`progress-bar ${a.collected > 90 ? 'progress-success' : a.collected > 75 ? 'progress-warning' : 'progress-danger'}`} style={{ width: `${a.collected}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 38 }}>{a.collected}%</span>
                      </div>
                    </td>
                    <td>₹{a.avgTax.toLocaleString()}</td>
                    <td style={{ color: a.growth > 12 ? '#057a55' : '#1a56db', fontWeight: 600 }}>+{a.growth}%</td>
                    <td style={{ color: a.collected > 90 ? '#057a55' : a.collected > 75 ? '#b45309' : '#e02424', fontWeight: 600, fontSize: 13 }}>
                      {a.collected > 90 ? '📈 Growing' : a.collected > 75 ? '➡️ Stable' : '📉 Needs Attention'}
                    </td>
                    <td><span className={`badge ${a.collected > 90 ? 'badge-success' : a.collected > 75 ? 'badge-warning' : 'badge-danger'}`}>{a.collected > 90 ? 'Excellent' : a.collected > 75 ? 'Good' : 'Action Needed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="card">
        <div className="card-header"><h3>🤖 AI Usage Insights</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {aiInsights.map((insight, i) => (
              <div key={insight.title} style={{ background: insight.color, border: `1px solid ${insight.border}`, borderRadius: 10, padding: 16, cursor: 'pointer' }} onClick={() => setActiveInsight(activeInsight === i ? null : i)}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{insight.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{insight.title}</div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{insight.desc}</div>
                {activeInsight === i && (
                  <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 6, fontSize: 11, color: '#1f2937' }}>
                    💡 <strong>Recommended Action:</strong> {i === 0 ? 'Schedule bulk re-assessment for 240 properties in Q2' : i === 1 ? 'Launch AI reminder campaign targeting Sarjapur & Electronic City zones' : 'Auto-register 340 new constructions detected via satellite API'}
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
