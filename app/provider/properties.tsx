import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { mockProperties } from '../../src/data/properties';
import { StatusBadge } from '../../src/components/StatusBadge';

export default function ProviderPropertiesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My properties</Text>

      {mockProperties.map((property) => (
        <View key={property.id} style={styles.card}>
          <Text style={styles.name}>{property.title}</Text>
          <Text style={styles.meta}>{property.location.address}</Text>
          <Text style={styles.meta}>₦{property.price.toLocaleString()} / year</Text>
          <StatusBadge label={property.verificationStatus} tone="success" />
          <Pressable style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
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
  editButton: {
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 12,
  },
  editButtonText: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
