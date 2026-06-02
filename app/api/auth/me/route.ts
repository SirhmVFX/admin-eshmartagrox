import { jsonError, jsonOk } from "@/lib/api-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { initializeApp } from "@/lib/seed";

export async function GET(request: Request) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  if (!session) return jsonError("Unauthorized", 401);
  return jsonOk({
    user: {
      id: session.sub,
      name: session.name,
      email: session.email,
      roleId: session.roleId,
      permissions: session.permissions,
    },
  });
}
