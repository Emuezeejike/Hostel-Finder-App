import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { mockProperties } from '../../src/data/properties';
import { useAppStore } from '../../src/store/app-store';
import { schools } from '../../src/data/schools';
import { PropertyCard } from '../../src/components/PropertyCard';
import { colors } from '../../src/theme/colors';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedType, setSelectedType] = useState('');
  const selectedSchool = useAppStore((state) => state.selectedSchool) ?? schools[0];
  const filters = ['All', 'Verified', 'Location', 'Property type'];
  const propertyTypes = ['Hostel', 'Self-contained', 'Room & Parlour', 'Shared Apartment'];

  const filteredProperties = useMemo(() => {
    const search = query.trim().toLowerCase();

    return mockProperties.filter((property) => {
      const haystack = [
        property.title,
        property.location.address,
        property.location.city,
        property.propertyType,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !search || haystack.includes(search);
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Verified' && property.verificationStatus === 'VERIFIED') ||
        (activeFilter === 'Location' && property.location.city === selectedSchool.city) ||
        (activeFilter === 'Property type' && (!selectedType || property.propertyType === selectedType));

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, query, selectedSchool.city, selectedType]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Go back" style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Hostels</Text>
        </View>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>FIND YOUR DREAM SPACE OFF CAMPUS</Text>
          <Text style={styles.introDescription}>Browse various spaces with costs, distance and availability in view</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={22} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by location or hostel name"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === filter }}
            onPress={() => {
              if (filter === 'Location') {
                router.push('/schools');
              }
              setActiveFilter(filter);
            }}
            style={[styles.filter, activeFilter === filter && styles.activeFilter]}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
            {filter === 'All' && <Ionicons name="options-outline" size={17} color={activeFilter === filter ? '#fff' : colors.muted} />}
          </Pressable>
        ))}
      </ScrollView>

      {activeFilter === 'Property type' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {propertyTypes.map((type) => (
            <Pressable key={type} onPress={() => setSelectedType(selectedType === type ? '' : type)} style={[styles.typeFilter, selectedType === type && styles.activeTypeFilter]}>
              <Text style={[styles.typeFilterText, selectedType === type && styles.activeTypeFilterText]}>{type}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>{filteredProperties.length} results found</Text>
        <Pressable onPress={() => router.push('/schools')} style={styles.locationButton}>
          <Ionicons name="location-outline" size={15} color={colors.primary} />
          <Text style={styles.locationText}>{selectedSchool.name}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              selectedSchoolId={selectedSchool.id}
              onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={colors.primary} />
            <Text style={styles.emptyTitle}>No accommodation found</Text>
            <Text style={styles.emptyText}>Try another search or choose a different filter.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  intro: {
    marginTop: 12,
  },
  introTitle: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
  },
  introDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 17,
    marginHorizontal: 22,
    height: 58,
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filters: {
    paddingHorizontal: 22,
    gap: 10,
    paddingTop: 20,
    paddingBottom: 13,
    marginBottom: 4,
  },
  filter: {
    height: 46,
    minWidth: 70,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 11,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 15,
    color: colors.muted,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  typeFilter: {
    minHeight: 36,
    paddingHorizontal: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: 28,
  },
  activeTypeFilter: {
    backgroundColor: colors.soft,
    borderColor: colors.primary,
  },
  typeFilterText: {
    color: colors.text,
    fontSize: 12,
  },
  activeTypeFilterText: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultsRow: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultsCount: {
    color: colors.muted,
    fontSize: 13,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  locationText: {
    color: colors.text,
    fontSize: 13,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 104,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
