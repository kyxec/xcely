import { Suspense } from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import AdminTutorsTable from "./_components/AdminTutorsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function TutorsPage() {
    // Preload simplified tutors data for admin view
    const preloadedTutors = await preloadQuery(
        api.tutors.getTutorsForAdmin,
        {},
        { token: await convexAuthNextjsToken() });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Tutor Management</h1>
                <p className="text-gray-600">View and manage all tutors in the system</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tutors</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading tutors...</div>}>
                        <AdminTutorsTable
                            preloadedTutors={preloadedTutors}
                        />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}