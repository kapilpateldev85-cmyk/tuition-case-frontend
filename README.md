# TuitionSpace Frontend

Next.js web app for **TuitionSpace** — a tuition marketplace where parents post cases and tutors respond to invitations. Consumes the [TuitionSpace API](../tuition-case-backend/README.md).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [User Flows](#user-flows)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Role-Based Access](#role-based-access)
- [API Integration](#api-integration)
- [Pages & Routes](#pages--routes)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

TuitionSpace frontend provides role-specific dashboards for two user types:

| Role | Primary flows |
|------|----------------|
| **Parent** | Dashboard → browse tutors → create cases → invite tutors → upload documents |
| **Tutor** | Dashboard → accept/decline invitations → view cases → edit profile → upload credentials |

Built for **reliability and clarity**: loading/empty/error states, graceful 401/403 handling, and permission-aware UI.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| UI | Radix UI + custom components (shadcn-style) |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| HTTP | Axios (interceptors, typed errors) |
| Icons | Lucide React |
| Toasts | Sonner |

---

## Prerequisites

- **Node.js** 20+
- **npm**
- **Running backend** on port 3000 (see [backend README](../tuition-case-backend/README.md))

---

## Quick Start

Run the **backend first**, then the frontend on a **different port**:

```bash
# Terminal 1 — Backend
cd ../tuition-case-backend
npm install
cp .env.example .env   # configure DATABASE_URL
npm run db:migrate
npm run start:dev      # http://localhost:3000

# Terminal 2 — Frontend
cd tuition-case-frontend
npm install
cp .env.example .env.local
npm run dev -- -p 3001         # http://localhost:3001
```

| Resource | URL |
|----------|-----|
| App (local) | http://localhost:3001 |
| App (production) | https://tuition-case-frontend-t7jb.vercel.app |
| Architecture docs | http://localhost:3001/docs |
| Backend Swagger | https://tuition-case-backend.onrender.com/api/docs |

> See [DEPLOYMENT.md](../DEPLOYMENT.md) for production env vars.

---

## Environment Variables

Create `.env` or `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://tuition-case-backend.onrender.com
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the TuitionSpace API (no trailing slash) |

For production, set this to your deployed API URL (e.g. `https://api.example.com`).

---

## Accounts

No demo users — register at `/register` after deploy or local setup.

**Production:** https://tuition-case-frontend-t7jb.vercel.app/register

---

## User Flows

### Parent

1. **Login** → `/dashboard`
2. **Browse tutors** → `/tutors` → open profile → `/tutors/[id]`
3. **Create case** → `/cases/new`
4. **Manage case** → `/cases/[id]` → invite tutor, upload documents, edit/close case
5. **Revoke invitation** → trash icon on invited tutor list

### Tutor

1. **Login** → `/tutor/dashboard`
2. **Pending invitations** → Accept or Decline on dashboard
3. **View cases** → `/tutor/cases` → `/tutor/cases/[id]`
4. **Profile** → `/tutor/profile` → edit qualifications, upload certificates
5. **Upload to case** → documents tab on invited case detail

---

## Project Structure

```
tuition-case-frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Login, register, session-expired
│   ├── (parent)/             # Parent dashboard, cases, tutors
│   ├── (tutor)/              # Tutor dashboard, cases, profile
│   ├── docs/                 # In-app architecture documentation
│   ├── forbidden/            # 403 page
│   └── unauthorized/         # 401 page
├── src/
│   ├── components/           # UI, layout, forms, cards, dialogs
│   ├── features/             # Domain hooks (auth, cases, tutors, documents)
│   ├── services/             # API client layer (Axios)
│   ├── lib/                  # Axios instance, QueryClient
│   ├── providers/            # AppProviders
│   ├── constants/            # Routes, query keys, enums
│   ├── types/                # TypeScript domain types
│   ├── schemas/              # Zod validation schemas
│   ├── hooks/                # Generic hooks (pagination, debounce)
│   └── utils/                # Formatting, cn(), helpers
└── public/
```

---

## Architecture

### State management

- **Server state** → TanStack Query (`useQuery`, `useMutation`)
- **Auth session** → `AuthProvider` + `localStorage` (`tuition_session`)
- **UI state** → local `useState` (no Redux)

### Data flow

```
Page → feature hook → service → axios → NestJS API
                ↓
         TanStack Query cache (QUERY_KEYS)
```

### Service layer

| Service | Responsibility |
|---------|----------------|
| `auth.service.ts` | Login, register, refresh, me |
| `case.service.ts` | Cases CRUD, invite, revoke, respond to invitation |
| `tutor.service.ts` | Directory, profile, invitations |
| `document.service.ts` | Upload, list, download, delete |

Axios interceptors:

- Attach `Authorization: Bearer` from session
- Unwrap `{ success, data }` API envelopes
- Redirect to `/session-expired` on 401

---

## Authentication

| Concern | Implementation |
|---------|----------------|
| Storage | `localStorage` key `tuition_session` |
| Token refresh | Auto-refresh on mount if access token expired |
| Route guards | `ProtectedRoute` on layout groups |
| UI guards | `RoleGuard` hides actions user cannot perform |
| Session expiry | Redirect to `/session-expired` |

**Tradeoff:** `localStorage` is simple for this project. Production hardening could move to **httpOnly cookies** to reduce XSS token theft risk.

---

## Role-Based Access

| Feature | Parent | Tutor |
|---------|:------:|:-----:|
| View own cases | ✅ | — |
| View invited cases | — | ✅ |
| Create / edit cases | ✅ | — |
| Invite / revoke tutors | ✅ | — |
| Accept / decline invitations | — | ✅ |
| Browse tutor directory | ✅ | — |
| Edit own profile | — | ✅ |
| Upload case documents | ✅ | ✅ (invited) |
| Upload profile documents | — | ✅ |
| Delete own documents | ✅ | ✅ |

Unauthorized API responses show toast errors — pages do not crash on 403.

---

## API Integration

All services call the backend via `NEXT_PUBLIC_API_URL`.

**Subject mapping:** Frontend labels (e.g. `Math`) map to backend enums (`MATHEMATICS`) in `case.service.ts`.

**Profile data:** Qualifications/experiences are stored as JSON strings on the backend; the frontend parses plain-text seed data as a fallback.

**Invitations:** Status values `pending` | `accepted` | `declined` sync with backend `InvitationStatus` enum.

---

## Pages & Routes

| Route | Role | Description |
|-------|------|-------------|
| `/login` | — | Sign in |
| `/register` | — | Create account |
| `/dashboard` | Parent | Parent home |
| `/cases` | Parent | Case list |
| `/cases/new` | Parent | Create case |
| `/cases/[id]` | Parent | Case detail |
| `/cases/[id]/edit` | Parent | Edit case |
| `/tutors` | Parent | Tutor directory |
| `/tutors/[id]` | Parent | Tutor profile |
| `/tutor/dashboard` | Tutor | Invitations & stats |
| `/tutor/cases` | Tutor | Invited cases |
| `/tutor/cases/[id]` | Tutor | Case detail |
| `/tutor/profile` | Tutor | Own profile |
| `/tutor/profile/edit` | Tutor | Edit profile |
| `/docs` | — | Architecture documentation |
| `/session-expired` | — | Re-login prompt |
| `/forbidden` | — | 403 page |

---

## Documentation

In-app docs live at **`/docs`** — folder structure, auth strategy, query keys, and integration notes.

For API contracts, use backend Swagger at **`/api/docs`**.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (default port 3000) |
| `npm run dev -- -p 3001` | Dev server on port 3001 (recommended) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

---

## Deployment

### Vercel (recommended)

1. Connect repository
2. Set **Root Directory** to `tuition-case-frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.example.com
   ```
4. Deploy

Ensure backend `FRONTEND_URL` matches your Vercel domain for CORS.

### Self-hosted

```bash
npm run build
npm run start -- -p 3001
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Network / CORS errors | Backend must run on 3000; frontend on 3001; check `FRONTEND_URL` on API |
| Login fails | Register first at `/register` — DB has no seeded users |
| Tutor sees no cases | Parent must invite you; click **Accept** on dashboard |
| Documents show wrong names | Refresh after backend update; filenames map from API `filename` field |
| Redirect to session-expired | Token expired — log in again (refresh runs automatically on mount) |
| `NEXT_PUBLIC_API_URL` ignored | Rebuild after changing env vars; prefix must be `NEXT_PUBLIC_` |

---

## Related

- [Backend README](../tuition-case-backend/README.md) — API setup, auth, deployment
- [Backend Swagger](http://localhost:3000/api/docs) — interactive API docs (when running locally)

---

## License

MIT
