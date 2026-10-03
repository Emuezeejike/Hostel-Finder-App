import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/app-store';
import { colors } from '../src/theme/colors';

export default function SchoolSelectionScreen() {
  const [query, setQuery] = useState('');
  const availableSchools = useAppStore((state) => state.schools);
  const selectedSchool = useAppStore((state) => state.selectedSchool) ?? availableSchools[0];
  const apiError = useAppStore((state) => state.apiError);
  const setSelectedSchool = useAppStore((state) => state.setSelectedSchool);

  const filteredSchools = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return availableSchools;

    return availableSchools.filter(
      (school) =>
        school.name.toLowerCase().includes(search) ||
        school.campus.toLowerCase().includes(search) ||
        school.city.toLowerCase().includes(search),
    );
  }, [availableSchools, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Select your school</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for your school"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.currentLabel}>Current school</Text>
      <Text style={styles.currentSchool}>{selectedSchool?.name ?? 'No school selected'}</Text>
      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

      <FlatList
        data={filteredSchools}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.schoolItem}
            onPress={() => {
              setSelectedSchool(item);
              router.back();
            }}
          >
            <Text style={styles.schoolName}>{item.name}</Text>
            <Text style={styles.schoolCampus}>{item.campus}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 18,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  currentLabel: {
    marginTop: 18,
    marginLeft: 20,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  currentSchool: {
    marginLeft: 20,
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  errorText: { color: '#A33B45', fontSize: 12, marginHorizontal: 20, marginTop: 8 },
  list: {
    padding: 20,
    paddingBottom: 80,
  },
  schoolItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  schoolCampus: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
});
