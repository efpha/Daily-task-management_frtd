# Task Manager Frontend

The Task Manager frontend is a responsive React single-page application for creating, tracking, editing, and completing personal tasks. It provides a public landing page, account authentication screens, password-reset initiation, and a protected task dashboard.

The application is built with Vite and communicates with the Django REST API in [`../task_backend`](../task_backend) through Axios. Authentication uses short-lived JWT access tokens and refresh tokens stored in the browser's `localStorage`.

## Features

- Responsive landing page with desktop and mobile navigation.
- User registration with client-side password confirmation and password-strength guidance.
- Email/password sign-in.
- Protected dashboard route that redirects unauthenticated users to sign-in.
- Automatic access-token refresh after an API request returns `401 Unauthorized`.
- Create tasks with a title and optional description.
- View all tasks belonging to the signed-in user.
- View task details and edit the title, description, and completion state.
- Mark tasks as complete and delete tasks.
- Password-reset request form with a privacy-preserving success message.
- Loading indicators and inline authentication error/success states.

## Tech stack

- React 19
- React Router DOM 7
- Vite (using `rolldown-vite` through the package override)
- Axios
- Tailwind CSS 4 with PostCSS
- Lucide React icons
- `sonner`, `clsx`, `tailwind-merge`, and `class-variance-authority`
- ESLint 9 with React Hooks and React Refresh rules

## Requirements

- Node.js 18+ (Node.js 20+ is recommended for current Vite tooling).
- npm.
- A running instance of the Django API. The backend in this repository expects routes under `/api/users/` and `/api/tasks/`.

## Getting started

From this directory:

```bash
npm install
```

The app defaults to the local Django API at `http://127.0.0.1:8000/api/`. To
override it, create a local environment file named `.env.local`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/
```

The older `VITE_BASE_LOCAL_URL` and `VITE_BASE_LIVE_URL` variables remain
supported for existing deployments, but `VITE_API_URL` is the preferred setting.

Start the development server:

```bash
npm run dev
```

Vite normally serves the app at [http://localhost:5173](http://localhost:5173).

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for review. |
| `npm run lint` | Run ESLint across the frontend source. |

## Application routes

| Route | Access | Screen |
| --- | --- | --- |
| `/` | Public | Redirects to `/home`. |
| `/home` | Public | Landing page. |
| `/home/login` | Public | Sign-in form. |
| `/home/register` | Public | Registration form. |
| `/home/password_reset` | Public | Password-reset request form. |
| `/dashboard` | Protected | Task dashboard. Redirects to `/home/login` without a valid session. |

The Vercel rewrite in [`vercel.json`](vercel.json) sends all paths to `/`, allowing the client-side router to handle navigation after deployment.

## API integration

The Axios client is configured in [`src/axiosConfig.js`](src/axiosConfig.js):

- `baseURL` comes from `VITE_API_URL`, with development/local and deployment
  fallbacks for the older variable names.
- JSON is the default request content type.
- `withCredentials: true` is enabled for the backend's session/cookie behavior.
- The access token is added as `Authorization: Bearer <token>` for non-public requests.
- A failed authenticated request with status `401` triggers one refresh request. If refresh fails, both tokens are removed and the browser is redirected to `/home/login`.

### Authentication endpoints

These paths are relative to the configured API base URL:

| Method | Path | Used by | Description |
| --- | --- | --- | --- |
| `POST` | `users/register/` | Registration screen | Creates an account from `name`, `email`, and `password`. |
| `POST` | `users/login/` | Sign-in screen | Returns `access_token` and `refresh_token`. |
| `POST` | `users/token/refresh/` | Axios interceptor and auth provider | Exchanges a refresh token for a new access token. |
| `POST` | `users/forgot-password/` | Password-reset screen | Starts the password-reset flow. |
| `POST` | `users/logout/` | Dashboard | Ends the backend session. |

For the Django backend in this repository, the configured base URL should include `/api/`, resulting in URLs such as `http://127.0.0.1:8000/api/users/login/`.

### Task endpoints

Task requests are centralized in [`src/app/task_handler.js`](src/app/task_handler.js):

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `tasks/all` | Fetch the current user's tasks. |
| `GET` | `tasks/<id>/` | Fetch one task. |
| `POST` | `tasks/create/` | Create a task with `title` and `description`. |
| `PUT` | `tasks/update/<id>/` | Update `title`, `description`, and `completed`. |
| `PATCH` | `tasks/complete/<id>/` | Mark a task as completed. |
| `DELETE` | `tasks/delete/<id>/` | Delete a task. |

The backend should enforce ownership and authentication for all task endpoints; the frontend does not attempt to scope or filter another user's data locally.

## Authentication lifecycle

1. A user submits the sign-in form.
2. The API returns `access_token` and `refresh_token`.
3. `AuthContext` stores both tokens and marks the session as authenticated.
4. The user is navigated to `/dashboard`.
5. Axios attaches the access token to protected requests.
6. When an access token expires, Axios calls the refresh endpoint and retries the original request once.
7. If refresh fails, the stored tokens are cleared and the user is sent back to sign-in.

Tokens are stored in `localStorage`, which keeps a session across page reloads but means the application should only be served over HTTPS in production. Do not put secrets in `VITE_*` variables: Vite exposes them to the browser bundle.

## Project structure

```text
task_frontend/
├── index.html                  # Vite HTML entry point
├── package.json                # Scripts and dependencies
├── vite.config.js              # Vite + React configuration
├── vercel.json                 # SPA rewrite for Vercel
├── src/
│   ├── main.jsx                # React bootstrap
│   ├── App.jsx                 # Router and protected-route wrapper
│   ├── authcontext.jsx         # Authentication state and token restoration
│   ├── axiosConfig.js          # Axios client and token interceptors
│   ├── app/
│   │   ├── home/home.jsx       # Public landing page
│   │   ├── dashboard/dashboard.jsx # Task dashboard UI
│   │   └── task_handler.js     # Task API operations
│   ├── components/
│   │   ├── auth/               # Shared authentication layout and fields
│   │   ├── login/              # Sign-in screen
│   │   ├── register/            # Registration screen
│   │   ├── password_reset/      # Password-reset screen
│   │   ├── popup/               # Standalone task popup component
│   │   └── ui/                  # Reusable input, button, and spinner components
│   ├── hooks/usePasswordReset.js
│   ├── lib/utils.js             # Tailwind class-name helper
│   └── *.css                    # Global, auth, and component styles
└── dist/                        # Generated by `npm run build`
```

## Production build and deployment

Build the application with:

```bash
npm run build
```

Deploy the generated `dist/` directory with a static host such as Vercel. Configure `VITE_API_URL` in the hosting provider's build environment, then rebuild after changing it. The API must allow the deployed frontend origin through CORS and, if cookies are used, configure compatible secure/SameSite cookie settings.

Before deploying, verify:

- The API base URL ends with `/api/` when using the backend in this repository.
- The API is reachable from the deployed browser origin.
- The frontend origin is in the backend's CORS and CSRF trusted-origin lists.
- The Vercel SPA rewrite is retained so direct navigation to `/dashboard` and authentication routes works.

## Development notes and current limitations

These are observations from the current implementation and are useful when extending the app:

- The dashboard displays and edits a `completed` boolean, while the Django task serializer exposes a `status` string (`pending`, `in_progress`, or `completed`). Keep this contract consistent between frontend and backend; otherwise completion checkboxes and update payloads can become out of sync.
- The task creation form currently sends only `title` and `description`; `due_date` is supported by the backend model but is not exposed in the current UI.
- The dashboard's “All Tasks”, “Pending”, and “Completed” controls currently display counts but do not yet filter the task list.
- The password-reset screen calls `users/forgot-password/`, but that endpoint is not present in the backend URL configuration shown in this repository. Add the backend endpoint or adjust the frontend before relying on the flow.
- `npm run build` is the primary production verification command. `npm run lint` currently reports existing issues in the dashboard logout handler, auth context, shared button export, unused Axios configuration value, logout stub, and CommonJS Tailwind config; these should be cleaned up before enforcing lint in CI.

## Contributing

1. Create a feature branch.
2. Install dependencies with `npm install`.
3. Add or update `.env.local` without committing credentials.
4. Run `npm run build` and, where practical, `npm run lint`.
5. Keep API calls in the Axios client or task handler rather than scattering request logic through UI components.
