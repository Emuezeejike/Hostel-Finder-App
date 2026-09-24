import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/app-store';

const roleCards = [
  {
    role: 'student',
    title: 'Student',
    description: 'Browse listings, request inspections, and track your bookings.',
    accent: '#0F172A',
  },
  {
    role: 'provider',
    title: 'Provider',
    description: 'List properties, review inspection requests, and manage approvals.',
    accent: '#2563EB',
  },
  {
    role: 'admin',
    title: 'Admin',
    description: 'Review provider applications, monitor reports, and manage users.',
    accent: '#0EA5E9',
  },
] as const;

export default function RoleSelectionScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const palette = {
    background: isDark ? '#120c1d' : '#f5f3ff',
    surface: isDark ? '#1d1530' : '#ffffff',
    text: isDark ? '#f4ecff' : '#1f1636',
    muted: isDark ? '#d7c8f8' : '#5b4c7e',
    border: isDark ? '#3f2d64' : '#e9d8ff',
    primary: '#7c3aed',
    soft: isDark ? '#2d1b46' : '#ede9fe',
  };

  const handleRoleSelect = (role: 'student' | 'provider' | 'admin') => {
    router.push({ pathname: '/auth/login', params: { role } });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.eyebrow, { color: palette.primary }]}>OFF-CAMPUS</Text>
      <Text style={[styles.title, { color: palette.text }]}>Choose your role</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>Select the persona you want to demo and continue with a ready-to-use account.</Text>

      {roleCards.map((card) => (
        <Pressable
          key={card.role}
          style={[styles.card, { borderColor: card.accent, backgroundColor: palette.surface }]}
          onPress={() => handleRoleSelect(card.role)}
        >
          <View style={[styles.badge, { backgroundColor: card.accent }]}>
            <Text style={styles.badgeText}>{card.title}</Text>
          </View>
          <Text style={[styles.cardText, { color: palette.text }]}>{card.description}</Text>
          <Text style={[styles.cardHint, { color: palette.muted }]}>Tap to continue</Text>
        </Pressable>
      ))}

      <Pressable style={[styles.guestButton, { backgroundColor: palette.soft }]} onPress={() => router.replace('/(tabs)')}>
        <Text style={[styles.guestButtonText, { color: palette.text }]}>Continue as guest</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 56,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 12,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 26,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  cardHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  guestButton: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guestButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
