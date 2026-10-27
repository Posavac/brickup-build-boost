import { createFileRoute } from "@tanstack/react-router";

import { checkPassword, clearCookie, isAuthed, sessionCookie } from "@/lib/server/admin";

// ---------------------------------------------------------------------------
// /api/admin/session
//   GET    → { ok } (je li prijavljen)
//   POST   → prijava lozinkom (ADMIN_PASSWORD), postavlja kolačić
//   DELETE → odjava
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.json({ ok: await isAuthed(request) }),
      POST: async ({ request }) => {
        let password = "";
        try {
          const body = (await request.json()) as { password?: unknown };
          password = typeof body.password === "string" ? body.password : "";
        } catch {
          // falls through to the wrong-password response
        }
        if (!password || !(await checkPassword(password))) {
          return Response.json({ ok: false, error: "Pogrešna lozinka." }, { status: 401 });
        }
        return Response.json({ ok: true }, { headers: { "set-cookie": await sessionCookie() } });
      },
      DELETE: async () => Response.json({ ok: true }, { headers: { "set-cookie": clearCookie } }),
    },
  },
});
