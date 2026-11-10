import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TaxCalculator from './pages/TaxCalculator';
import ValuePrediction from './pages/ValuePrediction';
import FraudDetection from './pages/FraudDetection';
import Reminders from './pages/Reminders';
import UsageAnalysis from './pages/UsageAnalysis';
import Properties from './pages/Properties';
import RegisterProperty from './pages/RegisterProperty';

const pages = {
  dashboard: { title: 'AI Analytics Dashboard', sub: 'Real-time property tax insights powered by AI', icon: '📊' },
  properties: { title: 'Property Registry', sub: 'Manage and search all registered properties', icon: '🏘️' },
  'tax-calc': { title: 'AI Tax Calculator', sub: 'Intelligent property tax computation engine', icon: '🧮' },
  'value-predict': { title: 'Property Value Prediction', sub: 'AI-powered market value forecasting', icon: '📈' },
  fraud: { title: 'AI Fraud & Duplicate Detection', sub: 'Real-time anomaly detection in property records', icon: '🔍' },
  reminders: { title: 'Tax Payment Reminders', sub: 'AI-driven payment prediction and notifications', icon: '🔔' },
  usage: { title: 'Property Usage Analysis', sub: 'AI insights on usage patterns and tax trends', icon: '🏗️' },
  register: { title: 'Register New Property', sub: 'AI-assisted property registration with instant verification', icon: '➕' },
  payments: { title: 'Payments', sub: 'Process and track tax payments', icon: '💳' },
  reports: { title: 'Reports', sub: 'Generate tax collection reports', icon: '📄' },
};

function PlaceholderPage({ page }) {
  return (
    <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="card-body" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{page.icon}</div>
        <h2 style={{ marginBottom: 8 }}>{page.title}</h2>
        <p style={{ color: '#6b7280' }}>{page.sub}</p>
        <div style={{ marginTop: 20 }}>
          <span className="badge badge-info">Coming Soon / In Development</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('dashboard');
  const page = pages[active] || pages.dashboard;

  const renderPage = () => {
    switch (active) {
      case 'dashboard': return <Dashboard />;
      case 'properties': return <Properties onNav={setActive} />;
      case 'tax-calc': return <TaxCalculator />;
      case 'value-predict': return <ValuePrediction />;
      case 'fraud': return <FraudDetection />;
      case 'reminders': return <Reminders />;
      case 'usage': return <UsageAnalysis />;
      case 'register': return <RegisterProperty />;
      default: return <PlaceholderPage page={page} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar active={active} onNav={setActive} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{page.title}</h1>
            <p>{page.sub}</p>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn">📥 Export</button>
            <button className="topbar-btn primary" onClick={() => setActive('register')}>+ Register Property</button>
          </div>
        </div>
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
