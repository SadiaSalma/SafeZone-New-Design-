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

## Run it on your computer

Needs: Python 3.12, Node.js, MongoDB Community Server (only the `mongod` program is used).

First time only:

```
cd api
py -3.12 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
cd ..\web
npm.cmd install
```

Every time, in three terminals:

| What | Folder | Command | Address |
| --- | --- | --- | --- |
| Database (MongoDB replica set rs0) | `api` | `.venv\Scripts\python.exe scripts\start_db.py` | port 27018 |
| Backend (FastAPI) | `api` | `.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000` | http://localhost:8000/docs |
| Website (Next.js) | `web` | `npm.cmd run dev` | http://localhost:3000 |

Set up the database (first time, and after pulling changes; safe to run again), with the database running:
in `api`, run `.venv\Scripts\python.exe -m scripts.init_db`. It creates all 22 collections with their rules and indexes.

Tests: in `api`, run `.venv\Scripts\python.exe -m pytest`.

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
