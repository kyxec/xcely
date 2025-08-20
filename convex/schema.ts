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
});
