import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    firstName: v.string(),
    lastName: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("tutor"), v.literal("student")),
    ),
  }).index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"]),

  tutorCandidates: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("applied"),
      v.literal("pending")
    ),
  }).index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  // Subject table: Stores main subject categories
  subjects: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  // Level table: Stores educational levels for each subject
  // Links to Subject table via foreign key
  levels: defineTable({
    name: v.string(),
    subjectId: v.id("subjects"),
  }).index("by_subject", ["subjectId"])
    .index("by_subject_and_name", ["subjectId", "name"]),

  // User profiles table: Extended user information
  tutorProfiles: defineTable({
    userId: v.id("users"),
    university: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Tutor levels: Links tutors to subjects and levels they can teach
  tutorLevels: defineTable({
    tutorId: v.id("tutorProfiles"),
    levelId: v.id("levels"),
  }).index("by_tutor", ["tutorId"])
    .index("by_level", ["levelId"])
    .index("by_tutor_and_level", ["tutorId", "levelId"]),

  // Conversations: Tracks conversations between students and tutors
  conversations: defineTable({
    studentId: v.id("users"), // Must be a student
    tutorId: v.id("users"), // Must be a tutor
    status: v.union(
      v.literal("active"),
      v.literal("archived")
    ),
  }).index("by_student", ["studentId"])
    .index("by_tutor", ["tutorId"])
    .index("by_student_and_tutor", ["studentId", "tutorId"])
    .index("by_status", ["status"]),

  // Bookings: Handles both free meetings and paid sessions
  bookings: defineTable({
    tutorId: v.id("users"),
    studentId: v.id("users"),
    levelId: v.id("levels"),
    conversationId: v.id("conversations"), // Link to the conversation
    suggestedTimes: v.optional(v.array(v.number())), // Array of timestamps for suggested meeting times
    bookingType: v.union(
      v.literal("freeMeeting"),
      v.literal("paidSession")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("canceled"),
      v.literal("completed")
    ),
  }).index("by_tutor", ["tutorId"])
    .index("by_student", ["studentId"])
    .index("by_conversation", ["conversationId"])
    .index("by_status", ["status"])
    .index("by_tutor_and_status", ["tutorId", "status"])
    .index("by_student_and_status", ["studentId", "status"])
    .index("by_student_and_tutor_and_type", ["studentId", "tutorId", "bookingType"]),

  // Messages: Individual messages within conversations with dynamic content
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"), // Can be student or tutor
    messageType: v.union(
      v.literal("text"), // Regular text message
      v.literal("booking"), // Booking-related message
      v.literal("systemNotification") // System generated messages
    ),
    content: v.string(), // JSON stringified for dynamic content
    relatedBookingId: v.optional(v.id("bookings")), // Link to booking if message is booking-related
    readAt: v.optional(v.number()), // Timestamp when message was read
  }).index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"]),

  // Presence: Track user activity and online status
  presence: defineTable({
    userId: v.id("users"),
    room: v.string(), // conversation ID or page identifier
    data: v.string(), // JSON stringified presence data (typing, cursor position, etc.)
    lastSeen: v.number(), // Timestamp of last activity
  }).index("by_room", ["room"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["room", "userId"])
    .index("by_last_seen", ["lastSeen"]),
});
