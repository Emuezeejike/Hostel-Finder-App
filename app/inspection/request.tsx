import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../src/utils/currency';
import { useAppStore } from '../../src/store/app-store';
import { bookInspection } from '../../src/api/client';
import { MainBottomBar } from '../../src/components/MainBottomBar';
import { colors } from '../../src/theme/colors';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function InspectionRequestScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const properties = useAppStore((state) => state.properties);
  const property = properties.find((item) => item.id === id);
  const addInspectionRequest = useAppStore((state) => state.addInspectionRequest);
  const selectedSchool = useAppStore((state) => state.selectedSchool);
  const user = useAppStore((state) => state.authUser);
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const firstWeekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarCells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );
  const todayKey = dateKey(today);

  const handleSubmit = async () => {
    if (!user || user.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    if (user.verificationStatus !== 'VERIFIED') {
      router.push('/student/verification');
      return;
    }
    if (!id || !selectedDate || !selectedTime) {
      setFormError('Choose an inspection date and enter a time.');
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(selectedTime)) {
      setFormError('Enter a valid time in 24-hour format, such as 14:30.');
      return;
    }
    if (selectedDate < todayKey) {
      setFormError('Choose today or a future date.');
      return;
    }
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hour, minute] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(year, month - 1, day, hour, minute).toISOString();
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      setFormError('Choose a future time for your inspection.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const booked = await bookInspection(id, scheduledAt);
      addInspectionRequest(booked);
      router.push('/inspection/success');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to book this inspection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) return <View style={styles.missing}><Text style={styles.title}>Property unavailable</Text><Text style={styles.subtitle}>Return to the listings and choose a property loaded from the server.</Text></View>;

  return (
    <View style={styles.screen}>
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Book Inspection</Text>
          <Text style={styles.subtitle}>Choose the date and time you would like to visit.</Text>
        </View>
      </View>

      <View style={styles.propertyCard}>
        <Image source={{ uri: property.images[0] }} style={styles.propertyImage} resizeMode="cover" />
        <View style={styles.propertyInfo}>
          <View style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
          <Text style={styles.propertyName} numberOfLines={2}>{property.title}</Text>
          <Text style={styles.location} numberOfLines={1}><Ionicons name="location-outline" size={13} color={colors.muted} /> {property.location.address}</Text>
          <View style={styles.ratingRow}><Ionicons name="star" size={14} color={colors.primary} /><Text style={styles.ratingText}>4.8 • 120 Reviews</Text></View>
          <Text style={styles.propertyType}>{property.propertyType.toUpperCase()}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatCurrency(property.price)}<Text style={styles.priceSuffix}>/year</Text></Text>
          <Pressable onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })} style={styles.detailsButton}>
            <Text style={styles.detailsText}>View details</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.bookingPanel}>
        <View style={styles.panelHeading}>
          <View style={styles.headingIcon}><Ionicons name="calendar-outline" size={20} color="#fff" /></View>
          <View>
            <Text style={styles.panelTitle}>Select Date</Text>
            <Text style={styles.panelHint}>Pick any date from today onward</Text>
          </View>
        </View>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityLabel="Previous month"
            disabled={calendarMonth.getFullYear() === today.getFullYear() && calendarMonth.getMonth() === today.getMonth()}
            onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            style={styles.monthButton}
          >
            <Ionicons name="chevron-back" size={19} color={colors.primary} />
          </Pressable>
          <Text style={styles.monthTitle}>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
          <Pressable accessibilityLabel="Next month" onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} style={styles.monthButton}>
            <Ionicons name="chevron-forward" size={19} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.calendarGrid}>
          {weekdays.map((weekday) => <Text key={weekday} style={styles.weekdayLabel}>{weekday}</Text>)}
          {calendarCells.map((day, index) => {
            if (day === null) return <View key={`empty-${index}`} style={styles.calendarCell} />;
            const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
            const key = dateKey(date);
            const disabled = key < todayKey;
            const active = key === selectedDate;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled }}
                disabled={disabled}
                onPress={() => setSelectedDate(key)}
                style={[styles.calendarCell, styles.calendarDay, active && styles.calendarDayActive, disabled && styles.calendarDayDisabled]}
              >
                <Text style={[styles.calendarDayText, active && styles.calendarDayTextActive, disabled && styles.calendarDayTextDisabled]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedDate ? <Text style={styles.selectedDate}>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text> : null}
      </View>

      <View style={styles.bookingPanel}>
        <View style={styles.panelHeading}>
          <View style={styles.headingIcon}><Ionicons name="time-outline" size={20} color="#fff" /></View>
          <View>
            <Text style={styles.panelTitle}>Select Time</Text>
            <Text style={styles.panelHint}>Enter a preferred time in 24-hour format</Text>
          </View>
        </View>
        <TextInput
          accessibilityLabel="Preferred inspection time"
          value={selectedTime}
          onChangeText={(value) => setSelectedTime(value.replace(/[^\d:]/g, '').slice(0, 5))}
          placeholder="HH:MM (for example, 14:30)"
          placeholderTextColor={colors.muted}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          style={styles.timeInput}
        />
      </View>

      {formError ? <Text accessibilityRole="alert" style={styles.errorText}>{formError}</Text> : null}
      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? 'Booking...' : 'Book Inspection'}</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>
      {selectedSchool && <Text style={styles.schoolNote}>Booking as {user?.name ?? 'guest'} near {selectedSchool.name}</Text>}
    </ScrollView>
    <MainBottomBar active="book" propertyId={property.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center', gap: 10 },
  screen: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { color: colors.text, fontSize: 23, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  propertyCard: { backgroundColor: colors.surface, borderRadius: 10, padding: 8, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, elevation: 2 },
  propertyImage: { width: '48%', height: 112, borderRadius: 8, backgroundColor: colors.soft },
  propertyInfo: { width: '52%', paddingLeft: 9, justifyContent: 'center' },
  verifiedPill: { flexDirection: 'row', gap: 4, alignItems: 'center', alignSelf: 'flex-end', backgroundColor: colors.soft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  verifiedText: { color: colors.text, fontSize: 9 },
  propertyName: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 5 },
  location: { color: colors.muted, fontSize: 10, marginTop: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  ratingText: { color: colors.text, fontSize: 10 },
  propertyType: { color: colors.text, fontSize: 9, marginTop: 6 },
  cardFooter: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: colors.border, marginTop: 9, paddingTop: 9 },
  price: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  priceSuffix: { color: colors.muted, fontSize: 11, fontWeight: '400' },
  detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 },
  detailsText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  bookingPanel: { backgroundColor: colors.surface, borderRadius: 10, padding: 15, marginBottom: 14, elevation: 2 },
  panelHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  headingIcon: { width: 37, height: 37, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  panelTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  panelHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekdayLabel: { width: '14.28%', textAlign: 'center', color: colors.muted, fontSize: 11, fontWeight: '600', paddingVertical: 8 },
  calendarCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' },
  calendarDay: { borderRadius: 20 },
  calendarDayActive: { backgroundColor: colors.primary },
  calendarDayDisabled: { opacity: 0.45 },
  calendarDayText: { color: colors.text, fontSize: 13 },
  calendarDayTextActive: { color: '#FFFFFF', fontWeight: '700' },
  calendarDayTextDisabled: { color: colors.muted },
  selectedDate: { color: colors.primary, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  timeInput: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 12, color: colors.text, fontSize: 15 },
  submitButton: { height: 52, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  schoolNote: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: 8 },
  errorText: { color: '#A33B45', fontSize: 12, marginBottom: 10 },
});