import React from 'react';
import { Stack, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { MainBottomBar } from '../../src/components/MainBottomBar';
import { colors } from '../../src/theme/colors';

export default function AdminLayout() {
  const segments = useSegments();
  const activeTab = segments.join('/') === 'admin/dashboard' ? 'home' : 'search';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
        <MainBottomBar active={activeTab} bookLabel="Inspection" />
      </SafeAreaView>
    </View>
  );
}
