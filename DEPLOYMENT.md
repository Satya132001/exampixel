# Deployment checklist

## GitHub

Push the repository root as-is. Do not commit `.env`, `node_modules`, generated `backend/processed` files, or deployment secrets.

## Vercel frontend

Create a Vercel project from the GitHub repository and keep the project root as `/`.

Use:

- Framework: Create React App (auto-detected)
- Build command: `npm run build`
- Output directory: `build`

Set `REACT_APP_API_URL` to the public backend URL if the API is deployed separately.

## Backend hosting

Set `DATABASE_URL`, `AUTH_SECRET`, `FRONTEND_URL`, and `STORAGE_DIR` in the backend host environment. Use HTTPS in production.

For production persistence, replace local file storage with object storage (S3/R2/Supabase Storage/Cloudinary) before relying on saved files across redeployments.

## CORS

`FRONTEND_URL` must exactly match the deployed frontend origin.
