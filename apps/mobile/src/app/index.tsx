import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiStatus } from '@/components/api-status';
import { MaxContentWidth, Radius, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

/**
 * Pantalla inicial de la FASE 1: identidad del producto y verificación de la conexión
 * con la API. La navegación principal (Home, Learn, Practice, Vocabulary, Progress,
 * Profile) se construye a partir de la FASE 2, cuando existan usuarios y contenido real.
 */
export default function HomeScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>AI</Text>
          </View>
          <Text style={styles.brandName}>AI English Immersion</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Your personal English teacher</Text>
          <Text style={styles.title}>
            Aprende a <Text style={styles.titleHighlight}>pensar en inglés</Text>.
          </Text>
          <Text style={styles.body}>
            Conversación real, pronunciación y comprensión auditiva, con un plan que se adapta a tu
            nivel. Estamos construyendo la plataforma: la beta privada abrirá próximamente.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del sistema</Text>
          <ApiStatus />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: Spacing.lg,
      gap: Spacing.xl,
      width: '100%',
      maxWidth: MaxContentWidth,
      alignSelf: 'center',
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    logo: {
      width: 32,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: { color: colors.onBrand, fontSize: 12, fontWeight: '700' },
    brandName: { color: colors.ink, fontSize: 16, fontWeight: '600' },
    hero: { gap: Spacing.md },
    eyebrow: {
      alignSelf: 'flex-start',
      color: colors.accent,
      backgroundColor: colors.accentSoft,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      fontSize: 13,
      fontWeight: '600',
      overflow: 'hidden',
    },
    title: { color: colors.ink, fontSize: 36, lineHeight: 42, fontWeight: '800' },
    titleHighlight: { color: colors.brand },
    body: { color: colors.inkMuted, fontSize: 16, lineHeight: 24 },
    section: { gap: Spacing.md },
    sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  });
}
