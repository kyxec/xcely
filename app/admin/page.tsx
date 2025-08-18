"use client"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"

export default function Page() {
    const test = useQuery(api.subjects.getSubjectsWithLevels, {})
    return (
        <div>{JSON.stringify(test)}</div>
    )
}
