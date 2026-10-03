import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { createReport } from '../../src/api/client';

const reportReasons = [
  'Incorrect price',
  'Incorrect location',
  'Property unavailable',
  'Misleading photos',
  'Provider issue',
  'Other',
];

export default function ReportScreen() {
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const [reason, setReason] = useState(reportReasons[0]);
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState(params.propertyId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const properties = useAppStore((state) => state.properties);

  const handleSubmit = async () => {
    if (!propertyId) {
      setError('Choose the property this report is about.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const reportReason = description.trim() ? `${reason}: ${description.trim()}` : reason;
      await createReport({ propertyId, reason: reportReason });
      router.back();
    } catch (reasonError) {
      setError(reasonError instanceof Error ? reasonError.message : 'Unable to submit this report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report problem</Text>

      {!params.propertyId && <View style={styles.propertyChoices}><Text style={styles.choiceTitle}>Property</Text>{properties.map((property) => <Pressable key={property.id} onPress={() => setPropertyId(property.id)} style={[styles.propertyChoice, propertyId === property.id && styles.propertyChoiceActive]}><Text style={styles.reasonText}>{property.title}</Text></Pressable>)}</View>}

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

      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.primaryButtonText}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingTop: 24,
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
  propertyChoices: { marginBottom: 12 },
  choiceTitle: { color: '#0F172A', fontWeight: '700', marginBottom: 6 },
  propertyChoice: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  propertyChoiceActive: { borderColor: '#0F172A', backgroundColor: '#E2E8F0' },
  errorText: { color: '#A33B45', fontSize: 12, marginTop: 10 },
});
