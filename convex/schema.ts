import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("tutor"), v.literal("student")),
    ),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"]),

  // Subject table: Stores main subject categories
  subjects: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  // Level table: Stores educational levels for each subject
  // Links to Subject table via foreign key
  levels: defineTable({
    name: v.string(),
    subjectId: v.id("subjects"),
  })
    .index("by_subject", ["subjectId"])
    .index("by_subject_and_name", ["subjectId", "name"]),

  // User profiles table: Extended user information
  tutorProfiles: defineTable({
    userId: v.id("users"),
    university: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Tutor qualifications: Links tutors to subjects and levels they can teach
  tutorQualifications: defineTable({
    tutorId: v.id("userProfiles"),
    subjectId: v.id("subjects"),
    levelId: v.id("levels"),
  })
    .index("by_tutor", ["tutorId"])
    .index("by_subject", ["subjectId"])
    .index("by_level", ["levelId"])
    .index("by_tutor_and_subject", ["tutorId", "subjectId"]),
});
