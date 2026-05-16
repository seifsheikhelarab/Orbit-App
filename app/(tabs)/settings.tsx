import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { useCurrentUser, useUpdateUser, useChangePassword, useDeleteAccount } from '@/features/settings/api/useSettings'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeMode } from '@/contexts/ThemeContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'America/Chicago', label: 'Chicago' },
  { value: 'America/Denver', label: 'Denver' },
  { value: 'America/Los_Angeles', label: 'Los Angeles' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

function SectionCardHeader({ icon, title, subtitle, danger }: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  danger?: boolean
}) {
  const colors = useColors()
  return (
    <View style={[sstyles.sectionHeader, danger && sstyles.sectionHeaderDanger]}>
      <View style={[sstyles.sectionIconWrap, danger && sstyles.sectionIconWrapDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.onError : colors.onPrimary} />
      </View>
      <View>
        <Text style={[sstyles.sectionTitle, danger && { color: colors.error }]}>{title}</Text>
        {subtitle && (
          <Text style={[sstyles.sectionSub, danger && { color: hexa(colors.error, 0.80) }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  )
}

export default function SettingsScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { signOut } = useAuth()
  const { mode, setMode, isDark } = useThemeMode()
  const { data: user, isLoading, refetch, isRefetching } = useCurrentUser()
  const updateUser = useUpdateUser()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [emailReminders, setEmailReminders] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)

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
      setTimezone(u.timezone || 'UTC')
      setEmailReminders(u.emailRemindersEnabled ?? true)
      setInAppNotifications(u.inAppNotificationsEnabled ?? true)
    }
  }, [user])

  const handleSaveProfile = useCallback(async () => {
    try {
      await updateUser.mutateAsync({ name, email, timezone, emailRemindersEnabled: emailReminders, inAppNotificationsEnabled: inAppNotifications })
      Alert.alert('Saved', 'Profile updated successfully')
    } catch {
      Alert.alert('Error', 'Failed to update profile')
    }
  }, [name, email, timezone, emailReminders, inAppNotifications, updateUser])

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
    <View style={sstyles.container}>
      <PageHeader
        icon="settings"
        iconVariant="primary"
        title="Settings"
        subtitle={user ? (user.name || user.email) : undefined}
      />

      <ScrollView
        style={sstyles.scroll}
        contentContainerStyle={sstyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={sstyles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <Card>
              <CardContent>
                <View style={sstyles.sectionBodyContent}>
                  <SectionCardHeader icon="person-outline" title="Profile" subtitle="Your personal info" />
                  <View>
                    <Label>Full Name</Label>
                    <Input value={name} onChangeText={setName} containerStyle={{ marginTop: 6 }} />
                  </View>
                  <View>
                    <Label>Email</Label>
                    <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginTop: 6 }} />
                  </View>
                  <Button onPress={handleSaveProfile} loading={updateUser.isPending} style={sstyles.saveBtn}>
                    Update Profile
                  </Button>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <View style={sstyles.sectionBodyContent}>
                  <SectionCardHeader icon="notifications-outline" title="Preferences" subtitle="Regional and notification settings" />
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone} options={TIMEZONES} style={{ marginTop: 6 }} />

                  <View style={sstyles.switchRow}>
                    <View style={sstyles.switchLabel}>
                      <Text style={sstyles.switchTitle}>Email Reminders</Text>
                      <Text style={sstyles.switchDesc}>Get notified about upcoming interviews</Text>
                    </View>
                    <Switch value={emailReminders} onValueChange={setEmailReminders} />
                  </View>

                  <View style={sstyles.switchRow}>
                    <View style={sstyles.switchLabel}>
                      <Text style={sstyles.switchTitle}>In-App Notifications</Text>
                      <Text style={sstyles.switchDesc}>Real-time alerts in Orbit</Text>
                    </View>
                    <Switch value={inAppNotifications} onValueChange={setInAppNotifications} />
                  </View>

                  <Separator style={{ marginVertical: 4 }} />

                  <View style={sstyles.switchRow}>
                    <View style={sstyles.switchLabel}>
                      <Text style={sstyles.switchTitle}>Dark Mode</Text>
                      <Text style={sstyles.switchDesc}>{mode === 'system' ? 'Follows system setting' : isDark ? 'Dark theme' : 'Light theme'}</Text>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={(v) => setMode(v ? 'dark' : 'light')}
                    />
                  </View>

                  <Button onPress={handleSaveProfile} loading={updateUser.isPending} style={sstyles.saveBtn}>
                    Save Preferences
                  </Button>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <View style={sstyles.sectionBodyContent}>
                  <SectionCardHeader icon="compass-outline" title="Shortcuts" subtitle="Quick navigation" />
                  <Pressable style={sstyles.shortcutRow} onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button">
                    <View style={[sstyles.shortcutIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                      <Ionicons name="person-outline" size={18} color={colors.accent} />
                    </View>
                    <View style={sstyles.shortcutLabel}>
                      <Text style={sstyles.shortcutTitle}>Professional Dossier</Text>
                      <Text style={sstyles.shortcutDesc}>Manage your central record of experience</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
                  </Pressable>
                  <Pressable style={sstyles.shortcutRow} onPress={() => router.push('/(tabs)/notifications')} accessibilityRole="button">
                    <View style={[sstyles.shortcutIcon, { backgroundColor: hexa(colors.primary, 0.08) }]}>
                      <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={sstyles.shortcutLabel}>
                      <Text style={sstyles.shortcutTitle}>Notifications</Text>
                      <Text style={sstyles.shortcutDesc}>View recent alerts and updates</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
                  </Pressable>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <View style={sstyles.sectionBodyContent}>
                  <SectionCardHeader icon="shield-outline" title="Security" subtitle="Password and access" />
                  {!showPasswordForm ? (
                    <Button variant="outline" onPress={() => setShowPasswordForm(true)}>
                      Change Password
                    </Button>
                  ) : (
                    <View style={sstyles.passwordForm}>
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
                      <View style={sstyles.passwordActions}>
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

            <Card style={sstyles.dangerCard}>
              <CardContent>
                <View style={sstyles.sectionBodyContent}>
                  <SectionCardHeader icon="warning-outline" title="Danger Zone" subtitle="Permanent actions" danger />
                  {!showDeleteConfirm ? (
                    <Button variant="destructive" onPress={() => setShowDeleteConfirm(true)}>
                      Delete Account
                    </Button>
                  ) : (
                    <View style={sstyles.deleteConfirm}>
                      <Text style={sstyles.deleteWarning}>
                        This cannot be undone. All your data will be permanently deleted.
                      </Text>
                      <Label>Type your email to confirm</Label>
                      <Input value={deleteEmailConfirm} onChangeText={setDeleteEmailConfirm} placeholder={userData?.email} autoCapitalize="none" containerStyle={{ marginTop: 6 }} />
                      <View style={sstyles.passwordActions}>
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
              style={sstyles.signOutBtn}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.error} />
              <Text style={sstyles.signOutText}>Sign Out</Text>
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const sstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
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
    backgroundColor: Colors.light.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sectionHeaderDanger: {
    backgroundColor: Colors.light.errorContainer,
    borderBottomColor: hexa(Colors.light.error, 0.19),
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconWrapDanger: {
    backgroundColor: Colors.light.error,
  },
  sectionTitle: {
    fontSize: Typography.title.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
  },
  sectionSub: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: Colors.light.onSurface,
  },
  switchDesc: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
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
    color: Colors.light.error,
    fontWeight: '500',
  },
  dangerCard: {
    borderColor: hexa(Colors.light.error, 0.25),
  },
  signOutBtn: {
    borderColor: hexa(Colors.light.error, 0.25),
    flexDirection: 'row',
    gap: 8,
  },
  signOutText: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: Colors.light.error,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
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
    color: Colors.light.onSurface,
  },
  shortcutDesc: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    marginTop: 1,
  },
})
