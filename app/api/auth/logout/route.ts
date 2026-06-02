import { jsonOk } from "@/lib/api-utils";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  return jsonOk({ success: true });
}
