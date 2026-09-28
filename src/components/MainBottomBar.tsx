import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../theme/colors';

type Tab = 'home' | 'search' | 'book' | 'menu';

interface MainBottomBarProps {
  active: Tab;
  propertyId?: string;
}

const tabs: { key: Tab; label: string; icon: 'home-outline' | 'search-outline' | 'bookmark-outline' | 'menu' }[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'search', label: 'Search', icon: 'search-outline' },
  { key: 'book', label: 'Book', icon: 'bookmark-outline' },
  { key: 'menu', label: 'Menu', icon: 'menu' },
];

export function MainBottomBar({ active, propertyId }: MainBottomBarProps) {
  const navigate = (tab: Tab) => {
    if (tab === 'home') router.push('/(tabs)');
    if (tab === 'search') router.push('/(tabs)/explore');
    if (tab === 'book') {
      if (propertyId) {
        router.push({ pathname: '/inspection/request', params: { id: propertyId } });
      } else {
        router.push('/(tabs)/inspections');
      }
    }
    if (tab === 'menu') router.push('/(tabs)/profile');
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const tint = selected ? colors.primary : colors.text;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => navigate(tab.key)}
            style={styles.item}
          >
            <Ionicons name={tab.icon} size={23} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 66,
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  item: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});