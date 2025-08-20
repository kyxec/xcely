"use client";

import { usePreloadedQuery, Preloaded } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Type-safe types inferred from Convex functions
type SubjectsWithLevels = FunctionReturnType<typeof api.subjects.getSubjectsWithLevels>;
type TutorsWithProfiles = FunctionReturnType<typeof api.tutors.getTutorsForPublic>;
type Subject = SubjectsWithLevels[number];
type Level = Subject["levels"][number];
type Tutor = TutorsWithProfiles[number];

type TutorsListingProps = {
    preloadedSubjects: Preloaded<typeof api.subjects.getSubjectsWithLevels>;
    preloadedTutors: Preloaded<typeof api.tutors.getTutorsForPublic>;
    initialSubjectId?: Id<"subjects">;
    initialLevelId?: Id<"levels">;
};

function TutorCard({ tutor }: { tutor: Tutor }) {
    const fullName = `${tutor.firstName} ${tutor.lastName || ""}`.trim();
    const initials = `${tutor.firstName[0]}${tutor.lastName?.[0] || ""}`.toUpperCase();

    return (
        <Link href={`/${tutor._id}`} className="block h-full">
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader className="text-center p-4 lg:p-6">
                    <div className="flex justify-center mb-3 lg:mb-4">
                        <Avatar className="h-12 w-12 lg:h-16 lg:w-16">
                            <AvatarImage src={tutor.image} alt={fullName} />
                            <AvatarFallback className="text-sm lg:text-base">{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-base lg:text-lg line-clamp-1">{fullName}</CardTitle>
                    {tutor.profile?.university && (
                        <p className="text-xs lg:text-sm text-gray-600 line-clamp-1">{tutor.profile.university}</p>
                    )}
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0 space-y-3 lg:space-y-4">
                    {tutor.profile?.bio && (
                        <p className="text-xs lg:text-sm text-gray-700 line-clamp-3">{tutor.profile.bio}</p>
                    )}

                    <div className="pt-2">
                        <Button className="w-full text-sm lg:text-base h-8 lg:h-10" asChild>
                            <span>View Profile</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// Helper function to build URL with search params
function buildFilterURL(subjectId?: string, levelId?: string) {
    const params = new URLSearchParams();
    if (subjectId && subjectId !== "all") {
        params.set('subjectId', subjectId);
    }
    if (levelId && levelId !== "all") {
        params.set('levelId', levelId);
    }
    return params.toString() ? `/?${params.toString()}` : '/';
}

export function TutorsListing({
    preloadedSubjects,
    preloadedTutors,
    initialSubjectId,
    initialLevelId
}: TutorsListingProps) {
    // Use preloaded data with proper types
    const subjectsWithLevels: SubjectsWithLevels = usePreloadedQuery(preloadedSubjects);
    const tutors: TutorsWithProfiles = usePreloadedQuery(preloadedTutors);

    // Get levels for the selected subject or all levels if no subject is selected
    const availableLevels: Level[] = initialSubjectId
        ? subjectsWithLevels?.find((s: Subject) => s._id === initialSubjectId)?.levels || []
        : subjectsWithLevels?.flatMap((s: Subject) => s.levels) || [];

    // Get current subject and level names for display
    const selectedSubjectName: string | undefined = initialSubjectId
        ? subjectsWithLevels?.find((s: Subject) => s._id === initialSubjectId)?.name
        : undefined;
    const selectedLevelName: string | undefined = initialLevelId
        ? availableLevels.find((l: Level) => l._id === initialLevelId)?.name
        : undefined;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 lg:py-12">
                {/* Header */}
                <div className="text-center mb-8 lg:mb-12">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
                        Find Your Perfect Tutor
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Connect with qualified tutors across various subjects and levels
                    </p>
                </div>

                {/* Filter Section */}
                <div className="mb-8 lg:mb-12">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-4 lg:p-6">
                        {/* Mobile-first responsive grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
                            {/* Subject Dropdown */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Subject
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {selectedSubjectName || "Select a subject"}
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full min-w-[200px]">
                                        <DropdownMenuItem asChild>
                                            <Link href={buildFilterURL(undefined, initialLevelId)} className="w-full">
                                                All Subjects
                                            </Link>
                                        </DropdownMenuItem>
                                        {subjectsWithLevels?.map((subject: Subject) => (
                                            <DropdownMenuItem key={subject._id} asChild>
                                                <Link href={buildFilterURL(subject._id,
                                                    // Keep current level if it exists in the new subject, otherwise clear it
                                                    initialLevelId && subject.levels.some(l => l._id === initialLevelId)
                                                        ? initialLevelId
                                                        : undefined
                                                )} className="w-full">
                                                    {subject.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Level Dropdown */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Level
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            disabled={availableLevels.length === 0}
                                        >
                                            {selectedLevelName || "Select a level"}
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full min-w-[200px]">
                                        <DropdownMenuItem asChild>
                                            <Link href={buildFilterURL(initialSubjectId, undefined)} className="w-full">
                                                All Levels
                                            </Link>
                                        </DropdownMenuItem>
                                        {availableLevels.map((level: Level) => {
                                            // Find the subject for this level to show context when no subject is selected
                                            const levelSubject = subjectsWithLevels?.find((s: Subject) => s._id === level.subjectId);
                                            const displayName = initialSubjectId ? level.name : `${level.name} (${levelSubject?.name || 'Unknown'})`;

                                            return (
                                                <DropdownMenuItem key={level._id} asChild>
                                                    <Link href={buildFilterURL(
                                                        // If a subject is selected, keep it; otherwise, find the subject for this level
                                                        initialSubjectId || level.subjectId,
                                                        level._id
                                                    )} className="w-full">
                                                        {displayName}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Clear Button */}
                            {(initialSubjectId || initialLevelId) && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="default"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href="/">
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {(selectedSubjectName || selectedLevelName) && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {selectedSubjectName && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            {selectedSubjectName}
                                            <Link href={buildFilterURL(undefined, initialLevelId)}>
                                                <X className="h-3 w-3 hover:text-red-600" />
                                            </Link>
                                        </Badge>
                                    )}
                                    {selectedLevelName && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            {selectedLevelName}
                                            <Link href={buildFilterURL(initialSubjectId, undefined)}>
                                                <X className="h-3 w-3 hover:text-red-600" />
                                            </Link>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 lg:mb-8">
                    <p className="text-gray-600 text-center text-sm lg:text-base">
                        <span className="font-semibold">{tutors?.length || 0}</span> tutors found
                        {selectedSubjectName && <span> for {selectedSubjectName}</span>}
                        {selectedLevelName && <span> - {selectedLevelName}</span>}
                    </p>
                </div>

                {/* Tutors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {tutors && tutors.length > 0 ? (
                        tutors.map((tutor: Tutor) => (
                            <TutorCard key={tutor._id} tutor={tutor} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 lg:py-16">
                            <div className="max-w-md mx-auto">
                                <p className="text-gray-500 text-lg lg:text-xl mb-4">No tutors found</p>
                                <p className="text-gray-400 text-sm lg:text-base mb-6">
                                    Try adjusting your filters or check back later
                                </p>
                                <Button variant="outline" asChild>
                                    <Link href="/">
                                        View All Tutors
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
