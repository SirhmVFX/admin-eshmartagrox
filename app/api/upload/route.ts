import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";

/** Uploads are handled client-side via Firebase Storage (ImageUpload component). */
export async function GET(request: NextRequest) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "media:read");
  if (!check.ok) return jsonError(check.message, check.status);

  return jsonOk({
    files: [],
    message: "Use the Media page upload — files go to Firebase Storage.",
  });
}

export async function POST() {
  return jsonError(
    "Use client-side Firebase Storage upload via the ImageUpload component.",
    400
  );
}
