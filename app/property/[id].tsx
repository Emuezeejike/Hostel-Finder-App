import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { calculateDistance, formatDistance } from '../../src/utils/distance';
import { formatCurrency } from '../../src/utils/currency';
import { AuthRequiredModal } from '../../src/components/AuthRequiredModal';
import { MainBottomBar } from '../../src/components/MainBottomBar';
import { useAppStore } from '../../src/store/app-store';
import { ApiError, fetchPropertyById, fetchPropertyReviews } from '../../src/api/client';
import { Property } from '../../src/types';
import { colors } from '../../src/theme/colors';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const properties = useAppStore((state) => state.properties);
  const availableSchools = useAppStore((state) => state.schools);
  const selectedSchool = useAppStore((state) => state.selectedSchool);
  const [remoteProperty, setRemoteProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const property = remoteProperty ?? properties.find((item) => item.id === id);
  const school = selectedSchool ?? availableSchools[0];
  const user = useAppStore((state) => state.authUser);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    void fetchPropertyById(id, school?.id).then((item) => {
      if (mounted) setRemoteProperty(item);
    }).catch((error: unknown) => {
      if (mounted) setLoadError(error instanceof ApiError ? error.message : 'Unable to load this property.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [id, school?.id]);

  useEffect(() => {
    if (!id) return;
    void fetchPropertyReviews(id).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  const distanceKm = useMemo(
    () => property && school
      ? calculateDistance(
        property.location.latitude,
        property.location.longitude,
        school.latitude,
        school.longitude,
      )
      : 0,
    [property, school],
  );

  if (!property) {
    return <View style={styles.missing}><Text style={styles.title}>{isLoading ? 'Loading property...' : 'Property unavailable'}</Text><Text style={styles.location}>{loadError || 'This listing could not be loaded from the server.'}</Text><Pressable onPress={() => router.back()}><Text style={styles.primaryButtonText}>Go back</Text></Pressable></View>;
  }

  const ratings = reviews.flatMap((review) => {
    if (typeof review !== 'object' || review === null) return [];
    const rating = (review as Record<string, unknown>).rating;
    return typeof rating === 'number' && Number.isFinite(rating) ? [rating] : [];
  });
  const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : null;

  return (
    <View style={styles.screen}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>

      <Image source={{ uri: property.images[0] }} style={styles.heroImage} resizeMode="cover" />

      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.verificationBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.verificationText}>{property.verificationStatus === 'VERIFIED' ? 'Verified Property' : 'Verification pending'}</Text>
          </View>
        </View>

        <Text style={styles.location}>{property.location.address}</Text>
        <Text style={styles.distance}>
          <Ionicons name="location-outline" size={15} color={colors.muted} /> {school ? `${formatDistance(distanceKm)} from ${school.name}` : 'Distance unavailable'}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color={colors.primary} />
          <Text style={styles.rating}>{averageRating ?? 'No rating'}</Text>
          <Text style={styles.reviewCount}>• {reviews.length} Reviews</Text>
        </View>
        <Text style={styles.propertyType}>{property.propertyType.toUpperCase()}</Text>
        <Text style={styles.price}>{formatCurrency(property.price)}<Text style={styles.priceSuffix}>/year</Text></Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{property.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenityGrid}>
          {property.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Provider</Text>
        <View style={styles.providerRow}>
          <View>
            <Text style={styles.providerName}>{property.provider.name}</Text>
            <Text style={styles.providerVerified}>{property.provider.isVerified ? '✓ Verified Provider' : 'Provider verification pending'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            if (!user) {
              setAuthModalVisible(true);
              return;
            }
            router.push({ pathname: '/inspection/request', params: { id: property.id } });
          }}
        >
          <Text style={styles.primaryButtonText}>Request Inspection</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push({ pathname: '/student/report', params: { propertyId: property.id } })}>
          <Text style={styles.secondaryButtonText}>Report this property</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push({ pathname: '/student/review', params: { propertyId: property.id } })}>
          <Text style={styles.secondaryButtonText}>Write a review</Text>
        </Pressable>
        <Text style={styles.reviewHint}>Reviews require an accepted inspection.</Text>
      </View>

      <AuthRequiredModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </ScrollView>
    <MainBottomBar active="search" propertyId={property.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missing: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center', gap: 12 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  verificationText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  location: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  distance: {
    marginTop: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  price: {
    marginTop: 14,
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  priceSuffix: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  rating: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  reviewCount: {
    color: colors.text,
    fontSize: 14,
  },
  propertyType: {
    color: colors.text,
    fontSize: 13,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    color: '#475569',
    lineHeight: 22,
    fontSize: 15,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  amenityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  providerRow: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
  },
  providerName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  providerVerified: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: { minHeight: 44, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  reviewHint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
