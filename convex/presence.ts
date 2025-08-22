import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./utils";

export type PresenceData = {
    typing?: boolean;
    lastSeen?: number;
    status?: "online" | "away" | "offline";
    inMessagesPage?: boolean;
    inConversation?: boolean;
    conversationId?: string;
    [key: string]: any;
};

/**
 * Update user presence in a room
 */
export const updatePresence = mutation({
    args: {
        room: v.string(),
        data: v.string(), // JSON stringified presence data
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const now = Date.now();

        // Check if presence record exists for this user in this room
        const existingPresence = await ctx.db
            .query("presence")
            .withIndex("by_room_and_user", (q) =>
                q.eq("room", args.room).eq("userId", user._id)
            )
            .first();

        if (existingPresence) {
            // Update existing presence
            await ctx.db.patch(existingPresence._id, {
                data: args.data,
                lastSeen: now,
            });
        } else {
            // Create new presence record
            await ctx.db.insert("presence", {
                userId: user._id,
                room: args.room,
                data: args.data,
                lastSeen: now,
            });
        }

        return null;
    },
});

/**
 * Send heartbeat to update last seen time
 */
export const heartbeat = mutation({
    args: {
        room: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const now = Date.now();

        const existingPresence = await ctx.db
            .query("presence")
            .withIndex("by_room_and_user", (q) =>
                q.eq("room", args.room).eq("userId", user._id)
            )
            .first();

        if (existingPresence) {
            await ctx.db.patch(existingPresence._id, {
                lastSeen: now,
            });
        } else {
            // Create minimal presence record if none exists
            await ctx.db.insert("presence", {
                userId: user._id,
                room: args.room,
                data: JSON.stringify({}),
                lastSeen: now,
            });
        }

        return null;
    },
});

/**
 * Get presence data for all users in a room
 */
export const getPresenceInRoom = query({
    args: {
        room: v.string(),
    },
    returns: v.array(
        v.object({
            userId: v.id("users"),
            userName: v.string(),
            data: v.string(),
            lastSeen: v.number(),
            isOnline: v.boolean(),
        })
    ),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const now = Date.now();
        const ONLINE_THRESHOLD = 5000; // 5 seconds - faster offline detection

        // Get all presence records for this room
        const presenceRecords = await ctx.db
            .query("presence")
            .withIndex("by_room", (q) => q.eq("room", args.room))
            .collect();

        // Enrich with user data
        const enrichedPresence = [];
        for (const presence of presenceRecords) {
            const presenceUser = await ctx.db.get(presence.userId);
            if (presenceUser && presence.userId !== user._id) {
                enrichedPresence.push({
                    userId: presence.userId,
                    userName: presenceUser.firstName + (presenceUser.lastName ? ` ${presenceUser.lastName}` : ""),
                    data: presence.data,
                    lastSeen: presence.lastSeen,
                    isOnline: (now - presence.lastSeen) < ONLINE_THRESHOLD,
                });
            }
        }

        // Sort by online status first, then by last seen
        return enrichedPresence.sort((a, b) => {
            if (a.isOnline !== b.isOnline) {
                return a.isOnline ? -1 : 1;
            }
            return b.lastSeen - a.lastSeen;
        });
    },
});

/**
 * Immediately mark user as offline in a room
 */
export const setOffline = mutation({
    args: {
        room: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const existingPresence = await ctx.db
            .query("presence")
            .withIndex("by_room_and_user", (q) =>
                q.eq("room", args.room).eq("userId", user._id)
            )
            .first();

        if (existingPresence) {
            // Parse existing data and mark as offline
            let presenceData;
            try {
                presenceData = JSON.parse(existingPresence.data);
            } catch {
                presenceData = {};
            }

            presenceData.status = "offline";
            presenceData.lastSeen = Date.now();

            await ctx.db.patch(existingPresence._id, {
                data: JSON.stringify(presenceData),
                lastSeen: Date.now() - 10000, // Set to 10 seconds ago to ensure immediate offline status
            });
        }

        return null;
    },
});

/**
 * Clean up old presence records (can be called periodically)
 */
export const cleanupPresence = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const now = Date.now();
        const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

        // Find old presence records
        const oldRecords = await ctx.db
            .query("presence")
            .withIndex("by_last_seen")
            .filter((q) => q.lt(q.field("lastSeen"), now - CLEANUP_THRESHOLD))
            .collect();

        // Delete old records
        await Promise.all(
            oldRecords.map((record) => ctx.db.delete(record._id))
        );

        return null;
    },
});
