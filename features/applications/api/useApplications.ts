import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { type ApplicationStatus } from '@/lib/status'

export type { ApplicationStatus }

export interface Application {
  id: string
  company: string
  jobTitle: string
  applicationStatus: ApplicationStatus
  location?: string
  jobURL?: string
  salaryMin?: number
  salaryMax?: number
  appliedDate?: string
  notes?: string
  followUpDate?: string
  followUpNote?: string
  source?: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationsResponse {
  data: Application[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface QueryParams {
  search: string
  status: ApplicationStatus[]
  location: string
  appliedFrom: string
  appliedTo: string
  salaryMin?: number
  salaryMax?: number
  page: number
  limit: number
  sort: string
  order: string
}

export function buildQueryString(params: QueryParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sort: params.sort,
    order: params.order,
  })
  if (params.search) query.set('search', params.search)
  if (params.status.length > 0) query.set('status', params.status.join(','))
  if (params.location) query.set('location', params.location)
  if (params.appliedFrom) query.set('applied_from', params.appliedFrom)
  if (params.appliedTo) query.set('applied_to', params.appliedTo)
  if (params.salaryMin !== undefined) query.set('salary_min', String(params.salaryMin))
  if (params.salaryMax !== undefined) query.set('salary_max', String(params.salaryMax))
  return query.toString()
}

export const useApplications = (params: QueryParams) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: async (): Promise<ApplicationsResponse> => {
      const res = await api.get(`/applications?${buildQueryString(params)}`)
      const body = res.data
      if (body && typeof body === 'object' && 'data' in body && 'pagination' in body) {
        return body
      }
      const data = body?.data ?? body
      return {
        data: Array.isArray(data) ? data : (data?.applications || []),
        pagination: data?.pagination || { page: params.page, limit: params.limit, total: data?.total || 0, pages: 1 },
      }
    },
  })
}

export const useApplicationsByStatus = (status: ApplicationStatus) => {
  return useQuery({
    queryKey: ['applications', 'status', status],
    queryFn: async (): Promise<ApplicationsResponse> => {
      const query = new URLSearchParams({ status, limit: '1000' })
      const res = await api.get(`/applications?${query.toString()}`)
      const data = res.data?.data ?? res.data
      if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) return data
      return {
        data: Array.isArray(data) ? data : (data?.applications || []),
        pagination: data?.pagination || { page: 1, limit: 1000, total: data?.total || 0, pages: 1 },
      }
    },
  })
}

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async (): Promise<{ data: Application }> => {
      const res = await api.get(`/applications/${id}`)
      const data = res.data?.data ?? res.data
      return { data: data?.data ?? data }
    },
    enabled: !!id,
  })
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Application>) => {
      return api.post('/applications', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error: unknown) => {
      console.error('Create application error:', error)
    },
  })
}

export const useUpdateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Application> }) => {
      return api.patch(`/applications/${id}`, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['applications', variables.id] })
      }
    },
  })
}

export const useDeleteApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/applications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export const useBulkUpdateApplications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { ids: string[]; status: ApplicationStatus }) => {
      return api.patch('/applications/bulk', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export const useBulkDeleteApplications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api.delete('/applications/bulk', { data: { ids } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export const useApplicationsDocumentCounts = (applicationIds: string[]) => {
  return useQuery({
    queryKey: ['applications', 'document-counts', applicationIds.join(',')],
    queryFn: async (): Promise<Record<string, number>> => {
      if (applicationIds.length === 0) return {}
      const res = await api.get(`/applications/document-counts?ids=${applicationIds.join(',')}`)
      return res.data || {}
    },
    enabled: applicationIds.length > 0,
  })
}

export const useAllApplicationIds = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['applications', 'ids', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v))
            } else {
              params.append(key, String(value))
            }
          }
        })
      }
      const res = await api.get(`/applications/ids?${params.toString()}`)
      return res.data?.ids || []
    },
    enabled: false,
  })
}
