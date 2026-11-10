// Shared API client for both loan frontends.
const BASE = import.meta.env.VITE_API_URL || "/api";
const getToken = () => localStorage.getItem("token");

async function req(path, { method = "GET", body, form } = {}) {
  const headers = {};
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (res.status === 401) localStorage.removeItem("token");
  if (!res.ok) {
    const d = data?.detail;
    throw new Error(typeof d === "string" ? d : Array.isArray(d) ? d.map(x => x.msg).join(", ") : "Request failed");
  }
  return data;
}

export function pickFile(accept = "image/*,application/pdf") {
  return new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}

export const api = {
  hasToken: () => !!getToken(),
  logout: () => localStorage.removeItem("token"),
  sendOtp: (phone) => req("/auth/send-otp", { method: "POST", body: { phone } }),
  async verifyOtp(phone, otp) {
    const r = await req("/auth/verify-otp", { method: "POST", body: { phone, otp } });
    localStorage.setItem("token", r.token);
    return r;
  },
  me: () => req("/me"),
  updateMe: (b) => req("/me", { method: "PUT", body: b }),
  uploadKyc(docType, file) {
    const f = new FormData(); f.append("doc_type", docType); f.append("file", file);
    return req("/kyc/upload", { method: "POST", form: f });
  },
  eligibility: (annual_income, cibil_score, existing_emi) =>
    req("/eligibility", { method: "POST", body: { annual_income, cibil_score, existing_emi } }),
  applyLoan: (b) => req("/loans", { method: "POST", body: b }),
  myLoans: () => req("/loans/mine"),
  emis: (ref) => req(`/loans/${ref}/emis`),
  payEmi: (ref, month) => req(`/emis/${ref}/${month}/pay`, { method: "POST" }),
  riskEvaluate: (b) => req("/risk/evaluate", { method: "POST", body: b }),
  mlPredict: (b) => req("/ml/predict", { method: "POST", body: b }),
  adminStats: () => req("/admin/stats"),
  adminLoans: (status = "all") => req(`/admin/loans?status=${status}`),
  decide: (ref, action) => req(`/admin/loans/${ref}/${action}`, { method: "POST" }),
  fraudAlerts: () => req("/admin/fraud-alerts"),
  resolveAlert: (ref) => req(`/admin/fraud-alerts/${ref}/resolve`, { method: "POST" }),
};
