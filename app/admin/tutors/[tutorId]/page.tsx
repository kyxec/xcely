import { Suspense } from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminTutorDetailsView from "./_components/AdminTutorDetailsView";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

interface TutorDetailsPageProps {
    params: Promise<{
        tutorId: string;
    }>
}

export default async function TutorDetailsPage({ params }: TutorDetailsPageProps) {
    const { tutorId } = await params;

    try {
        // Preload tutor details data
        const preloadedTutorDetails = await preloadQuery(
            api.tutors.getTutorDetailsForAdmin,
            { tutorId: tutorId as Id<"users">, },
            { token: await convexAuthNextjsToken() });

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/tutors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Tutors
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Tutor Details</h1>
                            <p className="text-gray-600">Manage tutor information and levels</p>
                        </div>
                    </div>
                </div>

                <Suspense fallback={<div>Loading tutor details...</div>}>
                    <AdminTutorDetailsView
                        preloadedTutorDetails={preloadedTutorDetails}
                    />
                </Suspense>
            </div>
        );
    } catch (error) {
        console.error("Error loading tutor details:", error);
        notFound();
    }
}
