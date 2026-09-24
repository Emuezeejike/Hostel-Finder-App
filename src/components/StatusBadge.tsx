import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const palette = {
    success: { backgroundColor: '#DCFCE7', color: '#166534' },
    warning: { backgroundColor: '#FEF3C7', color: '#92400E' },
    danger: { backgroundColor: '#FEE2E2', color: '#991B1B' },
    neutral: { backgroundColor: '#E2E8F0', color: '#0F172A' },
  };

  const styles = StyleSheet.create({
    badge: {
      backgroundColor: palette[tone].backgroundColor,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: 'flex-start',
    },
    text: {
      color: palette[tone].color,
      fontWeight: '700',
      fontSize: 10,
      textTransform: 'uppercase',
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
