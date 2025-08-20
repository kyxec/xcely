import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ApplicationStatusSkeleton() {
    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center space-y-4">
                {/* Icon skeleton */}
                <div className="flex justify-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                {/* Badge skeleton */}
                <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                {/* Title skeleton */}
                <Skeleton className="h-7 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <div className="space-y-2">
                    {/* Status text skeleton */}
                    <Skeleton className="h-5 w-40 mx-auto" />
                    {/* Wait time box skeleton */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <Skeleton className="h-4 w-56 mx-auto" />
                    </div>
                </div>
                {/* Bottom info skeleton */}
                <div className="space-y-1 pt-2 border-t">
                    <Skeleton className="h-3 w-32 mx-auto" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                </div>
            </CardContent>
        </Card>
    );
}
