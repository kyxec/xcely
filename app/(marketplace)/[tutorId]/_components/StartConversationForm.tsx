"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, MessageSquare, X, Calendar } from "lucide-react";
import { getAuthUserId } from "@convex-dev/auth/server";

type StartConversationProps = {
    tutorId: Id<"users">;
    tutorName: string;
    tutorLevels: Array<{
        subject: string;
        level: string;
        subjectId: Id<"subjects">;
        levelId: Id<"levels">;
    }>;
    onClose?: () => void;
    onSuccess?: () => void;
};

export function StartConversationForm({
    tutorId,
    tutorName,
    tutorLevels,
    onClose,
    onSuccess
}: StartConversationProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSubjectLevel, setSelectedSubjectLevel] = useState<string>("");
    const [preferredDateTime, setPreferredDateTime] = useState<Date | undefined>();
    const [message, setMessage] = useState("");

    const startConversation = useMutation(api.messages.startConversationWithFreeMeeting);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSubjectLevel) {
            toast.error("Please select a subject and level");
            return;
        }

        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        // Parse the selected subject and level
        const selectedLevel = tutorLevels.find(
            level => `${level.subjectId}-${level.levelId}` === selectedSubjectLevel
        );

        if (!selectedLevel) {
            toast.error("Invalid subject/level selection");
            return;
        }

        try {
            setIsSubmitting(true);

            await startConversation({
                tutorId,
                subjectId: selectedLevel.subjectId,
                levelId: selectedLevel.levelId,
                initialMessage: message,
                preferredBookingTime: preferredDateTime?.toISOString(),
            });

            toast.success(`Message sent to ${tutorName}!`);

            // Reset form
            setSelectedSubjectLevel("");
            setPreferredDateTime(undefined);
            setMessage("");

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to send message. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Book a Free Meeting
                </DialogTitle>
                <DialogDescription>
                    Send a message to {tutorName} to get started
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subject and Level Selection */}
                <div className="space-y-2">
                    <Label htmlFor="subject-level">
                        I want to know more about *
                    </Label>
                    <Select
                        value={selectedSubjectLevel}
                        onValueChange={setSelectedSubjectLevel}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select subject and level" />
                        </SelectTrigger>
                        <SelectContent>
                            {tutorLevels.map((level) => (
                                <SelectItem
                                    key={`${level.subjectId}-${level.levelId}`}
                                    value={`${level.subjectId}-${level.levelId}`}
                                >
                                    {level.subject} - {level.level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Preferred Meeting Time */}
                <div className="space-y-2">
                    <DateTimePicker
                        date={preferredDateTime}
                        onDateTimeChange={setPreferredDateTime}
                        label="Preferred meeting time (optional)"
                        placeholder="When would you like to meet?"
                    />
                    <p className="text-xs text-muted-foreground">
                        Suggest a specific time for your free meeting with {tutorName}
                    </p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <Label htmlFor="message">
                        Short message *
                    </Label>
                    <Textarea
                        id="message"
                        placeholder="Tell the tutor about your learning goals, current level, or any specific questions you have..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Be specific about what you'd like to learn or achieve
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending Message...
                        </>
                    ) : (
                        <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    This tutor will receive your message and can start interacting with you.
                </p>
            </form>
        </div>
    );
}
