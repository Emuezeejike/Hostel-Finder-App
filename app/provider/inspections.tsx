import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

const requests = [
  {
    id: '1',
    studentName: 'Ada Okafor',
    property: 'Emerald Student Lodge',
    date: 'Saturday, 28 September 2026',
    time: '2:00 PM',
    message: 'I would like to inspect this property.',
  },
];

export default function ProviderInspectionsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inspection requests</Text>

      {requests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.student}>{request.studentName}</Text>
          <Text style={styles.info}>Property: {request.property}</Text>
          <Text style={styles.info}>Date: {request.date}</Text>
          <Text style={styles.info}>Time: {request.time}</Text>
          <Text style={styles.info}>Message: {request.message}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.confirmButton}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
            <Pressable style={styles.declineButton}>
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  student: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  info: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  declineText: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
