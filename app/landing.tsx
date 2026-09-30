import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '../src/components/BrandLogo';
import { colors } from '../src/theme/colors';

const studentFeatures = [
  { icon: 'shield-checkmark-outline' as const, title: 'Verified\nProperties', detail: 'We verify landlords and listings for your safety.' },
  { icon: 'location-outline' as const, title: 'Accurate\nlocation info', detail: 'Know how long it takes to get to campus.' },
  { icon: 'calendar-outline' as const, title: 'Easy\ninspections', detail: 'Book an available slot at your convenience.' },
];

const providerFeatures = [
  { icon: 'shield-checkmark-outline' as const, title: 'Get Verified', detail: 'Complete verification and earn trust.' },
  { icon: 'location-outline' as const, title: 'Faster Bookings', detail: 'Clear details help your property stand out.' },
  { icon: 'calendar-outline' as const, title: 'Manage Inspections', detail: 'Review and manage requests in one place.' },
];

const menuItems = [
  { icon: 'home-outline' as const, label: 'Home', route: '/landing' },
  { icon: 'search-outline' as const, label: 'Browse properties', route: '/(tabs)/explore' },
  { icon: 'calendar-outline' as const, label: 'List your property', route: '/role-select' },
  { icon: 'person-add-outline' as const, label: 'Create account', route: '/auth/register' },
  { icon: 'log-in-outline' as const, label: 'Log in', route: '/auth/login' },
];

function FeatureGrid({ items }: { items: typeof studentFeatures }) {
  return (
    <View style={styles.featureGrid}>
      {items.map((item) => (
        <View key={item.title} style={styles.feature}>
          <Ionicons name={item.icon} size={29} color={colors.primary} />
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureDetail}>{item.detail}</Text>
        </View>
      ))}
    </View>
  );
}

export default function LandingScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <BrandLogo compact />
          <Pressable accessibilityLabel="Open menu" style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={29} color="#08070B" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.headline}>Find a hostel you
can feel confident
about.</Text>
            <Text style={styles.description}>
              Discover verified off-campus accommodation, compare by price and location, and book inspections before you decide.
            </Text>
          </View>
          <Image source={require('../assets/image1.png')} resizeMode="contain" style={styles.students} />
        </View>

        <Text style={styles.sectionHeading}>Are you a student?</Text>
        <FeatureGrid items={studentFeatures} />
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryButtonText}>Browse hostels</Text>
          <Ionicons name="arrow-forward" size={25} color="#fff" />
        </Pressable>

        <Text style={styles.sectionHeading}>Are you a hostel owner?</Text>
        <FeatureGrid items={providerFeatures} />
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/role-select')}>
          <Text style={styles.secondaryButtonText}>List your property</Text>
          <Ionicons name="arrow-forward" size={24} color={colors.text} />
        </Pressable>
      </ScrollView>

      <Modal
        visible={menuVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setMenuVisible(false)}
      >
        <SafeAreaView style={styles.menuScreen} edges={['top', 'bottom']}>
          <View style={styles.menuCloseRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close" size={21} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.menuHeading}>
            <Ionicons name="menu" size={36} color={colors.text} />
            <Text style={styles.menuTitle}>Menu</Text>
          </View>
          <View style={styles.menuLinks}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push(item.route);
                }}
              >
                <Ionicons name={item.icon} size={27} color="#512A88" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 44,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScreen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  menuCloseRow: {
    height: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  menuHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  menuLinks: {
    gap: 1,
  },
  menuItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 19,
  },
  menuItemText: {
    color: '#100D16',
    fontSize: 16,
    fontWeight: '500',
  },
  hero: {
    width: '100%',
    minHeight: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  headline: {
    color: '#100D16',
    fontSize: 28,
    lineHeight: 39,
    fontWeight: '800',
  },
  description: {
    maxWidth: '100%',
    marginTop: 14,
    color: '#211B2D',
    fontSize: 15,
    lineHeight: 22,
  },
  students: {
    width: '38%',
    minWidth: 100,
    maxWidth: 200,
    height: 240,
    flexShrink: 1,
  },
  sectionHeading: {
    color: '#100D16',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  feature: {
    flex: 1,
    minHeight: 176,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  featureTitle: {
    color: '#100D16',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 7,
  },
  featureDetail: {
    color: '#383142',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 2,
    marginBottom: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '600',
  },
});