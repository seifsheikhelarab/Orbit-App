import { Link } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Typography, Fonts } from '@/constants/theme'

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: Typography.title.lg,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: Typography.body.sm,
    color: Colors.light.accent,
    fontFamily: Fonts.body,
    fontWeight: '600',
  },
})
