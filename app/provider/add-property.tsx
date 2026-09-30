import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { Property } from '../../src/types';
import { colors } from '../../src/theme/colors';

const amenityOptions = ['Water', 'Security', 'Wi-Fi', 'Power/Generator', 'Laundry service', 'CCTV'];

export default function AddPropertyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const providerProperties = useAppStore((state) => state.providerProperties);
  const availableSchools = useAppStore((state) => state.schools);
  const selectedSchool = useAppStore((state) => state.selectedSchool);
  const setProviderPropertyDraft = useAppStore((state) => state.setProviderPropertyDraft);
  const existingProperty = providerProperties.find((property) => property.id === id);
  const [title, setTitle] = useState(existingProperty?.title ?? '');
  const [address, setAddress] = useState(existingProperty?.location.address ?? '');
  const [nearbySchool, setNearbySchool] = useState(selectedSchool?.name ?? '');
  const [distance, setDistance] = useState('');
  const [drivingTime, setDrivingTime] = useState('');
  const [rent, setRent] = useState(existingProperty ? String(existingProperty.price) : '');
  const [description, setDescription] = useState(existingProperty?.description ?? '');
  const [available, setAvailable] = useState(existingProperty?.availability === 'AVAILABLE');
  const [amenities, setAmenities] = useState<string[]>(existingProperty?.amenities ?? []);
  const [images, setImages] = useState<string[]>(existingProperty?.images ?? []);

  const chooseImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 6, quality: 0.85 });
      if (!result.canceled) setImages((current) => [...current, ...result.assets.map((asset) => asset.uri)].slice(0, 6));
    } catch {
      Alert.alert('Unable to open photos', 'Please try selecting your property photos again.');
    }
  };

  const continueToVerification = () => {
    const monthlyRent = Number(rent.replace(/[^\d]/g, ''));
    if (!title.trim() || !address.trim() || !nearbySchool.trim() || !monthlyRent || !description.trim()) {
      Alert.alert('Complete your listing', 'Add the property name, location, nearby school, rent and description to continue.');
      return;
    }

    const school = availableSchools.find((item) => item.name.toLowerCase() === nearbySchool.trim().toLowerCase());
    const property: Property = {
      id: existingProperty?.id ?? `provider-${Date.now()}`,
      schoolId: school?.id,
      title: title.trim(),
      description: description.trim(),
      propertyType: existingProperty?.propertyType ?? 'Hostel',
      price: monthlyRent,
      images: images.length ? images : existingProperty?.images ?? [],
      location: {
        address: address.trim(),
        city: school?.city ?? '',
        state: school?.state ?? '',
        latitude: school?.latitude ?? selectedSchool?.latitude ?? 0,
        longitude: school?.longitude ?? selectedSchool?.longitude ?? 0,
      },
      amenities,
      availability: available ? 'AVAILABLE' : 'UNAVAILABLE',
      verificationStatus: existingProperty?.verificationStatus ?? 'PENDING',
      provider: existingProperty?.provider ?? { id: 'provider-demo', name: 'Property provider', isVerified: false, phone: '' },
      inspectionAvailable: available,
      createdAt: existingProperty?.createdAt ?? new Date().toISOString(),
    };

    setProviderPropertyDraft(property);
    router.push('/provider/profile');
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.title}>Property Information</Text><Text style={styles.subtitle}>Provide detailed information of your property</Text></View>
      </View>

      <View style={styles.form}>
        <Field label="Property/Hostel Name" value={title} onChangeText={setTitle} placeholder="Royal Haven Lodge" />
        <Field label="Location" value={address} onChangeText={setAddress} placeholder="Surulere" />
        <Field label="School/College nearby" value={nearbySchool} onChangeText={setNearbySchool} placeholder="Lagos State University" />
        <Field label="Distance from school" value={distance} onChangeText={setDistance} placeholder="1.2 km" />
        <Field label="Estimated driving time" value={drivingTime} onChangeText={setDrivingTime} placeholder="7 mins" />
        <Field label="Monthly rent  ₦" value={rent} onChangeText={setRent} placeholder="350,000" keyboardType="numeric" />
        <Field label="Property Description" value={description} onChangeText={setDescription} placeholder="Describe your property" multiline />
      </View>

      <View style={styles.availabilityRow}><Text style={styles.label}>Availability</Text><Switch value={available} onValueChange={setAvailable} trackColor={{ false: '#D9D7DF', true: colors.primary }} thumbColor="#FFFFFF" /></View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property facilities/amenities</Text>
        <Text style={styles.sectionHint}>Select amenities available (multiple)</Text>
        <View style={styles.amenitiesGrid}>
          {amenityOptions.map((amenity) => {
            const selected = amenities.includes(amenity);
            return <Pressable key={amenity} onPress={() => toggleAmenity(amenity)} style={styles.amenityOption} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}><View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}</View><Text style={styles.amenityText}>{amenity}</Text></Pressable>;
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property media</Text><Text style={styles.sectionHint}>Upload photos of your property</Text>
        {images.length > 0 && <ScrollView horizontal contentContainerStyle={styles.mediaRow} showsHorizontalScrollIndicator={false}>{images.map((image, index) => <View key={`${image}-${index}`} style={styles.mediaItem}><Image source={{ uri: image }} style={styles.mediaImage} /><Pressable accessibilityLabel="Remove photo" onPress={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removeImage}><Ionicons name="close" size={16} color={colors.text} /></Pressable></View>)}</ScrollView>}
        <Pressable onPress={chooseImages} style={styles.uploadZone}><Ionicons name="cloud-upload-outline" size={21} color={colors.primary} /><Text style={styles.uploadText}>{images.length ? 'Add more photos' : 'Tap to upload property photos'}</Text></Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={continueToVerification}><Text style={styles.primaryButtonText}>Continue to Verification</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'numeric'; multiline?: boolean }) {
  return <View style={styles.fieldGroup}><Text style={styles.label}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor={colors.muted} keyboardType={props.keyboardType ?? 'default'} multiline={props.multiline} textAlignVertical={props.multiline ? 'top' : 'center'} style={[styles.input, props.multiline && styles.descriptionInput]} /></View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  backButton: { width: 30, height: 34, justifyContent: 'center', marginRight: 1 },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 24, lineHeight: 31, fontWeight: '800' },
  subtitle: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 3, marginLeft: -10 },
  form: { gap: 9 },
  fieldGroup: { gap: 7 },
  label: { color: '#171426', fontSize: 13, fontWeight: '600' },
  input: { minHeight: 51, borderRadius: 15, borderWidth: 1, borderColor: '#E5E1EC', backgroundColor: colors.surface, paddingHorizontal: 15, color: colors.text, fontSize: 14 },
  descriptionInput: { minHeight: 58, paddingTop: 15, paddingBottom: 12 },
  availabilityRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, borderBottomWidth: 1, borderBottomColor: colors.border },
  section: { paddingTop: 12, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  sectionHint: { color: colors.text, fontSize: 13, marginTop: 5, marginBottom: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  amenityOption: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 27 },
  checkbox: { width: 23, height: 23, borderWidth: 2, borderColor: colors.primary, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary },
  amenityText: { color: colors.text, fontSize: 12 },
  mediaRow: { gap: 8, paddingBottom: 10 },
  mediaItem: { width: 104, height: 86, position: 'relative' },
  mediaImage: { width: '100%', height: '100%', borderRadius: 10, backgroundColor: colors.soft },
  removeImage: { position: 'absolute', top: 5, right: 5, width: 23, height: 23, borderRadius: 12, backgroundColor: '#FFFFFFE8', alignItems: 'center', justifyContent: 'center' },
  uploadZone: { minHeight: 53, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.muted, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  uploadText: { color: colors.muted, fontSize: 13 },
  primaryButton: { minHeight: 56, marginTop: 20, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bottomSpace: { height: 20 },
});
