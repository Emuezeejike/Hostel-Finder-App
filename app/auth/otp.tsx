import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { fetchCurrentAccount, resendStudentOtp, sendStudentOtp, verifyStudentOtp } from '../../src/api/client';
import { useAppStore } from '../../src/store/app-store';

export default function OtpScreen() {
  const params = useLocalSearchParams<{ email?: string; role?: string }>();
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const login = useAppStore((state) => state.login);

  const sendCode = async (resend = false) => {
    setIsSending(true);
    setMessage('');
    try {
      if (resend) await resendStudentOtp();
      else await sendStudentOtp();
      setSent(true);
      setMessage(resend ? 'A new code was requested.' : 'A verification code was requested.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to request a code.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setMessage('Enter the six-digit code from your email.');
      return;
    }
    setIsVerifying(true);
    setMessage('');
    try {
      await verifyStudentOtp(code);
      const account = await fetchCurrentAccount();
      const role = params.role === 'provider' || params.role === 'student' ? params.role : account.role;
      const verifiedAccount = { ...account, role };
      login(verifiedAccount);
      router.replace(role === 'provider' ? '/provider/add-property' : '/(tabs)');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to verify this code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <BrandLogo compact style={styles.brand} />
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>{params.email ? `Enter the six-digit code sent to ${params.email}.` : 'Enter the six-digit code sent to your email.'}</Text>
      <TextInput
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.codeInput}
      />
      <Pressable style={styles.primaryButton} onPress={verifyCode} disabled={isVerifying}>
        <Text style={styles.primaryButtonText}>{isVerifying ? 'Verifying...' : 'Verify code'}</Text>
      </Pressable>
      <View style={styles.secondaryActions}>
        <Pressable onPress={() => void sendCode()} disabled={isSending}>
          <Text style={styles.link}>{isSending ? 'Requesting...' : sent ? 'Send another code' : 'Send verification code'}</Text>
        </Pressable>
        {sent && <Pressable onPress={() => void sendCode(true)} disabled={isSending}><Text style={styles.link}>Resend code</Text></Pressable>}
      </View>
      {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28 },
  brand: { alignSelf: 'center', marginBottom: 34 },
  title: { color: colors.text, fontSize: 27, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  codeInput: { height: 58, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginTop: 28, paddingHorizontal: 16, color: colors.text, fontSize: 24, letterSpacing: 5, textAlign: 'center' },
  primaryButton: { height: 52, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  message: { color: '#A33B45', fontSize: 13, marginTop: 16 },
});
