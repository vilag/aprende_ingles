import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Un QueryClient por instancia de la app (no global) para evitar estado compartido en pruebas.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  );

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
