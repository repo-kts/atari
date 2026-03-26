import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Search } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route'
import { useLogHistory, useLogHistoryUsers } from '@/hooks/useLogHistory'

const PAGE_SIZE = 10

function formatDateTime(value?: string | null): string {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', ', ')
}

function formatActivity(activity?: string | null): string {
  const value = String(activity || '').toUpperCase()
  if (value === 'LOGOUT') return 'Logout'
  if (value === 'LOGIN') return 'Login'
  return activity || 'N/A'
}

function buildPagination(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

export const LogHistory: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeConfig = getRouteConfig(location.pathname)
  const breadcrumbs = getBreadcrumbsForPath(location.pathname)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [appliedUserId, setAppliedUserId] = useState<number | undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: logResponse,
    isLoading,
    isFetching,
    error,
  } = useLogHistory({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    userId: appliedUserId,
    sortBy: 'eventAt',
    sortOrder: 'desc',
  })

  const { data: userOptions = [] } = useLogHistoryUsers()

  const logs = logResponse?.data ?? []
  const meta = logResponse?.meta ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  }

  const paginationItems = useMemo(
    () => buildPagination(meta.page, meta.totalPages),
    [meta.page, meta.totalPages],
  )

  const startEntry = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const endEntry = meta.total === 0 ? 0 : Math.min(meta.page * meta.limit, meta.total)
  const isRefreshing = isFetching && !isLoading

  const handleApplyFilter = () => {
    setAppliedUserId(selectedUserId ? Number(selectedUserId) : undefined)
    setCurrentPage(1)
  }

  return (
    <div className="bg-white rounded-2xl p-1">
      <div className="mb-6 flex items-center gap-4 px-6 pt-4">
        <button
          onClick={() => {
            if (routeConfig?.parent) {
              navigate(routeConfig.parent)
            } else {
              navigate('/dashboard')
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
        )}
      </div>

      <Card className="bg-[#FAF9F6]">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#487749]">View Users Log Activity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_auto] gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-medium text-[#487749] mb-2">Users</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                <option value="">All Users</option>
                {userOptions.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.userName || user.userEmail || `User ${user.userId}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-4 py-2.5 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-colors"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#212121] mb-2">Search:</label>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search user, email, KVK, IP..."
                className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error instanceof Error ? error.message : 'Failed to load log history'}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6EFE3] border-b border-[#D6E0D3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Activity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">IP Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[#757575]">
                        Loading log history...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[#757575]">
                        No log records found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <tr
                        key={log.logId}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-[#F6FAF5]'}
                      >
                        <td className="px-4 py-3 text-sm text-[#212121]">{log.userName || log.userEmail || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{log.roleName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{formatActivity(log.activity)}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{log.ipAddress || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{formatDateTime(log.eventAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-4 border-t border-[#E0E0E0] bg-white">
              <div className="text-sm text-[#757575] mb-3">
                Showing {startEntry} to {endEntry} of {meta.total.toLocaleString('en-IN')} entries
                {isRefreshing && ' (updating...)'}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                >
                  Previous
                </button>

                {paginationItems.map((item, index) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-sm text-[#757575]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`px-3 py-1.5 text-sm border rounded-md ${
                        item === meta.page
                          ? 'bg-[#7D9E77] text-white border-[#7D9E77]'
                          : 'border-[#E0E0E0] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
