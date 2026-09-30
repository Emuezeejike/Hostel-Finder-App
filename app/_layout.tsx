import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fetchProperties, fetchSchools } from '../src/api/client';
import { useAppStore } from '../src/store/app-store';

export default function RootLayout() {
  const setProperties = useAppStore((state) => state.setProperties);
  const setSchools = useAppStore((state) => state.setSchools);

  useEffect(() => {
    void fetchProperties().then(setProperties).catch(() => undefined);
    void fetchSchools().then(setSchools).catch(() => undefined);
  }, [setProperties, setSchools]);

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
