"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/lib/context/auth-context"

interface ParticipantAttendance {
    userId: string
    userName: string
    joinedAt: Date
    leftAt?: Date
}

export function useCallTracking(call: any, groupId: string) {
    const { user } = useAuth()
    const callStartTimeRef = useRef<Date>(new Date())
    const participantsRef = useRef<Map<string, ParticipantAttendance>>(new Map())
    const hasTrackedRef = useRef(false)

    const handleParticipantJoined = useCallback((participant: any) => {
        if (!participantsRef.current.has(participant.user_id)) {
            participantsRef.current.set(participant.user_id, {
                userId: participant.user_id,
                userName: participant.name || "Unknown",
                joinedAt: new Date(),
            })
        }
    }, [])

    const handleParticipantLeft = useCallback((participant: any) => {
        const attendance = participantsRef.current.get(participant.user_id)
        if (attendance) {
            attendance.leftAt = new Date()
        }
    }, [])

    const saveCallSession = useCallback(async () => {
        if (hasTrackedRef.current || !user || !call) return
        hasTrackedRef.current = true

        try {
            const callEndTime = new Date()
            const durationMinutes = Math.round((callEndTime.getTime() - callStartTimeRef.current.getTime()) / 60000)

            // Prepare attendance records
            const attendanceRecords = Array.from(participantsRef.current.values()).map((participant) => ({
                userId: participant.userId,
                userName: participant.userName,
                joinedAt: participant.joinedAt.toISOString(),
                leftAt: participant.leftAt?.toISOString() || callEndTime.toISOString(),
                durationMinutes: participant.leftAt
                    ? Math.round((participant.leftAt.getTime() - participant.joinedAt.getTime()) / 60000)
                    : durationMinutes,
            }))

            console.log("[DEBUG] Saving call session payload:", {
                groupId,
                userId: user.$id,
                userName: user.name || "Unknown",
                startedAt: callStartTimeRef.current.toISOString(),
                endedAt: callEndTime.toISOString(),
                durationMinutes,
                participants: Array.from(participantsRef.current.values()),
            })

            // Save to database via API
            const response = await fetch("/api/call-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId,
                    userId: user.$id,
                    userName: user.name || "Unknown",
                    startedAt: callStartTimeRef.current.toISOString(),
                    endedAt: callEndTime.toISOString(),
                    durationMinutes,
                    participants: attendanceRecords,
                }),
            })

            if (!response.ok) {
                console.error("[v0] Failed to save call session:", await response.text())
            }
        } catch (error) {
            console.error("[v0] Error saving call session:", error)
        }
    }, [user, call, groupId])

    useEffect(() => {
        if (!call) return;

        // When participant joins
        const handleJoin = (event: any) => {
            const participant = event.participant;
            handleParticipantJoined(participant);
        };

        // When participant leaves
        const handleLeave = (event: any) => {
            const participant = event.participant;
            handleParticipantLeft(participant);
        };

        call.on("participant_joined", handleJoin);
        call.on("participant_left", handleLeave);

        // Also add yourself (the local user)
        if (user) {
            participantsRef.current.set(user.$id, {
                userId: user.$id,
                userName: user.name || "You",
                joinedAt: new Date(),
            });
        }

        return () => {
            call.off("participant_joined", handleJoin);
            call.off("participant_left", handleLeave);
        };
    }, [call, handleParticipantJoined, handleParticipantLeft, user]);

    return { saveCallSession }
}
