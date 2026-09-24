import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockProperties } from '../../src/data/properties';
import { schools } from '../../src/data/schools';
import { calculateDistance, formatDistance } from '../../src/utils/distance';
import { formatCurrency } from '../../src/utils/currency';
import { AuthRequiredModal } from '../../src/components/AuthRequiredModal';
import { useAppStore } from '../../src/store/app-store';

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

  const totalCharges = property.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </Pressable>

      <Image source={{ uri: property.images[0] }} style={styles.heroImage} resizeMode="cover" />

      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.verificationBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.verificationText}>Verified Property</Text>
          </View>
        </View>

        <Text style={styles.location}>{property.location.address}</Text>
        <Text style={styles.distance}>
          <Ionicons name="location-outline" size={15} color="#0F172A" /> {formatDistance(distanceKm)} from {school.name}
        </Text>

        <Text style={styles.price}>{formatCurrency(property.price)} / year</Text>
        <Text style={styles.subtitle}>Additional charges are separate from rent.</Text>

        {property.additionalCharges.map((charge) => (
          <View key={charge.label} style={styles.chargeRow}>
            <Text style={styles.chargeLabel}>{charge.label}</Text>
            <Text style={styles.chargeValue}>{formatCurrency(charge.amount)}</Text>
          </View>
        ))}

        <Text style={styles.total}>Estimated total: {formatCurrency(property.price + totalCharges)}</Text>
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
            router.push('/inspection/request');
          }}
        >
          <Text style={styles.primaryButtonText}>Request Inspection</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${property.location.latitude},${property.location.longitude}`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.secondaryButtonText}>View on Google Maps</Text>
        </Pressable>
      </View>

      <AuthRequiredModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    color: '#0F172A',
    flex: 1,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  verificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  location: {
    marginTop: 8,
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  distance: {
    marginTop: 8,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  price: {
    marginTop: 14,
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 12,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  chargeLabel: {
    color: '#475569',
    fontSize: 14,
  },
  chargeValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  total: {
    marginTop: 18,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  amenityText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
  providerRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  providerName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  providerVerified: {
    marginTop: 4,
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
});
