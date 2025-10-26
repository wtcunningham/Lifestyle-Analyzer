# Lifestyle Analyzer

A zero-backend React app for analyzing daily task logs from an Excel sheet ("Daily Tasks"). Built with Vite + React + TypeScript + Tailwind, uses `xlsx` and `recharts`.

## Local dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy on AWS Amplify (Console)
1. Go to **AWS Amplify → Hosting**.
2. Click **Create app** → **Host web app** → **Connect to Git provider**.
3. Choose **GitHub**, select the repo, branch **main**.
4. When prompted for build settings, use the **amplify.yml** in the repo.
5. Save & deploy. Amplify will build the app and host it at a public URL.
6. In **Rewrites and redirects**, add a rule for SPA fallback (should be auto-added):  
   - Source: `</^((?!\.).)*$/>`  
   - Target: `/index.html`  
   - Type: `200 (Rewrite)`

---

### Excel Format
Create a sheet named **Daily Tasks** with columns like:
- Date
- Day Of Week (optional)
- Task Category
- Task
- Start
- Duration
- End
- Comments

The analyzer will compute KPIs and show charts for weekday/weekend categories and sleep trends.
