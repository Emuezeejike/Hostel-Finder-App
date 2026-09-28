import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockProperties } from '../../src/data/properties';
import { schools } from '../../src/data/schools';
import { PropertyCard } from '../../src/components/PropertyCard';
import { useAppStore } from '../../src/store/app-store';
import { calculateDistance, formatDistance } from '../../src/utils/distance';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const selectedSchool = useAppStore((state) => state.selectedSchool) ?? schools[0];
  const palette = colors;

  const filteredProperties = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return mockProperties.filter((property) => {
      const distanceKm = calculateDistance(
        property.location.latitude,
        property.location.longitude,
        selectedSchool.latitude,
        selectedSchool.longitude,
      );
      const matchesSchool =
        property.title.toLowerCase().includes(lowerQuery) ||
        property.location.address.toLowerCase().includes(lowerQuery) ||
        property.location.city.toLowerCase().includes(lowerQuery) ||
        (lowerQuery === '' || property.location.address.toLowerCase().includes(lowerQuery));

      return matchesSchool && distanceKm < 10;
    });
  }, [query, selectedSchool]);

  const featured = filteredProperties.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <BrandLogo compact />
          <Pressable style={[styles.profileButton, { backgroundColor: palette.soft }]} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person-outline" size={22} color={palette.primary} />
          </Pressable>
        </View>

        <Pressable
          style={[styles.schoolSelector, { backgroundColor: palette.surface, borderColor: palette.border, shadowColor: palette.primary }]}
          onPress={() => router.push('/schools')}
        >
          <Ionicons name="school-outline" size={18} color={palette.primary} />
          <Text style={[styles.schoolText, { color: palette.text }]}>{selectedSchool.name}</Text>
          <Ionicons name="chevron-down" size={18} color={palette.text} />
        </Pressable>

        <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Ionicons name="search-outline" size={18} color={palette.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search hostels, areas or schools..."
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, { color: palette.text }]}
          />
        </View>

        <View style={styles.chipRow}>
        {['Under ₦300k', 'Verified', 'Near school', 'Available now'].map((tag) => (
            <View key={tag} style={[styles.chip, { backgroundColor: palette.soft }]}>
              <Text style={[styles.chipText, { color: palette.text }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Popular near your school</Text>
          <Link href="/(tabs)/explore" style={[styles.linkText, { color: palette.primary }]}>View all</Link>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featured}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => {
            const distanceKm = calculateDistance(
              item.location.latitude,
              item.location.longitude,
              selectedSchool.latitude,
              selectedSchool.longitude,
            );

            return (
              <Pressable
                key={item.id}
                style={[styles.featuredCard, { backgroundColor: palette.soft }]}
                onPress={() => router.push({ pathname: '/property/[id]', params: { id: item.id } })}
              >
                <Image source={{ uri: item.images[0] }} style={styles.featuredImage} resizeMode="cover" />
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredTag}>
                    <Text style={styles.featuredTagText}>Verified</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredMeta}>{formatDistance(distanceKm)} away</Text>
                  <Text style={styles.featuredPrice}>₦{item.price.toLocaleString()} / year</Text>
                </View>
              </Pressable>
            );
          }}
        />

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Recommended for you</Text>
        </View>

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
          <View style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Ionicons name="search-outline" size={42} color={palette.primary} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>No properties found</Text>
            <Text style={[styles.emptyText, { color: palette.muted }]}>Try changing your search or school selection.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  logo: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  schoolText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  linkText: {
    fontWeight: '700',
  },
  horizontalList: {
    paddingRight: 12,
    marginBottom: 18,
  },
  featuredCard: {
    width: width * 0.74,
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
                    backgroundColor: 'rgba(43, 35, 64, 0.32)',
  },
  featuredContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  featuredTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  featuredMeta: {
    color: '#E2E8F0',
    fontSize: 12,
    marginBottom: 6,
  },
  featuredPrice: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 30,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
  },
});
