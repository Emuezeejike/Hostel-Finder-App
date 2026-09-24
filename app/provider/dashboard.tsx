import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/app-store';

export default function ProviderDashboard() {
  const providerProperties = useAppStore((state) => state.providerProperties);
  const inspectionRequests = useAppStore((state) => state.inspectionRequests);

  const approvedCount = providerProperties.filter((property) => property.verificationStatus === 'VERIFIED').length;
  const pendingCount = providerProperties.filter((property) => property.verificationStatus === 'PENDING').length;

  const stats = [
    { label: 'Total properties', value: String(providerProperties.length), icon: 'home-outline' },
    { label: 'Approved', value: String(approvedCount), icon: 'checkmark-circle-outline' },
    { label: 'Pending', value: String(pendingCount), icon: 'time-outline' },
    { label: 'Inspection requests', value: String(inspectionRequests.length), icon: 'calendar-outline' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Provider dashboard</Text>

      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={20} color="#0F172A" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => router.push('/provider/add-property')}>
          <Text style={styles.actionText}>Add Property</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => router.push('/provider/properties')}>
          <Text style={styles.actionText}>My Properties</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => router.push('/provider/inspections')}>
          <Text style={styles.actionText}>Inspection Requests</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => router.push('/provider/profile')}>
          <Text style={styles.actionText}>Profile</Text>
        </Pressable>
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  statLabel: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    marginTop: 22,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
