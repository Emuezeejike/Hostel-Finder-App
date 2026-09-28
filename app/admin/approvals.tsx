import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

const pendingApprovals = [
  { name: 'Urban Nest Homes', type: 'Provider', status: 'Awaiting documents' },
  { name: 'Fresh Lodge', type: 'Provider', status: 'Reviewing compliance' },
  { name: 'Yabatech Residency', type: 'Listing', status: 'Pending verification' },
];

export default function AdminApprovalsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Approval queue</Text>

      {pendingApprovals.map((item, index) => (
        <View key={`${item.name}-${index}`} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.type}</Text>
          <Text style={styles.meta}>{item.status}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryText}>Approve</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Reject</Text>
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
    paddingTop: 24,
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
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  meta: {
    color: '#475569',
    marginTop: 6,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
