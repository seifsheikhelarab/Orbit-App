import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL || 'http://192.168.1.37:5726/api/v1',
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('orbitapp_bearer_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignored
  }
  return config
})

export default api
