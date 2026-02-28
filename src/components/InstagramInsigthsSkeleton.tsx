import { Card, CardContent, CardHeader } from "./ui/card"; // Or your Card wrapper
import { Skeleton } from "@/components/ui/skeleton";

export const InstagramInsightsSkeleton = () => {
  return (
    <div className="space-y-6 mt-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Skeleton */}
        <div className="bg-[#121212] border border-[#222] rounded-xl p-8 flex flex-col items-center">
          <Skeleton className="w-24 h-24 rounded-full bg-slate-800 mb-4" />
          <Skeleton className="h-6 w-32 bg-slate-800 mb-2" />
          <Skeleton className="h-4 w-24 bg-slate-900 mb-6" />
          
          <div className="grid grid-cols-3 gap-4 w-full border-t border-[#222] pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-5 w-10 bg-slate-800" />
                <Skeleton className="h-3 w-12 bg-slate-900" />
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart Skeleton */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#222] rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-5 w-32 bg-slate-800" />
            <Skeleton className="h-5 w-20 bg-slate-900" />
          </div>
          <div className="flex items-center justify-center h-[220px]">
            {/* Mimic the radar shape with a large circle */}
            <Skeleton className="w-48 h-48 rounded-full border-4 border-slate-800 bg-transparent" />
          </div>
        </div>
      </div>

      {/* Mini Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#121212] border border-[#222] rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 bg-slate-900" />
              <Skeleton className="h-6 w-20 bg-slate-800" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
};