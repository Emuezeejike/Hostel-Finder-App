import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme/colors';

interface BrandLogoProps {
  compact?: boolean;
  stacked?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BrandLogo({ compact = false, stacked = false, style }: BrandLogoProps) {
  return (
    <View style={[styles.container, stacked && styles.stacked, style]}>
      <Image
        source={require('../../assets/HostelFinderLogo.png')}
        contentFit="contain"
        accessibilityLabel="Hostel Finder logo"
        style={[styles.mark, compact ? styles.compactMark : styles.largeMark]}
      />
      <Text style={[styles.wordmark, compact && styles.compactWordmark]}>
        Hostel <Text style={styles.accent}>Finder</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stacked: {
    flexDirection: 'column',
    gap: 14,
  },
  mark: {
    backgroundColor: 'transparent',
  },
  compactMark: {
    width: 42,
    height: 38,
  },
  largeMark: {
    width: 76,
    height: 62,
  },
  wordmark: {
    color: '#08070B',
    fontSize: 21,
    fontWeight: '800',
  },
  compactWordmark: {
    fontSize: 19,
  },
  accent: {
    color: colors.primary,
  },
});