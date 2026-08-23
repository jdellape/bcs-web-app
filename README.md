# Blair County Resources — Agency Data Entry

Simple Vite + React web app for creating, editing, and deleting agency records in Firestore via the FastAPI backend.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

Set `VITE_API_BASE` in `.env` to your FastAPI base URL. For local work, use `http://localhost:8000` (restart `npm run dev` after changing `.env`).

The cloud API URL only works in the browser if that deployment returns CORS headers (`Access-Control-Allow-Origin`). If you see **Failed to fetch**, either point at local FastAPI or redeploy `bcs-fastapi` with CORS enabled.

## Production build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Set environment variable: `VITE_API_BASE=https://bcs-fastapi-995e899b.fastapicloud.dev`
4. Deploy — Vercel detects Vite automatically.

## Related repos

- **bcs-mobile-app** — React Native (Expo) client for searching agencies
- **bcs-fastapi** — FastAPI backend + Firestore

## Notes

- Write operations require the API service account to have Firestore write permissions.
- Schedule / hours-of-operation editing is out of scope for this app.
