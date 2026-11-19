# SafeZone

Verified theft alerts, crime statistics and area safety for Dhaka.

SE 331 Software Engineering Design Capstone Project · Team-02 · Batch 41 · Daffodil International University

## What it does

- Victims report thefts together with their police GD (General Diary).
- Verifiers check each report and approve, reject or ask for more information.
- Approved reports become alerts for people in the area (simulated phones + browser notifications).
- Everyone can see a public theft map, area safety dashboards and a colour-coded danger map.

## Technology

| Part | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.12) |
| Database | MongoDB (single-node replica set) |
| Maps | Leaflet + OpenStreetMap |
| OCR | Tesseract (Bangla + English) |

## Project structure

```
safezone/
├── api/   FastAPI backend (Python)
└── web/   Next.js frontend (TypeScript)
```

## Development progress

- [ ] Phase A: Setup
- [ ] Phase B: Accounts
- [ ] Phase C: Areas
- [ ] Phase D: Reporting
- [ ] Phase E: Checks and review
- [ ] Phase F: Alerts
- [ ] Phase G: Public side
- [ ] Phase H: Crime statistics
- [ ] Phase I: OCR
- [ ] Phase J: Admin and privacy
- [ ] Phase K: Testing and demo

## Team

| Member | ID | Main responsibility |
| --- | --- | --- |
| Sadia Salma | 232-35-792 | Backend, database, alerts engine, integration |
| Ummay Arifun Nahar Jani | 232-35-528 | Frontend pages, maps, seed data, tests |
