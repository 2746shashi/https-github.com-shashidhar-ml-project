import React, { useState } from 'react';
import { properties, formatCurrency } from '../utils/data';

export default function Properties({ onNav }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = properties.filter(p => {
    const matchSearch = !search || p.owner.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const statusBadge = s => s === 'Paid' ? 'badge-success' : s === 'Overdue' ? 'badge-danger' : 'badge-warning';

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Shown', value: filtered.length, icon: '🏘️' },
          { label: 'Paid', value: properties.filter(p => p.status === 'Paid').length, icon: '✅' },
          { label: 'Pending', value: properties.filter(p => p.status === 'Pending').length, icon: '⏳' },
          { label: 'Overdue', value: properties.filter(p => p.status === 'Overdue').length, icon: '⚠️' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>🏘️ Property Registry</h3>
          <button className="btn btn-primary btn-sm" onClick={() => onNav('register')}>+ Register Property</button>
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input className="form-control" style={{ maxWidth: 260 }} placeholder="🔍 Search by owner, ID or location..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ maxWidth: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {['Residential', 'Commercial', 'Industrial', 'Vacant Land'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {['Paid', 'Pending', 'Overdue'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Location</th>
                <th>Area (sqft)</th>
                <th>Assessed Value</th>
                <th>Tax Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{p.id}</code></td>
                  <td><strong>{p.owner}</strong></td>
                  <td>{p.type}</td>
                  <td>{p.location}</td>
                  <td>{p.area.toLocaleString()}</td>
                  <td>{formatCurrency(p.assessedValue)}</td>
                  <td><strong style={{ color: p.status === 'Overdue' ? '#e02424' : '#1f2937' }}>{formatCurrency(p.taxDue)}</strong></td>
                  <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary">👁 View</button>
                      {p.status !== 'Paid' && <button className="btn btn-sm btn-primary">💳 Pay</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No properties found matching filters</div>
          )}
        </div>
      </div>
    </div>
  );
}
