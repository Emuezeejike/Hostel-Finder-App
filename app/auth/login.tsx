import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAppStore((state) => state.login);
  const themeMode = useAppStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const palette = {
    background: isDark ? '#120c1d' : '#f5f3ff',
    surface: isDark ? '#1d1530' : '#ffffff',
    text: isDark ? '#f4ecff' : '#1f1636',
    muted: isDark ? '#d7c8f8' : '#5b4c7e',
    border: isDark ? '#3f2d64' : '#e9d8ff',
    primary: '#7c3aed',
    secondary: isDark ? '#2d1b46' : '#ede9fe',
  };

  const selectedRole = (params.role as 'student' | 'provider' | 'admin') || 'student';

  const demoAccounts = {
    student: { email: 'student@example.com', password: 'password123', name: 'Ada Okafor', role: 'student' },
    provider: { email: 'provider@example.com', password: 'password123', name: 'Olivia Homes', role: 'provider' },
    admin: { email: 'admin@example.com', password: 'password123', name: 'System Admin', role: 'admin' },
  } as const;

  useEffect(() => {
    if (params.role) {
      const activeDemo = demoAccounts[selectedRole];
      setEmail(activeDemo.email);
      setPassword(activeDemo.password);
    }
  }, [selectedRole, params.role]);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }

    const activeDemo = demoAccounts[selectedRole];
    const matchesDemo = email.toLowerCase() === activeDemo.email && password === activeDemo.password;

    if (!matchesDemo) {
      const alternateLookup = Object.values(demoAccounts).find(
        (account) => account.email.toLowerCase() === email.toLowerCase() || account.role === selectedRole,
      );

      if (alternateLookup) {
        login({
          id: `${alternateLookup.role}-demo`,
          name: alternateLookup.name,
          email: alternateLookup.email,
          role: alternateLookup.role,
        });

        if (alternateLookup.role === 'provider') {
          router.replace('/provider/dashboard');
          return;
        }

        if (alternateLookup.role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }

        router.replace('/(tabs)');
        return;
      }

      return;
    }

    login({
      id: `${activeDemo.role}-demo`,
      name: activeDemo.name,
      email: activeDemo.email,
      role: activeDemo.role,
    });

    if (activeDemo.role === 'provider') {
      router.replace('/provider/dashboard');
      return;
    }

    if (activeDemo.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>Sign in as a {selectedRole} to continue the demo.</Text>
      <Text style={[styles.demoNote, { color: palette.primary }]}>Demo profile: {demoAccounts[selectedRole].name}</Text>

      <TextInput
        style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
        placeholder="Email"
        placeholderTextColor={palette.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
        placeholder="Password"
        placeholderTextColor={palette.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={[styles.primaryButton, { backgroundColor: palette.primary }]} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Log In</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/auth/register')}>
        <Text style={[styles.secondaryText, { color: palette.primary }]}>Need an account? Create one</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 10,
  },
  demoNote: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#2563EB',
    fontWeight: '700',
  },
});
