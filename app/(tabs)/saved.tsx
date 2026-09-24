import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/app-store';

export default function SavedScreen() {
  const user = useAppStore((state) => state.authUser);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="bookmark-outline" size={46} color="#0F172A" />
          <Text style={styles.title}>Saved properties</Text>
          <Text style={styles.subtitle}>Save properties you like and find them quickly later.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/auth/login')}>
            <Text style={styles.buttonText}>Log In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="bookmark-outline" size={46} color="#94A3B8" />
        <Text style={styles.title}>No saved properties</Text>
        <Text style={styles.subtitle}>Your favourite listings will appear here once you save them.</Text>
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    marginTop: 12,
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
