"use client";

import { useState } from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, User, ExternalLink } from "lucide-react";

type AdminTutorsTableProps = {
    preloadedTutors: Preloaded<typeof api.tutors.getTutorsForAdmin>;
};

export default function AdminTutorsTable({ preloadedTutors }: AdminTutorsTableProps) {
    const tutors = usePreloadedQuery(preloadedTutors);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter tutors based on search term
    const filteredTutors = tutors.filter((tutor) => {
        const fullName = `${tutor.firstName} ${tutor.lastName || ""}`.toLowerCase();
        const email = tutor.email?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();

        return fullName.includes(search) || email.includes(search);
    });

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search tutors by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {filteredTutors.length} of {tutors.length} tutors
                    </Badge>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor Info</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "No tutors found matching your search." : "No tutors found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTutors.map((tutor) => (
                                <TableRow key={tutor._id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="font-medium">
                                                {tutor.firstName} {tutor.lastName || ""}
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded w-fit">
                                                {tutor._id}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {tutor.email || <span className="text-muted-foreground italic">No email</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={`/admin/tutors/${tutor._id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
