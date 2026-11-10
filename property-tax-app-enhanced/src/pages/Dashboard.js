import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { revenueData, areaStats, formatCurrency } from '../utils/data';

const pieData = [
  { name: 'Residential', value: 58, color: '#1a56db' },
  { name: 'Commercial', value: 24, color: '#7c3aed' },
  { name: 'Industrial', value: 10, color: '#b45309' },
  { name: 'Vacant Land', value: 8, color: '#057a55' },
];

const aiInsights = [
  { icon: '🔺', text: 'Electronic City & Sarjapur show 17% property growth — update assessments for 340 new buildings.', type: 'warning' },
  { icon: '💡', text: 'Commercial rented properties generate 3.2× more revenue per sq ft. 240 under-assessed records found.', type: 'info' },
  { icon: '✅', text: 'Koramangala achieved 98.2% collection rate — highest in Bengaluru. Recommend as model zone.', type: 'success' },
  { icon: '⚠️', text: 'Sarjapur collection rate dropped to 67.8%. AI recommends targeted SMS reminder campaign.', type: 'danger' },
];

export default function Dashboard() {
  const [aiTick, setAiTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setAiTick(x => (x + 1) % aiInsights.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* KPI Stats */}
      <div className="stats-grid">
        {[
          { icon: '🏘️', label: 'Total Properties', value: '12,847', change: '↑ 3.2% from last year', up: true },
          { icon: '💰', label: 'Revenue Collected (FY)', value: '₹134.3 Cr', change: '↑ 11.4% vs target', up: true },
          { icon: '⚠️', label: 'Overdue Payments', value: '₹18.2 Cr', change: '↑ 2.1% month-on-month', up: false },
          { icon: '🔍', label: 'Fraud Alerts (AI)', value: '23', change: '5 high priority today', up: false },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.up ? 'change-up' : 'change-down'}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Live AI Insight Banner */}
      <div style={{ background: 'linear-gradient(135deg,#1a56db,#7c3aed)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, color: 'white' }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 3, fontWeight: 600, letterSpacing: '0.05em' }}>LIVE AI INSIGHT</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{aiInsights[aiTick].text}</div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {aiInsights.map((_, i) => (
            <div key={i} onClick={() => setAiTick(i)} style={{ width: 7, height: 7, borderRadius: '50%', background: i === aiTick ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Revenue + Distribution */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>📈 Revenue vs Target (FY 2023-24)</h3>
            <span className="badge badge-success">AI Projected</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a56db" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}Cr`} />
                <Tooltip formatter={v => `₹${v} Cr`} />
                <Legend />
                <Area type="monotone" dataKey="collected" stroke="#1a56db" strokeWidth={2.5} fill="url(#colCollected)" name="Collected" />
                <Line type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                <Line type="monotone" dataKey="predicted" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="AI Predicted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🏗️ Property Type Distribution</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false} fontSize={10}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Area Collection Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>📍 Area-wise Tax Collection Performance</h3>
          <span className="badge badge-info">AI Analysis</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={areaStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="area" tick={{ fontSize: 11 }} width={105} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="collected" radius={[0, 4, 4, 0]} name="Collection %">
                {areaStats.map((entry, i) => (
                  <Cell key={i} fill={entry.collected > 90 ? '#057a55' : entry.collected > 80 ? '#1a56db' : entry.collected > 70 ? '#f59e0b' : '#e02424'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>🔔 Pending Actions</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { label: 'Overdue tax notices to send', count: 148, color: '#e02424' },
              { label: 'Fraud cases under review', count: 23, color: '#b45309' },
              { label: 'New property registrations', count: 67, color: '#1a56db' },
              { label: 'Assessment updates pending', count: 312, color: '#7c3aed' },
              { label: 'Satellite verification queue', count: 56, color: '#059669' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color, fontSize: 15 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🤖 AI System Health</h3></div>
          <div className="card-body">
            {[
              { label: 'Tax Calculation Accuracy', value: 97.4, color: '#1a56db' },
              { label: 'Fraud Detection Precision', value: 91.2, color: '#e02424' },
              { label: 'Value Prediction Accuracy', value: 88.6, color: '#7c3aed' },
              { label: 'Reminder Delivery Rate', value: 99.1, color: '#057a55' },
              { label: 'Duplicate Detection Rate', value: 94.8, color: '#b45309' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{item.value}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
