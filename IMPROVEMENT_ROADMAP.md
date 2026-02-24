# DogeUB Improvement Roadmap

This roadmap focuses on improving **reliability, performance, maintainability, and user trust** without changing DogeUB's core product direction.

## 1) Server hardening and observability (highest impact)

- Add structured logging (request id, route, status code, latency) instead of `logger: false` to make production debugging easier.
- Add security headers via a Fastify plugin (CSP, X-Content-Type-Options, Referrer-Policy, frame protections where possible).
- Add lightweight per-IP rate limiting for expensive routes (`/return`, remote asset proxy routes).
- Add health/readiness endpoints (`/healthz`, `/readyz`) and expose upstream availability checks.
- Add timeout + retry policy for upstream fetches in `proxy()` and `/return` to avoid hanging requests.

## 2) Remote dependency resilience

- Mirror critical remote scripts/assets and introduce fallback URLs so a third-party outage does not break startup UX.
- Add build-time integrity/version pinning for external resources to reduce supply-chain risk.
- Add circuit-breaker behavior for repeatedly failing upstreams (serve fallback response after threshold).

## 3) Performance improvements

- Add micro-caching for search suggestions (`/return`) with short TTL (e.g., 30–60s) to cut repeated external calls.
- Add `stale-while-revalidate` caching policy where safe for static non-hashed assets.
- Measure bundle composition and split large routes/components with lazy loading boundaries.
- Add server timing metrics (`Server-Timing`) to profile proxy overhead from the browser.

## 4) Product UX upgrades

- Improve failure UX for blocked/unreachable destinations with clearer recovery actions.
- Add built-in diagnostics panel (connection mode, upstream status, websocket state, ping).
- Add optional profiles ("privacy", "speed", "compatibility") that tune defaults for users.
- Add import/export for user settings and quick-links.

## 5) Quality and release process

- Add automated tests:
  - Unit tests for utility functions and middleware behavior.
  - Integration tests for proxy routes, cache headers, and fallback routing.
  - Basic E2E smoke test for launch + search + proxy navigation.
- Add CI pipeline gates: `npm run lint`, `npm run build`, and tests on every PR.
- Add dependency update automation (weekly) with lockfile integrity checks.

## 6) Suggested implementation order

1. Logging + health endpoints + timeouts/retries.
2. Rate limiting + security headers.
3. `/return` caching + upstream fallback strategy.
4. Test scaffolding and CI enforcement.
5. UX diagnostics and profile presets.

## Quick wins you can do this week

- Turn on Fastify logger with a compact production serializer.
- Add 5–10 second fetch timeout wrapper for `proxy()` and `/return`.
- Add `/healthz` endpoint that reports process uptime and version.
- Cache `/return` results in memory for 60 seconds.
- Add request latency logging for all non-static API routes.
