# Lighthouse results

Measured with Lighthouse 12 (mobile preset, simulated throttling) against `next build && next start`
on localhost, headless Chromium. The measuring sandbox blocks outbound requests, so remote cover
images (images.unsplash.com) do not load in either run — treat absolute numbers as a lab baseline,
and compare before/after rather than against field data.

## Before (original code, Next.js 15.1.7)

| Route | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 60 | 98 | 96 | 100 | 3.4 s | 159,610 ms | 0 |
| `/courses` | 99 | 100 | 96 | 100 | 1.5 s | 150 ms | 0 |
| `/contact` | 93 | 100 | 100 | 100 | 2.0 s | 310 ms | 0 |

The extreme TBT on `/` comes from the full-window `<canvas>` wave animation (WavyBackground)
running a blurred redraw every animation frame, including while off-screen.
