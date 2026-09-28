import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState('');
  const login = useAppStore((state) => state.login);

  const handleSubmit = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword || !termsAccepted) {
      setFormError('Complete all fields and accept the terms to continue.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Your passwords do not match.');
      return;
    }
    setFormError('');

    login({
      id: 'student-register-1',
      name: fullName,
      email,
      role: 'student',
    });

    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <BrandLogo compact style={styles.brand} />
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Join &amp; Find Your Ideal Hostel</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} placeholder="Chinedu Okafor" placeholderTextColor={colors.muted} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="name@gmail.com"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} placeholder="+234 816 277 2324" placeholderTextColor={colors.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordField}>
        <TextInput style={styles.passwordInput} placeholder="At least 8 characters" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} />
        <Pressable accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'} onPress={() => setPasswordVisible(!passwordVisible)} hitSlop={10}>
          <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} />
        </Pressable>
      </View>

      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordField}>
        <TextInput style={styles.passwordInput} placeholder="Repeat your password" placeholderTextColor={colors.muted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!confirmVisible} />
        <Pressable accessibilityLabel={confirmVisible ? 'Hide confirmation password' : 'Show confirmation password'} onPress={() => setConfirmVisible(!confirmVisible)} hitSlop={10}>
          <Ionicons name={confirmVisible ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} />
        </Pressable>
      </View>

      <Pressable style={styles.termsRow} onPress={() => setTermsAccepted(!termsAccepted)} accessibilityRole="checkbox" accessibilityState={{ checked: termsAccepted }}>
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
          {termsAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.termsText}>I agree to the <Text style={styles.linkText}>Terms &amp; Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text></Text>
      </Pressable>

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Create Account</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialRow}>
        <Pressable accessibilityLabel="Continue with Apple" style={styles.socialButton} onPress={() => Alert.alert('Apple sign-in', 'Social sign-in is not connected in this demo.')}>
          <Ionicons name="logo-apple" size={29} color="#08070B" />
        </Pressable>
        <Pressable accessibilityLabel="Continue with Google" style={styles.socialButton} onPress={() => Alert.alert('Google sign-in', 'Social sign-in is not connected in this demo.')}>
          <Ionicons name="logo-google" size={27} color="#4285F4" />
        </Pressable>
      </View>

      <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText} onPress={() => router.push('/auth/login')}>Log in</Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  brand: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 29,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.text,
    fontSize: 15,
    marginTop: 3,
    marginBottom: 20,
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
    marginBottom: 7,
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
    marginBottom: 7,
  },
  passwordInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  termsText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: '#A33B45',
    fontSize: 12,
    marginBottom: 5,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
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
    marginTop: 18,
  },
  divider: {
    height: 1,
    flex: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.text,
    fontSize: 11,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginTop: 14,
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
    marginTop: 12,
    fontSize: 13,
  },
});
