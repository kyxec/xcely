"use client"

import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, Clock, User, Mail, Phone } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"

export default function PendingTutorsPage() {
    const pendingCandidates = useQuery(api.admin.getPendingTutorCandidates, {})
    const approveMutation = useMutation(api.admin.approveTutorApplication)
    const rejectMutation = useMutation(api.admin.rejectTutorApplication)

    const [processingId, setProcessingId] = useState<Id<"tutorCandidates"> | null>(null)

    const handleApprove = async (applicationId: Id<"tutorCandidates">) => {
        try {
            setProcessingId(applicationId)
            const result = await approveMutation({ applicationId })
            toast.success(result.message)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to approve application")
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (applicationId: Id<"tutorCandidates">) => {
        try {
            setProcessingId(applicationId)
            const result = await rejectMutation({ applicationId })
            toast.success(result.message)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reject application")
        } finally {
            setProcessingId(null)
        }
    }

    if (pendingCandidates === undefined) {
        return <PendingTutorsPageSkeleton />
    }

    if (pendingCandidates === null || pendingCandidates.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Pending Tutor Applications</h1>
                    <p className="text-muted-foreground">
                        Review and manage tutor applications
                    </p>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No pending applications</h3>
                            <p className="text-muted-foreground">
                                All tutor applications have been reviewed.
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
                <h1 className="text-3xl font-bold">Pending Tutor Applications</h1>
                <p className="text-muted-foreground">
                    Review and manage tutor applications ({pendingCandidates.length} pending)
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Applications Awaiting Review
                    </CardTitle>
                    <CardDescription>
                        Review candidate information and approve or reject applications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Contact Information</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingCandidates.map((candidate) => {
                                const user = candidate.user
                                const isProcessing = processingId === candidate._id

                                return (
                                    <TableRow key={candidate._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user?.image} />
                                                    <AvatarFallback>
                                                        {user ?
                                                            `${user.firstName.charAt(0)}${(user.lastName || '').charAt(0)}` :
                                                            <User className="h-4 w-4" />
                                                        }
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {user ?
                                                            `${user.firstName} ${user.lastName || ''}`.trim() :
                                                            'Unknown User'
                                                        }
                                                    </div>
                                                    {!user && (
                                                        <div className="text-sm text-destructive">
                                                            User not found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user ? (
                                                <div className="space-y-1">
                                                    {user.email && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            <span>{user.email}</span>
                                                        </div>
                                                    )}
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            <span>{user.phone}</span>
                                                        </div>
                                                    )}
                                                    {!user.email && !user.phone && (
                                                        <span className="text-sm text-muted-foreground">
                                                            No contact info
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    N/A
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(candidate._creationTime).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {candidate.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            disabled={isProcessing || !user}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Approve Tutor Application</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to approve {user?.firstName} {user?.lastName}&apos;s
                                                                application to become a tutor? This will grant them tutor privileges
                                                                and they will be able to create and manage tutoring sessions.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleApprove(candidate._id)}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                Approve Application
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled={isProcessing || !user}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Reject Tutor Application</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to reject {user?.firstName} {user?.lastName}&apos;s
                                                                application to become a tutor? This action cannot be undone and
                                                                the application will be permanently removed.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleReject(candidate._id)}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                Reject Application
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function PendingTutorsPageSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-80" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Table header skeleton */}
                        <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20 ml-auto" />
                        </div>

                        {/* Table rows skeleton */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-5 gap-4 py-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-16" />
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
