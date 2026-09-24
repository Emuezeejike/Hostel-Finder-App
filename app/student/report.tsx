import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';

const reportReasons = [
  'Incorrect price',
  'Incorrect location',
  'Property unavailable',
  'Misleading photos',
  'Provider issue',
  'Other',
];

export default function ReportScreen() {
  const [reason, setReason] = useState(reportReasons[0]);
  const [description, setDescription] = useState('');
  const addReport = useAppStore((state) => state.addReport);

  const handleSubmit = () => {
    addReport({
      id: `report-${Date.now()}`,
      propertyId: 'prop-1',
      reason,
      description,
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report problem</Text>

      {reportReasons.map((item) => (
        <Pressable
          key={item}
          onPress={() => setReason(item)}
          style={[styles.reasonButton, reason === item && styles.reasonButtonActive]}
        >
          <Text style={[styles.reasonText, reason === item && styles.reasonTextActive]}>{item}</Text>
        </Pressable>
      ))}

      <TextInput
        multiline
        numberOfLines={6}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.textArea}
      />

      <Pressable style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Submit Report</Text>
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
    marginBottom: 20,
  },
  reasonButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonButtonActive: {
    borderColor: '#0F172A',
    backgroundColor: '#E2E8F0',
  },
  reasonText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  reasonTextActive: {
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 14,
    minHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A',
    marginTop: 12,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
