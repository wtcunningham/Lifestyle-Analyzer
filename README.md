# React Component Specification – Lifestyle Analyzer

## Overview

Create a React component that allows a user to upload an Excel file containing a sheet named **“Daily Tasks.”** The component should analyze lifestyle data and generate an intelligent summary of daily habits and activities.

---

## Excel Sheet Format

### Sheet Name
**Daily Tasks**

### Columns

| Column Name     | Data Type             | Sample Data     |
|-----------------|----------------------|-----------------|
| Date            | Short Date           | 11/2/2025       |
| Day Of Week     | Text                 | Sunday          |
| Task Category   | Text                 | Health          |
| Task            | Text                 | Sleep           |
| Start           | Time                 | 5:00 AM         |
| Duration        | Duration (hh:mm:ss)  | 00:30:00        |
| End             | Time                 | 5:30 AM         |
| Comments        | Text                 | Example Comment |
| TaskID          | Int                  | 1               |
| TaskKey         | Text                 | 20251102_1      |

---

## Functional Requirements

### Upload & Data Handling
- The user uploads an **Excel file** with a sheet named **“Daily Tasks.”** (Drag & Drop **or** Manual Upload)
- The app **does not** use the provided sample data — only user-uploaded data.

### Analysis Features
The app should:
- Analyze lifestyle balance based on uploaded data.
- Identify:
  - Strengths (e.g., consistent sleep, exercise, work schedule)
  - Opportunities for improvement
  - Red flags (e.g., lack of rest, excessive work hours, missing health activities)
  - The summary shall be derived in a weekday / weekend format
  - General insights and recommendations

---

## User Interface Requirements

- Provide an **Upload** button for Excel files.
- Include **Reset** functionality after an excel file has been uploaded.
- Display:
  - A concise **summary report** of analysis.
  - Clean, friendly, and insightful text output.
  - KPIs and metrics for user insights displayed with best-class visualizations that are color friendly. 

---

## Notes

- The analysis logic should adapt dynamically to user data and always have the end goal to make the user have a happier, healthier life. 