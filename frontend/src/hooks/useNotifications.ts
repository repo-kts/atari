import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationApi, NotificationFilters } from '@/services/notificationApi'

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['notifications'] })
  queryClient.invalidateQueries({ queryKey: ['notifications-recent'] })
  queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
}

export function useNotifications(filters: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationApi.listForCurrentUser(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  })
}

export function useRecipientUsers(enabled = true) {
  return useQuery({
    queryKey: ['notification-recipient-users'],
    queryFn: () => notificationApi.listRecipientUsers(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.create,
    onSuccess: () => invalidateNotificationQueries(queryClient),
  })
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useRecentNotifications(limit = 5, enabled = true) {
  return useQuery({
    queryKey: ['notifications-recent', limit],
    queryFn: () => notificationApi.getRecent(limit),
    enabled,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userNotificationId: number) => notificationApi.markAsRead(userNotificationId),
    onSuccess: () => invalidateNotificationQueries(queryClient),
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => invalidateNotificationQueries(queryClient),
  })
}
