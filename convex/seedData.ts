import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Seed levels data after subjects have been imported
 * This function creates all the level entries based on the subject-level mapping
 */
export const seedLevels = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Subject-Level mapping from your SQL data
    const subjectLevelData = [
      { subject: 'Accounting', levels: ['A Level', 'GCSE', 'University'] },
      { subject: 'Arabic', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Art', levels: ['A Level', 'GCSE'] },
      { subject: 'BMAT (BioMedical Admissions)', levels: ['University'] },
      { subject: 'Biology', levels: ['A Level', 'GCSE', 'IB', 'KS3', 'National 4 and 5', 'Scottish Highers', 'University'] },
      { subject: 'Business Studies', levels: ['A Level', 'GCSE', 'IB', 'University'] },
      { subject: 'Career Development', levels: ['A Level', 'GCSE', 'Mentoring'] },
      { subject: 'Chemical Engineering', levels: ['University'] },
      { subject: 'Chemistry', levels: ['A Level', 'GCSE', 'IB', 'KS3', 'National 4 and 5', 'Scottish Highers', 'University'] },
      { subject: 'Classical Civilisation', levels: ['A Level', 'GCSE'] },
      { subject: 'Classical Greek', levels: ['13 Plus', 'A Level', 'GCSE', 'IB'] },
      { subject: 'Computer Science', levels: ['A Level', 'GCSE', 'IB', 'National 4 and 5', 'Scottish Highers', 'University'] },
      { subject: 'Design & Technology', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Drama', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Dutch', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'ELAT', levels: ['University'] },
      { subject: 'Economics', levels: ['A Level', 'GCSE', 'IB', 'Scottish Highers', 'University'] },
      { subject: 'Electronics', levels: ['A Level', 'GCSE'] },
      { subject: 'English', levels: ['11 Plus', '13 Plus', 'A Level', 'GCSE', 'IB', 'KS2', 'KS3', 'National 4 and 5', 'Scottish Highers', 'University'] },
      { subject: 'English Language', levels: ['A Level', 'GCSE', 'IB', 'KS3', 'National 4 and 5', 'Scottish Highers'] },
      { subject: 'English Literature', levels: ['A Level', 'GCSE', 'IB', 'KS3', 'National 4 and 5', 'Scottish Highers'] },
      { subject: 'English and World Literature', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Environmental Studies', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Extended Project Qualification', levels: ['A Level', 'GCSE'] },
      { subject: 'French', levels: ['13 Plus', 'A Level', 'GCSE', 'IB', 'KS3', 'Scottish Highers', 'University'] },
      { subject: 'Further Mathematics', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'GAMSAT', levels: ['University'] },
      { subject: 'Geography', levels: ['13 Plus', 'A Level', 'GCSE', 'IB', 'Scottish Highers', 'University'] },
      { subject: 'Geology', levels: ['A Level', 'GCSE'] },
      { subject: 'German', levels: ['13 Plus', 'A Level', 'GCSE', 'IB', 'Scottish Highers', 'University'] },
      { subject: 'Government and Politics', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Graphic Design', levels: ['A Level', 'GCSE'] },
      { subject: 'HAT', levels: ['University'] },
      { subject: 'History', levels: ['13 Plus', 'A Level', 'GCSE', 'IB', 'KS3', 'Scottish Highers', 'University'] },
      { subject: 'History of Art', levels: ['A Level', 'GCSE'] },
      { subject: 'Human Biology', levels: ['A Level', 'GCSE', 'Scottish Highers'] },
      { subject: 'ICT', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Italian', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Japanese', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'LNAT', levels: ['University'] },
      { subject: 'Latin', levels: ['13 Plus', 'A Level', 'GCSE', 'IB'] },
      { subject: 'Law', levels: ['A Level', 'GCSE', 'University'] },
      { subject: 'MAT', levels: ['University'] },
      { subject: 'MLAT (Modern Languages)', levels: ['University'] },
      { subject: 'Mandarin', levels: ['13 Plus', 'A Level', 'GCSE', 'IB'] },
      { subject: 'Maths', levels: ['11 Plus', '13 Plus', 'A Level', 'GCSE', 'IB', 'KS2', 'KS3', 'National 4 and 5', 'Scottish Highers', 'University'] },
      { subject: 'Media Studies', levels: ['A Level', 'GCSE'] },
      { subject: 'Medical School Preparation', levels: ['Mentoring'] },
      { subject: 'Medicine', levels: ['University'] },
      { subject: 'Music', levels: ['A Level', 'GCSE', 'IB', 'University'] },
      { subject: 'Oxbridge Preparation', levels: ['Mentoring'] },
      { subject: 'PAT', levels: ['University'] },
      { subject: 'Personal Statements', levels: ['Mentoring'] },
      { subject: 'Philosophy', levels: ['A Level', 'GCSE', 'IB', 'University'] },
      { subject: 'Philosophy and Ethics', levels: ['A Level', 'GCSE'] },
      { subject: 'Physical Education', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Physics', levels: ['A Level', 'GCSE', 'IB', 'KS3', 'National 4 and 5', 'Scottish Highers', 'University'] },
      { subject: 'Polish', levels: ['A Level', 'GCSE'] },
      { subject: 'Politics', levels: ['A Level', 'GCSE', 'IB', 'University'] },
      { subject: 'Portuguese', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Psychology', levels: ['A Level', 'GCSE', 'IB', 'Scottish Highers', 'University'] },
      { subject: 'Python', levels: ['Mentoring'] },
      { subject: 'Religious Studies', levels: ['13 Plus', 'A Level', 'GCSE', 'IB'] },
      { subject: 'Russian', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'STEP', levels: ['University'] },
      { subject: 'Sanskrit', levels: ['A Level', 'GCSE'] },
      { subject: 'Science', levels: ['13 Plus', 'A Level', 'GCSE', 'IB', 'KS2', 'KS3', 'National 4 and 5'] },
      { subject: 'Sociology', levels: ['A Level', 'GCSE', 'IB'] },
      { subject: 'Spanish', levels: ['13 Plus', 'A Level', 'GCSE', 'IB', 'KS3', 'University'] },
      { subject: 'TSA Oxford', levels: ['University'] },
      { subject: 'Theory of Knowledge', levels: ['IB'] },
      { subject: 'UCAT', levels: ['University'] },
      { subject: 'Welsh Literature', levels: ['A Level'] },
      { subject: 'Zoology', levels: ['A Level', 'GCSE'] }
    ];

    // Get all subjects to create a name -> id mapping
    const subjects = await ctx.db.query("subjects").collect();
    const subjectNameToId = new Map(
      subjects.map(subject => [subject.name, subject._id])
    );

    // Insert levels for each subject
    let totalLevelsAdded = 0;
    for (const { subject: subjectName, levels } of subjectLevelData) {
      const subjectId = subjectNameToId.get(subjectName);
      if (!subjectId) {
        console.warn(`Subject not found: ${subjectName}`);
        continue;
      }

      for (const levelName of levels) {
        await ctx.db.insert("levels", {
          name: levelName,
          subjectId: subjectId,
        });
        totalLevelsAdded++;
      }
    }

    console.log(`Successfully added ${totalLevelsAdded} levels for ${subjectLevelData.length} subjects`);
    return null;
  },
});
