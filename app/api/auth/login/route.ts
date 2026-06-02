import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import { createSession, setSessionCookie } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { updateAdminLastLogin } from "@/lib/db";
import { resolveSessionFromUid } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";

const loginSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await initializeApp();
    const body = await request.json();
    const parsed = parseBody(loginSchema, body);
    if (!parsed.ok) return jsonError(parsed.error, 400);

    const decoded = await getAdminAuth().verifyIdToken(parsed.data.idToken);
    const session = await resolveSessionFromUid(decoded.uid);

    if (!session) {
      return jsonError(
        "No admin profile found. Ask a super admin to add your account in Firestore admins collection.",
        403
      );
    }

    const token = await createSession(session);
    await setSessionCookie(token);
    await updateAdminLastLogin(session.sub);

    return jsonOk({
      user: {
        id: session.sub,
        name: session.name,
        email: session.email,
        roleId: session.roleId,
        permissions: session.permissions,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    return jsonError(message, 500);
  }
}
