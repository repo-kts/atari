import React from 'react'
import { Card, CardContent } from '../../../components/ui/Card'
import type {
    DashboardRecentLog,
    DashboardStaffPost,
} from '../../../services/dashboardApi'

type Props = {
    staffByPost: DashboardStaffPost[]
    recentLogs: DashboardRecentLog[]
    getProgressColor: (status: string) => string
    formatLogTime: (iso: string) => string
}

export const DashboardStaffAndLogs: React.FC<Props> = ({
    staffByPost,
    recentLogs,
    getProgressColor,
    formatLogTime,
}) => {
    const maxStaff = Math.max(1, ...staffByPost.map(s => s.count))

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-[#E0E0E0]">
                <CardContent className="p-0">
                    <div className="border-b border-[#E0E0E0] bg-[#FAF9F6]">
                        <h3 className="text-xs font-bold text-[#487749] uppercase tracking-wider mb-1">
                            Staff summary (by post)
                        </h3>
                    </div>
                    <div className="mt-2 space-y-2 max-h-[320px] overflow-y-auto">
                        {staffByPost.length === 0 ? (
                            <p className="text-xs text-[#757575] font-medium">
                                No staff records in this scope.
                            </p>
                        ) : (
                            staffByPost.map((row, index) => (
                                <div
                                    key={`${row.postId ?? 'u'}-${index}`}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-[#212121] line-clamp-2">
                                            {row.postName}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#487749] shrink-0">
                                            {row.count}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#F5F5F5] rounded-full h-1.5 border border-[#E0E0E0]/50">
                                        <div
                                            className={`h-1.5 rounded-full ${getProgressColor('active')} transition-all duration-500`}
                                            style={{
                                                width: `${Math.min(100, (row.count / maxStaff) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E0E0E0]">
                <CardContent className="p-0">
                    <div className="border-b border-[#E0E0E0] bg-[#FAF9F6]">
                        <h3 className="text-xs font-bold text-[#487749] uppercase tracking-wider mb-1">
                            Recent log history
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-[#FAF9F6] text-left text-[10px] font-bold uppercase tracking-wider text-[#757575]">
                                    <th className="px-2 py-2 whitespace-nowrap">
                                        KVK
                                    </th>
                                    <th className="px-2 py-2 whitespace-nowrap">
                                        User
                                    </th>
                                    <th className="px-2 py-2 whitespace-nowrap">
                                        Activity
                                    </th>
                                    <th className="px-2 py-2 whitespace-nowrap">
                                        IP
                                    </th>
                                    <th className="px-2 py-2 whitespace-nowrap">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-2 py-4 text-[#757575] font-medium text-center"
                                        >
                                            No recent activity.
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log, i) => (
                                        <tr
                                            key={`${log.eventAt}-${i}`}
                                            className="border-t border-[#E0E0E0]"
                                        >
                                            <td className="px-2 py-2 text-[#212121] font-medium whitespace-nowrap max-w-[100px] truncate">
                                                {log.kvkName || '—'}
                                            </td>
                                            <td className="px-2 py-2 text-[#212121] font-medium whitespace-nowrap max-w-[100px] truncate">
                                                {log.userName || '—'}
                                            </td>
                                            <td className="px-2 py-2 text-[#487749] font-bold whitespace-nowrap">
                                                {log.activity}
                                            </td>
                                            <td className="px-2 py-2 text-[#757575] whitespace-nowrap font-mono text-[10px]">
                                                {log.ipAddress || '—'}
                                            </td>
                                            <td className="px-2 py-2 text-[#757575] whitespace-nowrap text-[10px]">
                                                {formatLogTime(log.eventAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
