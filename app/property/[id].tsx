import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockProperties } from '../../src/data/properties';
import { schools } from '../../src/data/schools';
import { calculateDistance, formatDistance } from '../../src/utils/distance';
import { formatCurrency } from '../../src/utils/currency';
import { AuthRequiredModal } from '../../src/components/AuthRequiredModal';
import { MainBottomBar } from '../../src/components/MainBottomBar';
import { useAppStore } from '../../src/store/app-store';
import { colors } from '../../src/theme/colors';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = mockProperties.find((item) => item.id === id) ?? mockProperties[0];
  const school = schools[0];
  const user = useAppStore((state) => state.authUser);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const distanceKm = useMemo(
    () =>
      calculateDistance(
        property.location.latitude,
        property.location.longitude,
        school.latitude,
        school.longitude,
      ),
    [property, school],
  );

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
            <Text style={styles.verificationText}>Verified Property</Text>
          </View>
        </View>

        <Text style={styles.location}>{property.location.address}</Text>
        <Text style={styles.distance}>
          <Ionicons name="location-outline" size={15} color={colors.muted} /> {formatDistance(distanceKm)} from {school.name}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color={colors.primary} />
          <Text style={styles.rating}>4.8</Text>
          <Text style={styles.reviewCount}>• 120 Reviews</Text>
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
            <Text style={styles.providerVerified}>✓ Verified Provider</Text>
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
});
