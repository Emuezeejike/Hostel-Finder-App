import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { fetchAdminReports, updateAdminReport } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

interface AdminReport {
  id: string;
  reason: string;
  status: string;
  propertyId: string;
}

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      const records = await fetchAdminReports('open');
      setReports(records.flatMap((record): AdminReport[] => {
        if (typeof record !== 'object' || record === null) return [];
        const item = record as Record<string, unknown>;
        const id = String(item._id ?? item.id ?? '');
        if (!id) return [];
        const property = typeof item.propertyId === 'object' && item.propertyId !== null ? item.propertyId as Record<string, unknown> : {};
        return [{ id, reason: String(item.reason ?? 'Report'), status: String(item.status ?? 'open'), propertyId: String(property._id ?? property.id ?? item.propertyId ?? '') }];
      }));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void fetchAdminReports('open').then((records) => {
      if (!mounted) return;
      setReports(records.flatMap((record): AdminReport[] => {
        if (typeof record !== 'object' || record === null) return [];
        const item = record as Record<string, unknown>;
        const id = String(item._id ?? item.id ?? '');
        if (!id) return [];
        const property = typeof item.propertyId === 'object' && item.propertyId !== null ? item.propertyId as Record<string, unknown> : {};
        return [{ id, reason: String(item.reason ?? 'Report'), status: String(item.status ?? 'open'), propertyId: String(property._id ?? property.id ?? item.propertyId ?? '') }];
      }));
      setError('');
    }).catch((reason: unknown) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load reports.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (id: string, status: 'reviewed' | 'resolved') => {
    try {
      await updateAdminReport(id, status);
      await loadReports();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update this report.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reports</Text>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
      {isLoading ? <Text style={styles.detail}>Loading reports...</Text> : null}

      {reports.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.reason}</Text>
          <Text style={styles.detail}>Property ID: {item.propertyId || 'Not included'}</Text>
          <Text style={styles.detail}>Status: {item.status}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => void updateStatus(item.id, 'reviewed')} style={styles.actionButton}><Text style={styles.actionText}>Mark reviewed</Text></Pressable>
            <Pressable onPress={() => void updateStatus(item.id, 'resolved')} style={styles.actionButton}><Text style={styles.actionText}>Resolve</Text></Pressable>
          </View>
        </View>
      ))}
      {!isLoading && reports.length === 0 && !error ? <Text style={styles.detail}>No open reports.</Text> : null}
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
  detail: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
  },
  errorText: { color: '#A33B45', fontSize: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  actionText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
});
