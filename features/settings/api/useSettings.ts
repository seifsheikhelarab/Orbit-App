import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { signOut } from '@/lib/auth-client'

export interface UserSettings {
  id: string
  email: string
  name: string
  image: string | null
  timezone: string
  emailRemindersEnabled: boolean
  inAppNotificationsEnabled: boolean
  createdAt: string
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data?.data ?? res.data
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<{ name: string; email: string; timezone: string; emailRemindersEnabled: boolean; inAppNotificationsEnabled: boolean }>) => {
      return api.patch('/users/me', updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwords: { currentPassword: string; newPassword: string }) => {
      return api.post('/users/me/change-password', passwords)
    },
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      return api.delete('/users/me')
    },
    onSuccess: () => {
      signOut()
    },
  })
}
