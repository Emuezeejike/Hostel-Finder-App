import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const users = [
  { name: 'Ada Okafor', role: 'Student', status: 'Active' },
  { name: 'Olivia Homes', role: 'Provider', status: 'Verified' },
  { name: 'System Admin', role: 'Admin', status: 'Online' },
];

export default function AdminUsersScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Users</Text>

      {users.map((user, index) => (
        <View key={`${user.name}-${index}`} style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>{user.role}</Text>
          <Text style={styles.meta}>{user.status}</Text>
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
});
