
import { Skeleton } from "@/components/ui/skeleton";

export function InterviewSkeleton() {
    return (
        <div className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 w-2/3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function InterviewListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <InterviewSkeleton key={i} />
            ))}
        </div>
    );
}
