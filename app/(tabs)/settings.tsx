import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { ApiError } from '@/components/shared/ApiError'
import { useCurrentUser, useUpdateUser, useChangePassword, useDeleteAccount } from '@/features/settings/api/useSettings'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeMode } from '@/contexts/ThemeContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function SectionCardHeader({ icon, title, subtitle, danger }: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  danger?: boolean
}) {
  const colors = useColors()
  const s = getStyles(colors)
  return (
    <View style={[s.sectionHeader, danger && s.sectionHeaderDanger]}>
      <View style={[s.sectionIconWrap, danger && s.sectionIconWrapDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.onError : colors.onPrimary} />
      </View>
      <View>
        <Text style={[s.sectionTitle, danger && { color: colors.error }]}>{title}</Text>
        {subtitle && (
          <Text style={[s.sectionSub, danger && { color: hexa(colors.error, 0.80) }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  )
}

export default function SettingsScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const s = getStyles(colors)
  const { signOut } = useAuth()
  const { mode, setMode, isDark } = useThemeMode()
  const { data: user, isLoading, isError, error, refetch, isRefetching } = useCurrentUser()
  const updateUser = useUpdateUser()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('')

  useEffect(() => {
    if (user) {
      const u = user
      setName(u.name || '')
      setEmail(u.email || '')
    }
  }, [user])

  const handleSaveProfile = useCallback(async () => {
    try {
      await updateUser.mutateAsync({ name, email })
      Alert.alert('Saved', 'Profile updated successfully')
    } catch {
      Alert.alert('Error', 'Failed to update profile')
    }
  }, [name, email, updateUser])

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword })
      Alert.alert('Success', 'Password changed successfully')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      Alert.alert('Error', 'Failed to change password')
    }
  }, [newPassword, confirmPassword, currentPassword, changePassword])

  const handleDeleteAccount = useCallback(async () => {
    try {
      await deleteAccount.mutateAsync()
    } catch {
      Alert.alert('Error', 'Failed to delete account')
    }
  }, [deleteAccount])

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ])
  }, [])

  const userData = user

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <PageHeader
        icon="settings-outline"
        iconVariant="accent"
        title="Settings"
        subtitle={user ? (user.name || user.email) : undefined}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <ApiError message={(error as any)?.userMessage || (error as any)?.message} onRetry={() => refetch()} fullScreen />
        ) : (
          <>
            <Card>
              <CardContent>
                <View style={s.sectionBodyContent}>
                  <SectionCardHeader icon="person-outline" title="Profile" subtitle="Your personal info" />
                  <View>
                    <Label>Full Name</Label>
                    <Input value={name} onChangeText={setName} containerStyle={{ marginTop: 6 }} />
                  </View>
                  <View>
                    <Label>Email</Label>
                    <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginTop: 6 }} />
                  </View>
                  <Button onPress={handleSaveProfile} loading={updateUser.isPending} style={s.saveBtn}>
                    Update Profile
                  </Button>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <View style={s.sectionBodyContent}>
                  <SectionCardHeader icon="moon-outline" title="Appearance" />
                  <View style={s.switchRow}>
                    <View style={s.switchLabel}>
                      <Text style={s.switchTitle}>Dark Mode</Text>
                      <Text style={s.switchDesc}>{mode === 'system' ? 'Follows system setting' : isDark ? 'Dark theme' : 'Light theme'}</Text>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={(v) => setMode(v ? 'dark' : 'light')}
                    />
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <View style={s.sectionBodyContent}>
                  <SectionCardHeader icon="compass-outline" title="Shortcuts" subtitle="Quick navigation" />
                  <Pressable style={s.shortcutRow} onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button">
                    <View style={[s.shortcutIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                      <Ionicons name="person-outline" size={18} color={colors.accent} />
                    </View>
                    <View style={s.shortcutLabel}>
                      <Text style={s.shortcutTitle}>Professional Dossier</Text>
                      <Text style={s.shortcutDesc}>Manage your central record of experience</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
                  </Pressable>
                  <Pressable style={s.shortcutRow} onPress={() => router.push('/(tabs)/notifications')} accessibilityRole="button">
                    <View style={[s.shortcutIcon, { backgroundColor: hexa(colors.primary, 0.08) }]}>
                      <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={s.shortcutLabel}>
                      <Text style={s.shortcutTitle}>Notifications</Text>
                      <Text style={s.shortcutDesc}>View recent alerts and updates</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
                  </Pressable>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <View style={s.sectionBodyContent}>
                  <SectionCardHeader icon="shield-outline" title="Security" subtitle="Password and access" />
                  {!showPasswordForm ? (
                    <Button variant="outline" onPress={() => setShowPasswordForm(true)}>
                      Change Password
                    </Button>
                  ) : (
                    <View style={s.passwordForm}>
                      <View>
                        <Label>Current Password</Label>
                        <Input value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry containerStyle={{ marginTop: 6 }} />
                      </View>
                      <View>
                        <Label>New Password</Label>
                        <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry containerStyle={{ marginTop: 6 }} />
                      </View>
                      <View>
                        <Label>Confirm New Password</Label>
                        <Input value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry containerStyle={{ marginTop: 6 }} />
                      </View>
                      <View style={s.passwordActions}>
                        <Button
                          onPress={handleChangePassword}
                          loading={changePassword.isPending}
                          disabled={newPassword !== confirmPassword || !currentPassword || !newPassword}
                          style={{ flex: 1 }}
                        >
                          Update
                        </Button>
                        <Button variant="ghost" onPress={() => setShowPasswordForm(false)}>
                          Cancel
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              </CardContent>
            </Card>

            <Card style={s.dangerCard}>
              <CardContent>
                <View style={s.sectionBodyContent}>
                  <SectionCardHeader icon="warning-outline" title="Danger Zone" subtitle="Permanent actions" danger />
                  {!showDeleteConfirm ? (
                    <Button variant="destructive" onPress={() => setShowDeleteConfirm(true)}>
                      Delete Account
                    </Button>
                  ) : (
                    <View style={s.deleteConfirm}>
                      <Text style={s.deleteWarning}>
                        This cannot be undone. All your data will be permanently deleted.
                      </Text>
                      <Label>Type your email to confirm</Label>
                      <Input value={deleteEmailConfirm} onChangeText={setDeleteEmailConfirm} placeholder={userData?.email} autoCapitalize="none" containerStyle={{ marginTop: 6 }} />
                      <View style={s.passwordActions}>
                        <Button
                          variant="destructive"
                          onPress={handleDeleteAccount}
                          loading={deleteAccount.isPending}
                          disabled={deleteEmailConfirm !== userData?.email}
                          style={{ flex: 1 }}
                        >
                          Confirm Deletion
                        </Button>
                        <Button
                          variant="ghost"
                          onPress={() => {
                            setShowDeleteConfirm(false)
                            setDeleteEmailConfirm('')
                          }}
                        >
                          Cancel
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              </CardContent>
            </Card>

            <Separator style={{ marginVertical: 8 }} />

            <Button
              variant="outline"
              onPress={handleSignOut}
              style={s.signOutBtn}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.error} />
              <Text style={s.signOutText}>Sign Out</Text>
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  loadingWrap: {
    padding: 48,
    alignItems: 'center',
  },
  sectionBodyContent: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 0,
    backgroundColor: c.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: c.outlineVariant,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sectionHeaderDanger: {
    backgroundColor: c.errorContainer,
    borderBottomColor: hexa(c.error, 0.19),
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconWrapDanger: {
    backgroundColor: c.error,
  },
  sectionTitle: {
    fontSize: Typography.title.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: c.onSurface,
  },
  sectionSub: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: c.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: c.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.outlineVariant,
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: c.onSurface,
  },
  switchDesc: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: c.onSurfaceVariant,
    marginTop: 2,
  },
  saveBtn: {
    alignSelf: 'flex-start',
  },
  passwordForm: {
    gap: 16,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteConfirm: {
    gap: 12,
  },
  deleteWarning: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: c.error,
    fontWeight: '500',
  },
  dangerCard: {
    borderColor: hexa(c.error, 0.25),
  },
  signOutBtn: {
    borderColor: hexa(c.error, 0.25),
    flexDirection: 'row',
    gap: 8,
  },
  signOutText: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: c.error,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: c.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.outlineVariant,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: c.onSurface,
  },
  shortcutDesc: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: c.onSurfaceVariant,
    marginTop: 1,
  },
})
