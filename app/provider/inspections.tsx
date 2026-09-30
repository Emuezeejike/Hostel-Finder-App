import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { InspectionStatus } from '../../src/types';
import { colors } from '../../src/theme/colors';

const filters = ['All', 'Confirmed', 'Rescheduled', 'Cancelled'] as const;
type InspectionFilter = typeof filters[number];

export default function ProviderInspectionsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InspectionFilter>('All');
  const requests = useAppStore((state) => state.inspectionRequests);
  const properties = useAppStore((state) => state.properties);
  const providerProperties = useAppStore((state) => state.providerProperties);
  const updateInspectionRequest = useAppStore((state) => state.updateInspectionRequest);
  const visibleRequests = useMemo(() => requests.filter((request) => {
    const property = [...properties, ...providerProperties].find((item) => item.id === request.propertyId);
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${request.propertyName} ${request.requestedDate} ${request.requestedTime} ${property?.location.address ?? ''}`.toLowerCase().includes(query);
    const matchesStatus = filter === 'All' || request.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [filter, properties, providerProperties, requests, search]);

  const setStatus = (id: string, status: InspectionStatus) => updateInspectionRequest(id, { status });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
        <Text style={styles.title}>Inspection Management</Text>
      </View>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search by location or hostel name" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterButton, filter === item && styles.filterButtonActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}
      </ScrollView>

      {visibleRequests.length ? visibleRequests.map((request) => {
        const property = [...properties, ...providerProperties].find((item) => item.id === request.propertyId);
        const cancelled = request.status === 'Cancelled' || request.status === 'Declined';
        return (
          <View key={request.id} style={styles.requestCard}>
            <Image source={{ uri: property?.images[0] }} style={styles.propertyImage} />
            <View style={styles.requestDetails}>
              <View style={[styles.statusBadge, cancelled ? styles.cancelledBadge : styles.confirmedBadge]}><Text style={[styles.statusText, cancelled ? styles.cancelledText : styles.confirmedText]}>{request.status}</Text></View>
              <InfoRow icon="person-circle-outline" title="Student" detail="Student · Campus resident" />
              <InfoRow icon="home-outline" title="Property" detail={request.propertyName} />
              <InfoRow icon="calendar-outline" title="Inspection Date" detail={request.requestedDate} />
              <InfoRow icon="time-outline" title="Time" detail={request.requestedTime} />
              <InfoRow icon="location-outline" title="Location" detail={property?.location.address ?? 'Address on listing'} />
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => router.push({ pathname: '/property/[id]', params: { id: request.propertyId } })} style={styles.primaryAction}><Ionicons name="eye-outline" size={16} color="#FFFFFF" /><Text style={styles.primaryActionText}>View Inspection</Text></Pressable>
              <Pressable onPress={() => setStatus(request.id, 'Rescheduled')} style={styles.secondaryAction}><Ionicons name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.secondaryActionText}>Reschedule</Text></Pressable>
              <Pressable onPress={() => setStatus(request.id, 'Cancelled')} style={styles.secondaryAction}><Ionicons name="close-circle-outline" size={16} color={colors.primary} /><Text style={styles.secondaryActionText}>Cancel</Text></Pressable>
              {request.status === 'Pending' && <Pressable onPress={() => setStatus(request.id, 'Confirmed')} style={styles.confirmAction}><Ionicons name="checkmark-circle-outline" size={16} color="#2E7D42" /><Text style={styles.confirmActionText}>Confirm</Text></Pressable>}
            </View>
          </View>
        );
      }) : (
        <View style={styles.emptyState}><Ionicons name="calendar-outline" size={36} color={colors.primary} /><Text style={styles.emptyTitle}>No inspection requests</Text><Text style={styles.emptyText}>New student inspection requests will appear here.</Text></View>
      )}
    </ScrollView>
  );
}

function InfoRow(props: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string }) {
  return <View style={styles.infoRow}><View style={styles.infoIcon}><Ionicons name={props.icon} size={17} color={colors.primary} /></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>{props.title}</Text><Text numberOfLines={2} style={styles.infoDetail}>{props.detail}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  backButton: { width: 33, height: 38, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  searchBox: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surface, marginBottom: 12 },
  searchInput: { flex: 1, color: colors.text, fontSize: 13 },
  filterRow: { gap: 7, paddingBottom: 14 },
  filterButton: { minWidth: 94, minHeight: 39, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { color: colors.primary, fontSize: 13 },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  requestCard: { backgroundColor: colors.surface, borderRadius: 13, padding: 10, marginBottom: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 9, shadowColor: '#261B3E', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  propertyImage: { width: 112, height: 116, borderRadius: 9, backgroundColor: colors.soft },
  requestDetails: { flex: 1, minWidth: 190, gap: 6, paddingTop: 4 },
  statusBadge: { alignSelf: 'flex-end', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  confirmedBadge: { backgroundColor: '#B8E3B5' },
  cancelledBadge: { backgroundColor: '#FFD3D3' },
  statusText: { fontSize: 10, fontWeight: '600' },
  confirmedText: { color: '#38844A' },
  cancelledText: { color: '#B32626' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1 },
  infoTitle: { color: colors.muted, fontSize: 9 },
  infoDetail: { color: colors.text, fontSize: 12, fontWeight: '600' },
  actions: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 3 },
  primaryAction: { flex: 1, minWidth: 120, minHeight: 36, backgroundColor: colors.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  primaryActionText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  secondaryAction: { flex: 1, minWidth: 90, minHeight: 36, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  secondaryActionText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  confirmAction: { flex: 1, minWidth: 90, minHeight: 36, borderWidth: 1, borderColor: '#86C793', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  confirmActionText: { color: '#2E7D42', fontSize: 11, fontWeight: '600' },
  emptyState: { backgroundColor: colors.surface, minHeight: 210, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 22 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
