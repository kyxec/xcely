import { v } from "convex/values";
import { query } from "./_generated/server";


/**
 * Get subjects with their associated levels
 */
export const getSubjectsWithLevels = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("subjects"),
      _creationTime: v.number(),
      name: v.string(),
      levels: v.array(
        v.object({
          _id: v.id("levels"),
          _creationTime: v.number(),
          name: v.string(),
          subjectId: v.id("subjects"),
        })
      ),
    })
  ),
  handler: async (ctx, _) => {
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_name")
      .order("asc")
      .collect();

    const subjectsWithLevels = await Promise.all(
      subjects.map(async (subject) => {
        const levels = await ctx.db
          .query("levels")
          .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
          .order("asc")
          .collect();

        return {
          ...subject,
          levels,
        };
      })
    );

    return subjectsWithLevels;
  },
});