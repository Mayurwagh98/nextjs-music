# Lighthouse results

Measured with Lighthouse 12 (mobile preset, simulated throttling) against `next build && next start`
on localhost, headless Chromium. The measuring sandbox blocks outbound requests, so remote cover
images (images.unsplash.com) do not load in either run, and that's also the only source of the
"errors in console" Best Practices deduction. Treat absolute numbers as a lab baseline and compare
before/after rather than against field data.

## Before (original code, Next.js 15.1.7)

| Route | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 60 | 98 | 96 | 100 | 3.4 s | 159,610 ms | 0 |
| `/courses` | 99 | 100 | 96 | 100 | 1.5 s | 150 ms | 0 |
| `/contact` | 93 | 100 | 100 | 100 | 2.0 s | 310 ms | 0 |

The extreme TBT on `/` comes from the full-window `<canvas>` wave animation (WavyBackground)
running a blurred redraw every animation frame, including while off-screen.

## After (Next.js 16.4, Cache Components)

| Route | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 91 | 100 | 96 | 100 | 3.2 s | 60 ms | 0 |
| `/courses` | 98 | 100 | 96 | 100 | 2.3 s | 50 ms | 0 |
| `/courses/guitar-fundamentals` | 90 | 100 | 96 | 100 | 3.5 s | 120 ms | 0 |
| `/waitlist` (was `/contact`) | 92 | 100 | 100 | 100 | 3.1 s | 140 ms | 0 |

Simulated-throttling scores move by a few points between runs; the TBT change is the real result.

What changed:

- **Home TBT: 159,610 ms → 60 ms.** `WavyBackground` now sizes the canvas to its section instead of
  the window, renders at half resolution, blurs with a GPU CSS filter instead of `ctx.filter`, only
  animates while on screen (IntersectionObserver) and the tab is visible, and draws one static frame
  for `prefers-reduced-motion`.
- **Accessibility 98 → 100.** Low-contrast grey text raised from `neutral-500` to `neutral-400`,
  heading levels made sequential, and labels added to every form control.
- Pages are now dynamic (sessions, enrollments, search) yet still served from a prerendered static
  shell: only the per-user parts stream in behind `<Suspense>`.
