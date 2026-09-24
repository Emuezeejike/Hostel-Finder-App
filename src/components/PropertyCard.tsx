import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { formatCurrency } from '../utils/currency';
import { calculateDistance, formatDistance } from '../utils/distance';
import { schools } from '../data/schools';

interface PropertyCardProps {
  property: Property;
  selectedSchoolId?: string;
  onPress?: () => void;
}

export function PropertyCard({ property, selectedSchoolId, onPress }: PropertyCardProps) {
  const school = schools.find((item) => item.id === selectedSchoolId) ?? schools[0];
  const distanceKm = calculateDistance(
    property.location.latitude,
    property.location.longitude,
    school.latitude,
    school.longitude,
  );

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: property.images[0] }} style={styles.image} resizeMode="cover" />
      <View style={styles.badgeRow}>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#fff" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.location}>{property.location.address}</Text>

        <Text style={styles.price}>{formatCurrency(property.price)} / year</Text>
        {property.additionalCharges.length > 0 && (
          <Text style={styles.charges}>
            + {formatCurrency(property.additionalCharges[0].amount)} service charges
          </Text>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#4B5563" />
          <Text style={styles.metaText}>{formatDistance(distanceKm)} from {school.name}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.availability}>{property.availability}</Text>
          <Text style={styles.type}>{property.propertyType}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    marginLeft: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  price: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  charges: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availability: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  type: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
});
