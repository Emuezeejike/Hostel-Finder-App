import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';

export default function ReviewScreen() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const addReview = useAppStore((state) => state.addReview);

  const handleSubmit = () => {
    addReview({
      id: `review-${Date.now()}`,
      propertyId: 'prop-1',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review</Text>
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
        <Text style={styles.primaryButtonText}>Submit Review</Text>
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
