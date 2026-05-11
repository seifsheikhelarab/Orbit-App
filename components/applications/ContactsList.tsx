import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={16} color={Colors.light.onSecondaryContainer} />
        <Text style={styles.title}>Contacts</Text>
        <View style={styles.spacer} />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <Button variant="outline" size="sm">Add Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
              <DialogDescription>Add a contact for this application</DialogDescription>
            </DialogHeader>
            <View style={styles.formFields}>
              <View>
                <Text style={styles.label}>Name *</Text>
                <Input containerStyle={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />
              </View>
              <View>
                <Text style={styles.label}>Title</Text>
                <Input containerStyle={styles.input} value={title} onChangeText={setTitle} placeholder="Recruiter" />
              </View>
              <View>
                <Text style={styles.label}>Email</Text>
                <Input containerStyle={styles.input} value={email} onChangeText={setEmail} placeholder="john@company.com" keyboardType="email-address" />
              </View>
              <View>
                <Text style={styles.label}>Phone</Text>
                <Input containerStyle={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 234 567 8900" />
              </View>
              <View>
                <Text style={styles.label}>LinkedIn URL</Text>
                <Input containerStyle={styles.input} value={linkedinUrl} onChangeText={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
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
        <View style={styles.list}>
          {contacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} onDelete={onDelete} />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={32} color={Colors.light.onSurfaceVariant} />
          <Text style={styles.emptyText}>No contacts added yet</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.light.outline, paddingBottom: 12 },
  title: { fontSize: Typography.label.lg, fontWeight: '700', fontFamily: Fonts.body, textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.light.onSurface },
  spacer: { flex: 1 },
  formFields: { gap: 12 },
  label: { fontSize: Typography.label.md, fontWeight: '600', fontFamily: Fonts.body, color: Colors.light.onSurface, marginBottom: 4 },
  input: { height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.light.outline, paddingHorizontal: 12, fontSize: Typography.body.sm, fontFamily: Fonts.body, color: Colors.light.onSurface, backgroundColor: Colors.light.input },
  list: { gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.outline, backgroundColor: Colors.light.surface },
  contactLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  contactInitial: { fontSize: Typography.body.sm, fontWeight: '600', color: Colors.light.onPrimaryFixed },
  contactName: { fontSize: Typography.body.sm, fontWeight: '600', fontFamily: Fonts.body, color: Colors.light.onSurface },
  contactTitle: { fontSize: Typography.label.md, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant },
  empty: { alignItems: 'center', padding: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.light.outline, borderRadius: 12, gap: 8 },
  emptyText: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant },
})

const ContactItem = React.memo(function ContactItem({
  contact,
  onDelete,
}: {
  contact: Contact
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <View style={styles.contactItem}>
      <View style={styles.contactLeft}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactInitial}>{contact.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.contactName}>{contact.name}</Text>
          {contact.title && <Text style={styles.contactTitle}>{contact.title}</Text>}
        </View>
      </View>
      <Pressable onPress={() => onDelete(contact.id)}>
        <Ionicons name="trash-outline" size={16} color={Colors.light.onSurfaceVariant} />
      </Pressable>
    </View>
  )
})

export { ContactsList }
