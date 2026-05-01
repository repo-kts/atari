import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import {
    FileText,
    Users,
    GraduationCap,
    Tag,
    Building2,
    CreditCard,
    UserCircle,
    Activity,
    Loader2,
} from 'lucide-react'
import { dashboardApi } from '../../services/dashboardApi'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { ENTITY_PATHS } from '../../constants/entityConstants'
import { getModuleCodeForPath } from '../../config/route'
// TODO(#173): re-enable when Staff Summary / Log History cards return.
// import { DashboardStaffAndLogs } from './shared/DashboardStaffAndLogs'
import {
    DashboardKpiSkeleton,
    DashboardPanelsSkeleton,
} from './shared/DashboardSkeletons'
import { StatChartPanel } from './shared/StatChartPanel'

/* TODO(#173): re-enable along with the Staff Summary / Log History cards.
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
*/

export const KVKDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user, hasPermission } = useAuth()
    const [selectedYear, setSelectedYear] = useState<string>('all')

    const defaultYears = useMemo(() => {
        const y = new Date().getFullYear()
        return Array.from({ length: 20 }, (_, i) => y - i)
    }, [])

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ['dashboard', 'kvk', selectedYear],
        queryFn: () =>
            dashboardApi.getDashboard({
                reportingYear:
                    selectedYear === 'all' ? 'all' : Number(selectedYear),
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
            <Card className="bg-gradient-to-r from-[#487749] to-[#5c9a5e] border-none overflow-hidden relative shadow-none">
                <CardContent className="p-4 relative z-10 text-white">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-bold">
                            Welcome back, {user?.name}!
                        </h2>
                        <p className="text-white/85 text-sm font-medium max-w-xl">
                            {data?.primaryKvkName
                                ? `${data.primaryKvkName} — metrics respect the year filter below.`
                                : 'Track progress for your station using the year filter below.'}
                        </p>
                    </div>
                </CardContent>
                <div className="absolute top-0 right-0 w-48 h-full bg-white/10 -skew-x-12 translate-x-24" />
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] px-2 py-1.5">
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
                {isFetching && (
                    <Loader2
                        className="w-4 h-4 text-[#487749] animate-spin shrink-0"
                        aria-label="Updating"
                    />
                )}
            </div>

            {isPending && !data && <DashboardKpiSkeleton count={5} />}

            {showData && (
                <>
                    <div
                        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 transition-opacity ${isFetching ? 'opacity-70' : ''}`}
                    >
                        {kpiCards.map(card => (
                            <Link
                                key={card.label}
                                to={card.to}
                                className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#487749] focus-visible:ring-offset-1"
                            >
                                <Card className="border-[#E0E0E0] shadow-none hover:border-[#487749]/30 transition-colors h-full cursor-pointer">
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
                                                <p className="text-[10px] font-bold text-[#757575] uppercase tracking-wide mb-0.5 line-clamp-1">
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
                            title="OFT"
                            subtitle="Ongoing, completed; not started = no entries yet"
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
                            title="FLD"
                            subtitle="Ongoing, completed; not started = no entries yet"
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
                            subtitle="Ongoing, completed; not started = no entries yet"
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
                            title="Extension activity"
                            subtitle="Ongoing, completed; not started = no entries yet"
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

                    {/* TODO(#173): re-enable Staff Summary by Post and Log
                        History cards once the underlying data is finalised —
                        see issue #173. Data fetches (data.staffByPost,
                        data.recentLogs) are shared with other consumers, so
                        they are intentionally left in place. */}
                    {/*
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
                    */}

                    {/* Quick-link tiles — each is hidden when the user lacks VIEW
                        on the target module, so the dashboard only shows tiles
                        the user can actually open. */}
                    {(() => {
                        const quickLinks: Array<{
                            to: string
                            moduleCode: string
                            icon: React.ReactNode
                            title: string
                            subtitle: string
                        }> = [
                            {
                                to: '/kvk/details',
                                moduleCode: 'about_kvks_view_kvks',
                                icon: <Building2 className="w-6 h-6 text-[#487749]" />,
                                title: 'KVK details',
                                subtitle: 'Profile & assets',
                            },
                            {
                                to: '/kvk/bank-accounts',
                                moduleCode: 'about_kvks_bank_account_details',
                                icon: <CreditCard className="w-6 h-6 text-[#487749]" />,
                                title: 'Bank accounts',
                                subtitle: 'Financial details',
                            },
                            {
                                to: '/kvk/staff',
                                moduleCode: 'about_kvks_employee_details',
                                icon: <UserCircle className="w-6 h-6 text-[#487749]" />,
                                title: 'Staff directory',
                                subtitle: 'Human resources',
                            },
                        ]
                        const visible = quickLinks.filter(ql => hasPermission('VIEW', ql.moduleCode))
                        if (visible.length === 0) return null
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {visible.map(ql => (
                                    <Card
                                        key={ql.to}
                                        className="cursor-pointer border-[#E0E0E0] shadow-none hover:border-[#487749]/30 transition-colors"
                                        onClick={() => navigate(ql.to)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-[#E8F5E9] p-3 rounded-lg border border-[#E0E0E0]">
                                                    {ql.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-[#212121]">
                                                        {ql.title}
                                                    </h3>
                                                    <p className="text-xs text-[#757575] font-medium">
                                                        {ql.subtitle}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    })()}
                </>
            )}

            {isPending && !data && <DashboardPanelsSkeleton />}
        </div>
    )
}
