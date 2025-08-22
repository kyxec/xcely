import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireStudent } from "./utils";
import { Id } from "./_generated/dataModel";

// Message content types for dynamic messages
export type TextMessageContent = {
    type: "text";
    text: string;
};

export type BookingMessageContent = {
    type: "booking";
    bookingType: "freeMeeting" | "paidSession";
    subjectName: string;
    levelName: string;
    status: "pending" | "confirmed" | "canceled" | "completed";
    suggestedTimes?: number[];
    initialMessage?: string;
};

export type SystemNotificationContent = {
    type: "systemNotification";
    notification: string;
    action?: string;
};

export type MessageContent = TextMessageContent | BookingMessageContent | SystemNotificationContent;

/**
 * Start conversation with a tutor and create free meeting booking
 * Only students can initiate conversations, and they can only have one free meeting per tutor
 */
export const startConversationWithFreeMeeting = mutation({
    args: {
        tutorId: v.id("users"),
        subjectId: v.id("subjects"),
        levelId: v.id("levels"),
        initialMessage: v.string(),
        preferredBookingTime: v.optional(v.string()),
    },
    returns: v.object({
        conversationId: v.id("conversations"),
        bookingId: v.id("bookings"),
    }),
    handler: async (ctx, args) => {
        // Ensure user is authenticated and is a student
        const student = await requireStudent(ctx);

        // Verify the tutor exists and is actually a tutor
        const tutor = await ctx.db.get(args.tutorId);
        if (!tutor) {
            throw new Error("Tutor not found");
        }
        if (tutor.role !== "tutor") {
            throw new Error("Selected user is not a tutor");
        }

        // Verify the subject and level exist and are valid
        const subject = await ctx.db.get(args.subjectId);
        if (!subject) {
            throw new Error("Subject not found");
        }

        const level = await ctx.db.get(args.levelId);
        if (!level) {
            throw new Error("Level not found");
        }

        // Verify the level belongs to the subject
        if (level.subjectId !== args.subjectId) {
            throw new Error("Level does not belong to the specified subject");
        }

        // Check if tutor teaches this subject and level
        const tutorProfile = await ctx.db
            .query("tutorProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.tutorId))
            .first();

        if (!tutorProfile) {
            throw new Error("Tutor profile not found");
        }

        const tutorLevel = await ctx.db
            .query("tutorLevels")
            .withIndex("by_tutor_and_level", (q) =>
                q.eq("tutorId", tutorProfile._id).eq("levelId", args.levelId)
            )
            .first();

        if (!tutorLevel) {
            throw new Error("Tutor does not teach this subject and level");
        }

        // Check if student already has a free meeting with this tutor
        const existingFreeMeeting = await ctx.db
            .query("bookings")
            .withIndex("by_student_and_tutor_and_type", (q) =>
                q.eq("studentId", student._id)
                    .eq("tutorId", args.tutorId)
                    .eq("bookingType", "freeMeeting")
            )
            .first();

        if (existingFreeMeeting) {
            throw new Error("You already have a free meeting with this tutor. You can only have one free meeting per tutor.");
        }

        // Check if there's already an active conversation between this student and tutor
        let conversation = await ctx.db
            .query("conversations")
            .withIndex("by_student_and_tutor", (q) =>
                q.eq("studentId", student._id).eq("tutorId", args.tutorId)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .first();

        // Create conversation if it doesn't exist
        if (!conversation) {
            const conversationId = await ctx.db.insert("conversations", {
                studentId: student._id,
                tutorId: args.tutorId,
                status: "active",
            });
            conversation = await ctx.db.get(conversationId);
            if (!conversation) {
                throw new Error("Failed to create conversation");
            }
        }

        // Create the free meeting booking
        const suggestedTimes = args.preferredBookingTime
            ? [new Date(args.preferredBookingTime).getTime()]
            : undefined;

        const bookingId = await ctx.db.insert("bookings", {
            tutorId: args.tutorId,
            studentId: student._id,
            levelId: args.levelId,
            conversationId: conversation._id,
            bookingType: "freeMeeting",
            status: "pending",
            suggestedTimes,
        });

        // Create a single interactive booking message with all information
        const bookingMessageContent: BookingMessageContent = {
            type: "booking",
            bookingType: "freeMeeting",
            subjectName: subject.name,
            levelName: level.name,
            status: "pending",
            initialMessage: args.initialMessage,
            suggestedTimes: suggestedTimes,
        };

        await ctx.db.insert("messages", {
            conversationId: conversation._id,
            senderId: student._id,
            messageType: "booking",
            content: JSON.stringify(bookingMessageContent),
            relatedBookingId: bookingId,
        }); return {
            conversationId: conversation._id,
            bookingId,
        };
    },
});

/**
 * Send a regular text message in an existing conversation
 * Both students and tutors can send messages once conversation is started
 */
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    returns: v.id("messages"),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Verify the conversation exists and user is a participant
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.status !== "active") {
            throw new Error("Cannot send messages to archived conversations");
        }

        // Check if user is either the student or tutor in this conversation
        if (conversation.studentId !== user._id && conversation.tutorId !== user._id) {
            throw new Error("You are not a participant in this conversation");
        }

        // Create the text message
        const textMessageContent: TextMessageContent = {
            type: "text",
            text: args.content,
        };

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            messageType: "text",
            content: JSON.stringify(textMessageContent),
        });

        return messageId;
    },
});

/**
 * Get conversations for the current user
 * Students see conversations they started, tutors see conversations they're participating in
 */
export const getMyConversations = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("conversations"),
            _creationTime: v.number(),
            studentId: v.id("users"),
            tutorId: v.id("users"),
            status: v.union(v.literal("active"), v.literal("archived")),
            // Additional fields for display
            studentName: v.string(),
            tutorName: v.string(),
            lastMessage: v.optional(
                v.object({
                    content: v.string(),
                    _creationTime: v.number(),
                    senderName: v.string(),
                    messageType: v.union(v.literal("text"), v.literal("booking"), v.literal("systemNotification")),
                })
            ),
            unreadCount: v.number(),
            hasFreeMeeting: v.boolean(),
        })
    ),
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        let conversations;

        if (user.role === "student") {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_student", (q) => q.eq("studentId", user._id))
                .order("desc")
                .collect();
        } else if (user.role === "tutor") {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_tutor", (q) => q.eq("tutorId", user._id))
                .order("desc")
                .collect();
        } else {
            throw new Error("Only students and tutors can view conversations");
        }

        // Enrich conversations with additional data
        const enrichedConversations = await Promise.all(
            conversations.map(async (conversation) => {
                // Get student and tutor names
                const student = await ctx.db.get(conversation.studentId);
                const tutor = await ctx.db.get(conversation.tutorId);

                if (!student || !tutor) {
                    throw new Error("Invalid conversation data");
                }

                // Get last message
                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
                    .order("desc")
                    .first();

                let lastMessageData;
                if (lastMessage) {
                    const sender = await ctx.db.get(lastMessage.senderId);
                    if (sender) {
                        lastMessageData = {
                            content: lastMessage.content,
                            _creationTime: lastMessage._creationTime,
                            senderName: sender.firstName + (sender.lastName ? ` ${sender.lastName}` : ""),
                            messageType: lastMessage.messageType,
                        };
                    }
                }

                // Count unread messages (messages without readAt where sender is not current user)
                const unreadMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
                    .filter((q) =>
                        q.and(
                            q.neq(q.field("senderId"), user._id),
                            q.eq(q.field("readAt"), undefined)
                        )
                    )
                    .collect();

                // Check if there's a free meeting booking for this conversation
                const freeMeetingBooking = await ctx.db
                    .query("bookings")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
                    .filter((q) => q.eq(q.field("bookingType"), "freeMeeting"))
                    .first();

                return {
                    ...conversation,
                    studentName: student.firstName + (student.lastName ? ` ${student.lastName}` : ""),
                    tutorName: tutor.firstName + (tutor.lastName ? ` ${tutor.lastName}` : ""),
                    lastMessage: lastMessageData,
                    unreadCount: unreadMessages.length,
                    hasFreeMeeting: !!freeMeetingBooking,
                };
            })
        );

        return enrichedConversations;
    },
});

/**
 * Get messages for a specific conversation
 */
export const getConversationMessages = query({
    args: {
        conversationId: v.id("conversations"),
    },
    returns: v.array(
        v.object({
            _id: v.id("messages"),
            _creationTime: v.number(),
            conversationId: v.id("conversations"),
            senderId: v.id("users"),
            messageType: v.union(v.literal("text"), v.literal("booking"), v.literal("systemNotification")),
            content: v.string(),
            relatedBookingId: v.optional(v.id("bookings")),
            readAt: v.optional(v.number()),
            senderName: v.string(),
            senderRole: v.union(v.literal("student"), v.literal("tutor")),
        })
    ),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Verify the conversation exists and user is a participant
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Check if user is either the student or tutor in this conversation
        if (conversation.studentId !== user._id && conversation.tutorId !== user._id) {
            throw new Error("You are not a participant in this conversation");
        }

        // Get messages for this conversation
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich messages with sender information
        const enrichedMessages = await Promise.all(
            messages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);
                if (!sender) {
                    throw new Error("Message sender not found");
                }

                return {
                    ...message,
                    senderName: sender.firstName + (sender.lastName ? ` ${sender.lastName}` : ""),
                    senderRole: sender.role as "student" | "tutor",
                };
            })
        );

        return enrichedMessages;
    },
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Verify the conversation exists and user is a participant
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Check if user is either the student or tutor in this conversation
        if (conversation.studentId !== user._id && conversation.tutorId !== user._id) {
            throw new Error("You are not a participant in this conversation");
        }

        // Get unread messages from other users
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("senderId"), user._id),
                    q.eq(q.field("readAt"), undefined)
                )
            )
            .collect();

        // Mark them as read
        const readTimestamp = Date.now();
        await Promise.all(
            unreadMessages.map((message) =>
                ctx.db.patch(message._id, { readAt: readTimestamp })
            )
        );

        return null;
    },
});

/**
 * Archive a conversation (only for the student who started it)
 */
export const archiveConversation = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Verify the conversation exists
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Only the student who started the conversation can archive it
        if (conversation.studentId !== user._id) {
            throw new Error("Only the student who started the conversation can archive it");
        }

        // Archive the conversation
        await ctx.db.patch(args.conversationId, { status: "archived" });

        return null;
    },
});

/**
 * Get messages in a specific conversation
 */
export const getMessagesInConversation = query({
    args: {
        conversationId: v.id("conversations"),
    },
    returns: v.array(
        v.object({
            _id: v.id("messages"),
            _creationTime: v.number(),
            conversationId: v.id("conversations"),
            senderId: v.id("users"),
            messageType: v.union(v.literal("text"), v.literal("booking"), v.literal("systemNotification")),
            content: v.string(),
            relatedBookingId: v.optional(v.id("bookings")),
            readAt: v.optional(v.number()),
        })
    ),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Verify the user has access to this conversation
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.studentId !== user._id && conversation.tutorId !== user._id) {
            throw new Error("You don't have access to this conversation");
        }

        // Get all messages in the conversation
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("asc")
            .collect();

        return messages;
    },
});

/**
 * Send a text message in a conversation
 */
export const sendTextMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    returns: v.id("messages"),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Verify the user has access to this conversation
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.studentId !== user._id && conversation.tutorId !== user._id) {
            throw new Error("You don't have access to this conversation");
        }

        // Create the text message content
        const textMessageContent: TextMessageContent = {
            type: "text",
            text: args.content,
        };

        // Insert the message
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            messageType: "text",
            content: JSON.stringify(textMessageContent),
        });

        return messageId;
    },
});

/**
 * Get the total unread message count for the current user
 */
export const getTotalUnreadCount = query({
    args: {},
    returns: v.number(),
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        // Get all conversations for the user
        let conversations;
        if (user.role === "student") {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_student", (q) => q.eq("studentId", user._id))
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();
        } else if (user.role === "tutor") {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_tutor", (q) => q.eq("tutorId", user._id))
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();
        } else {
            return 0;
        }

        // Count total unread messages across all conversations
        let totalUnread = 0;
        for (const conversation of conversations) {
            const unreadMessages = await ctx.db
                .query("messages")
                .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
                .filter((q) =>
                    q.and(
                        q.neq(q.field("senderId"), user._id),
                        q.eq(q.field("readAt"), undefined)
                    )
                )
                .collect();
            totalUnread += unreadMessages.length;
        }

        return totalUnread;
    },
});

/**
 * Accept a booking (for tutors)
 */
export const acceptBooking = mutation({
    args: {
        bookingId: v.id("bookings"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Get the booking
        const booking = await ctx.db.get(args.bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        // Only tutors can accept bookings, and only their own bookings
        if (user.role !== "tutor" || booking.tutorId !== user._id) {
            throw new Error("Unauthorized");
        }

        // Update booking status
        await ctx.db.patch(args.bookingId, { status: "confirmed" });

        // Send system notification message
        const systemMessageContent: SystemNotificationContent = {
            type: "systemNotification",
            notification: `${user.firstName} accepted the ${booking.bookingType === "freeMeeting" ? "free meeting" : "session"} request.`,
        };

        await ctx.db.insert("messages", {
            conversationId: booking.conversationId,
            senderId: user._id,
            messageType: "systemNotification",
            content: JSON.stringify(systemMessageContent),
        });

        return null;
    },
});

/**
 * Reject a booking (for tutors)
 */
export const rejectBooking = mutation({
    args: {
        bookingId: v.id("bookings"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Get the booking
        const booking = await ctx.db.get(args.bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        // Only tutors can reject bookings, and only their own bookings
        if (user.role !== "tutor" || booking.tutorId !== user._id) {
            throw new Error("Unauthorized");
        }

        // Update booking status
        await ctx.db.patch(args.bookingId, { status: "canceled" });

        // Send system notification message
        const systemMessageContent: SystemNotificationContent = {
            type: "systemNotification",
            notification: `${user.firstName} declined the ${booking.bookingType === "freeMeeting" ? "free meeting" : "session"} request.`,
        };

        await ctx.db.insert("messages", {
            conversationId: booking.conversationId,
            senderId: user._id,
            messageType: "systemNotification",
            content: JSON.stringify(systemMessageContent),
        });

        return null;
    },
});

/**
 * Suggest alternative time for a booking
 */
export const suggestAlternativeTime = mutation({
    args: {
        bookingId: v.id("bookings"),
        suggestedTime: v.number(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Get the booking
        const booking = await ctx.db.get(args.bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        // Both tutors and students can suggest alternative times
        if (booking.tutorId !== user._id && booking.studentId !== user._id) {
            throw new Error("Unauthorized");
        }

        // Add the new suggested time to the booking
        const currentTimes = booking.suggestedTimes || [];
        const updatedTimes = [...currentTimes, args.suggestedTime];

        await ctx.db.patch(args.bookingId, {
            suggestedTimes: updatedTimes,
        });

        // Get booking details for the message
        const level = await ctx.db.get(booking.levelId);
        if (!level) {
            throw new Error("Level not found");
        }

        const subject = await ctx.db.get(level.subjectId);
        if (!subject) {
            throw new Error("Subject not found");
        }

        // Create a new booking message with the alternative time
        const bookingMessageContent: BookingMessageContent = {
            type: "booking",
            bookingType: booking.bookingType,
            subjectName: subject.name,
            levelName: level.name,
            status: booking.status,
            suggestedTimes: [args.suggestedTime],
            initialMessage: `${user.firstName} suggested an alternative time.`,
        };

        await ctx.db.insert("messages", {
            conversationId: booking.conversationId,
            senderId: user._id,
            messageType: "booking",
            content: JSON.stringify(bookingMessageContent),
            relatedBookingId: booking._id,
        });

        return null;
    },
});

/**
 * Check if a student already had a free meeting with a tutor
 */
export const hasStudentHadFreeMeetingWithTutor = query({
    args: {
        tutorId: v.id("users"),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        if (user.role !== "student") {
            return false;
        }

        // Check if student already has a free meeting with this tutor
        const existingFreeMeeting = await ctx.db
            .query("bookings")
            .withIndex("by_student_and_tutor_and_type", (q) =>
                q.eq("studentId", user._id)
                    .eq("tutorId", args.tutorId)
                    .eq("bookingType", "freeMeeting")
            )
            .first();

        return !!existingFreeMeeting;
    },
});
