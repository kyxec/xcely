"use client";

import { useState, useRef } from "react";
import { usePreloadedQuery, Preloaded, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    User,
    Mail,
    Phone,
    University,
    Plus,
    Trash2,
    MoreVertical,
    Calendar,
    IdCard,
    Camera,
    Edit,
    Save,
    X,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { toast } from "sonner";

type AdminTutorDetailsViewProps = {
    preloadedTutorDetails: Preloaded<typeof api.tutors.getTutorDetailsForAdmin>;
};

export default function AdminTutorDetailsView({ preloadedTutorDetails }: AdminTutorDetailsViewProps) {
    const tutorDetails = usePreloadedQuery(preloadedTutorDetails);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedUniversity, setEditedUniversity] = useState("");
    const [editedBio, setEditedBio] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLevelToTutor = useMutation(api.tutors.addLevelToTutorForAdmin);
    const removeLevelFromTutor = useMutation(api.tutors.removeLevelFromTutorForAdmin);
    const updateTutorProfile = useMutation(api.tutors.updateTutorProfileForAdmin);
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const saveProfileImage = useMutation(api.upload.saveProfileImage);

    // Get subjects with their levels for organized selection
    const subjectsWithLevels = useQuery(api.subjects.getSubjectsWithLevels);

    if (!tutorDetails) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">{`Tutor not found or you don't have permission to view this tutor.`}</p>
                </CardContent>
            </Card>
        );
    }

    const { user, profile, levels } = tutorDetails;

    // Initialize edit state when entering edit mode
    const handleStartEditing = () => {
        setEditedUniversity(profile?.university || "");
        setEditedBio(profile?.bio || "");
        setIsEditingProfile(true);
    };

    const handleCancelEditing = () => {
        setIsEditingProfile(false);
        setEditedUniversity("");
        setEditedBio("");
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            await updateTutorProfile({
                tutorId: user._id,
                university: editedUniversity.trim() || undefined,
                bio: editedBio.trim() || undefined,
            });
            setIsEditingProfile(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Get available subjects and their levels that the tutor doesn't already have
    const availableSubjectsWithLevels = subjectsWithLevels?.map(subject => ({
        ...subject,
        levels: subject.levels.filter(level =>
            !levels.some(tutorLevel => tutorLevel.levelId === level._id)
        )
    })).filter(subject => subject.levels.length > 0) || [];

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            // Generate upload URL
            const url = await generateUploadUrl();

            // Upload the file
            const result = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error('Failed to upload image');
            }

            const { storageId } = await result.json();

            // Save the profile image
            await saveProfileImage({
                storageId,
                tutorId: user._id,
            });

            toast.success("Profile picture updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile picture");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleAddLevel = async (levelId: string) => {
        if (!levelId) {
            toast.error("Please select a level to add");
            return;
        }

        setIsLoading(true);
        try {
            await addLevelToTutor({
                tutorId: user._id,
                levelId: levelId as Id<"levels">,
            });
            toast.success("Level added successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add level");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveLevel = async (levelId: string) => {
        if (!confirm("Are you sure you want to remove this level from the tutor?")) {
            return;
        }

        setIsLoading(true);
        try {
            await removeLevelFromTutor({
                tutorId: user._id,
                levelId: levelId as Id<"levels">,
            });
            toast.success("Level removed successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove level");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* User Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>User Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={user.image}
                                    alt={`${user.firstName} ${user.lastName || ""}`}
                                />
                                <AvatarFallback className="text-lg">
                                    {user.firstName.charAt(0)}{user.lastName?.charAt(0) || ""}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="sm"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                            >
                                {isUploadingImage ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <div className="flex-1 space-y-2">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {user.firstName} {user.lastName || ""}
                                </h2>
                                <Badge variant="secondary" className="mt-1">
                                    {user.role || "No role"}
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <IdCard className="h-4 w-4" />
                                <span className="font-mono">{user._id}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.email || "No email provided"}
                                    </p>
                                    {user.emailVerificationTime && (
                                        <p className="text-xs text-green-600">
                                            Verified: {formatDate(user.emailVerificationTime)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.phone || "No phone provided"}
                                    </p>
                                    {user.phoneVerificationTime && (
                                        <p className="text-xs text-green-600">
                                            Verified: {formatDate(user.phoneVerificationTime)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Account Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(user._creationTime)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Account Type</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.isAnonymous ? "Anonymous" : "Registered"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <University className="h-5 w-5" />
                            <span>Tutor Profile</span>
                        </div>
                        {!isEditingProfile ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleStartEditing}
                                disabled={isLoading}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEditing}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveProfile}
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {profile || isEditingProfile ? (
                        <div className="space-y-4">
                            {isEditingProfile ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="university">University</Label>
                                        <Input
                                            id="university"
                                            value={editedUniversity}
                                            onChange={(e) => setEditedUniversity(e.target.value)}
                                            placeholder="Enter university name"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={editedBio}
                                            onChange={(e) => setEditedBio(e.target.value)}
                                            placeholder="Enter bio description"
                                            disabled={isLoading}
                                            rows={4}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm font-medium">University</p>
                                        <p className="text-sm text-muted-foreground">
                                            {profile?.university || "No university specified"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Bio</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {profile?.bio || "No bio provided"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground italic mb-4">No tutor profile found</p>
                            <Button
                                variant="outline"
                                onClick={handleStartEditing}
                                disabled={isLoading}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Profile
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Teaching Levels Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span>Teaching Levels</span>
                            <Badge variant="outline">{levels.length}</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add Level Section */}
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <div className="flex items-center space-x-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Add Teaching Level</span>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                {availableSubjectsWithLevels.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        All available levels have been assigned to this tutor.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {availableSubjectsWithLevels.map((subject) => (
                                            <Collapsible key={subject._id}>
                                                <CollapsibleTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-between p-2 h-auto"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{subject.name}</span>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {subject.levels.length} available
                                                            </Badge>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="pl-4 pt-2">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {subject.levels.map((level) => (
                                                            <Button
                                                                key={level._id}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleAddLevel(level._id)}
                                                                disabled={isLoading}
                                                                className="justify-start h-auto p-2 text-left"
                                                            >
                                                                <span className="text-sm">{level.name}</span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    {/* Current Levels */}
                    {levels.length === 0 ? (
                        <p className="text-muted-foreground italic text-center py-8">
                            No teaching levels assigned yet
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {/* Group levels by subject */}
                            {Object.entries(
                                levels.reduce((acc, level) => {
                                    if (!acc[level.subject]) {
                                        acc[level.subject] = [];
                                    }
                                    acc[level.subject].push(level);
                                    return acc;
                                }, {} as Record<string, typeof levels>)
                            ).map(([subjectName, subjectLevels]) => (
                                <Collapsible key={subjectName} defaultOpen={Object.keys(levels.reduce((acc, level) => {
                                    if (!acc[level.subject]) {
                                        acc[level.subject] = [];
                                    }
                                    acc[level.subject].push(level);
                                    return acc;
                                }, {} as Record<string, typeof levels>)).length <= 5}>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-sm">{subjectName}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {subjectLevels.length} level{subjectLevels.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                                            {subjectLevels.map((level) => (
                                                <div
                                                    key={level._id}
                                                    className="border rounded-lg p-3 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-sm">{level.level}</h5>
                                                            <p className="text-xs text-muted-foreground">{level.subject}</p>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={isLoading}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleRemoveLevel(level.levelId)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Remove Level
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
