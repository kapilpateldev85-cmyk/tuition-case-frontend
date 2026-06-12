import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "TuitionSpace frontend architecture and component documentation.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">TuitionSpace</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-500">Documentation</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Frontend Documentation</h1>
        <p className="text-slate-500 mb-10">
          Architecture, design decisions, and integration guide for the TuitionSpace frontend.
        </p>

        <Section id="overview" title="Overview">
          <p>
            TuitionSpace is a tuition marketplace frontend built with Next.js 15 (App Router),
            TypeScript, TailwindCSS, TanStack Query, React Hook Form, and Zod. The backend does not
            exist yet — all data flows through a centralized mock service layer that mirrors the
            exact API contract a real REST backend would expose.
          </p>
        </Section>

        <Section id="stack" title="Technology Stack">
          <Table
            headers={["Layer", "Technology", "Rationale"]}
            rows={[
              ["Framework", "Next.js 15 (App Router)", "File-based routing, RSC, layout groups"],
              ["Language", "TypeScript (strict)", "Type safety, IDE support, zero any"],
              ["Styling", "Tailwind CSS + custom UI", "Utility-first, no runtime overhead"],
              ["Data Fetching", "TanStack Query v5", "Caching, mutations, optimistic updates"],
              ["Forms", "React Hook Form + Zod", "Schema-driven, performant, accessible"],
              ["HTTP", "Axios", "Interceptors, typed errors, easy to configure"],
              ["Icons", "Lucide React", "Consistent, tree-shakeable icon set"],
              ["Toasts", "Sonner", "Lightweight, accessible toast notifications"],
            ]}
          />
        </Section>

        <Section id="folder-structure" title="Folder Structure">
          <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-mono overflow-x-auto text-slate-700">
{`src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Unauthenticated pages (login, forgot-password)
│   ├── (parent)/           # Parent-role pages (dashboard, cases, tutors)
│   ├── (tutor)/            # Tutor-role pages (dashboard, profile, cases)
│   ├── docs/               # This documentation page
│   ├── unauthorized/       # 401 page
│   ├── forbidden/          # 403 page
│   └── not-found.tsx       # 404 page
│
├── components/
│   ├── ui/                 # Low-level primitives (Button, Input, Dialog...)
│   ├── common/             # App-level shared components (EmptyState, ErrorState...)
│   ├── layout/             # AppShell, Navbar, Sidebar, Breadcrumbs, PageHeader
│   ├── forms/              # CaseForm, TutorProfileForm
│   ├── cards/              # StatCard, DocumentCard
│   └── dialogs/            # ConfirmDialog, InviteTutorDialog
│
├── features/               # Domain feature modules
│   ├── auth/               # AuthProvider, useAuth, guards
│   ├── cases/              # Case hooks (useCases, useCaseDetail, mutations)
│   ├── tutors/             # Tutor hooks (useTutors, useMyProfile, mutations)
│   └── documents/          # Document hooks (useUpload, useDelete)
│
├── services/               # Mock service classes (one per domain)
├── mocks/                  # In-memory database (db.ts)
├── hooks/                  # Generic hooks (useDebounce, usePagination)
├── lib/                    # Axios instance, QueryClient
├── providers/              # AppProviders wrapper
├── constants/              # ROUTES, QUERY_KEYS, FILE_CONSTRAINTS
├── types/                  # All TypeScript domain types
├── schemas/                # Zod validation schemas
└── utils/                  # Pure utility functions`}
          </pre>
        </Section>

        <Section id="auth" title="Authentication Strategy">
          <p className="mb-3">
            Auth is managed by <code>AuthProvider</code> (<code>src/features/auth/AuthProvider.tsx</code>),
            a client-side React context that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-sm">
            <li>Persists the session (user + mock JWT token) in <code>localStorage</code></li>
            <li>Hydrates on mount and validates token expiry</li>
            <li>Exposes <code>useAuth()</code> and <code>useCurrentUser()</code> hooks</li>
            <li>Attaches the Bearer token to every Axios request via request interceptors</li>
            <li>Handles 401 responses by clearing the session and redirecting to <code>/session-expired</code></li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">
            <strong>Backend swap:</strong> Replace the <code>authService.login()</code> mock body with{" "}
            <code>axiosInstance.post("/auth/login", credentials).then(r =&gt; r.data)</code>.
            Everything else stays the same.
          </p>
        </Section>

        <Section id="api-layer" title="API Layer & Mock Strategy">
          <p className="mb-3">
            Every component fetches data through feature hooks (TanStack Query), which call typed
            service classes. The service classes currently call the in-memory mock db. Replacing
            them with real REST calls is a one-line change per method.
          </p>
          <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-mono text-slate-700 overflow-x-auto mb-3">
{`// Current (mock)
async list(filters) {
  await sleep(600);
  return paginate(db.cases, filters);
}

// After backend integration
async list(filters) {
  const { data } = await axiosInstance.get("/cases", { params: filters });
  return data;
}`}
          </pre>
          <p className="text-sm text-slate-600">
            The <strong>request interceptor</strong> adds <code>Authorization: Bearer &lt;token&gt;</code>.
            The <strong>response interceptor</strong> normalises errors into the <code>ApiError</code> shape
            and redirects on 401.
          </p>
        </Section>

        <Section id="state" title="State Management">
          <p className="mb-3">
            All server state lives in TanStack Query. Local UI state (search, filters, pagination,
            dialog open/close) is in component-level <code>useState</code>. There is no global
            client-side state store — this keeps the architecture simple and predictable.
          </p>
          <Table
            headers={["Pattern", "Usage"]}
            rows={[
              ["QUERY_KEYS factory", "Centralized, typed cache keys — prevents stale key bugs"],
              ["Cache invalidation", "Mutations invalidate affected queries on success"],
              ["Optimistic updates", "Invitation toggling updates immediately (reverts on error)"],
              ["Error retry", "1 retry for queries, 0 for mutations"],
              ["staleTime: 30s", "Avoids refetch-on-focus for stable data"],
            ]}
          />
        </Section>

        <Section id="roles" title="Role-Based Rendering">
          <p className="mb-3">
            Two guards enforce role restrictions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>ProtectedRoute</strong> — wraps an entire layout group. Redirects unauthenticated
              users to <code>/login</code> and wrong-role users to <code>/forbidden</code>.
            </li>
            <li>
              <strong>RoleGuard</strong> — wraps individual UI elements. Silently hides the element
              for users with the wrong role. Used for action buttons inside case/profile pages.
            </li>
          </ul>
        </Section>

        <Section id="validation" title="Validation">
          <p className="mb-2">
            All form validation uses Zod schemas exported from <code>src/schemas/index.ts</code>.
            React Hook Form integrates via <code>zodResolver</code>. Key behaviors:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
            <li>Submit button disabled while form is invalid or submitting</li>
            <li>Inline error messages with <code>role="alert"</code> for screen readers</li>
            <li>Whitespace trimmed via Zod <code>.trim()</code></li>
            <li>File validation (type + size) in both Zod schema and react-dropzone config</li>
            <li>Server errors mapped to field-level errors via <code>setError()</code></li>
          </ul>
        </Section>

        <Section id="tradeoffs" title="Tradeoffs & Future Work">
          <Table
            headers={["Decision", "Tradeoff", "Future"]}
            rows={[
              ["localStorage session", "Simple, no server dependency", "Move to httpOnly cookie sessions for security"],
              ["In-memory mock db", "Resets on page refresh", "Replace service bodies with Axios calls"],
              ["Client-side role guard", "UX-only protection", "Server-side middleware for API routes"],
              ["No MSW", "Simpler mock setup", "Add MSW for more realistic network simulation"],
              ["Mock upload progress", "Simulated, not real", "Use axios onUploadProgress callback"],
            ]}
          />
        </Section>

        <Section id="demo" title="Demo Credentials">
          <Table
            headers={["Role", "Email", "Password"]}
            rows={[
              ["Parent", "parent@example.com", "parent123"],
              ["Parent 2", "parent2@example.com", "parent123"],
              ["Tutor", "tutor@example.com", "tutor123"],
              ["Tutor 2–10", "tutor2–10@example.com", "tutor123"],
            ]}
          />
        </Section>
      </main>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
        {title}
      </h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {headers.map((h) => (
              <th key={h} className="text-left py-2.5 px-4 font-medium text-slate-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 px-4 text-slate-700">
                  <code className={j === 0 ? "font-medium" : ""}>{cell}</code>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
