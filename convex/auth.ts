import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google, { GoogleProfile } from "@auth/core/providers/google";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google({
    profile: (prof: GoogleProfile) => {
      return {
        id: prof.sub,
        firstName: prof.given_name,
        lastName: prof.family_name,
        email: prof.email,
        image: prof.picture,
      };
    },
  })],
  callbacks: {
    /**
     * This callback runs after a user signs in or updates their auth info.
     * We use it to set default permissions for new users.
     *
     * @param ctx - Convex context for database operations
     * @param args - Contains userId and flags for new/existing users
     */
    async afterUserCreatedOrUpdated(ctx, args) {
      // Skip if this is an existing user update
      if (args.existingUserId) return;

      // For new users, set their default role to STUDENT
      await ctx.db.patch(args.userId, {
        role: "student",
      });
    },
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});