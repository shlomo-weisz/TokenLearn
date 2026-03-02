# TokenLearn Frontend

Frontend app for TokenLearn built with React + Vite.

## Environment variables

Create a `.env` file (or `.env.local`) with:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

- `VITE_API_BASE_URL` is the backend base URL used by the client for all auth calls.
- `VITE_GOOGLE_CLIENT_ID` must match `google.client-id` configured on the backend.

## Google login flow

When users click **Continue with Google**, the client:
1. Loads Google Identity Services.
2. Gets an ID token (`credential`) from Google.
3. Sends it to `POST /api/auth/google` as:

```json
{ "googleToken": "<google_id_token>" }
```

The client then stores the JWT returned by the backend and uses it as a Bearer token for subsequent API calls.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```
