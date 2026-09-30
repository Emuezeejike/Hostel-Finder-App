import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { colors } from '../../src/theme/colors';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProviderAvailabilityScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const schedule = useAppStore((state) => state.availabilitySchedule);
  const setAvailabilitySchedule = useAppStore((state) => state.setAvailabilitySchedule);
  const [draft, setDraft] = useState(schedule);
  const updateDay = (day: string, key: 'available' | 'from' | 'to', value: boolean | string) => {
    setDraft((current) => ({ ...current, [day]: { ...current[day], [key]: value } }));
  };

  const saveAvailability = () => {
    setAvailabilitySchedule(draft);
    Alert.alert('Availability saved', 'Students can request inspections during the days and times you selected.');
    router.back();
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
      <Pressable style={styles.saveButton} onPress={saveAvailability}><Text style={styles.saveButtonText}>Save Availability</Text></Pressable>
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