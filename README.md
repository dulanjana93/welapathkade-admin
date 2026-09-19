# Welapathkade Admin Panel

Next.js (App Router) + TypeScript admin console for the Welapathkade NestJS API.

## Requirements

- Node 20+
- Running API at `http://localhost:3010` (see `welapathkade-api`)

## Setup

```bash
cd welapathkade-admin
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Bootstrap an ADMIN user (email + password):

```bash
cd ../welapathkade-api
npm run bootstrap:admin -- --email admin@welapathkade.local --password "ChangeMeNow!" --name "Platform Admin"
```

Password may also be set via `ADMIN_BOOTSTRAP_PASSWORD`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run test` — Vitest suite

## Auth

Admin Panel uses **email + password** via `POST /admin/auth/login`.
Public/Astrologer mobile apps continue to use phone + OTP unchanged.

## Phase scope

Implemented: login (ADMIN only), dashboard counts, astrologer review (approve/reject), platform services CRUD/status.

Placeholder: Users, Consultations, Payments, Referrals, Settings, Audit Logs.
