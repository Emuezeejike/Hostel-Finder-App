import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

const steps = [
  'Inspection completed',
  'Property accepted',
  'Proceeding',
  'Provider confirmation',
  'Completed',
];

export default function ProceedScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Proceed / transaction status</Text>
      <Text style={styles.status}>Current status: Provider Confirmation</Text>

      {steps.map((step, index) => (
        <View key={step} style={styles.stepRow}>
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
            {index < steps.length - 1 && <View style={styles.connector} />}
          </View>
          <Text style={styles.stepText}>{step}</Text>
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
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 22,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 14,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
  },
  connector: {
    width: 2,
    height: 26,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  stepText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
});
