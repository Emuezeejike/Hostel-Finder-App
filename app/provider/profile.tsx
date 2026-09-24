import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function ProviderProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Provider profile</Text>
      <Text style={styles.subtitle}>Verification status: Pending</Text>

      <Pressable style={styles.button} onPress={() => router.push('/provider/dashboard')}>
        <Text style={styles.buttonText}>Back to dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
