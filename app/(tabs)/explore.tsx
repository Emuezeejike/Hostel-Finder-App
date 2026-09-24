import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { mockProperties } from '../../src/data/properties';
import { useAppStore } from '../../src/store/app-store';
import { schools } from '../../src/data/schools';
import { PropertyCard } from '../../src/components/PropertyCard';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const selectedSchool = useAppStore((state) => state.selectedSchool) ?? schools[0];

  const filteredProperties = useMemo(() => {
    const search = query.trim().toLowerCase();

    return mockProperties.filter((property) => {
      if (!search) return true;

      const haystack = [
        property.title,
        property.location.address,
        property.location.city,
        property.propertyType,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Pressable onPress={() => router.push('/schools')} style={styles.schoolButton}>
          <Ionicons name="school-outline" size={18} color="#0F172A" />
          <Text style={styles.schoolText}>{selectedSchool.name}</Text>
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search hostel, area or property"
          placeholderTextColor="#64748B"
          style={styles.searchInput}
        />
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
            <Ionicons name="search-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No accommodation found</Text>
            <Text style={styles.emptyText}>Try a different keyword or adjust your school.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  schoolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  schoolText: {
    marginLeft: 8,
    color: '#0F172A',
    fontWeight: '700',
    flexShrink: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
});
