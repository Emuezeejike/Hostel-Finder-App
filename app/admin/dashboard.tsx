import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/app-store';

export default function AdminDashboard() {
  const adminApprovals = useAppStore((state) => state.adminApprovals);
  const reports = useAppStore((state) => state.reports);
  const adminUsers = useAppStore((state) => state.adminUsers);

  const stats = [
    { label: 'Pending approvals', value: String(adminApprovals.length), icon: 'shield-checkmark-outline' },
    { label: 'Open reports', value: String(reports.length), icon: 'alert-circle-outline' },
    { label: 'Active students', value: String(adminUsers.filter((user) => user.role === 'Student').length), icon: 'people-outline' },
    { label: 'Verified providers', value: `${String(Math.round((adminUsers.filter((user) => user.role === 'Provider' && user.status === 'Verified').length / Math.max(adminUsers.filter((user) => user.role === 'Provider').length, 1)) * 100))}%`, icon: 'checkmark-circle-outline' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin dashboard</Text>

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
        <Pressable style={styles.actionButton} onPress={() => router.push('/admin/approvals')}>
          <Text style={styles.actionText}>Approvals</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => router.push('/admin/reports')}>
          <Text style={styles.actionText}>Reports</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => router.push('/admin/users')}>
          <Text style={styles.actionText}>Users</Text>
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
    marginTop: 10,
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
