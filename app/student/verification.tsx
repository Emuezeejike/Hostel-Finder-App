import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/app-store';
import { sendStudentOtp } from '../../src/api/client';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';

export default function StudentVerificationScreen() {
  const verificationStatus = useAppStore((state) => state.studentVerificationStatus);
  const user = useAppStore((state) => state.authUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      await sendStudentOtp();
      router.push({ pathname: '/auth/otp', params: { email: user.email, role: user.role } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to request an email code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.navbar}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <BrandLogo compact />
        <Pressable accessibilityLabel="Help" onPress={() => Alert.alert('Student support', 'Contact Hostel Finder support for help with verification.')} style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={23} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.title}>Verify Your Student Status</Text>
        <Text style={styles.subtitle}>Join &amp; Find Your Ideal Hostel</Text>
        <Text style={styles.status}>Current status: {verificationStatus.toLowerCase()}</Text>

        <Text style={styles.label}>Account email</Text>
        <Text style={styles.accountEmail}>{user?.email ?? 'Sign in to verify your account email.'}</Text>
        <Text style={styles.note}>The available API verifies this email with an OTP. It does not currently provide a route to submit a matriculation number for academic verification.</Text>

        {formError ? <Text accessibilityRole="alert" style={styles.errorText}>{formError}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Requesting code...' : 'Send Verification Email'}</Text>
        </Pressable>
        <View style={styles.noteRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text} />
          <Text style={styles.otpHint}>OTP code will be sent to your account email.</Text>
        </View>
      </View>

      <Text style={styles.support}>Having trouble? <Text style={styles.supportLink}>Contact Support</Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 28 },
  navbar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 42 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  helpButton: { width: 34, alignItems: 'flex-end' },
  formCard: { backgroundColor: colors.surface, borderRadius: 9, paddingHorizontal: 22, paddingVertical: 20, elevation: 4, shadowColor: '#34254F', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  title: { color: colors.text, textAlign: 'center', fontSize: 22, fontWeight: '600' },
  subtitle: { color: colors.text, textAlign: 'center', fontSize: 14, marginTop: 4, marginBottom: 18 },
  status: { color: colors.muted, fontSize: 11, textAlign: 'right', marginBottom: 6 },
  label: { color: colors.text, fontSize: 13, fontWeight: '500', marginTop: 8, marginBottom: 7 },
  accountEmail: { color: colors.text, fontSize: 14, paddingVertical: 9 },
  errorText: { color: '#A33B45', fontSize: 12, marginBottom: 8 },
  primaryButton: { height: 52, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 3 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  noteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 14 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 14 },
  otpHint: { color: colors.text, fontSize: 12 },
  support: { color: colors.text, textAlign: 'center', marginTop: 18, fontSize: 13 },
  supportLink: { color: colors.primary, fontWeight: '600' },
});
