import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TutorsListing } from "./_components/TutorsListing";
import { Id } from "@/convex/_generated/dataModel";

type SearchParams = {
    subjectId?: string;
    levelId?: string;
};

export default async function MarketplacePage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    // Await and parse search params
    const awaitedSearchParams = await searchParams;
    const subjectId = awaitedSearchParams.subjectId as Id<"subjects"> | undefined;
    const levelId = awaitedSearchParams.levelId as Id<"levels"> | undefined;

    // Preload data on the server
    const preloadedSubjects = await preloadQuery(api.subjects.getSubjectsWithLevels);
    const preloadedTutors = await preloadQuery(api.tutors.getTutorsForPublic, {
        subjectId,
        levelId,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <TutorsListing
                preloadedSubjects={preloadedSubjects}
                preloadedTutors={preloadedTutors}
                initialSubjectId={subjectId}
                initialLevelId={levelId}
            />
        </div>
    );
}
