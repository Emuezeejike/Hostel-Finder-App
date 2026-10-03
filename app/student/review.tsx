import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { createReview, fetchMyInspections } from '../../src/api/client';

export default function ReviewScreen() {
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [propertyId, setPropertyId] = useState(params.propertyId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const requests = useAppStore((state) => state.inspectionRequests);
  const setInspectionRequests = useAppStore((state) => state.setInspectionRequests);

  useEffect(() => {
    void fetchMyInspections().then(setInspectionRequests).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load completed inspections.'));
  }, [setInspectionRequests]);

  const eligible = requests.filter((request) => request.accepted);

  const handleSubmit = async () => {
    if (!propertyId) {
      setError('Choose a property from an accepted inspection first.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await createReview({ propertyId, rating, comment: comment.trim() });
      router.back();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit this review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review</Text>
      {!params.propertyId && <View style={styles.propertyChoices}><Text style={styles.label}>Accepted inspection</Text>{eligible.map((request) => <Pressable key={request.id} onPress={() => setPropertyId(request.propertyId)} style={[styles.propertyChoice, propertyId === request.propertyId && styles.propertyChoiceActive]}><Text style={styles.propertyChoiceText}>{request.propertyName}</Text></Pressable>)}{eligible.length === 0 ? <Text style={styles.hint}>Reviews are available after a provider marks an inspection complete and you accept the property.</Text> : null}</View>}
      <Text style={styles.label}>Rating</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setRating(value)}>
            <Text style={[styles.star, value <= rating && styles.starActive]}>{value <= rating ? '★' : '☆'}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>How was your experience?</Text>
      <TextInput
        multiline
        numberOfLines={6}
        value={comment}
        onChangeText={setComment}
        placeholder="Write your review"
        style={styles.textArea}
      />

      <Pressable style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</Text>
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
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
    marginBottom: 18,
  },
  label: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  star: {
    fontSize: 32,
    color: '#CBD5E1',
    marginRight: 8,
  },
  starActive: {
    color: '#F59E0B',
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
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  propertyChoices: { marginBottom: 18 },
  propertyChoice: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, marginTop: 7 },
  propertyChoiceActive: { borderColor: '#0F172A', backgroundColor: '#E2E8F0' },
  propertyChoiceText: { color: '#0F172A', fontSize: 13 },
  hint: { color: '#64748B', fontSize: 12, marginTop: 8 },
  errorText: { color: '#A33B45', fontSize: 12, marginTop: 10 },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
