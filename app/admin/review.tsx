import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { reviewAdminQueueItem } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const checklistItems = [
  'Landlord identity verified',
  'Ownership documents checked',
  'Property details reviewed',
  'Distance & driving time confirmed',
];

export default function AdminReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const approval = useAppStore((state) => state.adminApprovals.find((item) => item.id === id));
  const approveApproval = useAppStore((state) => state.approveApproval);
  const updateApprovalStatus = useAppStore((state) => state.updateApprovalStatus);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const allChecked = checkedItems.length === checklistItems.length;

  const toggleChecklist = (item: string) => setCheckedItems((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]);
  const finishReview = async (status: 'Approved' | 'Needs Correction' | 'Rejected') => {
    if (!approval) return;
    if (status === 'Approved' && !allChecked) {
      Alert.alert('Complete the checklist', 'Confirm each verification item before approving this submission.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const kind = approval.type === 'Provider' ? 'providers' : 'properties';
    const apiStatus = status === 'Approved' ? 'verified' : 'rejected';
    try {
      await reviewAdminQueueItem(kind, approval.id, apiStatus, status === 'Needs Correction' ? 'Please correct the submitted verification details.' : undefined);
      if (status === 'Approved') approveApproval(approval.id);
      else updateApprovalStatus(approval.id, status);
      router.back();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit this review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!approval) {
    return <View style={styles.missing}><Text style={styles.missingText}>This submission is no longer in the review queue.</Text><Pressable onPress={() => router.replace('/admin/approvals')}><Text style={styles.link}>Return to review queue</Text></Pressable></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submission information</Text>
        <DataRow label={approval.type === 'Provider' ? 'Provider' : 'Property'} value={approval.name} />
        <DataRow label="Email" value={approval.email || 'Not included in queue response'} />
        <DataRow label="Phone Number" value={approval.phone || 'Not included in queue response'} />
        <DataRow label="Verification" value={approval.verification || approval.status} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supporting documents</Text>
        {approval.documents?.length ? approval.documents.map((document) => <DocumentRow key={document} label={document} />) : <Text style={styles.dataValue}>No document links were included in the queue response.</Text>}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Information</Text>
        <DataRow label="Location" value={approval.location || 'Not included in queue response'} />
        <DataRow label="School nearby" value={approval.school || 'Not included in queue response'} />
        <DataRow label="Distance from school" value={approval.distance || 'Not included in queue response'} />
        <DataRow label="Est. driving time" value={approval.drivingTime || 'Not included in queue response'} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facilities</Text>
        <View style={styles.facilities}>{approval.facilities?.length ? approval.facilities.map((facility) => <Text key={facility} style={styles.facility}>{facility}</Text>) : <Text style={styles.dataValue}>No amenities were included in the queue response.</Text>}</View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification Check-list</Text>
        {checklistItems.map((item) => {
          const checked = checkedItems.includes(item);
          return <Pressable key={item} onPress={() => toggleChecklist(item)} style={styles.checkRow} accessibilityRole="checkbox" accessibilityState={{ checked }}><View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}</View><Text style={styles.checkText}>{item}</Text></Pressable>;
        })}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
      <Pressable style={[styles.approveButton, (!allChecked || isSubmitting) && styles.disabledButton]} onPress={() => void finishReview('Approved')} disabled={isSubmitting}><Text style={styles.approveText}>{isSubmitting ? 'Submitting...' : 'Approve'}</Text></Pressable>
      <View style={styles.decisionRow}>
        <Pressable style={styles.correctionButton} onPress={() => void finishReview('Needs Correction')} disabled={isSubmitting}><Text style={styles.correctionText}>Request Correction</Text></Pressable>
        <Pressable style={styles.rejectButton} onPress={() => void finishReview('Rejected')} disabled={isSubmitting}><Text style={styles.rejectText}>Reject</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function DataRow(props: { label: string; value: string }) {
  return <View style={styles.dataRow}><Text style={styles.dataLabel}>{props.label}</Text><Text style={styles.dataValue} numberOfLines={2}>{props.value}</Text></View>;
}

function DocumentRow(props: { label: string }) {
  return <Pressable style={styles.documentRow}><Ionicons name="document-text-outline" size={17} color={colors.primary} /><Text style={styles.documentText}>{props.label}</Text><Ionicons name="open-outline" size={15} color={colors.primary} /></Pressable>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 17, paddingBottom: 35 },
  backButton: { width: 36, height: 36, justifyContent: 'center', marginBottom: 12 },
  section: { backgroundColor: colors.surface, borderRadius: 15, padding: 14, marginBottom: 15 },
  sectionTitle: { color: '#59348F', fontSize: 14, fontWeight: '700', marginBottom: 9 },
  dataRow: { minHeight: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dataLabel: { color: colors.muted, fontSize: 11, flex: 1 },
  dataValue: { color: '#15131A', fontSize: 12, textAlign: 'right', flex: 1.2 },
  documentRow: { minHeight: 37, borderWidth: 1, borderColor: colors.primary, borderRadius: 6, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5 },
  documentText: { color: colors.muted, fontSize: 12, flex: 1 },
  facilities: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  facility: { color: '#171426', fontSize: 12, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: colors.primary, borderRadius: 20, backgroundColor: colors.background },
  checkRow: { minHeight: 29, flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 19, height: 19, borderWidth: 1, borderColor: '#1E1B22', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: '#171426', fontSize: 12 },
  approveButton: { minHeight: 55, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  disabledButton: { opacity: 0.65 },
  approveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#A33B45', fontSize: 12, marginBottom: 8 },
  decisionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  correctionButton: { minHeight: 50, flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  correctionText: { color: '#15131A', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  rejectButton: { minHeight: 50, width: '39%', borderWidth: 1.5, borderColor: '#F02727', borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  rejectText: { color: '#15131A', fontSize: 14, fontWeight: '700' },
  missing: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 25, gap: 12 },
  missingText: { color: colors.text, textAlign: 'center', fontSize: 16 },
  link: { color: colors.primary, fontWeight: '700' },
});
