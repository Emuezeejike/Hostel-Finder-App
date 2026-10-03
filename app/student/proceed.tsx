import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../src/store/app-store';
import { fetchTransactions, updateTransactionStatus } from '../../src/api/client';

interface Transaction {
  id: string;
  propertyName: string;
  status: string;
}

function mapTransactions(records: unknown[]): Transaction[] {
  return records.flatMap((record): Transaction[] => {
    if (typeof record !== 'object' || record === null) return [];
    const item = record as Record<string, unknown>;
    const id = String(item._id ?? item.id ?? '');
    if (!id) return [];
    const property = typeof item.propertyId === 'object' && item.propertyId !== null ? item.propertyId as Record<string, unknown> : {};
    return [{ id, propertyName: String(property.title ?? item.propertyName ?? 'Accommodation'), status: String(item.status ?? 'pending').toLowerCase() }];
  });
}

export default function ProceedScreen() {
  const role = useAppStore((state) => state.authUser?.role ?? 'student');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    try {
      const records = await fetchTransactions(role === 'provider' ? 'provider' : 'student');
      setTransactions(mapTransactions(records));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    let mounted = true;
    void fetchTransactions(role === 'provider' ? 'provider' : 'student').then((records) => {
      if (mounted) setTransactions(mapTransactions(records));
    }).catch((reason: unknown) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load transactions.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [role]);

  const setStatus = async (id: string, status: string) => {
    try {
      await updateTransactionStatus(id, status);
      await loadTransactions();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update transaction status.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.status}>{role === 'provider' ? 'Transactions for your properties' : 'Your accommodation transactions'}</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {isLoading ? <Text style={styles.detail}>Loading transactions...</Text> : null}
      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.card}>
          <Text style={styles.property}>{transaction.propertyName}</Text>
          <Text style={styles.detail}>Status: {transaction.status}</Text>
          <View style={styles.actions}>
            {transaction.status === 'pending' && <Pressable style={styles.action} onPress={() => void setStatus(transaction.id, 'in_progress')}><Text style={styles.actionText}>Start</Text></Pressable>}
            {transaction.status === 'in_progress' && <Pressable style={styles.action} onPress={() => void setStatus(transaction.id, 'completed')}><Text style={styles.actionText}>Complete</Text></Pressable>}
            {['pending', 'in_progress'].includes(transaction.status) && <Pressable style={styles.cancelAction} onPress={() => void setStatus(transaction.id, 'cancelled')}><Text style={styles.cancelText}>Cancel</Text></Pressable>}
          </View>
        </View>
      ))}
      {!isLoading && transactions.length === 0 && !error ? <Text style={styles.detail}>No transactions found.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  status: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginTop: 12 },
  property: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  detail: { color: '#64748B', fontSize: 13, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  action: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#0F172A' },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  cancelAction: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#A33B45' },
  cancelText: { color: '#A33B45', fontSize: 12, fontWeight: '600' },
  error: { color: '#A33B45', fontSize: 12, marginTop: 10 },
});
