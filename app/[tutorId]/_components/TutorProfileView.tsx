"use client";

import { usePreloadedQuery, Preloaded } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

// Type-safe types inferred from Convex functions
type TutorProfile = FunctionReturnType<typeof api.tutors.getTutorForPublic>;

type TutorProfileViewProps = {
    preloadedTutor: Preloaded<typeof api.tutors.getTutorForPublic>;
};

export function TutorProfileView({ preloadedTutor }: TutorProfileViewProps) {
    const tutor: TutorProfile = usePreloadedQuery(preloadedTutor);

    if (!tutor) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Not Found</h1>
                        <p className="text-gray-600 mb-8">{`The tutor profile you're looking for doesn't exist.`}</p>
                        <Button asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Marketplace
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const fullName = `${tutor.firstName} ${tutor.lastName || ""}`.trim();
    const initials = `${tutor.firstName[0]}${tutor.lastName?.[0] || ""}`.toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader className="text-center pb-4">
                                    <div className="flex justify-center mb-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={tutor.image} alt={fullName} />
                                            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-xl">{fullName}</CardTitle>
                                    {tutor.profile?.university && (
                                        <p className="text-sm text-gray-600 flex items-center justify-center mt-2">
                                            <GraduationCap className="h-4 w-4 mr-1" />
                                            {tutor.profile.university}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Button className="w-full" size="lg">
                                        Contact Tutor
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bio Section */}
                            {tutor.profile?.bio && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">About</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {tutor.profile.bio}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Subjects & Levels Section */}
                            {tutor.levels.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Subjects & Levels</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.levels.map((level, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {level.subject} - {level.level}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Get in Touch</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4">
                                        Interested in learning with {tutor.firstName}? Get in touch to discuss your learning goals and schedule.
                                    </p>
                                    <Button size="lg" className="w-full sm:w-auto">
                                        Send Message
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
