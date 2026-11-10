import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Uses the ML endpoint (/api/ml/predict) of the loan-platform backend on :8000
export default defineConfig({
  plugins: [react()],
  server: { port: 5176, proxy: { "/api": "http://localhost:8000" } },
});
