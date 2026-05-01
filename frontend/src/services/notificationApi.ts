import { apiClient, ApiError } from './api'

export interface RecipientUser {
  userId: number
  name: string
  email: string
  roleName: string | null
}

export interface CreateNotificationPayload {
  subject: string
  content: string
  sendToAll?: boolean
  recipientUserIds?: number[]
  attachmentIds?: number[]
}

export interface NotificationAttachment {
  attachmentId: number
  notificationId: number | null
  fileName: string | null
  mimeType: string
  size: number
  createdAt: string
  fileUrl: string | null
  downloadUrl: string | null
}

export interface PresignAttachmentInput {
  fileName: string
  mimeType: string
  size: number
}

export interface PresignAttachmentResponse {
  s3Key: string
  uploadUrl: string
  expiresIn: number
  headers: Record<string, string>
}

export interface NotificationItem {
  userNotificationId: number
  notificationId: number
  subject: string
  content: string
  createdAt: string
  updatedAt: string
  isRead: boolean
  readAt: string | null
  sentBy: {
    userId: number
    name: string
    email: string
  } | null
  attachments?: NotificationAttachment[]
  attachmentCount?: number
}

export interface NotificationListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface NotificationListResponse {
  data: NotificationItem[]
  meta: NotificationListMeta
}

export interface NotificationFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'read' | 'unread'
}

export interface UnreadCountResponse {
  unreadCount: number
}

function buildQueryString(params?: Record<string, string | number | undefined>): string {
  if (!params) return ''

  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.append(key, String(value))
    }
  })
  const query = sp.toString()
  return query ? `?${query}` : ''
}

export const notificationApi = {
  create: async (payload: CreateNotificationPayload) => {
    try {
      return await apiClient.post('/admin/notifications', payload)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to create notification')
      }
      throw error
    }
  },

  listForCurrentUser: async (filters: NotificationFilters = {}): Promise<NotificationListResponse> => {
    try {
      const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status && filters.status !== 'all' ? filters.status : undefined,
      })
      return await apiClient.get<NotificationListResponse>(`/admin/notifications${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch notifications')
      }
      throw error
    }
  },

  listRecipientUsers: async (): Promise<RecipientUser[]> => {
    try {
      return await apiClient.get<RecipientUser[]>('/admin/notifications/users')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch users')
      }
      throw error
    }
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      return await apiClient.get<UnreadCountResponse>('/admin/notifications/unread-count')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch unread count')
      }
      throw error
    }
  },

  getRecent: async (limit = 5): Promise<NotificationItem[]> => {
    try {
      const query = buildQueryString({ limit })
      return await apiClient.get<NotificationItem[]>(`/admin/notifications/recent${query}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to fetch recent notifications')
      }
      throw error
    }
  },

  markAsRead: async (userNotificationId: number) => {
    try {
      return await apiClient.patch(`/admin/notifications/${userNotificationId}/read`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to mark notification as read')
      }
      throw error
    }
  },

  markAllAsRead: async () => {
    try {
      return await apiClient.patch('/admin/notifications/read-all')
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to mark all notifications as read')
      }
      throw error
    }
  },

  presignAttachment: async (input: PresignAttachmentInput): Promise<PresignAttachmentResponse> => {
    try {
      return await apiClient.post<PresignAttachmentResponse>(
        '/admin/notifications/attachments/presign',
        input,
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to start upload')
      }
      throw error
    }
  },

  confirmAttachment: async (input: {
    s3Key: string
    fileName: string
    mimeType: string
    size: number
  }): Promise<NotificationAttachment> => {
    try {
      return await apiClient.post<NotificationAttachment>(
        '/admin/notifications/attachments/confirm',
        input,
      )
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to confirm upload')
      }
      throw error
    }
  },

  deleteAttachment: async (attachmentId: number) => {
    try {
      return await apiClient.delete(`/admin/notifications/attachments/${attachmentId}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.data?.error || 'Failed to delete attachment')
      }
      throw error
    }
  },
}

export async function uploadFileToS3(
  uploadUrl: string,
  file: File,
  headers?: Record<string, string>,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: headers || { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!res.ok) {
    throw new Error(`S3 upload failed (${res.status})`)
  }
}
