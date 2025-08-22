"use client"

import { useState } from "react"
import { usePreloadedQuery, Preloaded } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FunctionReturnType } from "convex/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Clock, CheckCircle } from "lucide-react"
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
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 text-center max-w-md">
                        {userRole === "student"
                            ? "Start a conversation with a tutor to begin your learning journey."
                            : "When students contact you, your conversations will appear here."
                        }
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
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Conversations</h2>

            <div className="grid gap-4">
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
    const initials = otherPartyName.split(" ").map(n => n[0]).join("").toUpperCase()

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {otherPartyName}
                            </h3>
                            <div className="flex items-center space-x-2">
                                {conversation.unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full"
                                    >
                                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                    </Badge>
                                )}
                                {conversation.hasFreeMeeting && (
                                    <Badge variant="outline" className="text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Free Meeting
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {conversation.lastMessage && (
                            <>
                                <p className="text-sm text-gray-600 truncate mt-1">
                                    <span className="font-medium">{conversation.lastMessage.senderName}:</span>{" "}
                                    {conversation.lastMessage.messageType === "text"
                                        ? JSON.parse(conversation.lastMessage.content).text
                                        : "Booking message"
                                    }
                                </p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center">
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
