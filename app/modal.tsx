import { Link } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'

export default function ModalScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const s = getStyles(colors)
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Text style={s.title}>This is a modal</Text>
      <Link href="/" dismissTo style={s.link}>
        <Text style={s.linkText}>Go to home screen</Text>
      </Link>
    </View>
  )
}

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: c.background,
  },
  title: {
    fontSize: Typography.title.lg,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: c.onSurface,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: Typography.body.sm,
    color: c.accent,
    fontFamily: Fonts.body,
    fontWeight: '600',
  },
})

const styles = getStyles(Colors.light)
