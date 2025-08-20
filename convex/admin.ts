import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, createTutorProfile } from "./utils";

export const approveTutorApplication = mutation({
    args: {
        applicationId: v.id("tutorCandidates"),
    },
    returns: v.object({
        success: v.boolean(),
        message: v.string(),
    }),
    handler: async (ctx, args) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Get the application using direct ID lookup
        const application = await ctx.db.get(args.applicationId);

        if (!application) {
            throw new Error("Application not found");
        }

        // Check if application is in pending status
        if (application.status !== "pending") {
            throw new Error(`Application is already ${application.status}`);
        }

        // Get the user who applied
        const applicantUser = await ctx.db.get(application.userId);
        if (!applicantUser) {
            throw new Error("Applicant user not found");
        }

        // Check if user is already a tutor
        if (applicantUser.role === "tutor") {
            throw new Error("User is already a tutor");
        }

        // Update the application status to applied (approved)
        await ctx.db.patch(args.applicationId, {
            status: "applied",
        });

        // Update the user's role to tutor
        await ctx.db.patch(application.userId, {
            role: "tutor",
        });

        // Create tutor profile if it doesn't exist
        await createTutorProfile(ctx, application.userId);

        return {
            success: true,
            message: `Successfully approved tutor application for ${applicantUser.firstName} ${applicantUser.lastName || ''}`.trim(),
        };
    }
});

export const rejectTutorApplication = mutation({
    args: {
        applicationId: v.id("tutorCandidates"),
        reason: v.optional(v.string()),
    },
    returns: v.object({
        success: v.boolean(),
        message: v.string(),
    }),
    handler: async (ctx, args) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Get the application using direct ID lookup
        const application = await ctx.db.get(args.applicationId);

        if (!application) {
            throw new Error("Application not found");
        }

        // Check if application is in pending status
        if (application.status !== "pending") {
            throw new Error(`Application is already ${application.status}`);
        }

        // Get the user who applied
        const applicantUser = await ctx.db.get(application.userId);
        if (!applicantUser) {
            throw new Error("Applicant user not found");
        }

        // Delete the application (or you could update status to "rejected" if you want to keep history)
        await ctx.db.delete(args.applicationId);

        return {
            success: true,
            message: `Successfully rejected tutor application for ${applicantUser.firstName} ${applicantUser.lastName || ''}`.trim(),
        };
    }
});

export const getPendingTutorCandidates = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("tutorCandidates"),
            _creationTime: v.number(),
            userId: v.id("users"),
            status: v.union(v.literal("applied"), v.literal("pending")),
            user: v.union(
                v.object({
                    _id: v.id("users"),
                    _creationTime: v.number(),
                    firstName: v.string(),
                    lastName: v.optional(v.string()),
                    image: v.optional(v.string()),
                    email: v.optional(v.string()),
                    emailVerificationTime: v.optional(v.number()),
                    phone: v.optional(v.string()),
                    phoneVerificationTime: v.optional(v.number()),
                    isAnonymous: v.optional(v.boolean()),
                    role: v.optional(v.union(v.literal("admin"), v.literal("tutor"), v.literal("student"))),
                }),
                v.null()
            ),
        })
    ),
    handler: async (ctx) => {
        // Require admin authentication
        await requireAdmin(ctx);

        const pendingCandidates = await ctx.db
            .query("tutorCandidates")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .order("desc")
            .collect();

        const pendingCandidatesWithUsers = await Promise.all(
            pendingCandidates.map(async (candidate) => {
                const user = await ctx.db.get(candidate.userId);

                return {
                    ...candidate,
                    user,
                };
            })
        );

        return pendingCandidatesWithUsers;
    }
})
