import React from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

const destinations = [
  { route: 'dashboard', label: 'Home', icon: 'grid-outline' },
  { route: 'approvals', label: 'Approve', icon: 'shield-checkmark-outline' },
  { route: 'reviews', label: 'Reviews', icon: 'star-outline' },
  { route: 'properties', label: 'Records', icon: 'trash-outline' },
  { route: 'inspections', label: 'Bookings', icon: 'calendar-outline' },
] as const;

export default function AdminLayout() {
  const segments = useSegments();
  const routeName = segments.join('/').split('/').pop() ?? 'dashboard';
  const activeRoute = routeName === 'review' ? 'approvals' : routeName;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
        <View style={styles.bar}>
          {destinations.map((destination) => {
            const active = activeRoute === destination.route;
            return (
              <Pressable key={destination.route} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => router.replace(`/admin/${destination.route}`)} style={styles.item}>
                <Ionicons name={destination.icon} size={19} color={active ? colors.primary : colors.muted} />
                <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>{destination.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 60, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border },
  item: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  activeLabel: { color: colors.primary },
});
