import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireAdmin } from "./utils";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const getUserApplicationStatus = query({
    args: {},
    returns: v.union(
        v.null(),
        v.object({
            _id: v.id("tutorCandidates"),
            status: v.union(v.literal("applied"), v.literal("pending")),
            userId: v.id("users"),
            _creationTime: v.number(),
        })
    ),
    handler: async (ctx) => {
        // Get user ID without requiring authentication (returns null if not authenticated)
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        // Direct lookup by ID instead of filter
        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        // Use index for userId lookup instead of filter
        const application = await ctx.db
            .query("tutorCandidates")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        return application;
    },
});

export const getTutorsForPublic = query({
    args: {
        subjectId: v.optional(v.id("subjects")),
        levelId: v.optional(v.id("levels")),
    },
    returns: v.array(
        v.object({
            _id: v.id("users"),
            _creationTime: v.number(),
            firstName: v.string(),
            lastName: v.optional(v.string()),
            image: v.optional(v.string()),
            profile: v.optional(v.object({
                university: v.optional(v.string()),
                bio: v.optional(v.string()),
            })),
        })
    ),
    handler: async (ctx, { subjectId, levelId }) => {
        let matchingTutorIds = new Set<string>();

        if (subjectId || levelId) {
            // First, get tutor IDs that match the subject/level criteria efficiently
            if (levelId && !subjectId) {
                // Case 1: Filtering by specific level ID only - use index directly
                const tutorLevels = await ctx.db
                    .query("tutorLevels")
                    .withIndex("by_level", (q) => q.eq("levelId", levelId))
                    .collect();

                // Get tutor profile IDs and map to user IDs using Promise.all
                const tutorProfiles = await Promise.all(
                    tutorLevels.map(tutorLevel => ctx.db.get(tutorLevel.tutorId))
                );

                for (const tutorProfile of tutorProfiles) {
                    if (tutorProfile) {
                        matchingTutorIds.add(tutorProfile.userId);
                    }
                }
            } else if (subjectId && !levelId) {
                // Case 2: Filtering by subject ID only - get all levels in subject first
                const levelsInSubject = await ctx.db
                    .query("levels")
                    .withIndex("by_subject", (q) => q.eq("subjectId", subjectId))
                    .collect();

                // Get all tutorLevels for these levels using Promise.all
                const allTutorLevelsArrays = await Promise.all(
                    levelsInSubject.map(level =>
                        ctx.db
                            .query("tutorLevels")
                            .withIndex("by_level", (q) => q.eq("levelId", level._id))
                            .collect()
                    )
                );

                // Flatten and get unique tutor profile IDs
                const uniqueTutorProfileIds = new Set<Id<"tutorProfiles">>();
                for (const tutorLevelsArray of allTutorLevelsArrays) {
                    for (const tl of tutorLevelsArray) {
                        uniqueTutorProfileIds.add(tl.tutorId);
                    }
                }

                // Map tutor profile IDs to user IDs using Promise.all
                const tutorProfiles = await Promise.all(
                    Array.from(uniqueTutorProfileIds).map(profileId => ctx.db.get(profileId))
                );

                for (const tutorProfile of tutorProfiles) {
                    if (tutorProfile) {
                        matchingTutorIds.add(tutorProfile.userId);
                    }
                }
            } else if (subjectId && levelId) {
                // Case 3: Both subject and level - verify level belongs to subject first, then get tutors
                const level = await ctx.db.get(levelId);
                if (level && level.subjectId === subjectId) {
                    const tutorLevels = await ctx.db
                        .query("tutorLevels")
                        .withIndex("by_level", (q) => q.eq("levelId", levelId))
                        .collect();

                    // Get tutor profile IDs and map to user IDs using Promise.all
                    const tutorProfiles = await Promise.all(
                        tutorLevels.map(tutorLevel => ctx.db.get(tutorLevel.tutorId))
                    );

                    for (const tutorProfile of tutorProfiles) {
                        if (tutorProfile) {
                            matchingTutorIds.add(tutorProfile.userId);
                        }
                    }
                }
                // If level doesn't belong to subject, matchingTutorIds remains empty
            }
        } else {
            // No filters applied - get all tutors with tutor role
            const allTutors = await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", "tutor"))
                .collect();

            for (const tutor of allTutors) {
                matchingTutorIds.add(tutor._id);
            }
        }

        // Now only fetch detailed data for the matching tutors
        const matchingTutors = await Promise.all(
            Array.from(matchingTutorIds).map(tutorId => ctx.db.get(tutorId as Id<"users">))
        );

        // Filter out any null results and ensure they are tutors
        const validTutors = matchingTutors.filter(tutor =>
            tutor && tutor.role === "tutor"
        ) as Array<{
            _id: Id<"users">;
            _creationTime: number;
            firstName: string;
            lastName?: string;
            image?: string;
            role?: "admin" | "tutor" | "student";
        }>;

        // Get profiles and process images for the matching tutors only
        const tutorsWithData = await Promise.all(
            validTutors.map(async (tutor) => {
                // Get tutor profile
                const profile = await ctx.db
                    .query("tutorProfiles")
                    .withIndex("by_user", (q) => q.eq("userId", tutor._id))
                    .first();

                // Process image URL if it exists
                let imageUrl = tutor.image;
                if (tutor.image != null) {
                    imageUrl = await ctx.storage.getUrl(tutor.image) || undefined;
                }

                return {
                    _id: tutor._id,
                    _creationTime: tutor._creationTime,
                    firstName: tutor.firstName,
                    lastName: tutor.lastName,
                    image: imageUrl,
                    profile: profile ? {
                        university: profile.university,
                        bio: profile.bio,
                    } : undefined,
                };
            })
        );

        return tutorsWithData;
    }
});

// Get public tutor profile for individual tutor page
export const getTutorForPublic = query({
    args: {
        tutorId: v.id("users"),
    },
    returns: v.union(
        v.null(),
        v.object({
            _id: v.id("users"),
            _creationTime: v.number(),
            firstName: v.string(),
            lastName: v.optional(v.string()),
            image: v.optional(v.string()),
            profile: v.optional(v.object({
                university: v.optional(v.string()),
                bio: v.optional(v.string()),
            })),
            levels: v.array(v.object({
                subject: v.string(),
                level: v.string(),
                subjectId: v.id("subjects"),
                levelId: v.id("levels"),
            })),
        })
    ),
    handler: async (ctx, { tutorId }) => {
        // Get the user
        const user = await ctx.db.get(tutorId);
        if (!user || user.role !== "tutor") {
            return null;
        }

        // Get the profile image URL if exists
        let userWithImage = { ...user };
        if (user.image != null) {
            userWithImage.image = await ctx.storage.getUrl(user.image) || undefined;
        }

        // Get tutor profile
        const profile = await ctx.db
            .query("tutorProfiles")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!profile) {
            return {
                _id: userWithImage._id,
                _creationTime: userWithImage._creationTime,
                firstName: userWithImage.firstName,
                lastName: userWithImage.lastName,
                image: userWithImage.image,
                profile: undefined,
                levels: [],
            };
        }

        // Get tutor levels using profile ID
        const levels = await ctx.db
            .query("tutorLevels")
            .withIndex("by_tutor", (q) => q.eq("tutorId", profile._id))
            .collect();

        // Get subject and level names for levels
        const levelsWithNames = await Promise.all(
            levels.map(async (qual) => {
                const level = await ctx.db.get(qual.levelId);
                if (!level) return null; // Skip invalid levels

                const subject = await ctx.db.get(level.subjectId);
                if (!subject) return null; // Skip invalid subjects

                return {
                    subject: subject.name,
                    level: level.name,
                    subjectId: level.subjectId,
                    levelId: qual.levelId,
                };
            })
        );

        // Filter out null entries
        const validLevels = levelsWithNames.filter(level => level !== null);

        return {
            _id: userWithImage._id,
            _creationTime: userWithImage._creationTime,
            firstName: userWithImage.firstName,
            lastName: userWithImage.lastName,
            image: userWithImage.image,
            profile: profile ? {
                university: profile.university,
                bio: profile.bio,
            } : undefined,
            levels: validLevels,
        };
    }
});

// Get detailed tutor information for admin (SSR)
export const getTutorDetailsForAdmin = query({
    args: {
        tutorId: v.id("users"),
    },
    returns: v.union(
        v.null(),
        v.object({
            user: v.object({
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
            profile: v.union(
                v.null(),
                v.object({
                    _id: v.id("tutorProfiles"),
                    university: v.optional(v.string()),
                    bio: v.optional(v.string()),
                })
            ),
            levels: v.array(v.object({
                _id: v.id("tutorLevels"),
                subject: v.string(),
                level: v.string(),
                subjectId: v.id("subjects"),
                levelId: v.id("levels"),
            })),
        })
    ),
    handler: async (ctx, { tutorId }) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Get the user
        const user = await ctx.db.get(tutorId);
        if (!user || user.role !== "tutor") {
            return null;
        }

        if (user.image != null) {
            user.image = await ctx.storage.getUrl(user.image) || undefined;
        }

        // Get tutor profile
        const profile = await ctx.db
            .query("tutorProfiles")
            .withIndex("by_user", (q) => q.eq("userId", tutorId))
            .first();

        const levels = [];

        if (profile) {
            // Get tutor levels
            const tutorLevels = await ctx.db
                .query("tutorLevels")
                .withIndex("by_tutor", (q) => q.eq("tutorId", profile._id))
                .collect();

            // Get level and subject details
            for (const tutorLevel of tutorLevels) {
                const level = await ctx.db.get(tutorLevel.levelId);
                if (!level) continue;

                const subject = await ctx.db.get(level.subjectId);
                if (!subject) continue;

                levels.push({
                    _id: tutorLevel._id,
                    subject: subject.name,
                    level: level.name,
                    subjectId: level.subjectId,
                    levelId: tutorLevel.levelId,
                });
            }
        }

        return {
            user,
            profile: profile ? {
                _id: profile._id,
                university: profile.university,
                bio: profile.bio,
            } : null,
            levels,
        };
    },
});

// Simplified admin-only query for tutor listing
export const getTutorsForAdmin = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("users"),
            firstName: v.string(),
            lastName: v.optional(v.string()),
            email: v.optional(v.string()),
        })
    ),
    handler: async (ctx) => {
        // Require admin authentication
        await requireAdmin(ctx);

        const tutors = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "tutor"))
            .collect();

        // Return only the essential fields
        return tutors.map(tutor => ({
            _id: tutor._id,
            firstName: tutor.firstName,
            lastName: tutor.lastName,
            email: tutor.email,
        }));
    }
});

export const applyToBecomeTutorForPublic = mutation({
    args: {},
    returns: v.object({
        applicationId: v.id("tutorCandidates"),
    }),
    handler: async (ctx) => {
        // Get the current authenticated user
        const user = await requireUser(ctx);

        // Check if the user is already a tutor
        if (user.role === "tutor") {
            throw new Error("User is already a tutor");
        }

        // Check if there's already any application for this user
        const existingApplication = await ctx.db
            .query("tutorCandidates")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (existingApplication) {
            if (existingApplication.status === "pending") {
                throw new Error("You already have a pending tutor application");
            } else if (existingApplication.status === "applied") {
                throw new Error("You have already applied to become a tutor");
            }
        }

        // Create a new tutor application
        const applicationId = await ctx.db.insert("tutorCandidates", {
            userId: user._id,
            status: "pending",
        });

        return {
            applicationId,
        };
    }
});

// Admin function to add levels to a tutor
export const addLevelToTutorForAdmin = mutation({
    args: {
        tutorId: v.id("users"),
        levelId: v.id("levels"),
    },
    returns: v.object({
        success: v.boolean(),
    }),
    handler: async (ctx, { tutorId, levelId }) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Get or create the tutor's profile
        let tutorProfile = await ctx.db
            .query("tutorProfiles")
            .withIndex("by_user", (q) => q.eq("userId", tutorId))
            .first();

        if (!tutorProfile) {
            // Create tutor profile if it doesn't exist
            const profileId = await ctx.db.insert("tutorProfiles", {
                userId: tutorId,
            });
            tutorProfile = await ctx.db.get(profileId);
            if (!tutorProfile) {
                throw new Error("Failed to create tutor profile");
            }
        }

        // Check if the level assignment already exists using compound index
        const existingLevel = await ctx.db
            .query("tutorLevels")
            .withIndex("by_tutor_and_level", (q) =>
                q.eq("tutorId", tutorProfile._id).eq("levelId", levelId))
            .first();

        if (existingLevel) {
            throw new Error("Tutor already has this level assigned");
        }

        // Add the level to the tutor
        await ctx.db.insert("tutorLevels", {
            tutorId: tutorProfile._id,
            levelId: levelId,
        });

        return { success: true };
    }
});

// Admin function to remove a level from a tutor
export const removeLevelFromTutorForAdmin = mutation({
    args: {
        tutorId: v.id("users"),
        levelId: v.id("levels"),
    },
    returns: v.object({
        success: v.boolean(),
    }),
    handler: async (ctx, { tutorId, levelId }) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Get the tutor's profile
        const tutorProfile = await ctx.db
            .query("tutorProfiles")
            .withIndex("by_user", (q) => q.eq("userId", tutorId))
            .first();

        if (!tutorProfile) {
            throw new Error("Tutor profile not found");
        }

        // Find the level assignment using compound index
        const levelAssignment = await ctx.db
            .query("tutorLevels")
            .withIndex("by_tutor_and_level", (q) =>
                q.eq("tutorId", tutorProfile._id).eq("levelId", levelId))
            .first();

        if (!levelAssignment) {
            throw new Error("Tutor does not have this level assigned");
        }

        await ctx.db.delete(levelAssignment._id);

        return { success: true };
    }
});

// Function to update tutor profile information
export const updateTutorProfileForAdmin = mutation({
    args: {
        tutorId: v.id("users"),
        university: v.optional(v.string()),
        bio: v.optional(v.string()),
    },
    returns: v.object({
        success: v.boolean(),
    }),
    handler: async (ctx, { tutorId, university, bio }) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Get the tutor's profile
        let tutorProfile = await ctx.db
            .query("tutorProfiles")
            .withIndex("by_user", (q) => q.eq("userId", tutorId))
            .first();

        // If no profile exists, create one first
        if (!tutorProfile) {
            const user = await ctx.db.get(tutorId);
            if (!user) {
                throw new Error("User not found");
            }

            await ctx.db.insert("tutorProfiles", {
                userId: tutorId,
                university,
                bio,
            });

            return { success: true };
        }

        // Update the existing profile
        const updateData: { university?: string; bio?: string } = {};
        if (university !== undefined) {
            updateData.university = university;
        }
        if (bio !== undefined) {
            updateData.bio = bio;
        }

        await ctx.db.patch(tutorProfile._id, updateData);

        return { success: true };
    }
});
