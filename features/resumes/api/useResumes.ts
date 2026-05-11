import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ResumeType } from './types'

export interface Resume {
  id: string
  userId: string
  name: string
  type: ResumeType
  slug: string
  content: Record<string, any>
  settings: Record<string, any>
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface GetResumesResponse {
  success: boolean
  message: string
  data: Resume[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ResumeResponse {
  success: boolean
  message: string
  data: Resume
}

export function useResumes(page = 1, limit = 20, type?: ResumeType) {
  return useQuery({
    queryKey: ['resumes', { page, limit, type }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', String(limit))
      if (type) params.append('type', type)
      const response = await api.get(`/resumes?${params}`)
      return response.data as GetResumesResponse
    },
  })
}

export function useResume(id: string) {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      const response = await api.get(`/resumes/${id}`)
      return response.data as ResumeResponse
    },
    enabled: !!id,
  })
}

export function useCreateResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      type?: ResumeType
      content?: Record<string, any>
      settings?: Record<string, any>
    }) => {
      const response = await api.post('/resumes', data)
      return response.data as ResumeResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
  })
}

export function useUpdateResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      name?: string
      type?: ResumeType
      content?: Record<string, any>
      settings?: Record<string, any>
      isPublic?: boolean
    }) => {
      const response = await api.patch(`/resumes/${data.id}`, data)
      return response.data as ResumeResponse
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      queryClient.invalidateQueries({ queryKey: ['resume', variables.id] })
    },
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resumes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
  })
}

export function useAttachResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { resumeId: string; applicationId: string }) => {
      const response = await api.post(`/resumes/${data.resumeId}/attach`, {
        applicationId: data.applicationId,
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({
        queryKey: ['application-resumes', variables.applicationId],
      })
    },
  })
}
