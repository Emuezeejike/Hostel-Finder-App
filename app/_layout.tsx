import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { clearApiToken, fetchProperties, fetchSchools, restoreApiSession, setUnauthorizedHandler } from '../src/api/client';
import { useAppStore } from '../src/store/app-store';

export default function RootLayout() {
  const setProperties = useAppStore((state) => state.setProperties);
  const setSchools = useAppStore((state) => state.setSchools);
  const setApiError = useAppStore((state) => state.setApiError);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    void fetchProperties().then(setProperties).catch((error: unknown) => setApiError(error instanceof Error ? error.message : 'Unable to load properties.'));
    void fetchSchools().then(setSchools).catch((error: unknown) => setApiError(error instanceof Error ? error.message : 'Unable to load schools.'));
    void restoreApiSession().then((user) => {
      if (user) login(user);
      else logout();
    }).catch((error: unknown) => {
      void clearApiToken();
      logout();
      setApiError(error instanceof Error ? error.message : 'Unable to restore your session.');
    });
  }, [login, logout, setApiError, setProperties, setSchools]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="landing" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="schools" />
          <Stack.Screen name="property/[id]" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
