# CloudTask

A full-stack task manager with a Django REST Framework API and a React/Vite dashboard. The backend uses SQLite for local development.

## Requirements

- Python 3.10+
- Node.js 18+

## Run the backend

Open a terminal in `backend/` and run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`.

## Run the frontend

In another terminal, open `frontend/` and run:

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Vite proxies `/api` requests to the local Django server. To use another API origin, set `VITE_API_BASE_URL` before starting Vite.

## Accounts

Use **Create account** on the sign-in page to register with an email and password, or sign in with an existing account. Task data is private to the signed-in account. Django session cookies and CSRF protection are used for authentication; no account or password is preconfigured.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/auth/csrf/` | Start a CSRF-protected session |
| POST | `/api/auth/register/` | Create an account and sign in |
| POST | `/api/auth/login/` | Sign in |
| POST | `/api/auth/logout/` | Sign out |
| GET | `/api/auth/me/` | Return the signed-in account |
| GET, POST | `/api/tasks/` | List or create tasks |
| GET, PUT, PATCH, DELETE | `/api/tasks/{id}/` | Read, update, or delete a task |
| POST | `/api/tasks/{id}/complete/` | Mark a task completed |
| GET | `/api/tasks/stats/` | Task totals and completion percentage |

List queries support `search` (task title/description), `status`, `priority`, and `ordering` (for example `-created_at` or `deadline`).
Task endpoints require a signed-in session.

## Task fields

`title` is required. `description` and `deadline` are optional. Priority values are `low`, `medium`, and `high`; status values are `pending`, `in_progress`, and `completed`. Creation and update timestamps are managed by the API.
