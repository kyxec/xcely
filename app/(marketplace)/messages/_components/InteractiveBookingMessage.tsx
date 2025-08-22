"use client"

import React, { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
    Calendar,
    Clock,
    CheckCircle,
    X,
    MessageSquare,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"

type BookingMessageContent = {
    type: "booking"
    bookingType: "freeMeeting" | "paidSession"
    subjectName: string
    levelName: string
    status: "pending" | "confirmed" | "canceled" | "completed"
    suggestedTimes?: number[]
    initialMessage?: string
}

type InteractiveBookingMessageProps = {
    message: {
        _id: Id<"messages">
        _creationTime: number
        content: string
        relatedBookingId?: Id<"bookings">
    }
    messageContent: BookingMessageContent
    isOwnMessage: boolean
    senderName: string
    userRole: "student" | "tutor"
    conversationId: Id<"conversations">
}

export function InteractiveBookingMessage({
    message,
    messageContent,
    isOwnMessage,
    senderName,
    userRole,
    conversationId
}: InteractiveBookingMessageProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showCounterOffer, setShowCounterOffer] = useState(false)
    const [counterOfferTime, setCounterOfferTime] = useState<Date | undefined>()

    // Mutations for booking actions
    const acceptBooking = useMutation(api.messages.acceptBooking)
    const rejectBooking = useMutation(api.messages.rejectBooking)
    const suggestAlternativeTime = useMutation(api.messages.suggestAlternativeTime)

    const isFreeMeeting = messageContent.bookingType === "freeMeeting"
    const isPending = messageContent.status === "pending"
    const canTutorRespond = userRole === "tutor" && !isOwnMessage && isPending
    const canStudentRespond = userRole === "student" && !isOwnMessage && isPending

    const statusColor = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        confirmed: "bg-green-100 text-green-800 border-green-200",
        canceled: "bg-red-100 text-red-800 border-red-200",
        completed: "bg-blue-100 text-blue-800 border-blue-200"
    }

    const handleAcceptBooking = async () => {
        if (!message.relatedBookingId) return
        try {
            await acceptBooking({ bookingId: message.relatedBookingId })
        } catch (error) {
            console.error("Failed to accept booking:", error)
        }
    }

    const handleRejectBooking = async () => {
        if (!message.relatedBookingId) return
        try {
            await rejectBooking({ bookingId: message.relatedBookingId })
        } catch (error) {
            console.error("Failed to reject booking:", error)
        }
    }

    const handleCounterOffer = async () => {
        if (!counterOfferTime || !message.relatedBookingId) return
        try {
            await suggestAlternativeTime({
                bookingId: message.relatedBookingId,
                suggestedTime: counterOfferTime.getTime()
            })
            setShowCounterOffer(false)
            setCounterOfferTime(undefined)
        } catch (error) {
            console.error("Failed to suggest alternative time:", error)
        }
    }

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
            <div className={`max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? "ml-4" : "mr-4"}`}>
                <Card className={`${isOwnMessage
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                    } shadow-sm`}>
                    <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                {!isOwnMessage && (
                                    <p className="text-xs font-medium text-gray-600 mb-1">
                                        {senderName}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                        {isFreeMeeting ? "Free Meeting Request" : "Session Booking"}
                                    </span>
                                </div>
                            </div>
                            <Badge className={`text-xs ${statusColor[messageContent.status]}`}>
                                {messageContent.status}
                            </Badge>
                        </div>

                        {/* Subject and Level */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="font-medium">Subject:</span>
                                <span>{messageContent.subjectName} - {messageContent.levelName}</span>
                            </div>
                        </div>

                        {/* Initial Message */}
                        {messageContent.initialMessage && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                    "{messageContent.initialMessage}"
                                </p>
                            </div>
                        )}

                        {/* Suggested Times */}
                        {messageContent.suggestedTimes && messageContent.suggestedTimes.length > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Suggested Time{messageContent.suggestedTimes.length > 1 ? 's' : ''}:
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {messageContent.suggestedTimes.map((timestamp, index) => (
                                        <div
                                            key={index}
                                            className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm"
                                        >
                                            <div className="font-medium text-blue-900">
                                                {format(new Date(timestamp), "EEEE, MMMM d, yyyy")}
                                            </div>
                                            <div className="text-blue-700">
                                                {format(new Date(timestamp), "h:mm a")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons for Tutor */}
                        {canTutorRespond && (
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={handleAcceptBooking}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        size="sm"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept {isFreeMeeting ? "Meeting" : "Booking"}
                                    </Button>
                                    <Button
                                        onClick={() => setShowCounterOffer(!showCounterOffer)}
                                        variant="outline"
                                        className="flex-1"
                                        size="sm"
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Suggest Different Time
                                    </Button>
                                </div>

                                <Button
                                    onClick={handleRejectBooking}
                                    variant="outline"
                                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                                    size="sm"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Decline
                                </Button>
                            </div>
                        )}

                        {/* Counter Offer Time Picker */}
                        {showCounterOffer && canTutorRespond && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <h4 className="font-medium text-gray-900 mb-3">Suggest Alternative Time</h4>
                                <DateTimePicker
                                    date={counterOfferTime}
                                    onDateTimeChange={setCounterOfferTime}
                                    placeholder="When would work better for you?"
                                />
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        onClick={handleCounterOffer}
                                        disabled={!counterOfferTime}
                                        size="sm"
                                        className="flex-1"
                                    >
                                        Send Suggestion
                                    </Button>
                                    <Button
                                        onClick={() => setShowCounterOffer(false)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(message._creationTime, { addSuffix: true })}
                            </span>
                            {(messageContent.suggestedTimes?.length || 0) > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-xs text-gray-500 h-auto p-1"
                                >
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
