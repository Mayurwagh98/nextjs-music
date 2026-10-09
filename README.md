# Cadence Music Academy

A full-stack music-school web app built with **Next.js 16 (App Router)**, React 19 and TypeScript.
Visitors browse and search courses, play audio previews that keep playing as they move around the
site, sign up, enroll in courses, and manage them from a dashboard.

> Portfolio project by **Mayur Wagh**. Course content, instructors and testimonials are sample data
> for a fictional academy. Audio previews are synthesised by `scripts/generate-previews.py`.

## Features

- **Course catalog** with search and filters (instrument, level, instructor, sort), kept in the URL
- **Course pages**, prerendered at build time, with curriculum, live-session times, structured data
  and a generated social-share image
- **Quick-view modal**: clicking a course opens it over the list; refreshing or sharing the URL
  opens the full page
- **Persistent audio player** that keeps playing across page navigations
- **Accounts**: sign up, log in, log out, with a protected dashboard
- **Enrollment**: enroll in and leave courses, with live "N students enrolled" counts
- **Waitlist** form with validation and a live counter
- Weekly **live sessions**, with the next date calculated on the server in IST
- Public **JSON API** at `/api/courses`

## Next.js features used, and where

| Feature | Where | Why |
|---|---|---|
| **Cache Components** (`cacheComponents`, `"use cache"`, `cacheLife`, `cacheTag`) | `src/lib/catalog.ts`, `src/lib/enrollments.ts` | Catalog data is cached and prerendered into the static shell; user data stays dynamic. |
| **Partial Prerendering + streaming** | `courses/page.tsx`, `courses/[slug]/page.tsx`, `dashboard/page.tsx`, `layout.tsx` | Each route serves a static shell instantly; anything that reads cookies or `searchParams` streams in behind `<Suspense>`. |
| **On-demand revalidation** (`updateTag`) | `src/app/actions/*.ts` | After enrolling or joining the waitlist, the cached counts and lists update immediately (read-your-own-writes). |
| **Dynamic routes + `generateStaticParams`** | `courses/[slug]` | Every course page is generated at build time; an unknown slug returns a real 404 via `notFound()`. |
| **Parallel + intercepting routes** | `app/@modal/(.)courses/[slug]` | Course quick view as a modal that has its own URL, closes on Back, and falls back to the full page on refresh. |
| **Server Actions + `useActionState` + `useFormStatus`** | `src/app/actions`, `src/components/forms` | Signup, login, enroll and waitlist forms with server-side Zod validation, field errors and pending states. They also work before JavaScript loads. |
| **`proxy.ts`** (formerly middleware) | `src/proxy.ts` | Optimistic auth redirects (`/dashboard` ↔ `/login`) before rendering. |
| **Data Access Layer** | `src/lib/auth/dal.ts` | The only code that turns the cookie into a user. Every page and action re-checks the session there, so authorization doesn't rely on the proxy. |
| **Route Handlers** | `app/api/courses/route.ts`, `app/auth/reset/route.ts` | Public JSON API, and clearing a stale session cookie. |
| **Metadata API** | `layout.tsx`, `generateMetadata`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` | Titles, canonical URLs, sitemap, robots rules and generated OG images per course. JSON-LD `Course` schema on course pages. |
| **`next/form`** | `components/courses/CourseFilters.tsx` | Search form that updates search params with client-side navigation, and still works without JavaScript. |
| **`next/image`, `next/font/local`** | throughout | Responsive, lazy-loaded images limited to known hosts; a self-hosted variable font with no layout shift. |
| **Server and Client Component split** | throughout | Pages and sections are Server Components. Only interactive pieces (player, menus, forms, animations) are client islands, and auth UI is passed into the client navbar as a server-rendered slot. |
| **Error, loading and not-found UI** | `error.tsx`, `loading.tsx`, `not-found.tsx` | Route-level error recovery without a full reload, so the player keeps going. |

## Architecture

```
src/
├─ app/
│  ├─ layout.tsx                 Root layout: navbar, persistent player, @modal slot
│  ├─ page.tsx                   Home (fully prerendered)
│  ├─ courses/page.tsx           Search + filters (static shell, streamed results)
│  ├─ courses/[slug]/            Course page + per-course opengraph-image
│  ├─ @modal/(.)courses/[slug]/  Intercepted quick-view modal
│  ├─ dashboard/ login/ signup/ waitlist/
│  ├─ actions/                   Server Actions (auth, enrollment, waitlist)
│  ├─ api/courses/route.ts       Public JSON API
│  └─ sitemap.ts robots.ts opengraph-image.tsx
├─ components/                   UI (Aceternity-based visuals, player, forms, cards)
├─ data/                         Catalog content (courses, instructors, sessions)
├─ lib/
│  ├─ catalog.ts                 Cached catalog reads ("use cache")
│  ├─ enrollments.ts             Cached per-user / per-course reads, cache tags
│  ├─ auth/                      JWT session (jose), cookie helpers, Data Access Layer
│  ├─ store/                     MongoDB persistence behind a small Store interface
│  ├─ search.ts schedule.ts      Pure logic (unit tested)
│  └─ validation.ts              Zod schemas shared by actions
└─ proxy.ts                      Optimistic route protection
```

**Data.** Catalog content is versioned with the code and read through cached functions. User data
(accounts, enrollments, waitlist) is stored in **MongoDB** (`users`, `enrollments` and `waitlist`
collections) through a small `Store` interface. Unique indexes enforce one account per email, one
enrollment per user and course, and one waitlist entry per email, even under concurrent requests.
One connection pool is shared per server process.

**Auth.** Passwords are hashed with bcrypt. Sessions are signed JWTs (HS256, `jose`) stored in an
`httpOnly`, `SameSite=Lax` cookie (`Secure` in production). Login takes the same time whether or not
the email exists, and `?next=` redirects are restricted to same-site paths.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set MONGODB_URI (and SESSION_SECRET for production)
npm run dev                  # http://localhost:3000
```

`MONGODB_URI` is required. A free MongoDB Atlas cluster works, or a local `mongod`
(`mongodb://127.0.0.1:27017/cadence`). The database named in the URI is the one used.

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build, run production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm test` | Unit tests (Vitest). The MongoDB store tests run when `MONGODB_TEST_URI` is set. |
| `npm run test:e2e` | Playwright end-to-end tests against a production build and a test database (`E2E_MONGODB_URI`, default local `mongod`) |
| `npm run audio:generate` | Re-synthesise the preview clips (needs Python 3, numpy, ffmpeg) |

## Testing and CI

- **Unit tests (Vitest):** filter parsing and sorting, the weekly schedule (including a DST case),
  Zod schemas, JWT signing and tamper detection, and the MongoDB store (unique indexes, concurrent
  enrollments, waitlist dedupe) against a throwaway database.
- **End-to-end tests (Playwright):** search and filters, the modal and the full page, 404s, the
  player surviving navigation, signup validation, the full sign up → enroll → dashboard → leave →
  log out → log in flow, duplicate emails, open-redirect protection, the waitlist, the JSON API and
  SEO files.
- **GitHub Actions** (`.github/workflows/ci.yml`) starts a MongoDB service container and runs lint,
  typecheck and unit tests, then the end-to-end suite, on every push and pull request.

## Performance

Lighthouse before and after is in [`docs/lighthouse.md`](docs/lighthouse.md). The headline: home
page Total Blocking Time went from **~160 s to 60 ms**, and Performance from 60 to 91, after
reworking the canvas animation.

## Deploying (Vercel)

1. Create a free MongoDB Atlas cluster and copy the connection string. In **Network Access**, allow
   `0.0.0.0/0`, because Vercel doesn't use fixed IP addresses.
2. Import the repo in Vercel and set `MONGODB_URI`, `SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL`
   for Production (and Preview, if you use preview deployments).
3. Deploy. The build reads the database too (enrollment and waitlist counts are prerendered), so
   `MONGODB_URI` must be available at build time.
