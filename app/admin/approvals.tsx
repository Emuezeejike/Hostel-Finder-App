import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { colors } from '../../src/theme/colors';

const filters = ['Pending', 'Approved', 'Needs Correction'] as const;
type ApprovalFilter = 'All' | typeof filters[number];

export default function AdminApprovalsScreen() {
  const [filter, setFilter] = useState<ApprovalFilter>('Pending');
  const [search, setSearch] = useState('');
  const approvals = useAppStore((state) => state.adminApprovals);
  const counts = {
    Pending: approvals.filter((item) => item.status !== 'Approved' && item.status !== 'Needs Correction' && item.status !== 'Rejected').length,
    Approved: approvals.filter((item) => item.status === 'Approved').length,
    'Needs Correction': approvals.filter((item) => item.status === 'Needs Correction').length,
  };
  const filtered = useMemo(() => approvals.filter((item) => {
    const matchesSearch = `${item.name} ${item.location ?? ''} ${item.type}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Pending' ? !['Approved', 'Needs Correction', 'Rejected'].includes(item.status) : item.status === filter);
    return matchesSearch && matchesFilter;
  }), [approvals, filter, search]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /><Text style={styles.backText}>Back</Text></Pressable>
      <Text style={styles.title}>Review Queue</Text>
      <Text style={styles.subtitle}>Check landlord and property submissions before students can see them.</Text>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={17} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search property, landlord or location" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterButton label="All" count={approvals.length} selected={filter === 'All'} onPress={() => setFilter('All')} />
        {filters.map((item) => <FilterButton key={item} label={item} count={counts[item]} selected={filter === item} onPress={() => setFilter(item)} />)}
      </ScrollView>
      {filtered.map((item) => (
        <Pressable key={item.id} onPress={() => router.push({ pathname: '/admin/review', params: { id: item.id } })} style={styles.card}>
          <View style={styles.cardCopy}><Text style={styles.name}>{item.name}</Text><Text style={styles.location}>{item.location ?? item.type}</Text><View style={styles.statusPill}><Text style={styles.statusText}>{item.status}</Text></View></View>
          <Ionicons name="arrow-forward" size={22} color="#15131A" />
        </Pressable>
      ))}
      {filtered.length === 0 && <View style={styles.emptyState}><Ionicons name="search-outline" size={33} color={colors.primary} /><Text style={styles.emptyTitle}>Nothing to review here</Text><Text style={styles.emptyText}>Try another status or search term.</Text></View>}
      <Text style={styles.note}>Only approved properties are visible to students.</Text>
    </ScrollView>
  );
}

function FilterButton(props: { label: string; count: number; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={props.onPress} style={[styles.filterButton, props.selected && styles.filterSelected]}><Text style={[styles.filterLabel, props.selected && styles.filterLabelSelected]}>{props.label}</Text><Text style={[styles.filterCount, props.selected && styles.filterCountSelected]}>{props.count}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 35 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 35, alignSelf: 'flex-start' },
  backText: { color: colors.text, fontSize: 13 },
  title: { color: '#171426', fontSize: 24, fontWeight: '800', marginTop: 7 },
  subtitle: { color: '#383440', fontSize: 13, lineHeight: 18, marginTop: 5, marginBottom: 12 },
  searchBox: { minHeight: 42, borderRadius: 22, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginBottom: 13 },
  searchInput: { flex: 1, color: colors.text, fontSize: 12 },
  filterRow: { gap: 6, paddingBottom: 14 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 34, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 11 },
  filterSelected: { backgroundColor: colors.primary },
  filterLabel: { color: '#1C1921', fontSize: 12 },
  filterLabelSelected: { color: '#FFFFFF' },
  filterCount: { color: colors.text, fontSize: 11, fontWeight: '700' },
  filterCountSelected: { color: '#FFFFFF' },
  card: { minHeight: 82, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: colors.surface, borderRadius: 19, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardCopy: { flex: 1 },
  name: { color: '#171426', fontSize: 15, fontWeight: '700' },
  location: { color: colors.muted, fontSize: 11, marginTop: 5 },
  statusPill: { alignSelf: 'flex-start', backgroundColor: '#FFF0D6', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, marginTop: 7 },
  statusText: { color: '#9B5900', fontSize: 10, fontWeight: '600' },
  emptyState: { minHeight: 190, backgroundColor: colors.surface, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 12 },
  note: { color: '#171426', fontSize: 11, textAlign: 'center', marginTop: 4 },
});
