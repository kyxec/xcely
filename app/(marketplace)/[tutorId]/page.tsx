import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { TutorProfileView } from "./_components/TutorProfileView";

type Params = {
    tutorId: string;
};

export default async function TutorProfilePage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { tutorId } = await params;

    try {
        // Preload tutor data - we'll need to create a public function for this
        const preloadedTutor = await preloadQuery(api.tutors.getTutorForPublic, {
            tutorId: tutorId as Id<"users">,
        });

        return (
            <div className="min-h-screen bg-gray-50">
                <TutorProfileView preloadedTutor={preloadedTutor} />
            </div>
        );
    } catch {
        notFound();
    }
}
