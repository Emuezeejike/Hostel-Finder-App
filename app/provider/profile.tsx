import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { colors } from '../../src/theme/colors';

interface UploadItem {
  name: string;
  uri: string;
}

export default function ProviderProfileScreen() {
  const authUser = useAppStore((state) => state.authUser);
  const draft = useAppStore((state) => state.providerPropertyDraft);
  const addProviderProperty = useAppStore((state) => state.addProviderProperty);
  const updateProviderProperty = useAppStore((state) => state.updateProviderProperty);
  const setProviderPropertyDraft = useAppStore((state) => state.setProviderPropertyDraft);
  const [fullName, setFullName] = useState(authUser?.name ?? '');
  const [email, setEmail] = useState(authUser?.email ?? '');
  const [phone, setPhone] = useState('');
  const [documentType, setDocumentType] = useState('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [governmentId, setGovernmentId] = useState<UploadItem | null>(null);
  const [ownershipProof, setOwnershipProof] = useState<UploadItem | null>(null);
  const [propertyPhoto, setPropertyPhoto] = useState<UploadItem | null>(null);

  const pickDocument = async (setFile: React.Dispatch<React.SetStateAction<UploadItem | null>>) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled) setFile({ name: result.assets[0].name, uri: result.assets[0].uri });
    } catch {
      Alert.alert('Unable to open documents', 'Please try selecting the file again.');
    }
  };

  const pickPropertyPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (!result.canceled) setPropertyPhoto({ name: 'Property photo', uri: result.assets[0].uri });
    } catch {
      Alert.alert('Unable to open photos', 'Please try selecting the property photo again.');
    }
  };

  const submitVerification = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !idNumber.trim() || !governmentId || !ownershipProof || !propertyPhoto) {
      Alert.alert('Complete your verification', 'Add your contact details and all three required documents before submitting.');
      return;
    }

    if (draft) {
      const property = { ...draft, verificationStatus: 'PENDING' as const };
      if (draft.id.startsWith('provider-')) addProviderProperty(property);
      else updateProviderProperty(draft.id, property);
      setProviderPropertyDraft(null);
    }

    router.replace('/provider/properties');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
        <Text style={styles.title}>Landlord Details</Text>
      </View>

      <Field label="Full Name*" value={fullName} onChangeText={setFullName} placeholder="Chinedu Okafor" />
      <Field label="Email Address*" value={email} onChangeText={setEmail} placeholder="name@gmail.com" keyboardType="email-address" />
      <Field label="Phone Number*" value={phone} onChangeText={setPhone} placeholder="+234 816 277 2324" keyboardType="phone-pad" />
      <Text style={styles.label}>Means of Identification*</Text>
      <Pressable style={styles.selectField} onPress={() => setDocumentType(documentType === 'National ID' ? "Driver's License" : 'National ID')}>
        <Text style={styles.selectText}>{documentType}</Text><Ionicons name="chevron-down" size={22} color={colors.text} />
      </Pressable>
      <Field label="ID Number*" value={idNumber} onChangeText={setIdNumber} placeholder="12345678901" />

      <Text style={styles.sectionTitle}>Required Documents</Text>
      <UploadCard icon="document-text-outline" title="Government ID" file={governmentId} onPress={() => void pickDocument(setGovernmentId)} />
      <UploadCard icon="home-outline" title="Proof of Ownership" file={ownershipProof} onPress={() => void pickDocument(setOwnershipProof)} />
      <Pressable onPress={() => void pickPropertyPhoto()} style={styles.uploadCard}>
        <View style={styles.uploadIcon}><Ionicons name="camera-outline" size={30} color={colors.primary} /></View>
        <View style={styles.uploadContent}>
          <Text style={styles.uploadTitle}>Property Photo</Text>
          {propertyPhoto ? <Image source={{ uri: propertyPhoto.uri }} style={styles.photoPreview} /> : <UploadPrompt />}
        </View>
      </Pressable>

      <Pressable style={styles.primaryButton} onPress={submitVerification}>
        <Text style={styles.primaryButtonText}>Submit for Verification</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
      </Pressable>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad' }) {
  return <View style={styles.fieldGroup}><Text style={styles.label}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor={colors.muted} keyboardType={props.keyboardType} autoCapitalize={props.keyboardType === 'email-address' ? 'none' : 'words'} style={styles.input} /></View>;
}

function UploadPrompt() {
  return <View style={styles.uploadPrompt}><Ionicons name="cloud-upload-outline" size={23} color={colors.primary} /><Text style={styles.uploadPromptText}>Tap to upload a file</Text></View>;
}

function UploadCard(props: { icon: keyof typeof Ionicons.glyphMap; title: string; file: UploadItem | null; onPress: () => void }) {
  return <Pressable onPress={props.onPress} style={styles.uploadCard}><View style={styles.uploadIcon}><Ionicons name={props.icon} size={30} color={colors.primary} /></View><View style={styles.uploadContent}><Text style={styles.uploadTitle}>{props.title}</Text><View style={styles.uploadPrompt}><Ionicons name={props.file ? 'checkmark-circle-outline' : 'cloud-upload-outline'} size={22} color={colors.primary} /><Text style={styles.uploadPromptText} numberOfLines={1}>{props.file?.name ?? 'Tap to upload a file'}</Text></View></View></Pressable>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 25 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 19 },
  backButton: { width: 32, height: 40, justifyContent: 'center', marginRight: 4 },
  title: { color: colors.text, fontSize: 25, fontWeight: '800' },
  fieldGroup: { gap: 7, marginBottom: 13 },
  label: { color: '#171426', fontSize: 15, fontWeight: '600', marginBottom: 7 },
  input: { minHeight: 58, borderRadius: 15, borderWidth: 1, borderColor: '#E5E1EC', backgroundColor: colors.surface, paddingHorizontal: 16, color: colors.text, fontSize: 16 },
  selectField: { height: 58, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 16, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  selectText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 14, marginBottom: 15 },
  uploadCard: { minHeight: 120, backgroundColor: colors.surface, borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E5E1EC' },
  uploadIcon: { width: 58, height: 58, backgroundColor: colors.soft, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  uploadContent: { flex: 1, gap: 8 },
  uploadTitle: { color: colors.text, fontSize: 19, fontWeight: '700' },
  uploadPrompt: { minHeight: 46, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.text, borderRadius: 11, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadPromptText: { color: colors.muted, fontSize: 14, flexShrink: 1 },
  photoPreview: { width: '100%', height: 96, borderRadius: 9 },
  primaryButton: { minHeight: 60, marginTop: 7, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  bottomSpace: { height: 18 },
});
