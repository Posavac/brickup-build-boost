# BrickUp — agent notes

This is a TanStack Start (React) site for a craftsman/handyman business
serving Zagreb and Slavonia. See `README.md` for the file-based routing
conventions used in `src/routes/`.

Key pieces:

- `src/routes/index.tsx` — the single-page marketing site and lead form.
- `src/routes/api/contact.ts` — server route that validates and emails new
  leads via Resend. Requires the `RESEND_API_KEY` environment variable
  (see setup notes shared with this codebase).
- `src/server.ts` / `src/start.ts` — SSR error-handling wrapper so a crashed
  render returns a friendly HTML error page instead of a raw 500 response.

Deployment target is Cloudflare Workers (`nitro` with the
`cloudflare-module` preset, configured in `vite.config.ts`, build-only).
