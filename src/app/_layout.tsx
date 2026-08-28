import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/design/tokens';
import { initAuth, useAuth } from '@/lib/authStore';
import { queryClient } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { token } = useAuth();

  useEffect(() => {
    initAuth().catch(() => {});
  }, []);

  useEffect(() => {
    if (token !== undefined) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [token]);

  if (token === undefined) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="referral" options={{ headerShown: true, title: 'Giới thiệu bạn bè' }} />
            <Stack.Screen name="profile" options={{ headerShown: false, title: 'Hồ sơ' }} />
            <Stack.Screen name="guide" options={{ headerShown: false, title: 'Hướng dẫn' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
