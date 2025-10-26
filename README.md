# Lifestyle Analyzer

Live: https://main.d2giuvgshpmn6m.amplifyapp.com/

A zero-backend React app that analyzes your daily tasks from an Excel sheet named **`Daily Tasks`**. It summarizes sleep, work, and exercise and visualizes trends. Built with **Vite + React + TypeScript**, **Tailwind**, **Recharts**, and **xlsx**.

## Quick start
1. Open the live app above.
2. Drag & drop an `.xlsx` with a sheet named `Daily Tasks` (see format below).
3. Or click **Choose file** in the Upload panel.

### Excel format (minimum)
| Column | Example | Notes |
|---|---|---|
| Date | 2025-10-01 | Excel date or text date |
| Day Of Week | Wednesday | optional |
| Task Category | Sleep / Work / Gym / ... | categories drive charts |
| Task | Gym - upper body | optional |
| Start | 6:30 AM | optional |
| Duration | 1:00:00 or "1h 0m" or 0.0417 | hh:mm:ss, mm:ss or Excel fraction |
| End | 7:30 AM | optional |
| Comments | … | optional |

### Features
- KPI cards (Sleep, Work, Exercise) with health/work ratio
- Weekday/Weekend time by category (two pies)
- Weekday vs Weekend bar chart
- Sleep over time line chart
- Narrative insights: Strengths / Opportunities / Red Flags
- Drag & drop **and** button-based upload

### Local development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Deploy (AWS Amplify)
Amplify picks up `amplify.yml` in the repo. We pin Node 18 via `.nvmrc`.

### License
MIT
