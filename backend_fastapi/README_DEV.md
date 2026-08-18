# Dev Docker instructions for backend_fastapi

This repository includes a reproducible Docker development environment for the FastAPI backend located at backend_fastapi/.

Files added:
- Dockerfile.backend  — Dockerfile that installs native deps and Python requirements
- docker-compose.yml  — Compose file with postgres and backend services
- backend_fastapi/.dockerignore — reduce build context size

Quick start (Linux/macOS with Docker installed):

1) Build and start services
   docker-compose up --build

2) Create the database schema (run once after DB starts)
   # run this from repository root
   docker-compose exec backend bash -c "psql \"$DATABASE_URL\" -f migrations/01_init.sql"

   By default docker-compose sets:
   DATABASE_URL=postgresql://exampixel:exampixel@db:5432/exampixel_db

3) Open the app
   - Backend API: http://localhost:8000
   - Health: http://localhost:8000/api/health

Notes and troubleshooting:
- Native packages (rembg, mediapipe, opencv) are installed in the image; if you hit wheel/binary errors on specific architectures (Apple Silicon), use a Linux VM or CI runner.
- If the backend fails to connect to DB on initial startup, wait a few seconds and retry the migration command. "depends_on" does not wait for DB readiness.
- For production deployment on Render, build and deploy differently (Render builds from repository). Do NOT use docker-compose for Render. Use the uvicorn start command described in DEPLOYMENT notes.

Security:
- The docker-compose file uses default credentials for convenience in local dev. Do NOT use these credentials in production.
- Set JWT_SECRET and DATABASE_URL in your environment or in a local .env file (not committed).

