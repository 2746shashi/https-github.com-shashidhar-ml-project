// ─── Mock Property Data ───────────────────────────────────────────────
export const properties = [
  { id: 'P001', owner: 'Rajesh Kumar', type: 'Residential', area: 1200, location: 'Koramangala', usage: 'Self-occupied', assessedValue: 4500000, taxDue: 18000, status: 'Paid', year: 2024, floors: 2, age: 10 },
  { id: 'P002', owner: 'Priya Sharma', type: 'Commercial', area: 2400, location: 'MG Road', usage: 'Rented', assessedValue: 12000000, taxDue: 96000, status: 'Overdue', year: 2024, floors: 3, age: 8 },
  { id: 'P003', owner: 'Suresh Patel', type: 'Residential', area: 800, location: 'Whitefield', usage: 'Self-occupied', assessedValue: 3200000, taxDue: 12800, status: 'Paid', year: 2024, floors: 1, age: 5 },
  { id: 'P004', owner: 'Anita Nair', type: 'Industrial', area: 5000, location: 'Electronic City', usage: 'Rented', assessedValue: 22000000, taxDue: 220000, status: 'Pending', year: 2024, floors: 1, age: 15 },
  { id: 'P005', owner: 'Mohammed Ali', type: 'Commercial', area: 1800, location: 'Indiranagar', usage: 'Rented', assessedValue: 9000000, taxDue: 72000, status: 'Paid', year: 2024, floors: 2, age: 12 },
  { id: 'P006', owner: 'Deepa Reddy', type: 'Residential', area: 950, location: 'HSR Layout', usage: 'Self-occupied', assessedValue: 3800000, taxDue: 15200, status: 'Overdue', year: 2024, floors: 2, age: 7 },
  { id: 'P007', owner: 'Vikram Singh', type: 'Vacant Land', area: 3000, location: 'Sarjapur', usage: 'Vacant', assessedValue: 8000000, taxDue: 40000, status: 'Pending', year: 2024, floors: 0, age: 0 },
  { id: 'P008', owner: 'Kavitha Menon', type: 'Residential', area: 1500, location: 'Jayanagar', usage: 'Self-occupied', assessedValue: 6000000, taxDue: 24000, status: 'Paid', year: 2024, floors: 2, age: 20 },
  { id: 'P009', owner: 'Arun Krishnan', type: 'Commercial', area: 3200, location: 'Whitefield', usage: 'Rented', assessedValue: 18000000, taxDue: 144000, status: 'Paid', year: 2024, floors: 4, age: 6 },
  { id: 'P010', owner: 'Meena Pillai', type: 'Residential', area: 600, location: 'Koramangala', usage: 'Rented', assessedValue: 2700000, taxDue: 21600, status: 'Overdue', year: 2024, floors: 1, age: 18 },
];

export const fraudAlerts = [
  { id: 'FA001', type: 'Duplicate Registration', property: 'P-1198/B', owner: 'Ramesh Gupta', severity: 'high', details: 'Same survey number registered twice under different owner names – Ramesh Gupta (2018) and R. Gupta Enterprises (2023). AI cross-referenced PAN details.', score: 94, detected: '2024-01-15', area: 'Koramangala', action: 'Escalated to Legal' },
  { id: 'FA002', type: 'Area Mismatch', property: 'P-2244/C', owner: 'Sunita Rao', severity: 'high', details: 'Registered area 4,200 sq ft vs satellite measurement 1,800 sq ft. Difference of 2,400 sq ft may indicate ~₹1.2L annual tax evasion.', score: 87, detected: '2024-01-18', area: 'MG Road', action: 'Field Inspection Scheduled' },
  { id: 'FA003', type: 'Suspicious Ownership Transfer', property: 'P-3310/A', owner: 'Ajay Verma', severity: 'medium', details: 'Ownership changed 4 times in 6 months across related parties. Pattern matches known tax avoidance circular transfer scheme.', score: 72, detected: '2024-01-20', area: 'Indiranagar', action: 'Under Review' },
  { id: 'FA004', type: 'Undervalued Assessment', property: 'P-4502/D', owner: 'Lakshmi Iyer', severity: 'medium', details: 'Assessed value ₹32L vs AI-estimated market value ₹82L for HSR Layout zone. Potential ₹40K/yr underpayment.', score: 68, detected: '2024-01-22', area: 'HSR Layout', action: 'Reassessment Queued' },
  { id: 'FA005', type: 'Fake Exemption Claim', property: 'P-5678/E', owner: 'Kiran Desai', severity: 'medium', details: 'Agricultural land exemption claimed for 3,000 sq ft property in urban residential zone, saving ₹28K/yr illegally.', score: 61, detected: '2024-01-25', area: 'Sarjapur', action: 'Verification Pending' },
  { id: 'FA006', type: 'Ghost Property', property: 'P-6890/F', owner: 'Rajan & Sons', severity: 'low', details: 'Property records exist but address does not match any building in satellite/street view data. May be demolished or fictitious entry.', score: 48, detected: '2024-01-28', area: 'Whitefield', action: 'Physical Verification' },
];

export const taxReminders = [
  { id: 'R001', owner: 'Priya Sharma', property: 'P002', amount: 96000, dueDate: '2024-02-15', riskScore: 89, daysOverdue: 12, channel: 'SMS + Email', phone: '+91 98765 43210', aiMessage: 'Dear Priya Sharma, your commercial property tax of ₹96,000 for P002 (MG Road) is 12 days overdue. Pay now to avoid 2% monthly penalty. Link: pay.bbmp.gov.in/P002' },
  { id: 'R002', owner: 'Deepa Reddy', property: 'P006', amount: 15200, dueDate: '2024-02-20', riskScore: 75, daysOverdue: 7, channel: 'Email', phone: '+91 99887 76655', aiMessage: 'Dear Deepa Reddy, gentle reminder: ₹15,200 property tax for P006 (HSR Layout) is due. 7 days overdue. Early payment avoids penalties.' },
  { id: 'R003', owner: 'Vikram Singh', property: 'P007', amount: 40000, dueDate: '2024-03-01', riskScore: 62, daysOverdue: 0, channel: 'SMS', phone: '+91 77665 54433', aiMessage: 'Dear Vikram Singh, your property tax of ₹40,000 for P007 (Sarjapur) is due on March 1. Pay early and get 1% discount via online payment.' },
  { id: 'R004', owner: 'Anita Nair', property: 'P004', amount: 220000, dueDate: '2024-03-10', riskScore: 45, daysOverdue: 0, channel: 'Email + SMS', phone: '+91 88776 65544', aiMessage: 'Dear Anita Nair, upcoming payment reminder: Industrial property P004 (Electronic City) tax of ₹2,20,000 due March 10. Schedule payment to avoid disruption.' },
  { id: 'R005', owner: 'Meena Pillai', property: 'P010', amount: 21600, dueDate: '2024-02-10', riskScore: 91, daysOverdue: 18, channel: 'SMS + Email + Call', phone: '+91 91234 56789', aiMessage: 'URGENT: Meena Pillai, property P010 (Koramangala) tax ₹21,600 is 18 days overdue. Legal notice will be issued in 7 days if unpaid.' },
];

export const revenueData = [
  { month: 'Apr', collected: 8.2, target: 9.0, predicted: 8.5 },
  { month: 'May', collected: 9.4, target: 9.5, predicted: 9.6 },
  { month: 'Jun', collected: 7.8, target: 9.0, predicted: 8.2 },
  { month: 'Jul', collected: 10.2, target: 10.0, predicted: 10.4 },
  { month: 'Aug', collected: 9.6, target: 9.5, predicted: 9.8 },
  { month: 'Sep', collected: 11.1, target: 10.5, predicted: 11.3 },
  { month: 'Oct', collected: 10.8, target: 10.5, predicted: 11.0 },
  { month: 'Nov', collected: 12.4, target: 11.0, predicted: 12.6 },
  { month: 'Dec', collected: 13.2, target: 12.0, predicted: 13.5 },
  { month: 'Jan', collected: 11.9, target: 12.0, predicted: 12.1 },
  { month: 'Feb', collected: 14.1, target: 13.0, predicted: 14.4 },
  { month: 'Mar', collected: 15.6, target: 14.0, predicted: null },
];

export const areaStats = [
  { area: 'Koramangala', properties: 1240, collected: 98.2, avgTax: 24500, growth: 8.2 },
  { area: 'MG Road', properties: 540, collected: 78.4, avgTax: 112000, growth: 3.1 },
  { area: 'Whitefield', properties: 2180, collected: 94.6, avgTax: 18200, growth: 11.4 },
  { area: 'Indiranagar', properties: 980, collected: 91.3, avgTax: 45000, growth: 6.8 },
  { area: 'HSR Layout', properties: 1560, collected: 85.7, avgTax: 21000, growth: 9.3 },
  { area: 'Jayanagar', properties: 1120, collected: 96.4, avgTax: 28000, growth: 4.5 },
  { area: 'Electronic City', properties: 420, collected: 72.1, avgTax: 185000, growth: 14.2 },
  { area: 'Sarjapur', properties: 760, collected: 67.8, avgTax: 52000, growth: 17.6 },
];

// ─── AI Tax Calculation Engine ────────────────────────────────────────
export function calculateAITax({ type, area, location, usage, age, floors }) {
  const baseRates = { Residential: 0.4, Commercial: 0.8, Industrial: 1.0, 'Vacant Land': 0.5, Agricultural: 0.1 };
  const locationMultipliers = { 'MG Road': 2.2, Koramangala: 1.8, Indiranagar: 1.9, 'HSR Layout': 1.5, Whitefield: 1.4, Jayanagar: 1.6, 'Electronic City': 1.3, Sarjapur: 1.1, Other: 1.0 };
  const usageMultipliers = { 'Self-occupied': 1.0, Rented: 1.25, Vacant: 0.75, Commercial: 1.5 };

  const rate = baseRates[type] || 0.4;
  const locMult = locationMultipliers[location] || 1.0;
  const useMult = usageMultipliers[usage] || 1.0;
  const ageDed = age >= 30 ? 0.2 : age >= 20 ? 0.15 : age >= 10 ? 0.1 : age >= 5 ? 0.05 : 0;
  const floorBonus = floors > 3 ? 1.1 : 1.0;

  const psf = type === 'Commercial' ? 8000 : type === 'Industrial' ? 6000 : 4500;
  const estimatedValue = Math.round(area * psf * locMult * (1 - age * 0.004));
  const annualValue = Math.round(estimatedValue * 0.06);
  const baseTax = Math.round(annualValue * (rate / 100) * (area / 100));
  const adjustedTax = Math.round(baseTax * useMult * floorBonus * (1 - ageDed));
  const penalty = ageDed > 0 ? 0 : 0;
  const swachBharat = Math.round(adjustedTax * 0.06);
  const educationCess = Math.round(adjustedTax * 0.02);
  const total = adjustedTax + swachBharat + educationCess;

  return {
    estimatedValue,
    annualValue,
    baseTax,
    adjustedTax,
    swachBharat,
    educationCess,
    total,
    effectiveRate: ((total / estimatedValue) * 100).toFixed(3),
    breakdown: {
      'Base Rate': `${rate}%`,
      'Location Multiplier': `${locMult}x (${location})`,
      'Usage Factor': `${useMult}x`,
      'Age Deduction': `${(ageDed * 100).toFixed(0)}%`,
      'Floor Surcharge': `${floorBonus}x`,
      'Swachh Bharat Cess': '6%',
      'Education Cess': '2%',
    },
    confidence: Math.floor(85 + Math.random() * 12),
    aiInsights: [
      `📍 ${location} zone attracts ${locMult}x multiplier — ${locMult > 1.7 ? 'premium' : locMult > 1.4 ? 'mid-premium' : 'standard'} location.`,
      `🏗️ ${usage} usage category applies ${useMult}x factor to base computation.`,
      ageDed > 0 ? `🏠 Property age (${age}+ yrs) qualifies for ${(ageDed * 100).toFixed(0)}% depreciation benefit.` : `🏠 New property — no depreciation deduction applicable.`,
      `📊 Effective tax rate of ${((total / estimatedValue) * 100).toFixed(3)}% is ${((total / estimatedValue) * 100) < 0.5 ? 'below' : 'within'} Bengaluru average.`,
    ],
  };
}

// ─── AI Value Prediction Engine ───────────────────────────────────────
export function predictPropertyValue({ type, area, location, age }) {
  const locMult = { 'MG Road': 2.2, Koramangala: 1.8, Indiranagar: 1.9, 'HSR Layout': 1.5, Whitefield: 1.4, Jayanagar: 1.6, 'Electronic City': 1.3, Sarjapur: 1.1, Other: 1.0 };
  const growthRates = { 'MG Road': 0.06, Koramangala: 0.10, Indiranagar: 0.09, 'HSR Layout': 0.10, Whitefield: 0.12, Jayanagar: 0.07, 'Electronic City': 0.14, Sarjapur: 0.16, Other: 0.08 };
  const psf = type === 'Commercial' ? 8000 : type === 'Industrial' ? 6000 : 4500;
  const mult = locMult[location] || 1.0;
  const gr = growthRates[location] || 0.08;
  const current = Math.round(area * psf * mult * (1 - age * 0.004));

  return {
    currentValue: current,
    oneYear: Math.round(current * (1 + gr)),
    threeYear: Math.round(current * Math.pow(1 + gr, 3)),
    fiveYear: Math.round(current * Math.pow(1 + gr, 5)),
    annualGrowth: `${(gr * 100).toFixed(0)}-${(gr * 100 + 3).toFixed(0)}%`,
    marketTrend: gr > 0.12 ? 'Strongly Bullish 🚀' : gr > 0.08 ? 'Bullish 📈' : 'Stable ➡️',
    demandIndex: Math.min(98, Math.floor(55 + mult * 20 + Math.random() * 10)),
    taxTrend: `+${(gr * 50).toFixed(0)}-${(gr * 60).toFixed(0)}% over 5 yrs`,
    confidence: Math.floor(78 + Math.random() * 15),
    growthRate: gr,
    riskLevel: gr > 0.12 ? 'Low' : gr > 0.08 ? 'Medium' : 'High',
    factors: [
      { name: 'Metro Connectivity', impact: 'High', score: mult > 1.7 ? 92 : 74 },
      { name: 'IT Hub Proximity', impact: location.includes('Electronic') || location === 'Whitefield' ? 'High' : 'Medium', score: Math.floor(60 + Math.random() * 30) },
      { name: 'Social Infrastructure', impact: 'Medium', score: Math.floor(65 + Math.random() * 25) },
      { name: 'Road Connectivity', impact: 'High', score: Math.floor(70 + Math.random() * 20) },
    ],
  };
}

export const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN');
export const formatLakh = (val) => '₹' + (val / 100000).toFixed(2) + 'L';
