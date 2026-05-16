import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ResumeData } from '@/features/resumes/api/types'

export interface ProfileData {
  id: string
  userId: string
  content: ResumeData
  createdAt: string
  updatedAt: string
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/profile')
      return response.data.data as ProfileData
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: ResumeData) => {
      const response = await api.put('/profile', { content })
      return response.data.data as ProfileData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useAutoCV() {
  return useMutation({
    mutationFn: async (jobDescription: string) => {
      const response = await api.post('/profile/generate', { jobDescription })
      return response.data.data as {
        jobData: any
        tailoredContent: {
          resumeContent: ResumeData
          coverLetter: string
        }
      }
    },
  })
}

export function useSaveAutoCV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { jobData: any; tailoredContent: any }) => {
      const response = await api.post('/profile/save', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
  })
}
