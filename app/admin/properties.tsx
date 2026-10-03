import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { deleteProperty, fetchAdminInspections, fetchAdminProperties } from '../../src/api/client';
import { Property } from '../../src/types';
import { colors } from '../../src/theme/colors';

const filters = ['All', 'Active', 'Pending', 'Reported'] as const;
type PropertyFilter = typeof filters[number];

export default function AdminPropertiesScreen() {
  const [filter, setFilter] = useState<PropertyFilter>('All');
  const [search, setSearch] = useState('');
  const properties = useAppStore((state) => state.providerProperties);
  const setProviderProperties = useAppStore((state) => state.setProviderProperties);
  const [inspectionCount, setInspectionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const status = filter === 'Active' ? 'verified' : filter === 'Pending' ? 'pending' : filter === 'Reported' ? 'rejected' : undefined;

  useEffect(() => {
    let mounted = true;
    void Promise.all([fetchAdminProperties(status), fetchAdminInspections()]).then(([items, inspections]) => {
      if (!mounted) return;
      setProviderProperties(items);
      setInspectionCount(inspections.length);
      setError('');
    }).catch((reason: unknown) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load admin property data.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [setProviderProperties, status]);
  const pendingCount = properties.filter((property) => property.verificationStatus === 'PENDING').length;
  const activeCount = properties.filter((property) => property.verificationStatus === 'VERIFIED').length;
  const filtered = useMemo(() => properties.filter((property) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = `${property.title} ${property.location.address} ${property.provider.name}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'All' || (filter === 'Active' && property.verificationStatus === 'VERIFIED') || (filter === 'Pending' && property.verificationStatus === 'PENDING') || (filter === 'Reported' && property.verificationStatus === 'REJECTED');
    return matchesSearch && matchesFilter;
  }), [filter, properties, search]);
  const removeProperty = async (property: Property) => {
    setDeletingId(property.id);
    setError('');
    try {
      await deleteProperty(property.id);
      setProviderProperties(await fetchAdminProperties(status));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete landlord record.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
      <Text style={styles.title}>Property Management</Text>
      <Text style={styles.subtitle}>Remove property records submitted by landlords.</Text>
      <View style={styles.statsGrid}>
        <Stat label="Total Properties" value={String(properties.length)} />
        <Stat label="Pending Verification" value={String(pendingCount)} />
        <Stat label="Verified Properties" value={String(activeCount)} />
        <Stat label="Inspections" value={String(inspectionCount)} />
      </View>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search by property, landlord or location" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterButton, filter === item && styles.filterSelected]}><Text style={[styles.filterText, filter === item && styles.filterTextSelected]}>{item}</Text>{item !== 'All' && <Text style={styles.filterCount}>{item === 'Active' ? activeCount : item === 'Pending' ? pendingCount : 0}</Text>}{filter === item && <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />}</Pressable>)}
      </ScrollView>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
      {isLoading ? <Text style={styles.emptyText}>Loading landlord records...</Text> : filtered.length ? filtered.map((property) => <AdminPropertyCard key={property.id} property={property} deleting={deletingId === property.id} onDelete={() => Alert.alert('Delete landlord record?', `Remove ${property.title} from the platform?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void removeProperty(property) }])} />) : <View style={styles.emptyState}><Ionicons name="home-outline" size={35} color={colors.primary} /><Text style={styles.emptyTitle}>No properties found</Text><Text style={styles.emptyText}>{error || 'Try another filter or search term.'}</Text></View>}
    </ScrollView>
  );
}

function Stat(props: { label: string; value: string }) {
  return <View style={styles.statCard}><Text style={styles.statLabel}>{props.label}</Text><Text style={styles.statValue}>{props.value}</Text></View>;
}

function AdminPropertyCard(props: { property: Property; deleting: boolean; onDelete: () => void }) {
  const property = props.property;
  const verified = property.verificationStatus === 'VERIFIED';
  const suspended = property.verificationStatus === 'REJECTED';
  const statusLabel = verified ? 'Active' : suspended ? 'Suspended' : 'Pending';
  return (
    <View style={styles.card}>
      <View style={styles.propertyTop}>
        <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
        <View style={styles.propertyDetails}>
          <View style={[styles.statusPill, verified ? styles.activePill : suspended ? styles.suspendedPill : styles.pendingPill]}><Text style={[styles.statusText, verified ? styles.activeText : suspended ? styles.suspendedText : styles.pendingText]}>{statusLabel}</Text></View>
          <Text style={styles.propertyName} numberOfLines={1}>{property.title}</Text>
          <Meta icon="location-outline" value={property.location.address || 'Location not provided'} />
          <Meta icon="school-outline" value={`Nearby School  •  ${property.schoolId ? 'Selected campus' : 'UNILAG'}`} />
          <Meta icon="navigate-outline" value={`Distance  •  ${property.schoolId ? 'Not returned by API' : 'Unavailable'}`} />
          <Meta icon="time-outline" value="Driving time  •  Not returned by API" />
        </View>
      </View>
      <View style={styles.propertyLower}>
        <View style={styles.ownerColumn}>
          <Text style={styles.rent}>₦{property.price.toLocaleString()}/year</Text>
          <Text style={[styles.availabilityText, property.availability !== 'AVAILABLE' && styles.unavailableText]}>{property.availability === 'AVAILABLE' ? 'Available' : property.availability === 'BOOKED' ? 'Booked' : 'Unavailable'}</Text>
        </View>
        <View style={styles.ownerDetails}><Meta icon="person-circle-outline" value={`Landlord  •  ${property.provider.name}`} /><Text style={styles.propertyType}>{property.propertyType.toUpperCase()}</Text></View>
      </View>
      <View style={styles.amenities}>{property.amenities.map((item) => <View key={item} style={styles.amenity}><Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" /><Text style={styles.amenityText}>{item}</Text></View>)}</View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${property.title}`} disabled={props.deleting} onPress={props.onDelete} style={styles.deleteButton}><Ionicons name="trash-outline" size={16} color="#A33B45" /><Text style={styles.deleteText}>{props.deleting ? 'Deleting...' : 'Delete landlord record'}</Text></Pressable>
    </View>
  );
}

function Meta(props: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return <View style={styles.meta}><Ionicons name={props.icon} size={14} color={colors.primary} /><Text style={styles.metaText} numberOfLines={1}>{props.value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  backButton: { width: 35, height: 35, justifyContent: 'center' },
  title: { color: '#171426', fontSize: 24, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#383440', fontSize: 14, marginTop: 5, marginBottom: 17 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 8, marginBottom: 14 },
  statCard: { width: '48%', minHeight: 106, padding: 12, backgroundColor: colors.surface, borderRadius: 17, marginBottom: 10, shadowColor: '#261B3E', shadowOpacity: 0.11, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  trend: { color: '#168A20', fontSize: 13, fontWeight: '700' },
  trendDown: { color: '#D52D2D' },
  statLabel: { color: '#46414E', fontSize: 12, lineHeight: 16, marginTop: 6, fontWeight: '600' },
  statValue: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 7 },
  searchBox: { minHeight: 48, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: colors.text, fontSize: 13 },
  filterRow: { gap: 7, paddingVertical: 13 },
  filterButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 9, paddingHorizontal: 11, backgroundColor: colors.surface },
  filterSelected: { backgroundColor: colors.primary },
  filterText: { color: colors.muted, fontSize: 12 },
  filterTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  filterCount: { color: '#FFFFFF', backgroundColor: '#208D10', fontSize: 10, paddingHorizontal: 4, paddingVertical: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 13, padding: 11, marginBottom: 14, shadowColor: '#261B3E', shadowOpacity: 0.11, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  propertyTop: { flexDirection: 'row', gap: 10 },
  propertyImage: { width: '44%', height: 116, borderRadius: 9, borderWidth: 1, borderColor: '#B8E3B5', backgroundColor: colors.soft },
  propertyDetails: { flex: 1, gap: 5 },
  statusPill: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9 },
  activePill: { backgroundColor: '#188E10' },
  pendingPill: { backgroundColor: '#FFF400' },
  suspendedPill: { backgroundColor: '#FF875B' },
  statusText: { fontSize: 10, fontWeight: '700' },
  activeText: { color: '#FFFFFF' },
  pendingText: { color: '#1B171F' },
  suspendedText: { color: '#FFFFFF' },
  propertyName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.text, fontSize: 10, flex: 1 },
  propertyLower: { flexDirection: 'row', borderTopWidth: 1, borderColor: colors.border, marginTop: 9, paddingTop: 8, gap: 8 },
  ownerColumn: { width: '47%', justifyContent: 'space-between' },
  ownerDetails: { flex: 1, justifyContent: 'space-between', paddingVertical: 3 },
  rent: { color: colors.primary, fontSize: 17, fontWeight: '800' },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availabilityText: { color: '#198F19', fontSize: 12, fontWeight: '700' },
  unavailableText: { color: '#B8B6BD' },
  propertyType: { color: colors.text, fontSize: 13 },
  amenities: { minHeight: 34, borderRadius: 8, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 8, paddingHorizontal: 5 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { color: '#FFFFFF', fontSize: 11 },
  deleteButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8, borderWidth: 1, borderColor: '#E7B8B8', borderRadius: 7 },
  deleteText: { color: '#A33B45', fontSize: 12, fontWeight: '700' },
  emptyState: { minHeight: 190, backgroundColor: colors.surface, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 12 },
  errorText: { color: '#A33B45', fontSize: 12, marginBottom: 10 },
});
