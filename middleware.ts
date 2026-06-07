import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware was using JWT-based auth which we've replaced with Firebase.
// Keep it disabled for now as Firebase auth is handled client-side via useAuth provider.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
