import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, User, LogOut, ChevronDown, CheckCheck } from 'lucide-react'
import { ROLE_DISPLAY_NAMES } from '../../constants/roleHierarchy'
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useRecentNotifications,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications'

function formatRelativeTime(value?: string | null): string {
  if (!value) return 'Unknown time'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-GB')
}

function truncateText(value: string, max = 60): string {
  if (!value) return ''
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout, hasPermission } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const canViewNotifications = hasPermission('VIEW', 'notifications')

  const { data: unreadCountData } = useUnreadNotificationCount(canViewNotifications)
  const { data: recentNotifications = [], isLoading: isRecentLoading } = useRecentNotifications(
    5,
    canViewNotifications,
  )
  const markNotificationAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const unreadCount = unreadCountData?.unreadCount || 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleDisplayName = (role: string) => {
    return ROLE_DISPLAY_NAMES[role] || role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const handleNotificationClick = async (userNotificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markNotificationAsRead.mutateAsync(userNotificationId)
    }
    setNotificationMenuOpen(false)
    navigate('/view-email-notifications')
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync()
  }

  if (!user) return null

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#487749] hidden lg:block">AMS - ATARI Zone (IV) Patna</h1>
        </div>

        <div className="flex items-center gap-3">
          {canViewNotifications && (
            <div className="relative">
              <button
                className="relative p-2 rounded-xl hover:bg-[#F5F5F5] transition-all duration-200 border border-transparent hover:border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#487749]/20"
                aria-label="Notifications"
                onClick={() => {
                  setNotificationMenuOpen((open) => !open)
                  setUserMenuOpen(false)
                }}
              >
                <Bell className="w-5 h-5 text-[#487749]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] bg-white rounded-xl shadow-lg border border-[#E0E0E0] z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#212121]">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsRead.isPending}
                        className="inline-flex items-center gap-1 text-xs text-[#487749] hover:text-[#3d6540] disabled:opacity-50"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {isRecentLoading ? (
                      <p className="px-4 py-6 text-sm text-[#757575] text-center">Loading notifications...</p>
                    ) : recentNotifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-[#757575] text-center">No notifications yet</p>
                    ) : (
                      recentNotifications.map((item) => (
                        <button
                          key={item.userNotificationId}
                          type="button"
                          onClick={() => handleNotificationClick(item.userNotificationId, item.isRead)}
                          className={`w-full text-left px-4 py-3 border-b border-[#F1F1F1] hover:bg-[#F8FBF7] transition-colors ${
                            item.isRead ? 'bg-white' : 'bg-[#F6FAF5]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#212121]">{truncateText(item.subject, 70)}</p>
                              <p className="text-xs text-[#757575] mt-1">{truncateText(item.content, 95)}</p>
                              <p className="text-[11px] text-[#9A9A9A] mt-1">{formatRelativeTime(item.createdAt)}</p>
                            </div>
                            {!item.isRead && <span className="w-2 h-2 rounded-full bg-[#487749] mt-1.5 shrink-0" />}
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-[#E0E0E0]">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationMenuOpen(false)
                        navigate('/view-email-notifications')
                      }}
                      className="w-full text-center px-3 py-2 text-sm text-[#487749] rounded-lg hover:bg-[#F5F5F5]"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen)
                setNotificationMenuOpen(false)
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5F5F5] transition-all duration-200 border border-transparent hover:border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#487749]/20"
            >
              <div className="w-8 h-8 bg-[#487749] rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[#212121]">{user.name}</p>
                <p className="text-xs text-[#757575]">{getRoleDisplayName(user.role)}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#757575] hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E0E0E0] z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E0E0E0]">
                  <p className="text-sm font-medium text-[#212121]">{user.name}</p>
                  <p className="text-xs text-[#757575]">{user.email}</p>
                  <p className="text-xs text-[#487749] mt-1 font-medium">{getRoleDisplayName(user.role)}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#487749] rounded-xl hover:bg-[#F5F5F5] transition-all duration-200 border border-transparent hover:border-[#E0E0E0]"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(userMenuOpen || notificationMenuOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setUserMenuOpen(false)
            setNotificationMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}
