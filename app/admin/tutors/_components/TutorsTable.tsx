"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Plus } from "lucide-react"

// const tutor = {
//     firstName: "Eduardo",
//     lastName: "Carvalho",
//     email: "eduardo@xceltutors",
//     image: "https://lh3.googleusercontent.com/a/ACg8ocI6D1M-MkmjL13GLFYEtzwDbVr5Yd_AleX5lB2cyLZT6r0fMrS6=s96-c",
//     university: "University of Leiria",
//     subjects: [
//         {
//             id: "1aisdni1x",
//             name: "Mathematics",
//             levels: [
//                 {
//                     id: "1aisdni1x-level1",
//                     name: "A level"
//                 },
//                 {
//                     id: "1aisdni1x-level2",
//                     name: "GSCE"
//                 },
//             ]
//         },
//         {
//             id: "1aisdni2x",
//             name: "Physics",
//             levels: [
//                 {
//                     id: "1aisdni2x-level1",
//                     name: "A level"
//                 },
//                 {
//                     id: "1aisdni2x-level2",
//                     name: "GSCE"
//                 },
//                 {
//                     id: "1aisdni2x-level3",
//                     name: "A level"
//                 },
//                 {
//                     id: "1aisdni2x-level4",
//                     name: "Intermid Abc"
//                 }
//             ]
//         }
//     ]
// }
const generateTutors = () => {
    const firstNames = [
        "John",
        "Jane",
        "Michael",
        "Sarah",
        "David",
        "Emily",
        "Robert",
        "Olivia",
        "James",
        "Sophia",
        "William",
        "Emma",
        "Alexander",
        "Isabella",
        "Daniel",
        "Mia",
        "Matthew",
        "Charlotte",
        "Christopher",
        "Amelia",
    ]
    const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Gonzalez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
    ]
    const universities = [
        "University of California, Berkeley",
        "Stanford University",
        "Massachusetts Institute of Technology",
        "Harvard University",
        "Columbia University",
        "University of Toronto",
        "University of Cambridge",
        "University of Oxford",
        "Princeton University",
        "Yale University",
        "University of Chicago",
        "California Institute of Technology",
        "University of Pennsylvania",
        "Cornell University",
        "Northwestern University",
        "Duke University",
        "Johns Hopkins University",
        "University of Michigan",
        "New York University",
        "University of Washington",
    ]

    const tutors = []
    for (let i = 1; i <= 300; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        tutors.push({
            id: 100 + i,
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            university: universities[Math.floor(Math.random() * universities.length)],
            subjects: [
                "Computer Science",
                "Mathematics",
                "Physics",
                "Chemistry",
                "Biology",
                "History",
                "Literature",
                "Engineering",
            ][Math.floor(Math.random() * 8)],
        })
    }
    return tutors
}

const tutors = generateTutors()

// Number of tutors to display per page
const ITEMS_PER_PAGE = 10

export default function TutorsTable() {
    // State for the current page number and the search query
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")

    // Filter tutors based on the search query
    const filteredTutors = useMemo(() => {
        if (!searchQuery) {
            return tutors
        }
        const lowerCaseQuery = searchQuery.toLowerCase()
        return tutors.filter(
            (tutor) =>
                tutor.firstName.toLowerCase().includes(lowerCaseQuery) ||
                tutor.lastName.toLowerCase().includes(lowerCaseQuery) ||
                tutor.university.toLowerCase().includes(lowerCaseQuery) ||
                String(tutor.id).includes(lowerCaseQuery),
        )
    }, [searchQuery])

    // Calculate the total number of pages based on the filtered data
    const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE)

    // Calculate the start and end index for the current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    // Get the tutors for the current page
    const paginatedTutors = filteredTutors.slice(startIndex, endIndex)

    // Function to handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Function to handle search input changes and reset to the first page
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
        setCurrentPage(1) // Reset to the first page on new search
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <Input
                        type="text"
                        placeholder="Search by name, ID, or university..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
                    />
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/tutors/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Tutor
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4 min-w-[200px]">Name</TableHead>
                                <TableHead className="min-w-[250px]">Email</TableHead>
                                <TableHead className="min-w-[200px]">University</TableHead>
                                <TableHead className="w-[100px] text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTutors.map((tutor) => (
                                <TableRow key={tutor.id} className="odd:bg-muted/50">
                                    <TableCell className="pl-4">
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {tutor.firstName} {tutor.lastName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">ID: {tutor.id}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="break-all">{tutor.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="break-words">{tutor.university}</div>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/tutors/${tutor.id}`} className="flex items-center">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedTutors.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No tutors found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Results info */}
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredTutors.length)} of {filteredTutors.length} results
                    </div>

                    <div className="flex justify-center sm:justify-end">
                        <Pagination>
                            <PaginationContent className="flex-wrap">
                                {/* Previous button */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        aria-disabled={currentPage === 1}
                                    />
                                </PaginationItem>

                                {(() => {
                                    const pages = []
                                    const maxVisiblePages = 7 // Show more pages on larger screens

                                    if (totalPages <= maxVisiblePages) {
                                        // Show all pages if total is small
                                        for (let i = 1; i <= totalPages; i++) {
                                            pages.push(
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(i)}
                                                        isActive={i === currentPage}
                                                        className="cursor-pointer"
                                                        aria-label={`Go to page ${i}`}
                                                    >
                                                        {i}
                                                    </PaginationLink>
                                                </PaginationItem>,
                                            )
                                        }
                                    } else {
                                        // Enhanced pagination for large datasets
                                        const delta = 2 // Pages to show around current page
                                        const start = Math.max(1, currentPage - delta)
                                        const end = Math.min(totalPages, currentPage + delta)

                                        // Always show first page
                                        pages.push(
                                            <PaginationItem key={1}>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(1)}
                                                    isActive={1 === currentPage}
                                                    className="cursor-pointer"
                                                    aria-label="Go to page 1"
                                                >
                                                    1
                                                </PaginationLink>
                                            </PaginationItem>,
                                        )

                                        // Add ellipsis after first page if needed
                                        if (start > 2) {
                                            pages.push(
                                                <PaginationItem key="ellipsis1">
                                                    <span className="px-3 py-2 text-muted-foreground">...</span>
                                                </PaginationItem>,
                                            )
                                        }

                                        // Show current range (skip if it includes page 1)
                                        for (let i = Math.max(2, start); i <= Math.min(totalPages - 1, end); i++) {
                                            pages.push(
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(i)}
                                                        isActive={i === currentPage}
                                                        className="cursor-pointer"
                                                        aria-label={`Go to page ${i}`}
                                                    >
                                                        {i}
                                                    </PaginationLink>
                                                </PaginationItem>,
                                            )
                                        }

                                        // Add ellipsis before last page if needed
                                        if (end < totalPages - 1) {
                                            pages.push(
                                                <PaginationItem key="ellipsis2">
                                                    <span className="px-3 py-2 text-muted-foreground">...</span>
                                                </PaginationItem>,
                                            )
                                        }

                                        // Always show last page (if not already shown)
                                        if (totalPages > 1) {
                                            pages.push(
                                                <PaginationItem key={totalPages}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(totalPages)}
                                                        isActive={totalPages === currentPage}
                                                        className="cursor-pointer"
                                                        aria-label={`Go to page ${totalPages}`}
                                                    >
                                                        {totalPages}
                                                    </PaginationLink>
                                                </PaginationItem>,
                                            )
                                        }
                                    }

                                    return pages
                                })()}

                                {/* Next button */}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        aria-disabled={currentPage === totalPages}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </div>
    )
}
