# 🏛️ AI Property Tax Management System

A full-stack React application with 6 AI-powered features for municipal property tax management.

---

## 🚀 How to Run in VS Code

### Prerequisites
Install these before starting:
- [Node.js 18+](https://nodejs.org/) — download and install
- [VS Code](https://code.visualstudio.com/)

Verify installation:
```bash
node --version    # Should show v18+ or v20+
npm --version     # Should show 9+ or 10+
```

---

### Step 1: Open in VS Code

1. Copy the `property-tax-app` folder to your desktop or any location
2. Open VS Code
3. Go to **File → Open Folder**
4. Select the `property-tax-app` folder
5. Click **Open**

---

### Step 2: Open Terminal in VS Code

- Press `` Ctrl + ` `` (backtick) to open the integrated terminal
- Or go to **Terminal → New Terminal**

---

### Step 3: Install Dependencies

```bash
npm install
```

This installs React, Recharts, Lucide icons, and all dependencies (~2 minutes).

---

### Step 4: Start the App

```bash
npm start
```

The app will automatically open at **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
property-tax-app/
├── public/
│   └── index.html              ← HTML shell
├── src/
│   ├── App.js                  ← Main app with routing
│   ├── index.js                ← React entry point
│   ├── index.css               ← Global styles
│   ├── components/
│   │   └── Sidebar.js          ← Navigation sidebar
│   ├── pages/
│   │   ├── Dashboard.js        ← Feature 6: AI Analytics Dashboard
│   │   ├── TaxCalculator.js    ← Feature 1: AI Smart Tax Calculation
│   │   ├── ValuePrediction.js  ← Feature 2: AI Property Value Prediction
│   │   ├── FraudDetection.js   ← Feature 3: AI Fraud & Duplicate Detection
│   │   ├── Reminders.js        ← Feature 4: AI Payment Reminders
│   │   ├── UsageAnalysis.js    ← Feature 5: AI Property Usage Analysis
│   │   ├── Properties.js       ← Property Registry with search/filter
│   │   └── RegisterProperty.js ← Multi-step registration form
│   └── utils/
│       └── data.js             ← Mock data + AI calculation engine
└── package.json
```

---

## 🤖 AI Features Overview

| Feature | Page | What it Does |
|---------|------|-------------|
| AI Tax Calculator | `/tax-calc` | Calculates tax using type, location, usage, age factors |
| Value Prediction | `/value-predict` | 5-year property value forecast with trend chart |
| Fraud Detection | `/fraud` | Scans records for duplicates, anomalies, suspicious patterns |
| Payment Reminders | `/reminders` | Risk-scored reminders via SMS/Email/Push |
| Usage Analysis | `/usage` | Area-wise stats, type vs revenue breakdown |
| Analytics Dashboard | `/dashboard` | Revenue trends, collection rates, AI health metrics |

---

## 🛠️ VS Code Recommended Extensions

Install these for the best development experience:

- **ES7+ React/Redux/React-Native snippets** — React code shortcuts
- **Prettier - Code formatter** — Auto-format on save
- **ESLint** — Catch code errors
- **Auto Rename Tag** — HTML/JSX tag renaming

To install: Press `Ctrl+Shift+X`, search the name, click Install.

---

## ⚡ Available Commands

```bash
npm start       # Start development server (localhost:3000)
npm run build   # Build production bundle (creates /build folder)
```

---

## 🔧 Customization

### Change mock data
Edit `src/utils/data.js` to update:
- Property records
- Fraud alerts
- Revenue figures
- AI calculation rates

### Add real Anthropic AI
Replace the calculation functions in `data.js` with actual API calls:

```javascript
// Example: Replace calculateAITax with real Claude API call
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: `Calculate property tax for: ${JSON.stringify(propertyData)}` }]
  })
});
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Run `npm install --legacy-peer-deps` |
| Port 3000 in use | Run `npm start` — it will ask to use port 3001, press Y |
| Blank white screen | Open browser console (F12), check for errors |
| Charts not showing | Recharts may not be installed — run `npm install recharts` |

---

## 📞 Support
For issues, check the browser console (F12 → Console tab) for error messages.
