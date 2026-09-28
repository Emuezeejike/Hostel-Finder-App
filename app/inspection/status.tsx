import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../../src/store/app-store';
import { colors } from '../../src/theme/colors';

export default function InspectionStatusScreen() {
  const requests = useAppStore((state) => state.inspectionRequests);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inspection status</Text>

      {requests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.property}>{request.propertyName}</Text>
          <Text style={styles.info}>Date: {request.requestedDate}</Text>
          <Text style={styles.info}>Time: {request.requestedTime}</Text>
          <Text style={styles.info}>Provider response: {request.providerResponse}</Text>
          <Text style={styles.info}>Current status: {request.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  property: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 10,
  },
  info: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 6,
  },
});
