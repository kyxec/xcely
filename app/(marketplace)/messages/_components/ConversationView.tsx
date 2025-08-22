"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Calendar, CheckCircle, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { InteractiveBookingMessage } from "./InteractiveBookingMessage"

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
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    const otherPartyName = userRole === "student" ? conversation.tutorName : conversation.studentName
    const initials = otherPartyName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

    // Get messages for this conversation
    const messages = useQuery(api.messages.getMessagesInConversation, {
        conversationId: conversation._id,
    })

    // Mutations
    const sendTextMessage = useMutation(api.messages.sendTextMessage)
    const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (messages && messages.length > 0) {
            scrollToBottom()
        }
    }, [messages])

    // Mark messages as read when viewing conversation
    useEffect(() => {
        if (conversation._id) {
            markMessagesAsRead({ conversationId: conversation._id })
        }
    }, [conversation._id, markMessagesAsRead])

    const handleSendMessage = async () => {
        if (!message.trim()) return

        try {
            await sendTextMessage({
                conversationId: conversation._id,
                content: message.trim(),
            })
            setMessage("")
        } catch (error) {
            console.error("Failed to send message:", error)
        }
    }

    const handleSuggestTime = async () => {
        if (!suggestedDateTime) return

        const suggestionMessage = `I'd like to suggest we meet on ${suggestedDateTime.toLocaleDateString()} at ${suggestedDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Does this work for you?`

        try {
            await sendTextMessage({
                conversationId: conversation._id,
                content: suggestionMessage,
            })
            setShowTimeSuggestion(false)
            setSuggestedDateTime(undefined)
        } catch (error) {
            console.error("Failed to send time suggestion:", error)
        }
    }

    if (!messages) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversation...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen max-h-[calc(100vh-120px)]">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 border-b bg-white">
                <CardHeader className="py-4">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">{otherPartyName}</h2>
                            <div className="flex items-center space-x-2">
                                {conversation.hasFreeMeeting && (
                                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Free Meeting
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </div>

            {/* Messages - Scrollable middle section */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
                style={{ minHeight: 0 }} // Important for flex scrolling
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 py-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isOwnMessage={msg.senderId === (userRole === "student" ? conversation.studentId : conversation.tutorId)}
                                senderName={msg.senderId === conversation.studentId ? conversation.studentName : conversation.tutorName}
                                userRole={userRole}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-shrink-0 border-t bg-white">
                <div className="p-4 space-y-3">
                    {showTimeSuggestion && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-blue-900">Suggest a Meeting Time</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowTimeSuggestion(false)}
                                        className="h-8 w-8 p-0 hover:bg-blue-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <DateTimePicker
                                    date={suggestedDateTime}
                                    onDateTimeChange={setSuggestedDateTime}
                                    placeholder="Select when you'd like to meet"
                                />
                                <div className="flex justify-end mt-3 space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setShowTimeSuggestion(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSuggestTime}
                                        disabled={!suggestedDateTime}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Send Suggestion
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex space-x-3">
                        <div className="flex-1">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="min-h-[60px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                size="sm"
                                className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTimeSuggestion(true)}
                                title="Suggest meeting time"
                                className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50"
                            >
                                <Calendar className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

type MessageBubbleProps = {
    message: FunctionReturnType<typeof api.messages.getMessagesInConversation>[0]
    isOwnMessage: boolean
    senderName: string
    userRole: "student" | "tutor"
}

function MessageBubble({ message, isOwnMessage, senderName, userRole }: MessageBubbleProps) {
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
            />
        )
    }

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}>
            <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage ? "bg-blue-600 text-white" : "bg-white text-gray-900 border border-gray-200"
                    }`}
            >
                {!isOwnMessage && <p className="text-xs font-medium mb-1 opacity-70">{senderName}</p>}

                {message.messageType === "text" && <p className="whitespace-pre-wrap leading-relaxed">{messageContent.text}</p>}

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
