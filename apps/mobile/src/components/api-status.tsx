import { ApiClientError } from '@aei/api-client';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { apiBaseUrl, apiClient } from '@/lib/api';

/** Verifica en tiempo real la conexión con la API (GET /api/v1/health). */
export function ApiStatus() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const query = useQuery({ queryKey: ['health'], queryFn: () => apiClient.health.check() });

  let tone: { dot: string; panel: string; title: string; detail: string };
  if (query.isPending) {
    tone = {
      dot: colors.inkMuted,
      panel: colors.surfaceMuted,
      title: 'Verificando conexión…',
      detail: apiBaseUrl,
    };
  } else if (query.isError) {
    tone = {
      dot: colors.danger,
      panel: colors.dangerSoft,
      title: 'Sin conexión con la API',
      detail: describeError(query.error),
    };
  } else if (query.data.status === 'ok') {
    tone = {
      dot: colors.success,
      panel: colors.successSoft,
      title: 'Conectado a la API',
      detail: `Versión ${query.data.version} · base de datos disponible`,
    };
  } else {
    tone = {
      dot: colors.warning,
      panel: colors.warningSoft,
      title: 'Servicio degradado',
      detail: 'La API responde, pero la base de datos no está disponible.',
    };
  }

  return (
    <View style={[styles.card, { backgroundColor: tone.panel }]} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        {query.isFetching ? (
          <ActivityIndicator size="small" color={colors.inkMuted} />
        ) : (
          <View style={[styles.dot, { backgroundColor: tone.dot }]} />
        )}
        <Text style={styles.title}>{tone.title}</Text>
      </View>
      <Text style={styles.detail}>{tone.detail}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void query.refetch()}
        disabled={query.isFetching}
        style={({ pressed }) => [
          styles.button,
          (pressed || query.isFetching) && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Verificar de nuevo</Text>
      </Pressable>
    </View>
  );
}

function describeError(error: Error): string {
  if (!(error instanceof ApiClientError)) return 'Error inesperado.';
  switch (error.kind) {
    case 'timeout':
      return 'La API tardó demasiado en responder.';
    case 'network':
      return `No se pudo contactar ${apiBaseUrl}. ¿Está corriendo la API y la URL es accesible desde este dispositivo?`;
    case 'http':
      return `La API respondió con HTTP ${error.status ?? '?'}.`;
    case 'invalid_response':
      return 'La API respondió con un formato inesperado.';
  }
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    dot: { width: 10, height: 10, borderRadius: Radius.full },
    title: { color: colors.ink, fontSize: 16, fontWeight: '600' },
    detail: { color: colors.inkMuted, fontSize: 14, lineHeight: 20 },
    button: {
      alignSelf: 'flex-start',
      marginTop: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    buttonPressed: { opacity: 0.6 },
    buttonText: { color: colors.ink, fontSize: 14, fontWeight: '500' },
  });
}
