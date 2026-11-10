import React, { useState } from 'react';

const initialForm = {
  ownerName: '', aadhaar: '', mobile: '', email: '',
  surveyNo: '', type: 'Residential', area: '', floors: '',
  location: 'Koramangala', address: '', usage: 'Self-occupied',
  constructionYear: '', documentNo: '',
};

export default function RegisterProperty() {
  const [form, setForm] = useState(initialForm);
  const [tab, setTab] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [propId] = useState('P' + String(Math.floor(Math.random() * 9000) + 1000));

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-control" type={type} placeholder={placeholder} value={form[key]} onChange={e => update(key, e.target.value)} />
    </div>
  );

  const tabs = ['Owner Details', 'Property Details', 'Documents & Submit'];

  const submit = () => {
    if (!form.ownerName || !form.area) return alert('Fill in required fields');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ marginBottom: 8, color: '#057a55' }}>Property Registered Successfully!</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>AI has processed and verified the property registration.</p>
          <div style={{ background: '#f3faf7', border: '1px solid #84e1bc', borderRadius: 10, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#374151', textAlign: 'left' }}>
              {[
                ['Property ID', propId],
                ['Owner', form.ownerName || 'N/A'],
                ['Type', form.type],
                ['Area', form.area ? `${form.area} sq ft` : 'N/A'],
                ['Location', form.location],
                ['AI Assessment', 'Scheduled within 24 hours'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #d1fae5' }}>
                  <span style={{ color: '#6b7280' }}>{l}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setSubmitted(false); setTab(0); }}>Register Another Property</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h3>➕ New Property Registration</h3>
          <span className="badge badge-info">AI Assisted</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {tabs.map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: tab === i ? '#1a56db' : '#f9fafb', color: tab === i ? 'white' : '#6b7280',
                borderRight: i < 2 ? '1px solid #e5e7eb' : 'none',
              }}>
                {i + 1}. {t}
              </button>
            ))}
          </div>

          {tab === 0 && (
            <div>
              <div className="form-grid-2">
                {field('ownerName', 'Owner Full Name *', 'text', 'e.g. Rajesh Kumar')}
                {field('aadhaar', 'Aadhaar Number', 'text', 'XXXX XXXX XXXX')}
                {field('mobile', 'Mobile Number *', 'tel', '+91 XXXXX XXXXX')}
                {field('email', 'Email Address', 'email', 'owner@email.com')}
              </div>
              <button className="btn btn-primary" onClick={() => setTab(1)}>Next: Property Details →</button>
            </div>
          )}

          {tab === 1 && (
            <div>
              <div className="form-grid-2">
                {field('surveyNo', 'Survey / Khata Number', 'text', 'e.g. 123/456/A')}
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-control" value={form.type} onChange={e => update('type', e.target.value)}>
                    {['Residential', 'Commercial', 'Industrial', 'Vacant Land', 'Agricultural'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {field('area', 'Built-up Area (sq ft) *', 'number', 'e.g. 1200')}
                {field('floors', 'Number of Floors', 'number', '1')}
                <div className="form-group">
                  <label className="form-label">Location / Zone</label>
                  <select className="form-control" value={form.location} onChange={e => update('location', e.target.value)}>
                    {['MG Road', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Electronic City', 'Sarjapur', 'Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Usage Type</label>
                  <select className="form-control" value={form.usage} onChange={e => update('usage', e.target.value)}>
                    {['Self-occupied', 'Rented', 'Vacant', 'Commercial'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                {field('constructionYear', 'Construction Year', 'number', 'e.g. 2010')}
              </div>
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <textarea className="form-control" rows="2" placeholder="Street address, area, city, pincode" value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setTab(0)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setTab(2)}>Next: Documents →</button>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div>
              <div className="ai-panel" style={{ marginBottom: 20 }}>
                <div className="ai-panel-title">🤖 AI Pre-validation Checks</div>
                {[
                  ['Owner Aadhaar Verification', form.aadhaar ? 'Verified ✓' : 'Pending', !!form.aadhaar],
                  ['Duplicate Property Check', form.surveyNo ? 'No Duplicates Found ✓' : 'Pending', !!form.surveyNo],
                  ['Area Validation', form.area ? 'Within acceptable range ✓' : 'Pending', !!form.area],
                  ['Location Zone Mapping', 'Zone B, Ward 56 ✓', true],
                  ['Fraud Risk Score', '8/100 (Low Risk) ✓', true],
                ].map(([label, val, ok]) => (
                  <div className="ai-result-row" key={label}>
                    <span className="ai-result-label">{label}</span>
                    <span className="ai-result-value" style={{ color: ok ? '#057a55' : '#9ca3af', fontSize: 13 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Document Number (Sale Deed / Encumbrance)</label>
                <input className="form-control" type="text" placeholder="e.g. EC/2023/12345" value={form.documentNo} onChange={e => update('documentNo', e.target.value)} />
              </div>
              <div style={{ background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: 8, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Upload Property Documents (PDF, JPG)</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Khata certificate, sale deed, plan approval</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setTab(1)}>← Back</button>
                <button className="btn btn-success btn-lg" onClick={submit}>✅ Submit Registration</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
