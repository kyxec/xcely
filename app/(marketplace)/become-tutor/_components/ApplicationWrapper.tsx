"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ApplicationStatus } from "./ApplicationStatus";
import { ApplicationStatusSkeleton } from "./ApplicationStatusSkeleton";
import { ApplicationForm } from "./ApplicationForm";

export function ApplicationWrapper() {
    const application = useQuery(api.tutors.getUserApplicationStatus);

    // Loading state with nice skeleton
    if (application === undefined) {
        return <ApplicationStatusSkeleton />;
    }

    // If user has an application, show status
    if (application) {
        return <ApplicationStatus application={application} />;
    }

    // If no application, show a simple application form
    return (
        <div className="max-w-md mx-auto">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Ready to Become a Tutor?</h3>
                <p className="text-gray-600 mb-6">Submit your application to get started</p>
                <ApplicationForm />
            </div>
        </div>
    );
}
