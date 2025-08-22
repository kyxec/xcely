import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "./convex/_generated/api";

const isLoginPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher(["/", "/server"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isMessagesRoute = createRouteMatcher(["/messages(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Redirect authenticated users away from login page
  if (isLoginPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // Messages route protection - require authentication and proper role
  if (isMessagesRoute(request)) {
    const token = await convexAuth.getToken();
    if (!token) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    const user = await fetchQuery(api.auth.getMe, {}, { token });
    if (!user || (user.role !== "student" && user.role !== "tutor")) {
      return nextjsMiddlewareRedirect(request, "/");
    }
  }

  // Admin route protection - require authentication first
  if (isAdminRoute(request)) {
    const token = await convexAuth.getToken();
    if (!token) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    const user = await fetchQuery(api.auth.getMe, {}, { token });
    if (user?.role !== "admin") {
      return nextjsMiddlewareRedirect(request, "/");
    }
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
