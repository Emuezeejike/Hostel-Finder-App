import React, { useEffect, useState } from 'react';
import { Alert, Pressable, View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/app-store';
import { cancelInspection, decideInspection, fetchMyInspections } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

export default function InspectionStatusScreen() {
  const requests = useAppStore((state) => state.inspectionRequests);
  const setInspectionRequests = useAppStore((state) => state.setInspectionRequests);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchMyInspections().then(setInspectionRequests).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load inspections.'));
  }, [setInspectionRequests]);

  const cancel = (id: string) => Alert.alert('Cancel inspection?', 'The server will release the selected slot.', [
    { text: 'Keep booking', style: 'cancel' },
    { text: 'Cancel booking', style: 'destructive', onPress: () => {
      void cancelInspection(id).then(async () => setInspectionRequests(await fetchMyInspections())).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to cancel this booking.'));
    } },
  ]);

  const decide = async (id: string, decision: 'accepted' | 'rejected') => {
    try {
      await decideInspection(id, decision, decision === 'rejected' ? 'Student declined the property.' : undefined);
      setInspectionRequests(await fetchMyInspections());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit your decision.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inspection status</Text>
      {error ? <Text accessibilityRole="alert" style={styles.info}>{error}</Text> : null}

      {requests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.property}>{request.propertyName}</Text>
          <Text style={styles.info}>Date: {request.requestedDate}</Text>
          <Text style={styles.info}>Time: {request.requestedTime}</Text>
          <Text style={styles.info}>Provider response: {request.providerResponse}</Text>
          <Text style={styles.info}>Current status: {request.status}</Text>
          {request.status === 'Completed' && !request.accepted && <View style={styles.decisionActions}><Pressable style={styles.acceptButton} onPress={() => void decide(request.id, 'accepted')}><Text style={styles.acceptText}>Accept property</Text></Pressable><Pressable style={styles.rejectButton} onPress={() => void decide(request.id, 'rejected')}><Text style={styles.rejectText}>Reject property</Text></Pressable></View>}
          {!['Completed', 'Cancelled', 'Declined'].includes(request.status) && <Pressable style={styles.cancelButton} onPress={() => cancel(request.id)}><Ionicons name="close-circle-outline" size={17} color="#A33B45" /><Text style={styles.cancelText}>Cancel inspection</Text></Pressable>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  property: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 10,
  },
  info: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 6,
  },
  cancelButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  cancelText: { color: '#A33B45', fontSize: 13, fontWeight: '600' },
  decisionActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 8, backgroundColor: colors.primary },
  acceptText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  rejectButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 8, borderWidth: 1, borderColor: '#A33B45' },
  rejectText: { color: '#A33B45', fontSize: 12, fontWeight: '600' },
});
