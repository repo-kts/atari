import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Plus, Search, X } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCreateNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useRecipientUsers,
} from '@/hooks/useNotifications'
import { useAlert } from '@/hooks/useAlert'

const PAGE_SIZE = 10

function formatDateTime(value?: string | null): string {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(',', ', ')
}

function formatRoleName(value?: string | null): string {
  if (!value) return 'N/A'
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function truncateText(value: string, max = 90): string {
  if (!value) return ''
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
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

export const Notifications: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeConfig = getRouteConfig(location.pathname)
  const breadcrumbs = getBreadcrumbsForPath(location.pathname)
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const { alert, AlertDialog } = useAlert()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [status, setStatus] = useState<'all' | 'read' | 'unread'>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all')
  const [recipientSearch, setRecipientSearch] = useState('')
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<number[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!selectedNotificationId) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedNotificationId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedNotificationId])

  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    error,
  } = useNotifications({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status,
  })

  const { data: recipientUsers = [], isLoading: isRecipientUsersLoading } = useRecipientUsers(
    isSuperAdmin && isCreateOpen,
  )

  const createNotification = useCreateNotification()
  const markNotificationAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const notifications = notificationsResponse?.data ?? []
  const meta = notificationsResponse?.meta ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  }
  const startEntry = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const endEntry = meta.total === 0 ? 0 : Math.min(meta.page * meta.limit, meta.total)
  const isRefreshing = isFetching && !isLoading
  const paginationItems = useMemo(
    () => buildPagination(meta.page, meta.totalPages),
    [meta.page, meta.totalPages],
  )
  const hasUnread = notifications.some((item) => !item.isRead)
  const selectedNotification = selectedNotificationId
    ? notifications.find((item) => item.userNotificationId === selectedNotificationId) || null
    : null
  const filteredRecipientUsers = useMemo(() => {
    const query = recipientSearch.trim().toLowerCase()
    if (!query) return recipientUsers

    return recipientUsers.filter((recipient) => {
      const values = [
        recipient.name,
        recipient.email,
        recipient.roleName || '',
      ]
      return values.some((value) => value.toLowerCase().includes(query))
    })
  }, [recipientUsers, recipientSearch])
  const selectedRecipientCount = selectedRecipientIds.length

  const resetCreateForm = () => {
    setRecipientMode('all')
    setRecipientSearch('')
    setSelectedRecipientIds([])
    setSubject('')
    setContent('')
  }

  const toggleRecipient = (userId: number) => {
    setSelectedRecipientIds((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId],
    )
  }

  const handleCreateNotification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedSubject = subject.trim()
    const trimmedContent = content.trim()

    if (!trimmedSubject) {
      alert({ title: 'Validation Error', message: 'Subject is required', variant: 'error' })
      return
    }
    if (!trimmedContent) {
      alert({ title: 'Validation Error', message: 'Notification content is required', variant: 'error' })
      return
    }
    if (recipientMode === 'selected' && selectedRecipientIds.length === 0) {
      alert({ title: 'Validation Error', message: 'Select at least one recipient user', variant: 'error' })
      return
    }

    try {
      await createNotification.mutateAsync({
        subject: trimmedSubject,
        content: trimmedContent,
        sendToAll: recipientMode === 'all',
        recipientUserIds: recipientMode === 'selected' ? selectedRecipientIds : undefined,
      })

      alert({
        title: 'Notification Sent',
        message:
          recipientMode === 'all'
            ? 'Notification sent to all users'
            : `Notification sent to ${selectedRecipientIds.length} selected users`,
        variant: 'success',
        autoClose: true,
      })
      resetCreateForm()
      setIsCreateOpen(false)
      setCurrentPage(1)
    } catch (createError) {
      alert({
        title: 'Failed to Send',
        message: createError instanceof Error ? createError.message : 'Unable to create notification',
        variant: 'error',
      })
    }
  }

  const handleMarkAsRead = async (userNotificationId: number) => {
    try {
      await markNotificationAsRead.mutateAsync(userNotificationId)
    } catch (markError) {
      alert({
        title: 'Action Failed',
        message: markError instanceof Error ? markError.message : 'Unable to mark notification as read',
        variant: 'error',
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync()
    } catch (markAllError) {
      alert({
        title: 'Action Failed',
        message: markAllError instanceof Error ? markAllError.message : 'Unable to mark all notifications as read',
        variant: 'error',
      })
    }
  }

  const openNotificationDetails = (userNotificationId: number) => {
    setSelectedNotificationId(userNotificationId)
  }

  const closeNotificationDetails = () => {
    setSelectedNotificationId(null)
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
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#487749]">View Notifications</h2>
              <p className="text-sm text-[#757575] mt-1">
                Super admin can create notifications for all users or selected users.
              </p>
            </div>
            {isSuperAdmin && !isCreateOpen && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>

          {isSuperAdmin && isCreateOpen && (
            <form
              onSubmit={handleCreateNotification}
              className="mb-6 bg-white rounded-xl border border-[#E0E0E0] p-5"
            >
              <h3 className="text-base font-semibold text-[#212121] mb-4">Create Notification</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#487749] mb-2">Users</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm text-[#212121]">
                        <input
                          type="radio"
                          name="recipientMode"
                          checked={recipientMode === 'all'}
                          onChange={() => setRecipientMode('all')}
                          disabled={createNotification.isPending}
                        />
                        All Users
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-[#212121]">
                        <input
                          type="radio"
                          name="recipientMode"
                          checked={recipientMode === 'selected'}
                          onChange={() => setRecipientMode('selected')}
                          disabled={isRecipientUsersLoading || createNotification.isPending}
                        />
                        Selected Users
                      </label>
                    </div>

                    {recipientMode === 'selected' && (
                      <div className="border border-[#E0E0E0] rounded-xl p-3 bg-[#FAFDF9]">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={recipientSearch}
                            onChange={(event) => setRecipientSearch(event.target.value)}
                            placeholder="Search name, email, role..."
                            className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                            disabled={isRecipientUsersLoading || createNotification.isPending}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#757575] mb-2">
                          <span>
                            Selected: {selectedRecipientCount}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRecipientIds(filteredRecipientUsers.map((item) => item.userId))}
                              className="text-[#487749] hover:text-[#3d6540]"
                              disabled={filteredRecipientUsers.length === 0 || createNotification.isPending}
                            >
                              Select all shown
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRecipientIds([])}
                              className="text-[#487749] hover:text-[#3d6540]"
                              disabled={selectedRecipientCount === 0 || createNotification.isPending}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="max-h-44 overflow-y-auto border border-[#E0E0E0] rounded-lg bg-white p-2 space-y-1">
                          {isRecipientUsersLoading ? (
                            <p className="text-sm text-[#757575] p-2">Loading users...</p>
                          ) : filteredRecipientUsers.length === 0 ? (
                            <p className="text-sm text-[#757575] p-2">No users found</p>
                          ) : (
                            filteredRecipientUsers.map((recipient) => (
                              <label
                                key={recipient.userId}
                                className="flex items-start gap-2 p-1.5 rounded-md hover:bg-[#F5F9F4] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecipientIds.includes(recipient.userId)}
                                  onChange={() => toggleRecipient(recipient.userId)}
                                  disabled={createNotification.isPending}
                                  className="mt-1"
                                />
                                <span className="text-sm text-[#212121]">
                                  {recipient.name} ({recipient.email}) - {formatRoleName(recipient.roleName)}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#487749] mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject"
                    maxLength={300}
                    className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                    disabled={createNotification.isPending}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#487749] mb-2">Notification Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter notification message"
                  rows={5}
                  maxLength={5000}
                  className="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] resize-vertical"
                  disabled={createNotification.isPending}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={createNotification.isPending}
                  className="px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-colors disabled:opacity-50"
                >
                  {createNotification.isPending ? 'Sending...' : 'Send Notification'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetCreateForm()
                  }}
                  className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] rounded-xl text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mb-4 flex flex-col md:flex-row md:items-end gap-3 justify-between">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-[#212121] mb-2">Search:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search subject, content, sender..."
                  className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => {
                  const next = e.target.value as 'all' | 'read' | 'unread'
                  setStatus(next)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={!hasUnread || markAllAsRead.isPending}
                className="px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white text-sm hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark all as read
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error instanceof Error ? error.message : 'Failed to load notifications'}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6EFE3] border-b border-[#D6E0D3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">S.No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Message</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Sent By</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212121]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#757575]">
                        Loading notifications...
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#757575]">
                        No notifications found
                      </td>
                    </tr>
                  ) : (
                    notifications.map((item, index) => (
                      <tr
                        key={item.userNotificationId}
                        className={`cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white hover:bg-[#F8FBF7]' : 'bg-[#F6FAF5] hover:bg-[#EDF5EB]'
                        }`}
                        onClick={() => openNotificationDetails(item.userNotificationId)}
                      >
                        <td className="px-4 py-3 text-sm text-[#212121]">{startEntry + index}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{item.subject || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{truncateText(item.content || '')}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">
                          {item.sentBy?.name || item.sentBy?.email || 'System'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#212121]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.isRead ? 'bg-[#EEF5EE] text-[#487749]' : 'bg-[#FFF3E0] text-[#8A5A00]'
                            }`}
                          >
                            {item.isRead ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{formatDateTime(item.createdAt)}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">
                          {!item.isRead ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleMarkAsRead(item.userNotificationId)
                              }}
                              disabled={markNotificationAsRead.isPending}
                              className="text-[#487749] hover:text-[#3d6540] font-medium disabled:opacity-50"
                            >
                              Mark read
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
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
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
                  onClick={() => setCurrentPage((page) => Math.min(meta.totalPages, page + 1))}
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

      {selectedNotification && (
        <div
          className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4"
          onClick={closeNotificationDetails}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl border border-[#E0E0E0] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#212121]">Notification Details</h3>
              <button
                type="button"
                onClick={closeNotificationDetails}
                className="p-1 rounded-lg hover:bg-[#F5F5F5] text-[#757575]"
                aria-label="Close notification details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#757575]">Subject</p>
                <p className="text-sm text-[#212121] mt-1">{selectedNotification.subject || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#757575]">Message</p>
                <p className="text-sm text-[#212121] mt-1 whitespace-pre-wrap">
                  {selectedNotification.content || 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#757575]">Sent By</p>
                  <p className="text-sm text-[#212121] mt-1">
                    {selectedNotification.sentBy?.name || selectedNotification.sentBy?.email || 'System'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#757575]">Status</p>
                  <p className="text-sm text-[#212121] mt-1">
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#757575]">Time</p>
                  <p className="text-sm text-[#212121] mt-1">{formatDateTime(selectedNotification.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#757575]">Read Time</p>
                  <p className="text-sm text-[#212121] mt-1">{formatDateTime(selectedNotification.readAt)}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#E0E0E0] flex items-center justify-end gap-2">
              {!selectedNotification.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(selectedNotification.userNotificationId)}
                  disabled={markNotificationAsRead.isPending}
                  className="px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-colors disabled:opacity-50"
                >
                  Mark read
                </button>
              )}
              <button
                type="button"
                onClick={closeNotificationDetails}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] rounded-xl text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog />
    </div>
  )
}
