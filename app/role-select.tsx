import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../src/theme/colors';

const roleCards = [
  {
    role: 'student',
    title: 'Student',
    description: 'Browse listings, request inspections, and track your bookings.',
    accent: colors.primary,
  },
  {
    role: 'provider',
    title: 'Provider',
    description: 'Create an account, sign in, and add your property.',
    accent: colors.primary,
  },
  {
    role: 'admin',
    title: 'Admin',
    description: 'Approve landlords, review student feedback, manage listings, and confirm inspections.',
    accent: colors.primary,
  },
] as const;

export default function RoleSelectionScreen() {
  const palette = {
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    muted: colors.muted,
    border: colors.border,
    primary: colors.primary,
    soft: colors.soft,
  };

  const handleRoleSelect = (role: 'student' | 'provider' | 'admin') => {
    router.push({ pathname: '/auth/login', params: { role } });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.eyebrow, { color: palette.primary }]}>OFF-CAMPUS</Text>
      <Text style={[styles.title, { color: palette.text }]}>Choose your role</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>Choose the account type you want to sign in with.</Text>

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
    paddingTop: 24,
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
