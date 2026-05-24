# Transaction Reconciliation Engine — Frontend

Production-grade React dashboard for the Transaction Reconciliation Engine API. Upload user and exchange CSV files, configure matching tolerances, poll run status, and download reconciliation reports.

## Live Demo

| | Link |
|---|------|
| **Dashboard (Vercel)** | [https://transaction-reconciliation-engine.vercel.app/](https://transaction-reconciliation-engine.vercel.app/) |
| **API docs (Render)** | [https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/](https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/) |

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (dark fintech UI)
- Axios · React Hook Form · TanStack React Query
- Framer Motion · Lucide React

## Prerequisites

- Node.js 20+
- Running backend API (local or deployed)

## Installation

```bash
cd frontend
npm install
```

## Environment

Copy the example env file and set the API base URL (no trailing slash):

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend origin, e.g. `http://localhost:3000` or production URL |

**Production backend (Render):**

```env
VITE_API_BASE_URL=https://transaction-reconciliation-engine-fna4.onrender.com
```

## Running the Frontend

**Development** (with hot reload on port 5173):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Production build:**

```bash
npm run build
npm run preview
```

The Vite dev server proxies `/api` and `/health` to `http://localhost:3000` when `VITE_API_BASE_URL` is unset or you use the proxy path — for local dev you can set:

```env
VITE_API_BASE_URL=
```

and rely on the proxy, or point explicitly at your backend.

## Connecting to the Backend

### Local backend

1. From the repository root:

   ```bash
   cp .env.example .env
   npm install
   npm start
   ```

2. In `frontend/.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Start the frontend: `npm run dev`

### Deployed (production)

- **Frontend:** [https://transaction-reconciliation-engine.vercel.app/](https://transaction-reconciliation-engine.vercel.app/)
- **Backend base URL:** [https://transaction-reconciliation-engine-fna4.onrender.com](https://transaction-reconciliation-engine-fna4.onrender.com)
- **Swagger:** [https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/](https://transaction-reconciliation-engine-fna4.onrender.com/api-docs/)
- **Health:** [https://transaction-reconciliation-engine-fna4.onrender.com/health](https://transaction-reconciliation-engine-fna4.onrender.com/health)

For local dev, set `VITE_API_BASE_URL` to the Render base URL (or `http://localhost:3000`). To deploy your own build, publish `dist/` to Vercel or any static host with the same env var.

> **CORS:** The backend enables CORS for browser clients. Ensure your static frontend origin is allowed if you add custom CORS rules later.

## API Integration

| Action | Method | Path |
|--------|--------|------|
| Start reconciliation | `POST` | `/api/v1/reconcile` (multipart) |
| Poll status | `GET` | `/api/v1/reconcile/:runId` (every 2s while running) |
| Download report | `GET` | `/api/v1/reconcile/:runId/report` |
| Quality issues | `GET` | `/api/v1/reconcile/:runId/issues?page=&limit=` |

Multipart fields: `userFile`, `exchangeFile`, `timestampToleranceSeconds`, `quantityTolerancePct`.

## Project Structure

```
src/
├── components/     # UI components (upload, form, cards, table, etc.)
├── pages/          # Route pages
├── hooks/          # React Query polling & issues hooks
├── services/       # Axios API layer
├── layouts/        # App shell
├── utils/          # Errors, validation, formatting
└── types/          # TypeScript interfaces
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |

## License

MIT
