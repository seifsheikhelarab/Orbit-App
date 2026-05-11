import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useAnalyticsSummary = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'summary', dateRange],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary', { params: { period: dateRange } })
      return (data as any)?.data ?? data
    },
    staleTime: 120000,
  })
}

export const useApplicationsOverTime = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'overTime', dateRange],
    queryFn: async () => {
      const { data } = await api.get('/analytics/applications-over-time', { params: { period: dateRange } })
      return (data as any)?.data ?? data
    },
    staleTime: 120000,
  })
}

export const usePipelineFunnel = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'pipeline', dateRange],
    queryFn: async () => {
      const { data } = await api.get('/analytics/pipeline-funnel', { params: { period: dateRange } })
      return (data as any)?.data ?? data
    },
    staleTime: 120000,
  })
}

export const useStatusBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'statusBreakdown'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/status-breakdown')
      return (data as any)?.data ?? data
    },
    staleTime: 120000,
  })
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['analytics', 'recentActivity'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/recent-activity')
      return (data as any)?.data ?? data
    },
    staleTime: 120000,
  })
}

export const usePipelineFlow = () => {
  return useQuery({
    queryKey: ['analytics', 'pipelineFlow'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/pipeline-flow')
      return (data as any)?.data ?? data
    },
    staleTime: 120000,
  })
}
