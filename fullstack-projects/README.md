# Full-Stack Projects

Your four files, rebuilt as real full-stack apps (React frontend + API backend + database).

| Project | Frontend | Backend | Data |
|---|---|---|---|
| **AI Learning Assistant** (`ai-assistant/`) | React + Vite · `:5173` | Node / Express · `:5000` | SQLite chat history |
| **FinFlow India** (`loan-platform/frontend-finflow`) from `LoanApp.jsx` | React + Vite · `:5174` | FastAPI · `:8000` | SQLite via SQLAlchemy |
| **LoanSetu** (`loan-platform/frontend-loansetu`) from `LoanApprovalApp.jsx` | React + Vite · `:5175` | same FastAPI · `:8000` | same database |
| **SmartLoan AI** (`smartloan-ml-web/`) from `SmartLoan_AI.py` | React + Vite · `:5176` | same FastAPI · `:8000` (`/api/ml/predict`) | scikit-learn ensemble |

Both loan frontends share one backend, so a loan applied for in one UI shows up in the admin view of the other.

## Run it (4 terminals)

```bash
# 1. Loan + ML backend  (Python 3.10+)
cd loan-platform/backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000               # trains the ML models on startup (~10 s)

# 2. AI assistant backend  (Node 18+)
cd ai-assistant/backend
cp .env.example .env        # put your ANTHROPIC_API_KEY in .env
npm install && npm start

# 3. Frontends — run whichever you want to see
cd ai-assistant/frontend            && npm install && npm run dev   # :5173
cd loan-platform/frontend-finflow   && npm install && npm run dev   # :5174
cd loan-platform/frontend-loansetu  && npm install && npm run dev   # :5175
cd smartloan-ml-web/frontend        && npm install && npm run dev   # :5176
```
API docs for the loan backend: http://localhost:8000/docs

## Demo logins (loan apps)
OTP login is real (server generates, stores and expires codes). With `DEBUG_OTP=true` (default in dev) the code is
shown on screen and printed in the backend console.
- **Admin:** `9999999999`
- **Customer:** `9876543210` (any other 10-digit number creates a new customer)

## What changed vs. your original files
- **AI assistant:** the browser no longer calls Anthropic directly. The key lives on the server, requests are rate-limited,
  and conversations persist in SQLite (survive refresh).
- **Loan apps:** every mock array / `setTimeout` fake is replaced by an API call — OTP + JWT auth with server-enforced roles,
  KYC file upload, loan applications, EMI schedule + pay, admin approve / reject / disburse, live stats, risk engine, fraud alerts.
- **SmartLoan:** the ML engine (data generation, 3-model ensemble, rules, bank matching, EMI) is ported unchanged into
  `loan-platform/backend/app/ml_engine.py` and exposed as `POST /api/ml/predict`. Your Tkinter original is kept in
  `smartloan-ml-web/desktop-original/`.
- Fixed two JSX bugs that stopped `LoanApprovalApp.jsx` from compiling: a bare `<` in `NPA < 5%` and one extra `</div>` in the Architecture tab.

## Known limits (be honest in a demo / viva)
- Credit score is stored per user (default 742), not pulled from a real bureau. KYC "face match %" in LoanSetu is cosmetic;
  uploaded files are saved but not OCR'd or verified.
- `ml_engine` trains on **synthetic** data (as in your original), so accuracy numbers describe the synthetic rule, not real lending.
- Charts like the monthly trend in LoanSetu's admin overview are still static demo data.
- SQLite is fine for a demo; set the `DATABASE_URL` env var to a PostgreSQL URL (add `psycopg2-binary` to requirements) for production.

## Deploy
- Backends: `docker compose up --build` (needs `ANTHROPIC_API_KEY` and `SECRET_KEY` env vars), or Render / Railway / Fly.io.
- Frontends: `npm run build`, upload `dist/` to Netlify / Vercel, with env var `VITE_API_URL=https://<your-backend>/api`.
- Production checklist: `DEBUG_OTP=false`, real SMS provider in `send_otp`, strong `SECRET_KEY`, set `CORS_ORIGINS` to your frontend URLs.
