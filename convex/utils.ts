import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx } from "./_generated/server";

// Helper type for contexts that support authentication
export type AuthCtx = QueryCtx | MutationCtx;

/**
 * Require user to be authenticated and return the user document
 */
export async function requireUser(ctx: AuthCtx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
        throw new Error("User must be authenticated");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", userId))
        .first();

    if (!user) {
        throw new Error("User not found in database");
    }

    return user;
}

/**
 * Require user to have a specific role
 */
export async function requireRole(ctx: AuthCtx, role: "admin" | "tutor" | "student") {
    const user = await requireUser(ctx);

    if (user.role !== role) {
        throw new Error(`User must be a ${role}`);
    }

    return user;
}

/**
 * Require user to be an admin
 */
export async function requireAdmin(ctx: AuthCtx) {
    return await requireRole(ctx, "admin");
}

/**
 * Require user to be a tutor
 */
export async function requireTutor(ctx: AuthCtx) {
    return await requireRole(ctx, "tutor");
}

/**
 * Require user to be a student
 */
export async function requireStudent(ctx: AuthCtx) {
    return await requireRole(ctx, "student");
}

/**
 * Get the current user if authenticated, return null if not
 */
export async function getCurrentUser(ctx: AuthCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }

    const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", identity.email))
        .first();

    return user || null;
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(ctx: AuthCtx, role: "admin" | "tutor" | "student") {
    const user = await getCurrentUser(ctx);
    return user?.role === role;
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(ctx: AuthCtx) {
    return await hasRole(ctx, "admin");
}

/**
 * Check if current user is a tutor
 */
export async function isTutor(ctx: AuthCtx) {
    return await hasRole(ctx, "tutor");
}

/**
 * Check if current user is a student
 */
export async function isStudent(ctx: AuthCtx) {
    return await hasRole(ctx, "student");
}

/**
 * Require user to be either admin or tutor
 */
export async function requireAdminOrTutor(ctx: AuthCtx) {
    const user = await requireUser(ctx);

    if (user.role !== "admin" && user.role !== "tutor") {
        throw new Error("User must be an admin or tutor");
    }

    return user;
}

/**
 * Get user by ID with error handling
 */
export async function getUserById(ctx: AuthCtx, userId: string) {
    const user = await ctx.db.get(userId as any);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

/**
 * Get or create tutor profile for a user (mutation context only)
 */
export async function createTutorProfile(ctx: MutationCtx, userId: string) {
    const existingProfile = await ctx.db
        .query("tutorProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId as any))
        .first();

    if (existingProfile) {
        return existingProfile;
    }

    // Create new profile
    const profileId = await ctx.db.insert("tutorProfiles", {
        userId: userId as any,
    });

    const newProfile = await ctx.db.get(profileId);
    if (!newProfile) {
        throw new Error("Failed to create tutor profile");
    }

    return newProfile;
}

/**
 * Get tutor profile for a user (query/mutation context)
 */
export async function getTutorProfile(ctx: AuthCtx, userId: string) {
    const profile = await ctx.db
        .query("tutorProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId as any))
        .first();

    if (!profile) {
        throw new Error("Tutor profile not found");
    }

    return profile;
}
