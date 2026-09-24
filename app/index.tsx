import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>OFF-CAMPUS</Text>
      <Text style={styles.logo}>HOSTEL FINDER</Text>
      <ActivityIndicator size="small" color="#0F172A" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#0F172A',
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  logo: {
    marginTop: 8,
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '800',
  },
  loader: {
    marginTop: 18,
  },
});
