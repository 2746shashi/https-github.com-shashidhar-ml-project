import React from 'react';

const navItems = [
  { section: 'Main', items: [
    { id: 'dashboard', icon: '📊', label: 'AI Dashboard' },
    { id: 'properties', icon: '🏘️', label: 'Properties' },
  ]},
  { section: 'AI Features', items: [
    { id: 'tax-calc', icon: '🧮', label: 'AI Tax Calculator' },
    { id: 'value-predict', icon: '📈', label: 'Value Prediction' },
    { id: 'fraud', icon: '🔍', label: 'Fraud Detection', badge: 5 },
    { id: 'reminders', icon: '🔔', label: 'Payment Reminders', badge: 4 },
    { id: 'usage', icon: '🏗️', label: 'Usage Analysis' },
  ]},
  { section: 'Management', items: [
    { id: 'register', icon: '➕', label: 'Register Property' },
    { id: 'payments', icon: '💳', label: 'Payments' },
    { id: 'reports', icon: '📄', label: 'Reports' },
  ]},
];

export default function Sidebar({ active, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏛️</div>
        <h2>PropTax AI</h2>
        <span>Bengaluru Municipal Corporation</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div className="nav-section" key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${active === item.id ? 'active' : ''}`}
                onClick={() => onNav(item.id)}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Logged in as</div>
        <div style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600 }}>Admin Officer</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>Tax Department</div>
      </div>
    </aside>
  );
}
