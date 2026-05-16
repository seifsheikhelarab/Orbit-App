import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { emit } from './events'

const BEARER_TOKEN_KEY = 'orbitapp_bearer_token'
const SESSION_CACHE_KEY = 'orbitapp_session_cache'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL || 'http://192.168.1.37:5726/api/v1',
  timeout: 30000,
  timeoutErrorMessage: 'Request timed out. Please check your connection and try again.',
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(BEARER_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // SecureStore may be unavailable on some platforms
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // Network error (no internet connection)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.userMessage = 'The request timed out. Please check your connection and try again.'
      } else {
        error.userMessage = 'Unable to connect to the server. Please check your internet connection.'
      }
      return Promise.reject(error)
    }

    const { status } = error.response

    switch (status) {
      case 401: {
        // Token expired or invalid — clear auth state
        try {
          await Promise.all([
            SecureStore.deleteItemAsync(BEARER_TOKEN_KEY),
            SecureStore.deleteItemAsync(SESSION_CACHE_KEY),
          ])
        } catch {
          // ignore cleanup errors
        }
        error.userMessage = 'Your session has expired. Please sign in again.'
        // Notify AuthContext about the expired session
        emit('auth:expired', error)
        break
      }
      case 403:
        error.userMessage = 'You don\'t have permission to perform this action.'
        break
      case 404:
        error.userMessage = 'The requested resource was not found.'
        break
      case 429:
        error.userMessage = 'Too many requests. Please wait a moment and try again.'
        break
      case 500:
        error.userMessage = 'Something went wrong on our end. Please try again later.'
        break
      default:
        if (status >= 400 && status < 500) {
          error.userMessage = error.response?.data?.message || 'An unexpected error occurred.'
        } else {
          error.userMessage = 'Something went wrong. Please try again.'
        }
    }

    return Promise.reject(error)
  }
)

export default api
