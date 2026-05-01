import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/Card'
import {
    Users,
    FileText,
    BarChart3,
    GraduationCap,
    Tag,
    Activity,
    Loader2,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardApi } from '../../services/dashboardApi'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { ENTITY_PATHS } from '../../constants/entityConstants'
import { getModuleCodeForPath } from '../../config/route'
import { DashboardStaffAndLogs } from './shared/DashboardStaffAndLogs'
import {
    DashboardKpiSkeleton,
    DashboardPanelsSkeleton,
} from './shared/DashboardSkeletons'
import { StatChartPanel } from './shared/StatChartPanel'

const getProgressColor = (status: string) => {
    switch (status) {
        case 'complete':
        case 'active':
            return 'bg-[#487749]'
        case 'in-progress':
            return 'bg-[#5c9a5e]'
        case 'over':
            return 'bg-amber-500'
        case 'pending':
            return 'bg-gray-300'
        default:
            return 'bg-gray-300'
    }
}

function formatLogTime(iso: string) {
    try {
        const d = new Date(iso)
        return d.toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'short',
        })
    } catch {
        return iso
    }
}

export const SuperAdminDashboard: React.FC = () => {
    const { user, hasPermission } = useAuth()
    const canPickKvk = user?.role === 'super_admin'
    const [selectedYear, setSelectedYear] = useState<string>('all')
    const [selectedKvk, setSelectedKvk] = useState<string>('all')

    const defaultYears = useMemo(() => {
        const y = new Date().getFullYear()
        return Array.from({ length: 20 }, (_, i) => y - i)
    }, [])

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ['dashboard', selectedYear, selectedKvk, canPickKvk],
        queryFn: () =>
            dashboardApi.getDashboard({
                reportingYear:
                    selectedYear === 'all' ? 'all' : Number(selectedYear),
                kvkId:
                    canPickKvk && selectedKvk !== 'all'
                        ? Number(selectedKvk)
                        : undefined,
            }),
        placeholderData: previousData => previousData,
    })

    const yearOptions = data?.yearOptions?.length
        ? data.yearOptions
        : defaultYears
    const showData = !!data

    const kpiCards = data
        ? [
              {
                  label: 'Institute',
                  value: data.kpis.organizationCount,
                  to: ENTITY_PATHS.ORGANIZATIONS,
                  icon: <FileText className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
              {
                  label: 'KVK',
                  value: data.kpis.kvkCount,
                  to: ENTITY_PATHS.KVK_MASTER,
                  icon: <BarChart3 className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
              {
                  label: 'Total OFT',
                  value: data.kpis.totalOft,
                  to: ROUTE_PATHS.ACHIEVEMENTS.OFT,
                  icon: <Users className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
              {
                  label: 'Total FLD',
                  value: data.kpis.totalFld,
                  to: ROUTE_PATHS.ACHIEVEMENTS.FLD.BASE,
                  icon: <FileText className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
              {
                  label: 'Training',
                  value: data.kpis.training.toLocaleString(),
                  to: ROUTE_PATHS.ACHIEVEMENTS.TRAININGS,
                  icon: <GraduationCap className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
              {
                  label: 'Ext. Activity',
                  value: data.kpis.extension.toLocaleString(),
                  to: ROUTE_PATHS.ACHIEVEMENTS.EXTENSION_ACTIVITIES,
                  icon: <Activity className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
              {
                  label: 'Total Staff',
                  value: data.kpis.totalStaff,
                  to: ENTITY_PATHS.KVK_EMPLOYEES,
                  icon: <Tag className="w-6 h-6" />,
                  bgColor: 'bg-[#E8F5E9]',
                  iconColor: 'text-[#487749]',
              },
          ].filter(card => {
              // Hide the card entirely if the user lacks VIEW on the target
              // route's module. Module code is derived from the route config.
              const moduleCode = getModuleCodeForPath(card.to)
              return !moduleCode || hasPermission('VIEW', moduleCode)
          })
        : []

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {(error as Error).message || 'Failed to load dashboard'}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#487749] uppercase tracking-wide whitespace-nowrap">
                        Year
                    </span>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        disabled={isPending && !data}
                        className="h-8 min-w-[88px] px-2 text-xs font-medium border border-[#E0E0E0] rounded-md bg-white text-[#212121] focus:outline-none focus:ring-1 focus:ring-[#487749]/30"
                    >
                        <option value="all">All</option>
                        {yearOptions.map(y => (
                            <option key={y} value={String(y)}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                {canPickKvk && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#487749] uppercase tracking-wide whitespace-nowrap">
                            KVK
                        </span>
                        <select
                            value={selectedKvk}
                            onChange={e => setSelectedKvk(e.target.value)}
                            disabled={isPending && !data}
                            className="h-8 min-w-[120px] max-w-[200px] px-2 text-xs font-medium border border-[#E0E0E0] rounded-md bg-white text-[#212121] focus:outline-none focus:ring-1 focus:ring-[#487749]/30"
                        >
                            <option value="all">All</option>
                            {(data?.kvkOptions ?? []).map(k => (
                                <option key={k.kvkId} value={String(k.kvkId)}>
                                    {k.kvkName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => {
                        setSelectedYear('all')
                        setSelectedKvk('all')
                    }}
                    className="text-[11px] font-semibold text-[#757575] hover:text-[#487749] ml-auto"
                >
                    Reset
                </button>
                {isFetching && (
                    <Loader2
                        className="w-4 h-4 text-[#487749] animate-spin shrink-0"
                        aria-label="Updating"
                    />
                )}
            </div>

            {isPending && !data && <DashboardKpiSkeleton count={7} />}

            {showData && (
                <>
                    <div
                        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 transition-opacity ${isFetching ? 'opacity-70' : ''}`}
                    >
                        {kpiCards.map(card => (
                            <Link
                                key={card.label}
                                to={card.to}
                                className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#487749] focus-visible:ring-offset-1"
                            >
                                <Card className="border-[#E0E0E0] hover:border-[#487749]/30 transition-colors shadow-none h-full cursor-pointer">
                                    <CardContent className="p-3">
                                        <div className="flex flex-col gap-2">
                                            <div
                                                className={`${card.bgColor} ${card.iconColor} w-8 h-8 rounded-lg border border-[#E0E0E0] flex items-center justify-center`}
                                            >
                                                {React.cloneElement(
                                                    card.icon as React.ReactElement,
                                                    {
                                                        className: 'w-4 h-4',
                                                    } as object
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[#757575] uppercase tracking-wide mb-0.5 leading-tight">
                                                    {card.label}
                                                </p>
                                                <p className="text-xl font-bold text-[#212121] leading-tight">
                                                    {card.value}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div
                        className={`grid grid-cols-1 lg:grid-cols-2 gap-3 transition-opacity ${isFetching ? 'opacity-70' : ''}`}
                    >
                        <StatChartPanel
                            title="OFT progress"
                            subtitle="Ongoing, completed; not started = KVK with no entries"
                            mode="pair"
                            primaryLabel="completed"
                            secondaryLabel="created"
                            rows={data.perKvk.map(r => ({
                                id: r.kvkId,
                                name: r.kvkName,
                                status: r.oft.status,
                                primary: r.oft.completed,
                                secondary: r.oft.created,
                                segments: r.oft.segments,
                            }))}
                        />
                        <StatChartPanel
                            title="FLD progress"
                            subtitle="Ongoing, completed; not started = KVK with no entries"
                            mode="pair"
                            primaryLabel="completed"
                            secondaryLabel="created"
                            rows={data.perKvk.map(r => ({
                                id: r.kvkId,
                                name: r.kvkName,
                                status: r.fld.status,
                                primary: r.fld.completed,
                                secondary: r.fld.created,
                                segments: r.fld.segments,
                            }))}
                        />
                        <StatChartPanel
                            title="Training"
                            subtitle="Ongoing, completed; not started = KVK with no entries"
                            mode="count"
                            primaryLabel="sessions"
                            unit="sessions"
                            rows={data.perKvk.map(r => ({
                                id: r.kvkId,
                                name: r.kvkName,
                                status: r.training.status,
                                primary: r.training.count,
                                segments: r.training.segments,
                            }))}
                        />
                        <StatChartPanel
                            title="Extension activities"
                            subtitle="Ongoing, completed; not started = KVK with no entries"
                            mode="count"
                            primaryLabel="activities"
                            unit="activities"
                            rows={data.perKvk.map(r => ({
                                id: r.kvkId,
                                name: r.kvkName,
                                status: r.extension.status,
                                primary: r.extension.count,
                                segments: r.extension.segments,
                            }))}
                        />
                    </div>

                    <div
                        className={
                            isFetching ? 'opacity-70 transition-opacity' : ''
                        }
                    >
                        <DashboardStaffAndLogs
                            staffByPost={data.staffByPost}
                            recentLogs={data.recentLogs}
                            getProgressColor={getProgressColor}
                            formatLogTime={formatLogTime}
                        />
                    </div>
                </>
            )}

            {isPending && !data && (
                <div className="space-y-3">
                    <DashboardPanelsSkeleton />
                </div>
            )}
        </div>
    )
}
