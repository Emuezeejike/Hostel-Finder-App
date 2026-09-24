import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { schools } from '../src/data/schools';
import { useAppStore } from '../src/store/app-store';

export default function SchoolSelectionScreen() {
  const [query, setQuery] = useState('');
  const selectedSchool = useAppStore((state) => state.selectedSchool) ?? schools[0];
  const setSelectedSchool = useAppStore((state) => state.setSelectedSchool);

  const filteredSchools = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return schools;

    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(search) ||
        school.campus.toLowerCase().includes(search) ||
        school.city.toLowerCase().includes(search),
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Select your school</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for your school"
          placeholderTextColor="#64748B"
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.currentLabel}>Current school</Text>
      <Text style={styles.currentSchool}>{selectedSchool.name}</Text>

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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#0F172A',
  },
  currentLabel: {
    marginTop: 18,
    marginLeft: 20,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  currentSchool: {
    marginLeft: 20,
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  list: {
    padding: 20,
    paddingBottom: 80,
  },
  schoolItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  schoolCampus: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
});
