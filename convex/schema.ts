import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  
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
});
