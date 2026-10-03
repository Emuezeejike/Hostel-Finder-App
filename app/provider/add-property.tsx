import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { createProperty, fetchMyProperties, fetchSchools, updateProperty } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const amenityOptions = ['Water', 'Security', 'Wi-Fi', 'Power/Generator', 'Laundry service', 'CCTV'];
const propertyTypes = ['Hostel', 'Self-contained', 'Room & Parlour', 'Shared Apartment', 'Apartment'] as const;

export default function AddPropertyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const providerProperties = useAppStore((state) => state.providerProperties);
  const availableSchools = useAppStore((state) => state.schools);
  const defaultSchool = useAppStore((state) => state.selectedSchool);
  const setSchools = useAppStore((state) => state.setSchools);
  const setProviderProperties = useAppStore((state) => state.setProviderProperties);
  const existingProperty = providerProperties.find((property) => property.id === id);
  const [title, setTitle] = useState(existingProperty?.title ?? '');
  const [address, setAddress] = useState(existingProperty?.location.address ?? '');
  const [selectedSchoolId, setSelectedSchoolId] = useState(existingProperty?.schoolId ?? '');
  const [schoolPickerOpen, setSchoolPickerOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolLoadError, setSchoolLoadError] = useState('');
  const [isLoadingSchools, setIsLoadingSchools] = useState(availableSchools.length === 0);
  const [propertyType, setPropertyType] = useState<typeof propertyTypes[number]>(existingProperty?.propertyType ?? 'Hostel');
  const [rent, setRent] = useState(existingProperty ? String(existingProperty.price) : '');
  const [description, setDescription] = useState(existingProperty?.description ?? '');
  const [available, setAvailable] = useState(existingProperty?.availability === 'AVAILABLE');
  const [amenities, setAmenities] = useState<string[]>(existingProperty?.amenities ?? []);
  const [images, setImages] = useState<string[]>(existingProperty?.images ?? []);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const selectedSchool = availableSchools.find((school) => school.id === selectedSchoolId);
  const filteredSchools = useMemo(() => {
    const query = schoolSearch.trim().toLowerCase();
    if (!query) return availableSchools;
    return availableSchools.filter((school) =>
      `${school.name} ${school.campus} ${school.city} ${school.state}`.toLowerCase().includes(query),
    );
  }, [availableSchools, schoolSearch]);

  useEffect(() => {
    if (availableSchools.length > 0) return;

    let isMounted = true;
    void fetchSchools()
      .then((schools) => {
        if (isMounted) {
          setIsLoadingSchools(false);
          setSchools(schools);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setSchoolLoadError(error instanceof Error ? error.message : 'Unable to load schools.');
          setIsLoadingSchools(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [availableSchools.length, setSchools]);

  const submitProperty = async () => {
    const price = Number(rent.replace(/[^\d]/g, ''));
    if (!title.trim() || !address.trim() || !selectedSchoolId || !price || !description.trim()) {
      Alert.alert('Complete your listing', 'Add the property name, location, nearby school, rent and description to continue.');
      return;
    }

    const validPhotos = images.filter((image) => /^https?:\/\//i.test(image));
    if (!selectedSchool) {
      Alert.alert('Choose a listed school', 'Select a school from the server school list.');
      return;
    }
    if (!validPhotos.length) {
      Alert.alert('Add a hosted photo URL', 'The documented API accepts public photo URLs. It does not currently document a file-upload endpoint.');
      return;
    }

    const typeValues: Record<string, string> = {
      'Self-contained': 'self_contain',
      'Room & Parlour': 'room_and_parlour',
      'Shared Apartment': 'shared_apartment',
      Hostel: 'hostel',
      Apartment: 'apartment',
    };
    const amenityValues: Record<string, string> = {
      'Wi-Fi': 'wifi',
      'Power/Generator': 'generator',
      'Laundry service': 'laundry',
    };
    const payload = {
      title: title.trim(),
      description: description.trim(),
      price,
      photos: validPhotos.map((url, order) => ({ url, order })),
      amenities: amenities.map((amenity) => amenityValues[amenity] ?? amenity.toLowerCase()),
      address: address.trim(),
      latitude: selectedSchool.latitude || defaultSchool?.latitude || 0,
      longitude: selectedSchool.longitude || defaultSchool?.longitude || 0,
      propertyType: typeValues[propertyType] ?? 'hostel',
      schoolId: selectedSchool.id,
      availabilityStatus: available ? 'available' : 'unavailable',
    };

    setIsSaving(true);
    setSaveMessage('');
    try {
      if (existingProperty) await updateProperty(existingProperty.id, payload);
      else await createProperty(payload);
      setProviderProperties(await fetchMyProperties());
      setSaveMessage(existingProperty ? 'Property changes saved.' : 'Property submitted for review.');
    } catch (error) {
      Alert.alert('Unable to save property', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addPhotoUrl = () => {
    if (!/^https?:\/\//i.test(photoUrl.trim())) {
      Alert.alert('Enter a valid photo URL', 'Use a public https:// image URL.');
      return;
    }
    setImages((current) => [...new Set([...current, photoUrl.trim()])].slice(0, 6));
    setPhotoUrl('');
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
      {saveMessage ? <Text accessibilityRole="alert" style={styles.successMessage}>{saveMessage}</Text> : null}

      <View style={styles.form}>
        <Field label="Property/Hostel Name" value={title} onChangeText={setTitle} placeholder="Royal Haven Lodge" />
        <Field label="Location" value={address} onChangeText={setAddress} placeholder="Surulere" />
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>School/College nearby</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: schoolPickerOpen }}
            onPress={() => setSchoolPickerOpen((open) => !open)}
            style={styles.schoolSelect}
          >
            <Text style={[styles.schoolSelectText, !selectedSchool && styles.schoolPlaceholder]}>
              {selectedSchool ? `${selectedSchool.name}${selectedSchool.campus && selectedSchool.campus !== selectedSchool.name ? ` — ${selectedSchool.campus}` : ''}` : 'Select a school'}
            </Text>
            <Ionicons name={schoolPickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
          </Pressable>
          {schoolPickerOpen ? (
            <View style={styles.schoolPicker}>
              <TextInput
                value={schoolSearch}
                onChangeText={setSchoolSearch}
                placeholder="Search schools"
                placeholderTextColor={colors.muted}
                style={styles.schoolSearch}
                accessibilityLabel="Search schools"
              />
              {isLoadingSchools && availableSchools.length === 0 ? (
                <Text style={styles.schoolPickerMessage}>Loading schools...</Text>
              ) : filteredSchools.length ? (
                <ScrollView style={styles.schoolOptions} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {filteredSchools.map((school) => (
                    <Pressable
                      key={school.id}
                      onPress={() => {
                        setSelectedSchoolId(school.id);
                        setSchoolPickerOpen(false);
                        setSchoolSearch('');
                      }}
                      style={styles.schoolOption}
                    >
                      <Text style={styles.schoolOptionName}>{school.name}</Text>
                      <Text style={styles.schoolOptionDetail}>
                        {[school.campus, school.city, school.state].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join(' · ')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.schoolPickerMessage}>
                  {schoolLoadError || (schoolSearch ? 'No schools match your search.' : 'No schools are available.')}
                </Text>
              )}
            </View>
          ) : null}
        </View>
        <Field label="Rent amount  ₦" value={rent} onChangeText={setRent} placeholder="350,000" keyboardType="numeric" />
        <Field label="Property Description" value={description} onChangeText={setDescription} placeholder="Describe your property" multiline />
      </View>

      <View style={styles.typeSection}><Text style={styles.label}>Property type</Text><View style={styles.typeOptions}>{propertyTypes.map((type) => <Pressable key={type} onPress={() => setPropertyType(type)} style={[styles.typeOption, propertyType === type && styles.typeOptionActive]}><Text style={[styles.typeOptionText, propertyType === type && styles.typeOptionTextActive]}>{type}</Text></Pressable>)}</View></View>

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
        <Text style={styles.sectionTitle}>Property media</Text><Text style={styles.sectionHint}>Add public photo URLs for the listing</Text>
        {images.length > 0 && <ScrollView horizontal contentContainerStyle={styles.mediaRow} showsHorizontalScrollIndicator={false}>{images.map((image, index) => <View key={`${image}-${index}`} style={styles.mediaItem}><Image source={{ uri: image }} style={styles.mediaImage} /><Pressable accessibilityLabel="Remove photo" onPress={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removeImage}><Ionicons name="close" size={16} color={colors.text} /></Pressable></View>)}</ScrollView>}
        <TextInput value={photoUrl} onChangeText={setPhotoUrl} placeholder="https://example.com/property-photo.jpg" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="url" style={styles.photoUrlInput} />
        <Pressable onPress={addPhotoUrl} style={styles.uploadZone}><Ionicons name="add-circle-outline" size={21} color={colors.primary} /><Text style={styles.uploadText}>Add photo URL</Text></Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => void submitProperty()} disabled={isSaving}><Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : existingProperty ? 'Save Changes' : 'Create Listing'}</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
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
  typeSection: { marginTop: 14 },
  typeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  typeOption: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 7, backgroundColor: colors.surface },
  typeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeOptionText: { color: colors.text, fontSize: 11 },
  typeOptionTextActive: { color: '#FFFFFF', fontWeight: '600' },
  fieldGroup: { gap: 7 },
  label: { color: '#171426', fontSize: 13, fontWeight: '600' },
  input: { minHeight: 51, borderRadius: 15, borderWidth: 1, borderColor: '#E5E1EC', backgroundColor: colors.surface, paddingHorizontal: 15, color: colors.text, fontSize: 14 },
  schoolSelect: { minHeight: 51, borderRadius: 15, borderWidth: 1, borderColor: '#E5E1EC', backgroundColor: colors.surface, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  schoolSelectText: { flex: 1, color: colors.text, fontSize: 14, marginRight: 12 },
  schoolPlaceholder: { color: colors.muted },
  schoolPicker: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, padding: 8, gap: 6 },
  schoolSearch: { minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 11, color: colors.text, fontSize: 14 },
  schoolOptions: { maxHeight: 220 },
  schoolOption: { paddingVertical: 10, paddingHorizontal: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  schoolOptionName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  schoolOptionDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  schoolPickerMessage: { color: colors.muted, fontSize: 13, padding: 10 },
  photoUrlInput: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12, color: colors.text, fontSize: 13 },
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
  successMessage: { color: '#287647', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bottomSpace: { height: 20 },
});
