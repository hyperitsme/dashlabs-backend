# DashLabs Backend

Minimal Express backend for DashLabs DApp. Ships endpoints for health, proof, verification, transfer, and receipt. Proofs and transactions are **simulated** with HMAC and in-memory storage—swap with real circuits and on-chain calls later.

## Endpoints

- `GET /api/health` – uptime/info
- `POST /api/prove` – `{ amount, to, memo? } -> { proof }`
- `POST /api/verify` – `{ proof } -> { valid }`
- `POST /api/transfer` – `{ proof } -> { signature, id }` (simulated submit + confirm)
- `POST /api/receipt` – `{ proof, signature } -> { receipt }`
- `GET /api/activity` – recent simulated txs

## Local Dev

```bash
cp .env.example .env
npm i
npm run dev
# http://localhost:10000/api/health
