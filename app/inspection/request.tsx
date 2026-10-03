import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../src/utils/currency';
import { useAppStore } from '../../src/store/app-store';
import { ApiSlot, bookInspection, fetchOpenSlots } from '../../src/api/client';
import { MainBottomBar } from '../../src/components/MainBottomBar';
import { colors } from '../../src/theme/colors';

export default function InspectionRequestScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const properties = useAppStore((state) => state.properties);
  const property = properties.find((item) => item.id === id);
  const addInspectionRequest = useAppStore((state) => state.addInspectionRequest);
  const selectedSchool = useAppStore((state) => state.selectedSchool);
  const user = useAppStore((state) => state.authUser);
  const [slots, setSlots] = useState<ApiSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!id || user?.role !== 'student' || user.verificationStatus !== 'VERIFIED') return;
    let mounted = true;
    void fetchOpenSlots(id).then((items) => {
      if (!mounted) return;
      setSlots(items);
      const firstDate = items[0] ? new Date(items[0].start).toDateString() : '';
      setSelectedDate(firstDate);
      setSelectedSlotId(items[0]?.id ?? '');
    }).catch((error: unknown) => {
      if (mounted) setFormError(error instanceof Error ? error.message : 'Unable to load inspection slots.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [id, user]);

  const dates = [...new Set(slots.map((slot) => new Date(slot.start).toDateString()))];
  const dateSlots = slots.filter((slot) => new Date(slot.start).toDateString() === selectedDate);

  const handleSubmit = async () => {
    if (!user || user.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    if (user.verificationStatus !== 'VERIFIED') {
      router.push('/student/verification');
      return;
    }
    if (!id || !selectedSlotId) {
      setFormError('Choose an available inspection time first.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const booked = await bookInspection(id, selectedSlotId);
      if (booked) addInspectionRequest(booked);
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
          <Text style={styles.subtitle}>Choose a date and time that works for you. Slots reflect the landlord&apos;s availability.</Text>
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
            <Text style={styles.panelHint}>Available dates from landlord</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dates.map((date) => {
            const label = new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
            const active = selectedDate === date;
            return <Pressable key={date} onPress={() => { setSelectedDate(date); setSelectedSlotId(''); }} style={[styles.dateButton, active && styles.dateButtonActive]}><Text style={[styles.dateWeekday, active && styles.dateTextActive]}>{label}</Text><View style={[styles.dateDot, active && styles.dateDotActive]} /></Pressable>;
          })}
          {!isLoading && dates.length === 0 ? <Text style={styles.panelHint}>{user?.verificationStatus === 'VERIFIED' ? 'No dates are currently available.' : 'Verify your student account to view open times.'}</Text> : null}
        </ScrollView>
      </View>

      <View style={styles.bookingPanel}>
        <View style={styles.panelHeading}>
          <View style={styles.headingIcon}><Ionicons name="time-outline" size={20} color="#fff" /></View>
          <View>
            <Text style={styles.panelTitle}>Select Time</Text>
            <Text style={styles.panelHint}>Available time slots</Text>
          </View>
        </View>
        <View style={styles.timeGrid}>
          {dateSlots.map((slot) => {
            const active = selectedSlotId === slot.id;
            const start = new Date(slot.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            const end = new Date(slot.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            return <Pressable key={slot.id} onPress={() => setSelectedSlotId(slot.id)} style={[styles.timeButton, active && styles.timeButtonActive]}><Text style={[styles.timeText, active && styles.timeTextActive]}>{start} - {end}</Text>{active && <Ionicons name="checkmark-circle" size={19} color="#fff" />}</Pressable>;
          })}
          {isLoading ? <Text style={styles.panelHint}>Loading available times...</Text> : null}
          {!isLoading && selectedDate && dateSlots.length === 0 ? <Text style={styles.panelHint}>No open times for this date.</Text> : null}
        </View>
      </View>

      {formError ? <Text accessibilityRole="alert" style={styles.errorText}>{formError}</Text> : null}
      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting || isLoading}>
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
  dateRow: { gap: 10, paddingRight: 2 },
  dateButton: { width: 57, minHeight: 70, borderRadius: 11, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 },
  dateButtonActive: { backgroundColor: colors.primary },
  dateWeekday: { color: colors.muted, fontSize: 11 },
  dateDay: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 3 },
  dateMonth: { color: colors.muted, fontSize: 10 },
  dateTextActive: { color: '#fff' },
  dateDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 4 },
  dateDotActive: { backgroundColor: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeButton: { width: '48%', minHeight: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  timeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeText: { color: colors.primary, fontSize: 11 },
  timeTextActive: { color: '#fff' },
  submitButton: { height: 52, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  schoolNote: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: 8 },
  errorText: { color: '#A33B45', fontSize: 12, marginBottom: 10 },
});