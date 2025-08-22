"use client"

import { useEffect, useCallback, useRef } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { PresenceData } from "@/convex/presence"

const HEARTBEAT_INTERVAL = 2000; // 2 seconds - faster heartbeat
// ONLINE_THRESHOLD is now handled in the backend (5 seconds)

export function usePresence(
    room: string,
    initialData: PresenceData = {}
) {
    const updatePresence = useMutation(api.presence.updatePresence)
    const heartbeat = useMutation(api.presence.heartbeat)
    const setOffline = useMutation(api.presence.setOffline)
    const othersPresence = useQuery(api.presence.getPresenceInRoom, { room })

    const currentDataRef = useRef<PresenceData>(initialData)
    const lastUpdateRef = useRef<number>(0)
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // Update presence with partial data
    const updateMyPresence = useCallback(async (partialData: Partial<PresenceData>) => {
        const newData = { ...currentDataRef.current, ...partialData }
        currentDataRef.current = newData

        // Debounce updates to avoid too many mutations
        const now = Date.now()
        if (now - lastUpdateRef.current < 50) { // 50ms debounce - faster updates
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
                updatePresence({
                    room,
                    data: JSON.stringify(newData)
                })
                lastUpdateRef.current = Date.now()
            }, 50)
            return
        }

        try {
            await updatePresence({
                room,
                data: JSON.stringify(newData)
            })
            lastUpdateRef.current = now
        } catch (error) {
            console.error("Failed to update presence:", error)
        }
    }, [room, updatePresence])

    // Send heartbeat and initial presence
    useEffect(() => {
        // Send initial presence
        updateMyPresence(initialData)

        // Set up heartbeat interval
        const intervalId = setInterval(() => {
            // Only send heartbeat if page is visible
            if (!document.hidden) {
                heartbeat({ room }).catch((error) => {
                    console.error("Failed to send heartbeat:", error)
                })
            }
        }, HEARTBEAT_INTERVAL)

        // Handle page visibility changes for immediate offline detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Immediately set offline when page becomes hidden
                setOffline({ room }).catch((error) => {
                    console.error("Failed to set offline:", error)
                })
            } else {
                // Send heartbeat when page becomes visible again
                heartbeat({ room }).catch((error) => {
                    console.error("Failed to send heartbeat on visibility:", error)
                })
            }
        }

        // Handle before page unload - more aggressive offline detection
        const handleBeforeUnload = () => {
            // Use navigator.sendBeacon for more reliable delivery
            try {
                // First try the mutation
                setOffline({ room }).catch(() => {
                    // Fallback: try sendBeacon as last resort
                    if (navigator.sendBeacon) {
                        const url = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/presence/offline`
                        const data = JSON.stringify({ room })
                        navigator.sendBeacon(url, data)
                    }
                })
            } catch {
                // Ignore errors during page unload
            }
        }

        // Handle page hide (more reliable than beforeunload)
        const handlePageHide = () => {
            setOffline({ room }).catch(() => {
                // Ignore errors
            })
        }

        // Add event listeners
        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("pagehide", handlePageHide) // More reliable than beforeunload

        // Also listen for browser/tab close
        window.addEventListener("unload", handlePageHide)

        heartbeatIntervalRef.current = intervalId

        return () => {
            clearInterval(intervalId)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Remove event listeners
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("beforeunload", handleBeforeUnload)
            window.removeEventListener("pagehide", handlePageHide)
            window.removeEventListener("unload", handlePageHide)

            // Set offline when component unmounts
            setOffline({ room }).catch((error) => {
                console.error("Failed to set offline on unmount:", error)
            })
        }
    }, [room, heartbeat, setOffline, updateMyPresence])

    // Filter online users
    const onlinePresence = othersPresence?.filter(
        (presence) => presence.isOnline
    ) || []

    return {
        othersPresence: othersPresence || [],
        onlinePresence,
        updateMyPresence,
        isLoading: othersPresence === undefined,
    }
}

// Hook specifically for typing indicators
export function useTypingIndicator(room: string) {
    const { othersPresence, updateMyPresence } = usePresence(room)

    const setTyping = useCallback((typing: boolean) => {
        updateMyPresence({ typing })
    }, [updateMyPresence])

    // Get users who are currently typing
    const typingUsers = othersPresence
        .filter((presence) => {
            try {
                const data = JSON.parse(presence.data) as PresenceData
                return data.typing === true && presence.isOnline
            } catch {
                return false
            }
        })
        .map((presence) => presence.userName)

    return {
        typingUsers,
        setTyping,
    }
}

// Hook for online status
export function useOnlineStatus(room: string) {
    const { onlinePresence, updateMyPresence } = usePresence(room)

    useEffect(() => {
        // Update presence to indicate we're in this room
        updateMyPresence({ inRoom: true })

        return () => {
            // Clean up when leaving room
            updateMyPresence({ inRoom: false })
        }
    }, [room, updateMyPresence])

    return {
        onlineUsers: onlinePresence,
        onlineCount: onlinePresence.length,
    }
}
