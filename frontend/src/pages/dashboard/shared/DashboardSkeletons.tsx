import React from 'react'

export const DashboardKpiSkeleton: React.FC<{ count?: number }> = ({ count = 7 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-lg border border-[#E0E0E0] p-3 animate-pulse">
        <div className="h-8 w-8 rounded-lg bg-[#E8E8E8] mb-2" />
        <div className="h-3 w-16 bg-[#E8E8E8] rounded mb-2" />
        <div className="h-6 w-12 bg-[#E0E0E0] rounded" />
      </div>
    ))}
  </div>
)

export const DashboardPanelsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-lg border border-[#E0E0E0] overflow-hidden animate-pulse">
        <div className="h-10 bg-[#E8E8E8]" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-[#F0F0F0] rounded w-3/4" />
          <div className="h-2 bg-[#E8E8E8] rounded-full" />
        </div>
      </div>
    ))}
  </div>
)
