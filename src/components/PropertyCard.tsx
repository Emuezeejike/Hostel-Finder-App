import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { formatCurrency } from '../utils/currency';
import { calculateDistance, formatDistance } from '../utils/distance';
import { schools } from '../data/schools';
import { colors } from '../theme/colors';

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
      <View style={styles.imageWrap}>
        <Image source={{ uri: property.images[0] }} style={styles.image} resizeMode="cover" />
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityBadgeText}>Available</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
          {property.verificationStatus === 'VERIFIED' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={colors.muted} />
          <Text style={styles.metaText} numberOfLines={2}>
            {property.location.address}, {formatDistance(distanceKm)} from {school.name}
          </Text>
        </View>
        <Text style={styles.type}>{property.propertyType.toUpperCase()}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(property.price)}<Text style={styles.priceSuffix}>/year</Text></Text>
          <View style={styles.detailsAction}>
            <Text style={styles.detailsText}>View details</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    minHeight: 164,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrap: {
    width: '41%',
    minHeight: 164,
    position: 'relative',
    backgroundColor: colors.soft,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: colors.soft,
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: 9,
    left: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  availabilityBadgeText: {
    fontSize: 10,
    color: '#286A32',
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  verifiedText: {
    marginLeft: 4,
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 11,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: colors.text,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  priceSuffix: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  detailsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  type: {
    marginTop: 6,
    fontSize: 10,
    color: colors.muted,
    fontWeight: '500',
  },
  detailsText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
});
