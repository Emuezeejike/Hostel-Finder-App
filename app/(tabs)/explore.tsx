import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchProperties } from '../../src/api/client';
import { useAppStore } from '../../src/store/app-store';
import { PropertyCard } from '../../src/components/PropertyCard';
import { colors } from '../../src/theme/colors';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedType, setSelectedType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const properties = useAppStore((state) => state.properties);
  const availableSchools = useAppStore((state) => state.schools);
  const selectedSchool = useAppStore((state) => state.selectedSchool) ?? availableSchools[0];
  const selectedSchoolId = selectedSchool?.id;
  const selectedSchoolCity = selectedSchool?.city;
  const setProperties = useAppStore((state) => state.setProperties);
  const setApiError = useAppStore((state) => state.setApiError);
  const apiError = useAppStore((state) => state.apiError);
  const [isLoading, setIsLoading] = useState(true);
  const filters = ['All', 'Verified', 'Location', 'Property type'];
  const propertyTypes = ['Hostel', 'Self-contained', 'Room & Parlour', 'Shared Apartment'];

  useEffect(() => {
    const typeMap: Record<string, string> = {
      Hostel: 'hostel',
      'Self-contained': 'self_contain',
      'Room & Parlour': 'room_and_parlour',
      'Shared Apartment': 'shared_apartment',
    };
    const timer = setTimeout(() => {
      void fetchProperties({
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        schoolId: activeFilter === 'Location' || maxDistanceKm ? selectedSchool?.id : undefined,
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
        amenities,
        propertyType: activeFilter === 'Property type' && selectedType ? typeMap[selectedType] : undefined,
        availability: availableOnly ? 'available' : undefined,
        sort: sortAscending ? 'price_asc' : undefined,
        page: 1,
        limit: 100,
      }).then((items) => {
        setProperties(items);
        setApiError('');
      }).catch((error: unknown) => {
        setApiError(error instanceof Error ? error.message : 'Unable to search properties.');
      }).finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [activeFilter, amenities, availableOnly, maxDistanceKm, maxPrice, minPrice, selectedSchool?.id, selectedType, setApiError, setProperties, sortAscending]);

  const filteredProperties = useMemo(() => {
    const search = query.trim().toLowerCase();

    return properties.filter((property) => {
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
        (activeFilter === 'Location' && Boolean(selectedSchoolId) && (property.schoolId === selectedSchoolId || (Boolean(selectedSchoolCity) && property.location.city === selectedSchoolCity))) ||
        (activeFilter === 'Property type' && (!selectedType || property.propertyType === selectedType));

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, properties, query, selectedSchoolCity, selectedSchoolId, selectedType]);

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

      <View style={styles.numericFilters}>
        <TextInput value={minPrice} onChangeText={setMinPrice} placeholder="Min price" keyboardType="number-pad" style={styles.numericInput} />
        <TextInput value={maxPrice} onChangeText={setMaxPrice} placeholder="Max price" keyboardType="number-pad" style={styles.numericInput} />
        <TextInput value={maxDistanceKm} onChangeText={setMaxDistanceKm} placeholder="Max km" keyboardType="decimal-pad" style={styles.numericInput} />
      </View>
      <View style={styles.quickFilters}>
        {['wifi', 'water', 'security'].map((amenity) => <Pressable key={amenity} onPress={() => setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity])} style={[styles.quickFilter, amenities.includes(amenity) && styles.quickFilterActive]}><Text style={[styles.quickFilterText, amenities.includes(amenity) && styles.quickFilterTextActive]}>{amenity}</Text></Pressable>)}
        <Pressable onPress={() => setAvailableOnly((current) => !current)} style={[styles.quickFilter, availableOnly && styles.quickFilterActive]}><Text style={[styles.quickFilterText, availableOnly && styles.quickFilterTextActive]}>Available</Text></Pressable>
        <Pressable onPress={() => setSortAscending((current) => !current)} style={[styles.quickFilter, sortAscending && styles.quickFilterActive]}><Text style={[styles.quickFilterText, sortAscending && styles.quickFilterTextActive]}>{sortAscending ? 'Price: low first' : 'Sort by price'}</Text></Pressable>
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
          <Text style={styles.locationText}>{selectedSchool?.name ?? 'Select school'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading properties...</Text>
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              selectedSchoolId={selectedSchool?.id ?? ''}
              onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={colors.primary} />
            <Text style={styles.emptyTitle}>No accommodation found</Text>
            <Text style={styles.emptyText}>{apiError || 'Try another search or choose a different filter.'}</Text>
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
  numericFilters: { flexDirection: 'row', gap: 7, paddingHorizontal: 22, marginBottom: 8 },
  numericInput: { minWidth: 0, flex: 1, height: 39, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 9, color: colors.text, fontSize: 12 },
  quickFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 22, paddingBottom: 6 },
  quickFilter: { minHeight: 29, justifyContent: 'center', paddingHorizontal: 9, borderRadius: 7, borderWidth: 1, borderColor: colors.border },
  quickFilterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  quickFilterText: { color: colors.text, fontSize: 11 },
  quickFilterTextActive: { color: '#FFFFFF' },
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
