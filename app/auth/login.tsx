import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const login = useAppStore((state) => state.login);

  const selectedRole = (params.role as 'student' | 'provider' | 'admin') || 'student';

  const demoAccounts = {
    student: { email: 'student@example.com', password: 'password123', name: 'Ada Okafor', role: 'student' },
    provider: { email: 'provider@example.com', password: 'password123', name: 'Olivia Homes', role: 'provider' },
    admin: { email: 'admin@example.com', password: 'password123', name: 'System Admin', role: 'admin' },
  } as const;
  const email = emailInput ?? (params.role ? demoAccounts[selectedRole].email : '');
  const password = passwordInput ?? (params.role ? demoAccounts[selectedRole].password : '');

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
    <ScrollView style={styles.page} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <BrandLogo compact style={styles.brand} />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Start Your Hostel Search</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="name@gmail.com"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmailInput}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordField}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPasswordInput}
            secureTextEntry={!passwordVisible}
          />
          <Pressable accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'} onPress={() => setPasswordVisible(!passwordVisible)} hitSlop={10}>
            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} />
          </Pressable>
        </View>
        <Pressable style={styles.forgotButton} onPress={() => Alert.alert('Forgot password?', 'Contact support to reset your password.')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Log In</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialRow}>
        <Pressable accessibilityLabel="Continue with Apple" style={styles.socialButton} onPress={() => Alert.alert('Apple sign-in', 'Social sign-in is not connected in this demo.')}>
          <Ionicons name="logo-apple" size={30} color="#08070B" />
        </Pressable>
        <Pressable accessibilityLabel="Continue with Google" style={styles.socialButton} onPress={() => Alert.alert('Google sign-in', 'Social sign-in is not connected in this demo.')}>
          <Ionicons name="logo-google" size={28} color="#4285F4" />
        </Pressable>
      </View>
      <Text style={styles.footerText}>Don&apos;t have an account? <Text style={styles.linkText} onPress={() => router.push('/auth/register')}>Sign Up</Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brand: {
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 4,
  },
  form: {
    marginTop: 36,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  passwordField: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 16,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 26,
  },
  divider: {
    height: 1,
    flex: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.muted,
    fontSize: 11,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginTop: 28,
  },
  socialButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 'auto',
    fontSize: 13,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
