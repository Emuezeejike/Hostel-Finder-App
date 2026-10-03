import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAdminInspections, updateInspection } from '../../src/api/client';
import { InspectionRequest } from '../../src/types';
import { colors } from '../../src/theme/colors';

export default function AdminInspectionsScreen() {
  const [inspections, setInspections] = useState<InspectionRequest[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState('');

  useEffect(() => {
    let mounted = true;
    void Promise.all([fetchAdminInspections('pending'), fetchAdminInspections('confirmed')]).then(([pending, confirmed]) => {
      if (mounted) setInspections([...pending, ...confirmed]);
    }).catch((reason: unknown) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load inspections.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const confirmBooking = async (inspection: InspectionRequest) => {
    if (!inspection.scheduledAt) {
      setError('This booking is missing its original scheduled time and cannot be confirmed.');
      return;
    }
    setConfirmingId(inspection.id);
    setError('');
    try {
      await updateInspection(inspection.id, 'schedule', { scheduledAt: inspection.scheduledAt });
      setInspections((current) => current.map((item) => item.id === inspection.id ? { ...item, status: 'Confirmed' } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to confirm this booking.');
    } finally {
      setConfirmingId('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>BOOKINGS</Text>
      <Text style={styles.title}>Inspection bookings</Text>
      <Text style={styles.subtitle}>Review student requests and confirm the selected appointment time.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {isLoading ? <Text style={styles.muted}>Loading inspections...</Text> : null}
      {inspections.map((inspection) => <View key={inspection.id} style={styles.row}>
        <View style={styles.rowHeader}><Text style={styles.property} numberOfLines={1}>{inspection.propertyName}</Text><Text style={[styles.status, inspection.status === 'Confirmed' && styles.confirmed]}>{inspection.status}</Text></View>
        <Text style={styles.muted}>{inspection.requestedDate} · {inspection.requestedTime}</Text>
        {inspection.status === 'Pending' ? <Pressable accessibilityRole="button" disabled={confirmingId === inspection.id || !inspection.scheduledAt} onPress={() => void confirmBooking(inspection)} style={[styles.confirmButton, (!inspection.scheduledAt || confirmingId === inspection.id) && styles.disabledButton]}><Ionicons name="checkmark-circle-outline" size={17} color="#FFFFFF" /><Text style={styles.confirmText}>{confirmingId === inspection.id ? 'Confirming...' : 'Confirm booking'}</Text></Pressable> : null}
      </View>)}
      {!isLoading && inspections.length === 0 && !error ? <Text style={styles.muted}>No student inspection bookings found.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 20, paddingTop: 24, paddingBottom: 30 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 7 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 16 },
  row: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, marginBottom: 10, gap: 7 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  property: { color: colors.text, fontSize: 15, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: 12 },
  status: { color: '#9B5900', fontSize: 11, fontWeight: '700' },
  confirmed: { color: '#287647' },
  confirmButton: { minHeight: 39, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 12, marginTop: 3 },
  confirmText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  disabledButton: { opacity: 0.55 },
  error: { color: '#A33B45', fontSize: 12, marginTop: 8 },
});
