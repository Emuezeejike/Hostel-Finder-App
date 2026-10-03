import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { createInspectionSlots } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProviderAvailabilityScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const schedule = useAppStore((state) => state.availabilitySchedule);
  const setAvailabilitySchedule = useAppStore((state) => state.setAvailabilitySchedule);
  const user = useAppStore((state) => state.authUser);
  const [draft, setDraft] = useState(schedule);
  const [isSaving, setIsSaving] = useState(false);
  const updateDay = (day: string, key: 'available' | 'from' | 'to', value: boolean | string) => {
    setDraft((current) => ({ ...current, [day]: { ...(current[day] ?? { available: false, from: '10:00 AM', to: '02:00 PM' }), [key]: value } }));
  };

  const saveAvailability = async () => {
    if (!propertyId) {
      Alert.alert('Property required', 'Open availability from one of your property listings.');
      return;
    }
    if (user?.role !== 'provider') {
      router.push({ pathname: '/auth/login', params: { role: 'provider' } });
      return;
    }
    const now = new Date();
    const windows = days.flatMap((day) => {
      const entry = draft[day];
      if (!entry?.available) return [];
      const target = new Date(now);
      const dayIndex = days.indexOf(day);
      const offset = (dayIndex - now.getDay() + 7) % 7;
      target.setDate(now.getDate() + offset);
      const parseTime = (value: string) => {
        const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;
        const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
        return { hour, minute: Number(match[2]) };
      };
      const from = parseTime(entry.from);
      const to = parseTime(entry.to);
      if (!from || !to) return [];
      const start = new Date(target);
      const end = new Date(target);
      start.setHours(from.hour, from.minute, 0, 0);
      end.setHours(to.hour, to.minute, 0, 0);
      if (end <= now) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
      }
      return end > start ? [{ start: start.toISOString(), end: end.toISOString() }] : [];
    });
    if (!windows.length) {
      Alert.alert('No valid time windows', 'Enable at least one day and enter a valid start and end time.');
      return;
    }
    setIsSaving(true);
    try {
      await createInspectionSlots(propertyId, windows, 30);
      setAvailabilitySchedule(draft);
      Alert.alert('Availability saved', 'The server has created inspection slots for your selected windows.');
      router.back();
    } catch (error) {
      Alert.alert('Unable to save availability', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.title}>Inspection</Text><Text style={styles.subtitle}>Set the days and times when students can visit this property for inspection.</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Your Availability</Text>
      {days.map((day) => {
        const entry = draft[day] ?? { available: false, from: '10:00 AM', to: '02:00 PM' };
        return (
          <View key={day} style={[styles.dayCard, entry.available && styles.dayCardActive]}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day}</Text>
              <View style={styles.switchRow}><Text style={[styles.availabilityLabel, !entry.available && styles.unavailableLabel]}>{entry.available ? 'Available' : 'Unavailable'}</Text><Switch value={entry.available} onValueChange={(value) => updateDay(day, 'available', value)} trackColor={{ false: '#D7D5DD', true: '#47C832' }} thumbColor="#FFFFFF" /></View>
            </View>
            {entry.available && (
              <View style={styles.timeRow}>
                <TimeField label="From" value={entry.from} onChangeText={(value) => updateDay(day, 'from', value)} />
                <TimeField label="To" value={entry.to} onChangeText={(value) => updateDay(day, 'to', value)} />
              </View>
            )}
          </View>
        );
      })}
      <View style={styles.stepsPanel}>
        <View style={styles.stepsTitleRow}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><Text style={styles.stepsTitle}>How inspection booking works</Text></View>
        <View style={styles.stepsTrack}>{['Set availability', 'Create slots', 'Student chooses', 'Auto-confirm'].map((step, index) => <View key={step} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}</View>
      </View>
      <Pressable style={styles.saveButton} onPress={() => void saveAvailability()} disabled={isSaving}><Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Availability'}</Text></Pressable>
      {propertyId ? <Text style={styles.propertyNote}>Availability for {useAppStore.getState().providerProperties.find((property) => property.id === propertyId)?.title ?? 'your property'}</Text> : null}
    </ScrollView>
  );
}

function TimeField(props: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View style={styles.timeField}><Text style={styles.timeLabel}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} placeholder="10:00 AM" placeholderTextColor={colors.muted} style={styles.timeInput} /></View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  backButton: { width: 34, height: 42, justifyContent: 'center', marginRight: 4 },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontWeight: '700' },
  subtitle: { color: '#16131F', fontSize: 14, lineHeight: 20, marginTop: 5 },
  sectionTitle: { color: '#171426', fontSize: 19, fontWeight: '600', marginBottom: 5 },
  dayCard: { borderWidth: 1, borderColor: colors.primary, borderRadius: 7, padding: 8, marginBottom: 11, minHeight: 50 },
  dayCardActive: { minHeight: 91 },
  dayHeader: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayName: { color: '#171426', fontSize: 14, fontWeight: '500' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  availabilityLabel: { color: '#27B818', fontSize: 12, fontWeight: '600' },
  unavailableLabel: { color: '#B8B6BD' },
  timeRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  timeField: { flex: 1, minHeight: 34, backgroundColor: '#E5DDF0', borderRadius: 5, paddingHorizontal: 7, paddingTop: 3 },
  timeLabel: { color: '#171426', fontSize: 10 },
  timeInput: { color: '#171426', height: 20, fontSize: 11, padding: 0 },
  stepsPanel: { borderRadius: 9, backgroundColor: '#E7DDF2', padding: 12, marginTop: 3, marginBottom: 23 },
  stepsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  stepsTitle: { color: '#171426', fontSize: 14, fontWeight: '600' },
  stepsTrack: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { flex: 1, alignItems: 'center', gap: 7 },
  stepNumber: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#A27AD9', alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepText: { color: '#171426', fontSize: 9, textAlign: 'center', lineHeight: 12 },
  saveButton: { minHeight: 49, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  propertyNote: { textAlign: 'center', marginTop: 10, color: colors.muted, fontSize: 12 },
});