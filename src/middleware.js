import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes - they have their own authentication
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isPublicPath =
    path === "/login" || path === "/signup" || path === "/verifyemail";
  const token = request.cookies.get("token")?.value || "";

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/profile",
    "/verifyemail",
    "/business/:path*",
    "/generate/:path*",
    "/logs",
    // Explicitly include API routes in matcher but handle them separately
    "/api/:path*",
  ],
};
