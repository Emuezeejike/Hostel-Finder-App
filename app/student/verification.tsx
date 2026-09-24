import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';

export default function StudentVerificationScreen() {
  const verificationStatus = useAppStore((state) => state.studentVerificationStatus);
  const setVerificationStatus = useAppStore((state) => state.setStudentVerificationStatus);

  const [fullName, setFullName] = useState('Ada Okafor');
  const [school, setSchool] = useState('University of Lagos');
  const [matric, setMatric] = useState('190402001');
  const [document, setDocument] = useState('Student ID / Admission letter');

  const handleSubmit = () => {
    setVerificationStatus('PENDING');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Verification</Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{verificationStatus}</Text>
      </View>

      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" />
      <TextInput style={styles.input} value={school} onChangeText={setSchool} placeholder="School" />
      <TextInput style={styles.input} value={matric} onChangeText={setMatric} placeholder="Matriculation number" />
      <TextInput
        style={styles.input}
        value={document}
        onChangeText={setDocument}
        placeholder="Verification document/evidence"
      />

      <Pressable style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Submit Verification</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 18,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
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
    color: '#0F172A',
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
});
