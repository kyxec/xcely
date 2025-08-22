"use client"

import { useState } from "react"
import { usePreloadedQuery, type Preloaded } from "convex/react"
import type { api } from "@/convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Clock, CheckCircle, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ConversationView } from "./ConversationView"

type ConversationsData = FunctionReturnType<typeof api.messages.getMyConversations>
type Conversation = ConversationsData[0]

type MessagesViewProps = {
    preloadedConversations: Preloaded<typeof api.messages.getMyConversations>
    userRole: "student" | "tutor"
}

export function MessagesView({ preloadedConversations, userRole }: MessagesViewProps) {
    const conversations = usePreloadedQuery(preloadedConversations)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

    if (conversations.length === 0) {
        return (
            <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No messages yet</h3>
                    <p className="text-gray-600 text-center max-w-md leading-relaxed">
                        {userRole === "student"
                            ? "Start a conversation with a tutor to begin your learning journey."
                            : "When students contact you, your conversations will appear here."}
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (selectedConversation) {
        return (
            <ConversationView
                conversation={selectedConversation}
                userRole={userRole}
                onBack={() => setSelectedConversation(null)}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Conversations</h2>
                <Badge variant="outline" className="text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </Badge>
            </div>

            <div className="grid gap-3">
                {conversations.map((conversation) => (
                    <ConversationCard
                        key={conversation._id}
                        conversation={conversation}
                        userRole={userRole}
                        onClick={() => setSelectedConversation(conversation)}
                    />
                ))}
            </div>
        </div>
    )
}

type ConversationCardProps = {
    conversation: Conversation
    userRole: "student" | "tutor"
    onClick: () => void
}

function ConversationCard({ conversation, userRole, onClick }: ConversationCardProps) {
    const otherPartyName = userRole === "student" ? conversation.tutorName : conversation.studentName

    // Get initials for avatar
    const initials = otherPartyName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

    return (
        <Card
            className="cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 border-0 shadow-sm"
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate text-lg">{otherPartyName}</h3>
                            <div className="flex items-center space-x-2">
                                {conversation.unreadCount > 0 && (
                                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full px-2">
                                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                    </Badge>
                                )}
                                {conversation.hasFreeMeeting && (
                                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Free Meeting
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {conversation.lastMessage && (
                            <>
                                <p className="text-sm text-gray-600 truncate mt-1 leading-relaxed">
                                    <span className="font-medium">{conversation.lastMessage.senderName}:</span>{" "}
                                    {conversation.lastMessage.messageType === "text"
                                        ? JSON.parse(conversation.lastMessage.content).text
                                        : "📅 Booking message"}
                                </p>
                                <p className="text-xs text-gray-400 mt-2 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDistanceToNow(conversation.lastMessage._creationTime, { addSuffix: true })}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
