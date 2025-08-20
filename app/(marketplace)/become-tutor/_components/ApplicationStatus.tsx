"use client";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { FunctionReturnType } from "convex/server";

export function ApplicationStatus({ application }: { application: FunctionReturnType<typeof api.tutors.getUserApplicationStatus> }) {
    if (!application) {
        return null;
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    icon: <Clock className="h-12 w-12 text-yellow-500" />,
                    badge: <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">Under Review</Badge>,
                    title: "Application Submitted",
                    waitTime: "2-3 business days",
                    statusText: "Your application is being reviewed"
                };
            case "applied":
                return {
                    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
                    badge: <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Approved</Badge>,
                    title: "Welcome, Tutor!",
                    waitTime: "Complete",
                    statusText: "You can now start tutoring"
                };
            case "rejected":
                return {
                    icon: <XCircle className="h-12 w-12 text-red-500" />,
                    badge: <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">Not Approved</Badge>,
                    title: "Application Update",
                    waitTime: "Complete",
                    statusText: "Contact support for details"
                };
            default:
                return {
                    icon: <Clock className="h-12 w-12 text-gray-500" />,
                    badge: <Badge variant="outline">Unknown</Badge>,
                    title: "Status Unknown",
                    waitTime: "Contact support",
                    statusText: "Please contact support"
                };
        }
    };

    const statusInfo = getStatusInfo(application.status);
    const applicationDate = new Date(application._creationTime).toLocaleDateString();

    // Calculate days since application
    const daysSince = Math.floor((Date.now() - application._creationTime) / (1000 * 60 * 60 * 24));

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                    {statusInfo.icon}
                </div>
                {statusInfo.badge}
                <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <div className="space-y-2">
                    <p className="text-gray-600">{statusInfo.statusText}</p>
                    {application.status === "pending" && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">
                                Expected Wait Time: <span className="text-blue-600">{statusInfo.waitTime}</span>
                            </p>
                        </div>
                    )}
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t">
                    <p>Applied: {applicationDate}</p>
                    <p>Days since: {daysSince}</p>
                </div>
            </CardContent>
        </Card>
    );
}
