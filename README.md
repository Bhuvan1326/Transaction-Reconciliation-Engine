# Transaction Reconciliation Engine

Full-stack reconciliation platform: a Node.js API that ingests user and exchange transaction CSVs, flags data quality issues, matches transactions across sources, and produces downloadable reports — plus a React dashboard for uploads, tolerance configuration, live status polling, and report downloads.

## Live Demo


| **Frontend (Vercel)** | [https://transaction-reconciliation-engine.vercel.app/](https://transaction-reconciliation-engine.vercel.app/) |
| **Backend API docs (Render)** | [https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/](https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/) |

### Backend (Render)

| Service | URL |
|---------|-----|
| **API base** | [https://transaction-reconciliation-engine-fna4.onrender.com](https://transaction-reconciliation-engine-fna4.onrender.com) |
| **Swagger UI** | [https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/](https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/) |
| **Health** | [https://transaction-reconciliation-engine-fna4.onrender.com/health](https://transaction-reconciliation-engine-fna4.onrender.com/health) |

The [deployed dashboard](https://transaction-reconciliation-engine.vercel.app/) calls this API. For local development, set `VITE_API_BASE_URL` in `frontend/.env` — see [frontend/README.md](frontend/README.md).

## Stack

**Backend**

- Node.js 20, Express, MongoDB (Mongoose)
- Streaming CSV: `csv-parse`, `csv-stringify`
- Validation: Joi | Logging: Winston | Tests: Jest | API docs: Swagger UI
- Docker & Docker Compose

**Frontend** (`frontend/`)

- React 18, Vite, TypeScript, Tailwind CSS
- Axios, React Hook Form, TanStack React Query, Framer Motion, Lucide React

## Quick Start

```bash
cp .env.example .env
npm install
npm start
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`  
Health: `http://localhost:3000/health`

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

### Docker

```bash
cp .env.example .env   # required — compose loads env via env_file
docker compose up --build
```

Services: `reconciliation-app` (port 3000), `reconciliation-mongodb` (port 27017). Named volumes: `mongodb_data`, `uploads_data`, `reports_data`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/reconcile` | Upload `userFile` + `exchangeFile` (multipart), optional tolerance overrides |
| GET | `/api/v1/reconcile/:runId` | Run status and summary |
| GET | `/api/v1/reconcile/:runId/report` | Download CSV report |
| GET | `/api/v1/reconcile/:runId/issues` | Paginated data quality issues |
| GET | `/health` | Health check |

### Example: Start reconciliation

```bash
curl -X POST http://localhost:3000/api/v1/reconcile \
  -F "userFile=@src/tests/fixtures/user_transactions.csv" \
  -F "exchangeFile=@src/tests/fixtures/exchange_transactions.csv" \
  -F "timestampToleranceSeconds=300" \
  -F "quantityTolerancePct=0.01"
```

## CSV Schema

```
transaction_id, timestamp, type, asset, quantity, price_usd, fee, note
```

## Tests

```bash
npm test
```

## Key Design Decisions

### Repository pattern rationale

All database access is isolated in `src/repositories/`. Services orchestrate business logic (ingestion, matching, reporting) without importing Mongoose models directly. This keeps persistence swappable, simplifies unit testing via repository mocks, and enforces a single place for query shapes and bulk-write semantics (`insertMany` with `ordered: false`).

### Streaming + batch insert strategy

CSV ingestion uses `fs.createReadStream` piped to `csv-parse` with `for await` row iteration — the full file is never loaded into memory. Rows accumulate in in-memory buffers and flush via `transaction.repository.insertMany` and `qualityIssue.repository.insertMany` every 500 rows (configurable via `BATCH_INSERT_SIZE`). A final flush drains partial batches when the stream ends.

### Deterministic tie-breaking formula

When multiple exchange candidates satisfy asset, type, and tolerance filters, the matcher selects the candidate with the lowest `weightedDistance`:

```
score = (timestampDeltaSeconds × 0.7) + (quantityDeltaPct × 0.3)
```

Equal scores break on lexicographically smaller MongoDB `_id`, guaranteeing deterministic output for identical inputs.

### Timestamp null policy

Timestamps are accepted only if the raw value is a complete ISO 8601 string matching a strict regex and parses to a valid `Date`. Malformed values (e.g. `2024-03-09T`), empty strings, and missing fields become `timestamp: null` with a `warning` quality issue. There is no partial recovery or coercion.

### Run isolation and idempotency

Each reconciliation creates a new `ReconciliationRun` with a unique `runId`. All `Transaction` and `DataQualityIssue` documents are tagged with that `reconciliationRunId`. Re-uploading the same files creates a new isolated run; prior runs are never read or mutated.

### Error resilience policy

Row-level problems (invalid quantity, bad timestamp, duplicates, parse errors) are caught per row, logged at `warn`, recorded as `DataQualityIssue` entries, and the row is still persisted. Only infrastructure failures (database connectivity, file I/O) mark a run as `failed`. The async job wrapper catches terminal errors so the API process remains stable.

## Project Structure

```
transaction-reconciliation-engine/
├── src/                    # Backend (Express API)
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── jobs/
│   ├── middlewares/
│   ├── validators/
│   └── utils/
├── frontend/               # React + Vite dashboard
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── layouts/
│       ├── utils/
│       └── types/
├── docker-compose.yml
└── Dockerfile
```

Backend layers: config → routes → controllers → services → repositories → MongoDB.

## License

MIT
