# Vitals Monitor

A real-time patient vitals monitoring dashboard — simulates a clinical monitoring station where multiple patients' vitals (heart rate, SpO2, temperature) stream live over WebSockets, with automatic threshold-based alerting and historical trend charts.

> ⚠️ This is a simulation for learning/portfolio purposes — all patient data is randomly generated, not real medical data.


## What it does

- **Live vitals streaming** — heart rate, SpO2, and temperature update every 2 seconds per patient over a WebSocket connection (Socket.io), with no polling or manual refresh
- **Multi-patient dashboard** — several simulated patients, each with their own room number and live-updating trend chart
- **Threshold-based alerts** — cards visually flag when a vital drifts outside a normal range, and a running **alert log** tracks when each alert started and resolved
- **Patient history** — click any patient to open a modal with a longer historical chart and a readings table, backed by persisted MongoDB data
- **Authentication** — JWT-based signup/login gates access to both the REST API and the live socket connection; passwords are hashed with bcrypt
- **Input validation & rate limiting** — request bodies are validated before hitting the database, and login is rate-limited to guard against brute-force attempts

## Why I built it

I wanted a project that combined real backend depth (not just CRUD) with something tied to my background in biomedical/healthcare data engineering — this maps loosely to concepts from my Medical Monitors & Life Support Systems and Biomedical Transducers & Sensors coursework (ECG, SpO2, PPG-style vitals). It was also my first hands-on project with WebSockets, after building REST-only APIs previously.

## Tech stack

**Frontend:** React (Vite), Socket.io-client, Recharts
**Backend:** Node.js, Express, Socket.io, Mongoose (MongoDB)
**Auth & security:** JWT, bcrypt, express-validator, express-rate-limit

## Architecture

```
frontend/                React app (dashboard, auth screen, patient history modal)
backend/
├── index.js             Server entry point — Express + Socket.io + MongoDB setup
├── routes/               HTTP route definitions
├── controllers/          Route handler logic (auth)
├── middleware/            Auth verification, centralized error handling
├── Reading.js             Mongoose model — persisted vitals readings
├── Alert.js               Mongoose model — alert start/resolve events
└── User.js                Mongoose model — user accounts
```

Real-time data flows over a Socket.io connection authenticated via a JWT passed at handshake time. Every reading is also persisted to MongoDB, and status transitions (normal → alert, alert → normal) are tracked server-side to generate a clean alert log instead of repeated noise.

## Running it locally

**Backend**
```bash
cd backend
npm install
# create a .env file with MONGO_URI and JWT_SECRET
node index.js
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend running at `http://localhost:3000`.



## Author

**Sohaila Ahmed** — Biomedical & Healthcare Data Engineering student, Cairo University
[GitHub](https://github.com/sohailaahmed12) 
