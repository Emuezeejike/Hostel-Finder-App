import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/app-store';
import { fetchMyInspections } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

export default function InspectionsScreen() {
  const user = useAppStore((state) => state.authUser);
  const requests = useAppStore((state) => state.inspectionRequests);
  const setInspectionRequests = useAppStore((state) => state.setInspectionRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    void fetchMyInspections().then(setInspectionRequests).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'Unable to load inspections.')).finally(() => setIsLoading(false));
  }, [setInspectionRequests, user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={46} color={colors.primary} />
          <Text style={styles.title}>Inspection requests</Text>
          <Text style={styles.subtitle}>Sign in to manage your inspection bookings and provider updates.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/auth/login')}>
            <Text style={styles.buttonText}>Log In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>My Inspections</Text>
      <Text style={styles.intro}>Track your property visits and provider updates.</Text>
      {loadError ? <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text> : null}
      {isLoading ? <Text style={styles.intro}>Loading your inspections...</Text> : null}
      {requests.length ? requests.map((request) => (
        <Pressable key={request.id} style={styles.card} onPress={() => router.push('/inspection/status')}>
          <View style={styles.requestHeader}>
            <View style={styles.calendarIcon}><Ionicons name="calendar-outline" size={20} color="#fff" /></View>
            <Text style={styles.status}>{request.status}</Text>
          </View>
          <Text style={styles.title}>{request.propertyName}</Text>
          <Text style={styles.subtitle}>{request.requestedDate} · {request.requestedTime}</Text>
          {request.providerResponse ? <Text style={styles.response}>{request.providerResponse}</Text> : null}
        </Pressable>
      )) : (
        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={46} color={colors.primary} />
          <Text style={styles.title}>No inspections yet</Text>
          <Text style={styles.subtitle}>Choose a verified hostel and book a time to visit.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.buttonText}>Find a hostel</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 26,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    marginTop: 12,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  intro: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  error: { color: '#A33B45', fontSize: 12, marginTop: 10 },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    color: colors.primary,
    backgroundColor: colors.soft,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '600',
  },
  response: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 13,
  },
  button: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
