# Subhan Care HMS

Hospital Management System — MERN stack (MongoDB, Express, React/Vite, Node.js).

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env        # fill in real values
npm install
npm run seed                 # optional: populate demo data
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                  # opens http://localhost:5173
```

## Environment Variables

All secrets live in `backend/.env` (never committed).  
See `backend/.env.example` and `frontend/.env.example` for the full list.

## ⚠️ Security — Rotate Hardcoded Secrets

> **If you previously committed real credentials to git history, those values are still recoverable even after removal.**
>
> Rotate these immediately before any public/production deployment:
> - **MongoDB password** (the `MONGO_URI` user password)
> - **JWT signing secret** (`JWT_SECRET`)
>
> Generate a new JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
>
> Change your MongoDB Atlas password in the Atlas dashboard, then update `backend/.env`.
