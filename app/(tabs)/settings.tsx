import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useCurrentUser, useUpdateUser, useChangePassword, useDeleteAccount } from '@/features/settings/api/useSettings'
import { useAuth } from '@/contexts/AuthContext'
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { signOut } = useAuth()
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="settings" size={20} color={Colors.light.onPrimary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            {user && (
              <Text style={styles.headerSub}>{user.name || user.email}</Text>
            )}
          </View>
        </View>
        <View style={styles.headerVersion}>
          <Text style={styles.headerVersionText}>1.0</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.light.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <>
            {/* Profile Card */}
            <SectionCard icon="person-outline" title="Profile" subtitle="Your personal info">
              <View>
                <Label>Full Name</Label>
                <Input value={name} onChangeText={setName} containerStyle={{ marginTop: 6 }} />
              </View>
              <View>
                <Label>Email</Label>
                <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginTop: 6 }} />
              </View>
              <Button onPress={handleSaveProfile} loading={updateUser.isPending} style={styles.saveBtn}>
                Update Profile
              </Button>
            </SectionCard>

            {/* Preferences Card */}
            <SectionCard icon="notifications-outline" title="Preferences" subtitle="Regional and notification settings">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone} options={TIMEZONES} style={{ marginTop: 6 }} />

              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchTitle}>Email Reminders</Text>
                  <Text style={styles.switchDesc}>Get notified about upcoming interviews</Text>
                </View>
                <Switch value={emailReminders} onValueChange={setEmailReminders} />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchTitle}>In-App Notifications</Text>
                  <Text style={styles.switchDesc}>Real-time alerts in Orbit</Text>
                </View>
                <Switch value={inAppNotifications} onValueChange={setInAppNotifications} />
              </View>

              <Button onPress={handleSaveProfile} loading={updateUser.isPending} style={styles.saveBtn}>
                Save Preferences
              </Button>
            </SectionCard>

            {/* Security Card */}
            <SectionCard icon="shield-outline" title="Security" subtitle="Password and access">
              {!showPasswordForm ? (
                <Button variant="outline" onPress={() => setShowPasswordForm(true)}>
                  Change Password
                </Button>
              ) : (
                <View style={styles.passwordForm}>
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
                  <View style={styles.passwordActions}>
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
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard icon="warning-outline" title="Danger Zone" subtitle="Permanent actions" danger>
              {!showDeleteConfirm ? (
                <Button variant="destructive" onPress={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              ) : (
                <View style={styles.deleteConfirm}>
                  <Text style={styles.deleteWarning}>
                    This cannot be undone. All your data will be permanently deleted.
                  </Text>
                  <Label>Type your email to confirm</Label>
                  <Input value={deleteEmailConfirm} onChangeText={setDeleteEmailConfirm} placeholder={userData?.email} autoCapitalize="none" containerStyle={{ marginTop: 6 }} />
                  <View style={styles.passwordActions}>
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
            </SectionCard>

            <Separator style={{ marginVertical: 8 }} />

            <Button
              variant="outline"
              onPress={handleSignOut}
              style={styles.signOutBtn}
            >
              <Ionicons name="log-out-outline" size={16} color={Colors.light.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  )
}

function SectionCard({
  icon,
  title,
  subtitle,
  danger,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <View style={[styles.section, danger && styles.sectionDanger]}>
      <View style={[styles.sectionHeader, danger && styles.sectionHeaderDanger]}>
        <View style={[styles.sectionIconWrap, danger && styles.sectionIconWrapDanger]}>
          <Ionicons name={icon} size={18} color={danger ? Colors.light.error : Colors.light.onPrimary} />
        </View>
        <View>
          <Text style={[styles.sectionTitle, danger && { color: Colors.light.error }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.sectionSub, danger && { color: Colors.light.error + 'cc' }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.headline.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
  },
  headerSub: {
    fontSize: Typography.label.lg,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    marginTop: 1,
  },
  headerVersion: {
    width: 36,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.light.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerVersionText: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
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
  section: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    overflow: 'hidden',
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionDanger: {
    borderColor: Colors.light.error + '40',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  sectionHeaderDanger: {
    backgroundColor: Colors.light.errorContainer,
    borderBottomColor: Colors.light.error + '30',
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
  sectionBody: {
    padding: 16,
    gap: 16,
  },
  field: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    fontFamily: Fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.light.onSurfaceVariant,
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
  signOutBtn: {
    borderColor: Colors.light.error + '40',
    flexDirection: 'row',
    gap: 8,
  },
  signOutText: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: Colors.light.error,
  },
})
