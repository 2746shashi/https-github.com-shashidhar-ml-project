# PropertyTax Pro — Management System

A full-featured Property Tax Calculator built with React.

## Features
- **Dashboard** — Live stats: collection %, type-wise breakdown, recent payments
- **Register Property** — Add owners and properties; auto-generates tax bill
- **Calculate Tax** — View rate table, property-wise breakdown, all bills
- **Pay Tax** — Mark bills as paid (with overdue penalty calculation at 12%/yr)
- **Payment History** — Filter by year, total collected stats
- **Admin Panel** — Set/edit tax rates, reports, reset demo data

## Tax Formula
```
Annual Tax = Area (sqft) × Rate per sqft (by Property Type + Usage)
Penalty    = Tax Amount × 12% × Years Overdue  (if unpaid in prior years)
```

---

## How to Run in VS Code

### Prerequisites
Make sure you have:
- **Node.js** (v16+): https://nodejs.org
- **npm** (comes with Node)

### Step 1 — Open in VS Code
```bash
# Open VS Code in the project folder
code property-tax-app
```
Or open VS Code → File → Open Folder → select `property-tax-app`

### Step 2 — Install dependencies
Open the **Terminal** in VS Code (`Ctrl+\`` or View → Terminal):
```bash
npm install
```

### Step 3 — Start the app
```bash
npm start
```
The app opens automatically at **http://localhost:3000**

---

## VS Code Tips

### Recommended Extensions
- **ES7+ React/Redux/React-Native Snippets** — code snippets
- **Prettier** — auto-format on save
- **ESLint** — linting

### Useful Commands (in VS Code Terminal)
| Command | Description |
|---------|-------------|
| `npm start` | Start dev server (hot reload) |
| `npm run build` | Build for production |

### Keyboard Shortcuts
- `Ctrl+\`` — Open terminal
- `Ctrl+Shift+P` → "React: Start" — if you have the extension

---

## Project Structure
```
src/
├── data/
│   └── db.js            # LocalStorage data layer + seed data
├── pages/
│   ├── Home.js          # Dashboard
│   ├── RegisterProperty.js
│   ├── CalculateTax.js
│   ├── PayTax.js
│   ├── PaymentHistory.js
│   └── Admin.js
├── utils/
│   └── taxUtils.js      # Tax calc, penalty, formatting
├── App.js               # Layout + navigation
└── App.css              # All styles (dark theme)
```
