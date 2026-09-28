import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const reports = [
  { title: 'Misleading listing', detail: 'Location mismatch reported by student' },
  { title: 'Unsafe environment', detail: 'Shared concern about gate access and lighting' },
  { title: 'Payment issue', detail: 'Provider requested extra charges not disclosed upfront' },
];

export default function AdminReportsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reports</Text>

      {reports.map((item, index) => (
        <View key={`${item.title}-${index}`} style={styles.card}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.detail}>{item.detail}</Text>
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
  detail: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
  },
});
