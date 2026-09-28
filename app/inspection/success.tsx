import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

export default function InspectionSuccessScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
      <Text style={styles.title}>Inspection request sent</Text>
      <Text style={styles.subtitle}>Status: Pending provider response</Text>

      <Pressable style={styles.button} onPress={() => router.replace('/(tabs)/inspections')}>
        <Text style={styles.buttonText}>View inspection status</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 26,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
