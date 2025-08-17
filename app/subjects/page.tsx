"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SubjectsPage() {
  const subjectsWithLevels = useQuery(api.subjects.getSubjectsWithLevels);

  if (subjectsWithLevels === undefined) {
    return <div className="p-4">Loading subjects...</div>;
  }

  if (subjectsWithLevels.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Subjects & Qualifications</h1>
        <p>No subjects found. Run the seed command to import data:</p>
        <code className="bg-gray-100 p-2 rounded block mt-2">
          npm run seed:all
        </code>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subjects & Qualifications</h1>
      <p className="text-gray-600 mb-8">
        Browse through our comprehensive list of subjects and their available qualification levels.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsWithLevels.map((subject) => (
          <div
            key={subject._id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              {subject.name}
            </h2>
            
            {subject.levels.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Available levels:
                </p>
                <div className="flex flex-wrap gap-2">
                  {subject.levels.map((level) => (
                    <span
                      key={level._id}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {level.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No levels available</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-gray-500">
        <p>Total subjects: {subjectsWithLevels.length}</p>
        <p>
          Total levels: {subjectsWithLevels.reduce((acc, subject) => acc + subject.levels.length, 0)}
        </p>
      </div>
    </div>
  );
}
