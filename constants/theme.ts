import { Platform } from 'react-native'

export const Colors = {
  light: {
    text: '#111827',
    background: '#fafbfc',
    tint: '#1a1a2e',
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#1a1a2e',

    primary: '#1a1a2e',
    primaryHover: '#16213e',
    primaryContainer: '#e8e8ed',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#1a1a2e',

    secondary: '#4a5568',
    secondaryContainer: '#f7f8fa',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#2d3748',

    accent: '#0f766e',
    accentContainer: '#ccfbf1',
    onAccent: '#ffffff',
    onAccentContainer: '#134e4a',

    surface: '#ffffff',
    surfaceDim: '#f8f9fa',
    surfaceBright: '#ffffff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f8f9fa',
    surfaceContainer: '#f1f3f5',
    surfaceContainerHigh: '#e5e7eb',
    surfaceContainerHighest: '#d1d5db',

    onSurface: '#111827',
    onSurfaceVariant: '#4b5563',

    outline: '#d1d5db',
    outlineVariant: '#e5e7eb',

    error: '#dc2626',
    errorContainer: '#fef2f2',
    onError: '#ffffff',
    onErrorContainer: '#991b1b',

    warning: '#d97706',
    warningContainer: '#fffbeb',
    onWarning: '#ffffff',
    onWarningContainer: '#78350f',

    success: '#059669',
    successContainer: '#ecfdf5',
    onSuccess: '#ffffff',
    onSuccessContainer: '#064e3b',

    inversePrimary: '#a5b4fc',
    inverseSurface: '#111827',
    inverseOnSurface: '#f8f9fa',

    primaryFixed: '#1a1a2e',
    primaryFixedDim: '#e8e8ed',
    onPrimaryFixed: '#ffffff',
    onPrimaryFixedDim: '#1a1a2e',

    accentFixed: '#0f766e',
    accentFixedDim: '#ccfbf1',
    onAccentFixed: '#ffffff',
    onAccentFixedDim: '#134e4a',

    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    popover: '#ffffff',
    popoverForeground: '#111827',
    ring: '#1a1a2e',
    border: '#e5e7eb',
    input: '#f8f9fa',

    statusSaved: '#4f46e5',
    statusApplied: '#4f46e5',
    statusPhoneScreen: '#8b5cf6',
    statusInterview: '#f59e0b',
    statusOffer: '#10b981',
    statusClosed: '#64748b',

    statusBgSaved: '#eef2ff',
    statusBgApplied: '#eef2ff',
    statusBgPhoneScreen: '#f5f3ff',
    statusBgInterview: '#fffbeb',
    statusBgOffer: '#ecfdf5',
    statusBgClosed: '#f1f5f9',

    statusTextSaved: '#3730a3',
    statusTextApplied: '#3730a3',
    statusTextPhoneScreen: '#6d28d9',
    statusTextInterview: '#92400e',
    statusTextOffer: '#065f46',
    statusTextClosed: '#475569',
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a',
    tint: '#f1f5f9',
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#f1f5f9',

    primary: '#94a3b8',
    primaryHover: '#cbd5e1',
    primaryContainer: '#1e293b',
    onPrimary: '#0f172a',
    onPrimaryContainer: '#e2e8f0',

    secondary: '#cbd5e1',
    secondaryContainer: '#1e293b',
    onSecondary: '#0f172a',
    onSecondaryContainer: '#e2e8f0',

    accent: '#2dd4bf',
    accentContainer: '#134e4a',
    onAccent: '#042f2e',
    onAccentContainer: '#ccfbf1',

    surface: '#1a1a2e',
    surfaceDim: '#0f172a',
    surfaceBright: '#1e293b',
    surfaceContainerLowest: '#0f172a',
    surfaceContainerLow: '#1e293b',
    surfaceContainer: '#334155',
    surfaceContainerHigh: '#475569',
    surfaceContainerHighest: '#64748b',

    onSurface: '#f1f5f9',
    onSurfaceVariant: '#94a3b8',

    outline: '#475569',
    outlineVariant: '#334155',

    error: '#fca5a5',
    errorContainer: '#450a0a',
    onError: '#450a0a',
    onErrorContainer: '#fca5a5',

    warning: '#fbbf24',
    warningContainer: '#78350f',
    onWarning: '#78350f',
    onWarningContainer: '#fbbf24',

    success: '#6ee7b7',
    successContainer: '#064e3b',
    onSuccess: '#064e3b',
    onSuccessContainer: '#6ee7b7',

    inversePrimary: '#1a1a2e',
    inverseSurface: '#fafbfc',
    inverseOnSurface: '#0f172a',

    primaryFixed: '#1a1a2e',
    primaryFixedDim: '#e8e8ed',
    onPrimaryFixed: '#ffffff',
    onPrimaryFixedDim: '#1a1a2e',

    accentFixed: '#0f766e',
    accentFixedDim: '#134e4a',
    onAccentFixed: '#ffffff',
    onAccentFixedDim: '#ccfbf1',

    muted: '#374151',
    mutedForeground: '#94a3b8',
    popover: '#1f2937',
    popoverForeground: '#f1f5f9',
    ring: '#94a3b8',
    border: '#374151',
    input: '#1e293b',

    statusSaved: '#818cf8',
    statusApplied: '#818cf8',
    statusPhoneScreen: '#a78bfa',
    statusInterview: '#fbbf24',
    statusOffer: '#34d399',
    statusClosed: '#94a3b8',

    statusBgSaved: '#312e81',
    statusBgApplied: '#1e3a8a',
    statusBgPhoneScreen: '#4c1d95',
    statusBgInterview: '#78350f',
    statusBgOffer: '#065f46',
    statusBgClosed: '#1e293b',

    statusTextSaved: '#c7d2fe',
    statusTextApplied: '#bfdbfe',
    statusTextPhoneScreen: '#ddd6fe',
    statusTextInterview: '#fde68a',
    statusTextOffer: '#a7f3d0',
    statusTextClosed: '#e2e8f0',
  },
}

export const Fonts = {
  headline: 'Manrope',
  body: 'Inter',
  sans: Platform.select({
    ios: 'system-ui',
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    default: 'normal',
  }),
  serif: Platform.select({
    ios: 'ui-serif',
    web: "Georgia, 'Times New Roman', serif",
    default: 'serif',
  }),
  rounded: Platform.select({
    ios: 'ui-rounded',
    default: 'normal',
  }),
  mono: Platform.select({
    ios: 'ui-monospace',
    web: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    default: 'monospace',
  }),
}

export const Typography = {
  display: { lg: 72, md: 56, sm: 40 },
  headline: { lg: 32, md: 28, sm: 22 },
  title: { lg: 20, md: 18, sm: 16 },
  body: { lg: 18, md: 16, sm: 14 },
  label: { lg: 14, md: 12, sm: 11 },
}

export const Shadows = {
  sm: {
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
}

export function getShadows(c: typeof Colors.light) {
  return {
    sm: {
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 8,
    },
    xl: {
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 48,
      elevation: 12,
    },
  }
}
