import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendAdminTestEmail, sendSystemAnnouncement } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

export default function AdminNotificationsScreen() {
  const [recipient, setRecipient] = useState('');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const run = async (action: 'test' | 'announcement') => {
    if (action === 'test' && !recipient.trim()) {
      setError('Enter a test email recipient.');
      return;
    }
    if (action === 'announcement' && (!userId.trim() || !title.trim() || !body.trim())) {
      setError('Enter a user ID, title, and message.');
      return;
    }
    setIsSending(true);
    setError('');
    try {
      if (action === 'test') await sendAdminTestEmail(recipient.trim());
      else await sendSystemAnnouncement(userId.trim(), title.trim(), body.trim());
      Alert.alert('Sent', action === 'test' ? 'The SMTP test request succeeded.' : 'The announcement request succeeded.');
      if (action === 'announcement') {
        setTitle('');
        setBody('');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to send this notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Send test email and targeted announcements.</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SMTP test</Text>
        <TextInput value={recipient} onChangeText={setRecipient} placeholder="Recipient email" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <Pressable style={styles.button} onPress={() => void run('test')} disabled={isSending}><Text style={styles.buttonText}>{isSending ? 'Sending...' : 'Send test email'}</Text></Pressable>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Announcement</Text>
        <TextInput value={userId} onChangeText={setUserId} placeholder="Recipient user ID" autoCapitalize="none" style={styles.input} />
        <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input} />
        <TextInput value={body} onChangeText={setBody} placeholder="Message" multiline style={[styles.input, styles.bodyInput]} />
        <Pressable style={styles.button} onPress={() => void run('announcement')} disabled={isSending}><Text style={styles.buttonText}>{isSending ? 'Sending...' : 'Send announcement'}</Text></Pressable>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 20, paddingTop: 14, paddingBottom: 32 },
  backButton: { width: 38, height: 38, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 4 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5, marginBottom: 16 },
  section: { paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  input: { minHeight: 48, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.text, marginBottom: 9 },
  bodyInput: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' },
  button: { minHeight: 44, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  error: { color: '#A33B45', fontSize: 12, marginTop: 8 },
});
