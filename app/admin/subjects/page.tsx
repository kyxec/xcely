"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubjectsPage() {
    const subjects = useQuery(api.subjects.getSubjectsWithLevels, {})

    if (subjects === undefined) {
        return <SubjectsPageSkeleton />
    }

    if (subjects === null || subjects.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Subjects</h1>
                    <p className="text-muted-foreground">
                        Manage subjects and their levels
                    </p>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <h3 className="text-lg font-medium">No subjects found</h3>
                            <p className="text-muted-foreground">
                                Get started by creating your first subject.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Subjects</h1>
                <p className="text-muted-foreground">
                    Manage subjects and their levels ({subjects.length} total)
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Subjects</CardTitle>
                    <CardDescription>
                        A comprehensive list of all subjects and their associated levels
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject Name</TableHead>
                                <TableHead>Levels</TableHead>
                                <TableHead>Level Count</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.map((subject) => (
                                <TableRow key={subject._id}>
                                    <TableCell className="font-medium">
                                        {subject.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {subject.levels.length > 0 ? (
                                                subject.levels.map((level) => (
                                                    <Badge
                                                        key={level._id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {level.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">
                                                    No levels assigned
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {subject.levels.length}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(subject._creationTime).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function SubjectsPageSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Table header skeleton */}
                        <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>

                        {/* Table rows skeleton */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-4 gap-4 py-3">
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-1">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-5 w-8" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
