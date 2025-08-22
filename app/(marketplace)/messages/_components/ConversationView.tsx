"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FunctionReturnType } from "convex/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Calendar, Clock, CheckCircle, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { InteractiveBookingMessage } from "./InteractiveBookingMessage"
import { Id } from "@/convex/_generated/dataModel"

type ConversationsData = FunctionReturnType<typeof api.messages.getMyConversations>
type Conversation = ConversationsData[0]

type ConversationViewProps = {
    conversation: Conversation
    userRole: "student" | "tutor"
    onBack: () => void
}

export function ConversationView({ conversation, userRole, onBack }: ConversationViewProps) {
    const [message, setMessage] = useState("")
    const [showTimeSuggestion, setShowTimeSuggestion] = useState(false)
    const [suggestedDateTime, setSuggestedDateTime] = useState<Date | undefined>()

    const otherPartyName = userRole === "student" ? conversation.tutorName : conversation.studentName
    const initials = otherPartyName.split(" ").map(n => n[0]).join("").toUpperCase()

    // Get messages for this conversation
    const messages = useQuery(api.messages.getMessagesInConversation, {
        conversationId: conversation._id
    })

    // Mutations
    const sendTextMessage = useMutation(api.messages.sendTextMessage)
    const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead)

    // Mark messages as read when viewing conversation
    React.useEffect(() => {
        if (conversation._id) {
            markMessagesAsRead({ conversationId: conversation._id })
        }
    }, [conversation._id, markMessagesAsRead])

    const handleSendMessage = async () => {
        if (!message.trim()) return

        try {
            await sendTextMessage({
                conversationId: conversation._id,
                content: message.trim()
            })
            setMessage("")
        } catch (error) {
            console.error("Failed to send message:", error)
        }
    }

    const handleSuggestTime = async () => {
        if (!suggestedDateTime) return

        const suggestionMessage = `I'd like to suggest we meet on ${suggestedDateTime.toLocaleDateString()} at ${suggestedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Does this work for you?`

        try {
            await sendTextMessage({
                conversationId: conversation._id,
                content: suggestionMessage
            })
            setShowTimeSuggestion(false)
            setSuggestedDateTime(undefined)
        } catch (error) {
            console.error("Failed to send time suggestion:", error)
        }
    }

    if (!messages) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversation...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header */}
            <Card className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold">{otherPartyName}</h2>
                            <div className="flex items-center space-x-2">
                                {conversation.hasFreeMeeting && (
                                    <Badge variant="outline" className="text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Free Meeting
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Messages */}
            <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isOwnMessage={msg.senderId === (userRole === "student" ? conversation.studentId : conversation.tutorId)}
                                senderName={msg.senderId === conversation.studentId ? conversation.studentName : conversation.tutorName}
                                userRole={userRole}
                                conversationId={conversation._id}
                            />
                        ))
                    )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4 space-y-3">
                    {showTimeSuggestion && (
                        <Card className="p-4 bg-blue-50 border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-blue-900">Suggest a Meeting Time</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTimeSuggestion(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <DateTimePicker
                                date={suggestedDateTime}
                                onDateTimeChange={setSuggestedDateTime}
                                label="Suggested Meeting Time"
                                placeholder="Select when you'd like to meet"
                            />
                            <div className="flex justify-end mt-3 space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowTimeSuggestion(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSuggestTime}
                                    disabled={!suggestedDateTime}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Send Suggestion
                                </Button>
                            </div>
                        </Card>
                    )}

                    <div className="flex space-x-2">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 min-h-[60px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                        />
                        <div className="flex flex-col space-y-2">
                            <Button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                size="sm"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTimeSuggestion(true)}
                                title="Suggest meeting time"
                            >
                                <Calendar className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

type MessageBubbleProps = {
    message: any // We'll type this properly based on the message structure
    isOwnMessage: boolean
    senderName: string
    userRole: "student" | "tutor"
    conversationId: Id<"conversations">
}

function MessageBubble({ message, isOwnMessage, senderName, userRole, conversationId }: MessageBubbleProps) {
    const messageContent = JSON.parse(message.content)

    // Use InteractiveBookingMessage for booking messages
    if (message.messageType === "booking") {
        return (
            <InteractiveBookingMessage
                message={message}
                messageContent={messageContent}
                isOwnMessage={isOwnMessage}
                senderName={senderName}
                userRole={userRole}
                conversationId={conversationId}
            />
        )
    }

    // Regular message bubble for text and system messages
    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
            <div className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${isOwnMessage
                    ? "bg-blue-600 text-white ml-4"
                    : "bg-gray-100 text-gray-900 mr-4"
                }`}>
                {!isOwnMessage && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                        {senderName}
                    </p>
                )}

                {message.messageType === "text" && (
                    <p className="whitespace-pre-wrap">{messageContent.text}</p>
                )}

                {message.messageType === "systemNotification" && (
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 opacity-70" />
                        <p className="text-sm italic">{messageContent.notification}</p>
                    </div>
                )}

                <p className={`text-xs mt-2 opacity-70 ${isOwnMessage ? "text-right" : "text-left"}`}>
                    {formatDistanceToNow(message._creationTime, { addSuffix: true })}
                </p>
            </div>
        </div>
    )
}
