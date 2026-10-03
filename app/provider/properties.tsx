import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { deleteProperty, fetchMyProperties, updateProperty } from '../../src/api/client';
import { Property } from '../../src/types';
import { colors } from '../../src/theme/colors';

type PropertyFilter = 'All properties' | 'Active' | 'Pending';
const filters: PropertyFilter[] = ['All properties', 'Active', 'Pending'];

export default function ProviderPropertiesScreen() {
  const [activeFilter, setActiveFilter] = useState<PropertyFilter>('All properties');
  const providerProperties = useAppStore((state) => state.providerProperties);
  const setProviderProperties = useAppStore((state) => state.setProviderProperties);
  const selectedSchool = useAppStore((state) => state.selectedSchool);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;
    void fetchMyProperties().then((items) => {
      if (mounted) setProviderProperties(items);
    }).catch((error: unknown) => {
      if (mounted) setLoadError(error instanceof Error ? error.message : 'Unable to load your properties.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [setProviderProperties]);
  const filteredProperties = useMemo(() => providerProperties.filter((property) => {
    if (activeFilter === 'Active') return property.verificationStatus === 'VERIFIED';
    if (activeFilter === 'Pending') return property.verificationStatus === 'PENDING';
    return true;
  }), [activeFilter, providerProperties]);

  const editProperty = (property: Property) => router.push({ pathname: '/provider/add-property', params: { id: property.id } });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.title}>Property Information</Text><Text style={styles.subtitle}>Manage your property listing and keep everything up to date.</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((filter) => <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}><Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text></Pressable>)}
        <Pressable accessibilityLabel="Add property" onPress={() => router.push('/provider/add-property')} style={styles.addButton}><Ionicons name="add" size={23} color="#FFFFFF" /></Pressable>
      </ScrollView>

      {isLoading ? <Text style={styles.emptyText}>Loading your properties...</Text> : filteredProperties.length ? filteredProperties.map((property) => <PropertyManagementCard key={property.id} property={property} schoolName={selectedSchool?.name ?? 'Nearby campus'} onEdit={() => editProperty(property)} />) : (
        <View style={styles.emptyState}><Ionicons name="home-outline" size={36} color={colors.primary} /><Text style={styles.emptyTitle}>No properties in this view</Text><Text style={styles.emptyText}>{loadError || 'Try another status or add a property listing.'}</Text></View>
      )}
    </ScrollView>
  );
}

function PropertyManagementCard(props: { property: Property; schoolName: string; onEdit: () => void }) {
  const property = props.property;
  const setProviderProperties = useAppStore((state) => state.setProviderProperties);
  const [isSaving, setIsSaving] = useState(false);
  const isVerified = property.verificationStatus === 'VERIFIED';
  const statusLabel = isVerified ? 'Approved/Active' : property.verificationStatus === 'REJECTED' ? 'Requires Correction' : 'Pending Verification';
  const openAvailability = () => router.push({ pathname: '/provider/availability', params: { propertyId: property.id } });

  const changeAvailability = async () => {
    setIsSaving(true);
    try {
      await updateProperty(property.id, { availabilityStatus: property.availability === 'AVAILABLE' ? 'unavailable' : 'available' });
      setProviderProperties(await fetchMyProperties());
    } catch (error) {
      Alert.alert('Unable to update availability', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeProperty = () => Alert.alert('Delete listing?', 'This removes the property from your account.', [
    { text: 'Keep listing', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void deleteProperty(property.id).then(async () => setProviderProperties(await fetchMyProperties())).catch((error: unknown) => Alert.alert('Unable to delete listing', error instanceof Error ? error.message : 'Please try again.'));
    } },
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.propertyTop}>
        <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
        <View style={styles.propertyDetails}>
          <View style={[styles.statusPill, isVerified ? styles.statusApproved : property.verificationStatus === 'REJECTED' ? styles.statusRejected : styles.statusPending]}><Text style={[styles.statusText, isVerified ? styles.statusApprovedText : property.verificationStatus === 'REJECTED' ? styles.statusRejectedText : styles.statusPendingText]}>{statusLabel}</Text></View>
          <Text style={styles.propertyName} numberOfLines={2}>{property.title}</Text>
          <View style={styles.infoLine}><Ionicons name="location-outline" size={17} color={colors.primary} /><Text style={styles.infoText} numberOfLines={1}>{property.location.address || props.schoolName}</Text></View>
          <Text style={styles.metaLabel}>Monthly Rent</Text><Text style={styles.rent}>₦{property.price.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.metricsRow}><Metric icon="car-outline" label="Distance from school" value={property.schoolId ? '1.2 km' : '2.1 km'} /><Metric icon="time-outline" label="Est. driving time" value="6 mins" /></View>
      <View style={styles.statusRow}><Metric icon="calendar-outline" label="Availability" value={property.availability === 'AVAILABLE' ? 'Available' : 'Unavailable'} /><Metric icon="list-outline" label="Listing status" value={isVerified ? 'Listed' : 'Not Listed'} /></View>
      <View style={styles.amenitiesHeading}><Ionicons name="business-outline" size={20} color={colors.primary} /><Text style={styles.amenitiesTitle}>Facilities &amp; Amenities</Text></View>
      <View style={styles.amenityStrip}>{(property.amenities.length ? property.amenities : ['Water', 'Power', 'Wi-Fi', 'Security']).slice(0, 4).map((amenity) => <View key={amenity} style={styles.amenityItem}><Ionicons name="checkmark-circle-outline" size={15} color={colors.primary} /><Text style={styles.amenityText} numberOfLines={1}>{amenity}</Text></View>)}</View>
      {!isVerified && property.verificationStatus === 'REJECTED' && <View style={styles.warningBox}><Ionicons name="warning" size={20} color="#C77700" /><Text style={styles.warningText}>This property requires correction. Update its details and resubmit for verification.</Text></View>}
      <View style={styles.actionGrid}>
        <ActionButton icon="eye-outline" label="View Property" onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })} />
        <ActionButton icon="create-outline" label="Edit Property" onPress={props.onEdit} />
        <ActionButton icon="wallet-outline" label="Update Rent" onPress={props.onEdit} />
        <ActionButton icon="calendar-outline" label={isSaving ? 'Saving...' : 'Update Availability'} onPress={() => void changeAvailability()} />
        <ActionButton icon="refresh-outline" label="Update Amenities" onPress={props.onEdit} />
        <ActionButton icon="images-outline" label="Update Images" onPress={props.onEdit} />
        <ActionButton icon="document-text-outline" label="Update Description" onPress={props.onEdit} />
        <ActionButton icon="trash-outline" label="Delete Listing" onPress={removeProperty} />
        <ActionButton icon="calendar-number-outline" label="Manage Inspection Availability" onPress={openAvailability} />
      </View>
    </View>
  );
}

function Metric(props: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.metric}><Ionicons name={props.icon} size={19} color={colors.primary} /><View style={styles.metricCopy}><Text style={styles.metricLabel}>{props.label}</Text><Text style={styles.metricValue}>{props.value}</Text></View></View>;
}

function ActionButton(props: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return <Pressable onPress={props.onPress} style={styles.actionButton}><Ionicons name={props.icon} size={18} color={colors.primary} /><Text style={styles.actionText}>{props.label}</Text><Ionicons name="chevron-forward" size={16} color={colors.primary} /></Pressable>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  backButton: { width: 32, height: 36, justifyContent: 'center', marginRight: 3 },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 25, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5 },
  filterRow: { gap: 8, alignItems: 'center', paddingBottom: 14 },
  filterButton: { minWidth: 98, paddingHorizontal: 14, minHeight: 42, borderRadius: 9, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  addButton: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 13, marginBottom: 17, borderWidth: 1, borderColor: '#E7E0F1', shadowColor: '#261B3E', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  propertyTop: { flexDirection: 'row', gap: 12, minHeight: 126 },
  propertyImage: { width: '38%', height: 126, borderRadius: 11, backgroundColor: colors.soft },
  propertyDetails: { flex: 1, justifyContent: 'center' },
  statusPill: { alignSelf: 'flex-end', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, marginBottom: 5 },
  statusApproved: { backgroundColor: '#B8E3B5' },
  statusPending: { backgroundColor: '#EEE5FB' },
  statusRejected: { backgroundColor: '#FFE0AF' },
  statusText: { fontSize: 10, fontWeight: '600' },
  statusApprovedText: { color: '#38844A' },
  statusPendingText: { color: colors.primary },
  statusRejectedText: { color: '#A35A00' },
  propertyName: { color: colors.text, fontSize: 18, lineHeight: 21, fontWeight: '800', marginBottom: 6 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { color: colors.text, fontSize: 12, flex: 1 },
  metaLabel: { color: colors.muted, fontSize: 12, marginTop: 8 },
  rent: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 1 },
  metricsRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 11 },
  statusRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 11 },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 3 },
  metricCopy: { flex: 1 },
  metricLabel: { color: colors.muted, fontSize: 10 },
  metricValue: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 2 },
  amenitiesHeading: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 7 },
  amenitiesTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  amenityStrip: { minHeight: 34, borderRadius: 8, backgroundColor: colors.soft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 5, marginBottom: 13 },
  amenityItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  amenityText: { color: colors.text, fontSize: 10, flexShrink: 1 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFE2B7', padding: 11, borderRadius: 9, marginBottom: 13 },
  warningText: { color: colors.text, fontSize: 12, flex: 1, lineHeight: 17 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { width: '48.5%', minHeight: 45, borderRadius: 9, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: colors.primary, fontSize: 11, fontWeight: '600', flex: 1 },
  emptyState: { backgroundColor: colors.surface, borderRadius: 14, minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 22, gap: 7 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
