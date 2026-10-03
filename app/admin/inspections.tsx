import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAdminInspections, updateAdminInspection } from '../../src/api/client';
import { InspectionRequest } from '../../src/types';
import { colors } from '../../src/theme/colors';

export default function AdminInspectionsScreen() {
  const [inspections, setInspections] = useState<InspectionRequest[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      fetchAdminInspections('pending'),
      fetchAdminInspections('confirmed'),
      fetchAdminInspections('rejected'),
    ]).then(([pending, confirmed, rejected]) => {
      if (mounted) setInspections([...new Map([...pending, ...confirmed, ...rejected].map((inspection) => [inspection.id, inspection])).values()]);
    }).catch((reason: unknown) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load inspections.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const setBookingStatus = async (inspection: InspectionRequest, status: 'confirmed' | 'rejected') => {
    setUpdatingId(inspection.id);
    setError('');
    try {
      await updateAdminInspection(inspection.id, status);
      const [pending, confirmed, rejected] = await Promise.all([
        fetchAdminInspections('pending'),
        fetchAdminInspections('confirmed'),
        fetchAdminInspections('rejected'),
      ]);
      setInspections([...new Map([...pending, ...confirmed, ...rejected].map((item) => [item.id, item])).values()]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update this booking.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>BOOKINGS</Text>
      <Text style={styles.title}>Inspection bookings</Text>
      <Text style={styles.subtitle}>Review student requests and confirm or reject their requested appointment time.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {isLoading ? <Text style={styles.muted}>Loading inspections...</Text> : null}
      {inspections.map((inspection) => <View key={inspection.id} style={styles.row}>
        <View style={styles.rowHeader}><Text style={styles.property} numberOfLines={1}>{inspection.propertyName}</Text><Text style={[styles.status, inspection.status === 'Confirmed' && styles.confirmed]}>{inspection.status}</Text></View>
        <Text style={styles.muted}>{inspection.requestedDate} · {inspection.requestedTime}</Text>
        {inspection.status === 'Pending' ? <View style={styles.actions}>
          <Pressable accessibilityRole="button" disabled={updatingId === inspection.id} onPress={() => void setBookingStatus(inspection, 'confirmed')} style={[styles.confirmButton, updatingId === inspection.id && styles.disabledButton]}><Ionicons name="checkmark-circle-outline" size={17} color="#FFFFFF" /><Text style={styles.confirmText}>{updatingId === inspection.id ? 'Updating...' : 'Confirm'}</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={updatingId === inspection.id} onPress={() => void setBookingStatus(inspection, 'rejected')} style={[styles.rejectButton, updatingId === inspection.id && styles.disabledButton]}><Ionicons name="close-circle-outline" size={17} color="#A33B45" /><Text style={styles.rejectText}>Reject</Text></Pressable>
        </View> : null}
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
  actions: { flexDirection: 'row', gap: 8, marginTop: 3 },
  confirmButton: { minHeight: 39, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 12, marginTop: 3 },
  confirmText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  rejectButton: { minHeight: 39, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#A33B45', borderRadius: 6, paddingHorizontal: 12, marginTop: 3 },
  rejectText: { color: '#A33B45', fontSize: 12, fontWeight: '700' },
  disabledButton: { opacity: 0.55 },
  error: { color: '#A33B45', fontSize: 12, marginTop: 8 },
});
