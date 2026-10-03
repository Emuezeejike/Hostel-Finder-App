import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { fetchAdminUsers } from '../../src/api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Students', value: '0' },
    { label: 'Total Landlords', value: '0' },
  ]);
  const [apiError, setApiError] = useState('');
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    void Promise.all([
      fetchAdminUsers({ role: 'student' }),
      fetchAdminUsers({ role: 'provider' }),
    ]).then(([students, landlords]) => {
      setStats([
        { label: 'Total Students', value: String(students.length) },
        { label: 'Total Landlords', value: String(landlords.length) },
      ]);
      setApiError('');
    }).catch((error: unknown) => setApiError(error instanceof Error ? error.message : 'Unable to load admin dashboard data.'));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.brandRow}><BrandLogo compact /><Text style={styles.date}>{today}</Text></View>
      <Text style={styles.title}>Admin overview</Text>
      <Text style={styles.subtitle}>A clear view of students, landlords and platform activity.</Text>

      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <Action icon="shield-checkmark-outline" label="Approve landlords" onPress={() => router.push('/admin/approvals')} />
        <Action icon="star-outline" label="Student reviews" onPress={() => router.push('/admin/reviews')} />
        <Action icon="trash-outline" label="Landlord records" onPress={() => router.push('/admin/properties')} />
        <Action icon="calendar-outline" label="Inspection bookings" onPress={() => router.push('/admin/inspections')} />
      </View>

      {apiError ? <Text accessibilityRole="alert" style={styles.errorText}>{apiError}</Text> : null}
    </ScrollView>
  );
}

function Action(props: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return <Pressable style={styles.actionButton} onPress={props.onPress}><View style={styles.actionIcon}><Ionicons name={props.icon} size={20} color={colors.primary} /></View><Text style={styles.actionText}>{props.label}</Text><Ionicons name="chevron-forward" size={18} color={colors.text} /></Pressable>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 36 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  date: { color: colors.muted, fontSize: 13 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '800', color: '#171426' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 23 },
  errorText: { color: '#A33B45', fontSize: 12, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 8 },
  statCard: { width: '48%', minHeight: 132, backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#271A40', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  statLabel: { color: '#494354', fontSize: 14, lineHeight: 19, fontWeight: '600' },
  statValue: { color: colors.text, fontSize: 31, fontWeight: '800', marginTop: 14 },
  trend: { color: '#178A22', fontSize: 14, fontWeight: '700', alignSelf: 'flex-end' },
  trendDown: { color: '#D82D2D' },
  sectionTitle: { color: '#383440', fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  actionButton: { width: '48%', minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 9, borderRadius: 14, backgroundColor: colors.surface, shadowColor: '#271A40', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  actionIcon: { width: 37, height: 37, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft },
  actionText: { color: '#171426', fontSize: 12, fontWeight: '600', flex: 1 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 10 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { color: colors.text, fontSize: 13 },
  activityTable: { backgroundColor: colors.surface, borderRadius: 11, overflow: 'hidden' },
  tableHeader: { minHeight: 42, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderColor: colors.border },
  tableHeading: { color: colors.text, fontSize: 12, fontWeight: '700', paddingHorizontal: 8 },
  activityRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border },
  activityText: { color: '#45414B', fontSize: 11, paddingHorizontal: 8, lineHeight: 16 },
  activityColumn: { width: '42%' },
  detailColumn: { width: '38%' },
  timeColumn: { width: '20%', textAlign: 'right' },
});
