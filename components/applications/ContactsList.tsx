import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export interface Contact {
  id: string
  applicationId: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  linkedinUrl: string | null
}

interface ContactsListProps {
  contacts: Contact[]
  isLoading?: boolean
  onAdd: (data: { name: string; title?: string; email?: string; phone?: string; linkedinUrl?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function ContactsList({ contacts, isLoading, onAdd, onDelete }: ContactsListProps) {
  const colors = useColors()
  const s = getStyles(colors)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setName('')
    setTitle('')
    setEmail('')
    setPhone('')
    setLinkedinUrl('')
  }

  const handleAdd = async () => {
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await onAdd({ name, title: title || undefined, email: email || undefined, phone: phone || undefined, linkedinUrl: linkedinUrl || undefined })
      setIsAddOpen(false)
      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Ionicons name="people-outline" size={16} color={colors.onSecondaryContainer} />
        <Text style={s.title}>Contacts</Text>
        <View style={s.spacer} />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <Button variant="outline" size="sm">Add Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
              <DialogDescription>Add a contact for this application</DialogDescription>
            </DialogHeader>
            <View style={s.formFields}>
              <View>
                <Text style={s.label}>Name *</Text>
                <Input containerStyle={s.input} value={name} onChangeText={setName} placeholder="John Doe" />
              </View>
              <View>
                <Text style={s.label}>Title</Text>
                <Input containerStyle={s.input} value={title} onChangeText={setTitle} placeholder="Recruiter" />
              </View>
              <View>
                <Text style={s.label}>Email</Text>
                <Input containerStyle={s.input} value={email} onChangeText={setEmail} placeholder="john@company.com" keyboardType="email-address" />
              </View>
              <View>
                <Text style={s.label}>Phone</Text>
                <Input containerStyle={s.input} value={phone} onChangeText={setPhone} placeholder="+1 234 567 8900" />
              </View>
              <View>
                <Text style={s.label}>LinkedIn URL</Text>
                <Input containerStyle={s.input} value={linkedinUrl} onChangeText={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
              </View>
            </View>
            <DialogFooter>
              <Button variant="outline" onPress={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onPress={handleAdd} disabled={!name.trim() || isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Contact'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>

      {contacts.length > 0 ? (
        <View style={s.list}>
          {contacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} onDelete={onDelete} />
          ))}
        </View>
      ) : (
        <View style={s.empty}>
          <Ionicons name="people-outline" size={32} color={colors.onSurfaceVariant} />
          <Text style={s.emptyText}>No contacts added yet</Text>
        </View>
      )}
    </View>
  )
}

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: c.outline, paddingBottom: 12 },
  title: { fontSize: Typography.label.lg, fontWeight: '700', fontFamily: Fonts.body, textTransform: 'uppercase', letterSpacing: 0.5, color: c.onSurface },
  spacer: { flex: 1 },
  formFields: { gap: 12 },
  label: { fontSize: Typography.label.md, fontWeight: '600', fontFamily: Fonts.body, color: c.onSurface, marginBottom: 4 },
  input: { borderRadius: 10, borderWidth: 1, borderColor: c.outline, paddingHorizontal: 12, fontSize: Typography.body.sm, fontFamily: Fonts.body, color: c.onSurface, backgroundColor: c.input },
  list: { gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface },
  contactLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  contactInitial: { fontSize: Typography.body.sm, fontWeight: '600', color: c.onPrimaryFixed },
  contactName: { fontSize: Typography.body.sm, fontWeight: '600', fontFamily: Fonts.body, color: c.onSurface },
  contactTitle: { fontSize: Typography.label.md, fontFamily: Fonts.body, color: c.onSurfaceVariant },
  empty: { alignItems: 'center', padding: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: c.outline, borderRadius: 12, gap: 8 },
  emptyText: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: c.onSurfaceVariant },
})

const styles = getStyles(Colors.light)

const ContactItem = React.memo(function ContactItem({
  contact,
  onDelete,
}: {
  contact: Contact
  onDelete: (id: string) => Promise<void>
}) {
  const colors = useColors()
  const s = getStyles(colors)
  return (
    <View style={s.contactItem}>
      <View style={s.contactLeft}>
        <View style={s.contactAvatar}>
          <Text style={s.contactInitial}>{contact.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={s.contactName}>{contact.name}</Text>
          {contact.title && <Text style={s.contactTitle}>{contact.title}</Text>}
        </View>
      </View>
      <Pressable onPress={() => onDelete(contact.id)}>
        <Ionicons name="trash-outline" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  )
})

export { ContactsList }
