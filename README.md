# ExamPixel V4

Responsive, mobile-first UI update is included. See `RESPONSIVE_V4.md` for the device/layout coverage and the responsive changes.

# ExamPixel

ExamPixel is a React web app with a separate Node/Express API for exam-photo and document processing.

## Repository structure

- `src/` — React frontend
- `public/` — static frontend assets
- `backend/` — Express API, authentication, image processing and PostgreSQL integration
- `src/data/examSpecs.json` — central exam/document specification source used by frontend and backend

## Frontend (Vercel)

The repository root is the React app, so Vercel can be connected directly to this repository without setting a nested project directory.

Build command: `npm run build`

Output directory: `build`

For a separately hosted backend, set the Vercel environment variable:

`REACT_APP_API_URL=https://your-api-domain.example`

For local development, copy `.env.example` to `.env.local` and adjust the API URL if needed.

## Backend

Create `backend/.env` from `backend/.env.example` and set:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — random secret with at least 32 characters
- `FRONTEND_URL` — production frontend URL (for example, your Vercel domain)
- `STORAGE_DIR` — runtime output directory, default `./processed`

Then install and start the backend:

```bash
cd backend
npm install
npm start
```

## Local frontend

```bash
npm install
npm start
```

## Deployment note

The frontend and backend are intentionally deployable separately. Vercel is suitable for the React frontend; the Express/PostgreSQL backend can be deployed on Railway, Render, Fly.io, or another Node host with persistent storage/object storage configured for processed files.

## Exam specifications

The specification dataset is centralized in `src/data/examSpecs.json`. Values inherited from the supplied project are marked for official verification where required. Before public launch, compare each live exam preset with its current official notification and keep a verified date/source in your operational process.

## Features in v3

- Smooth processing and result-reveal animations
- Server-signed CAPTCHA for login/signup
- Protected authenticated history/save endpoints
- Final output validation for dimensions, DPI and file size
- SBI Clerk / Junior Associate presets for photo, signature, left thumb impression and handwritten declaration
- SBI live-photo requirement notice
