import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchAdminProperties, fetchPropertyReviews } from '../../src/api/client';
import { Property } from '../../src/types';
import { colors } from '../../src/theme/colors';

type ReviewItem = {
  id: string;
  property: string;
  student: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function reviewItems(value: unknown, property: Property, index: number): ReviewItem[] {
  if (!isRecord(value)) return [];
  const student = isRecord(value.studentId) ? value.studentId
    : isRecord(value.student) ? value.student
      : isRecord(value.reviewer) ? value.reviewer
        : isRecord(value.user) ? value.user : {};
  const rating = Number(value.rating ?? value.score ?? 0);
  return [{
    id: String(value._id ?? value.id ?? `${property.id}-${index}`),
    property: property.title,
    student: String(student.fullName ?? student.name ?? 'Student'),
    rating: Number.isFinite(rating) ? rating : 0,
    comment: String(value.comment ?? value.text ?? ''),
    createdAt: String(value.createdAt ?? ''),
  }];
}

export default function AdminReviewsScreen() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    void fetchAdminProperties().then(async (properties) => {
      const grouped = await Promise.all(properties.map(async (property) => {
        const records = await fetchPropertyReviews(property.id);
        return records.flatMap((record, index) => reviewItems(record, property, index));
      }));
      if (mounted) {
        setReviews(grouped.flat().sort((first, second) => second.createdAt.localeCompare(first.createdAt)));
        setError('');
      }
    }).catch((reason: unknown) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load student reviews.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>FEEDBACK</Text>
      <Text style={styles.title}>Student reviews</Text>
      <Text style={styles.subtitle}>Reviews posted on listed properties.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {isLoading ? <Text style={styles.muted}>Loading reviews...</Text> : null}
      {!isLoading && !error && reviews.length === 0 ? <Text style={styles.muted}>No student reviews have been posted yet.</Text> : null}
      {reviews.map((review) => (
        <View key={review.id} style={styles.review}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewCopy}>
              <Text style={styles.property} numberOfLines={1}>{review.property}</Text>
              <Text style={styles.student}>{review.student}{review.createdAt ? `  ·  ${new Date(review.createdAt).toLocaleDateString()}` : ''}</Text>
            </View>
            <Text style={styles.rating}>{review.rating.toFixed(1)} / 5</Text>
          </View>
          {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : <Text style={styles.muted}>No written comment.</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 7 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5, marginBottom: 18 },
  review: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 15, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  reviewCopy: { flex: 1 },
  property: { color: colors.text, fontSize: 15, fontWeight: '700' },
  student: { color: colors.muted, fontSize: 11, marginTop: 5 },
  rating: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  comment: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 12 },
  muted: { color: colors.muted, fontSize: 12, marginTop: 12 },
  error: { color: '#A33B45', fontSize: 12, marginTop: 8 },
});
