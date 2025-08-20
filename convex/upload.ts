import { mutation } from './_generated/server';
import { v } from "convex/values";
import { requireAdmin } from "./utils";

export const generateUploadUrl = mutation(async (ctx) => {
    // Require admin authentication for uploads
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
});

export const saveProfileImage = mutation({
    args: {
        storageId: v.id('_storage'),
        tutorId: v.id("users")
    },
    handler: async (ctx, args) => {
        // Require admin authentication
        await requireAdmin(ctx);

        // Verify the user exists
        const user = await ctx.db.get(args.tutorId);
        if (!user) {
            throw new Error('User not found');
        }

        // Update user's profile image
        await ctx.db.patch(args.tutorId, {
            image: args.storageId,
        });

        return { success: true };
    },
});
