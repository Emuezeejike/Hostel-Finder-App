import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AdminUser, useAppStore } from '../../src/store/app-store';
import { colors } from '../../src/theme/colors';

const statuses = ['All', 'Pending', 'Verified'] as const;
type UserStatusFilter = typeof statuses[number];
const roles = ['Students', 'Landlords'] as const;
type UserRoleFilter = typeof roles[number];

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('All');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('Students');
  const users = useAppStore((state) => state.adminUsers);
  const updateAdminUserStatus = useAppStore((state) => state.updateAdminUserStatus);
  const filtered = useMemo(() => users.filter((user) => {
    const matchesRole = roleFilter === 'Students' ? user.role === 'Student' : user.role === 'Provider';
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Pending' ? user.status !== 'Verified' : user.status === 'Verified');
    const query = search.trim().toLowerCase();
    const matchesSearch = `${user.name} ${user.email ?? ''} ${user.school ?? ''} ${user.matricNumber ?? ''}`.toLowerCase().includes(query);
    return matchesRole && matchesStatus && matchesSearch;
  }), [roleFilter, search, statusFilter, users]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
      <Text style={styles.title}>Student Verification &amp; User Management</Text>
      <Text style={styles.subtitle}>View verification information and manage student and landlord accounts.</Text>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={19} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search by name, email, school or matric no..." placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
      <View style={styles.roleRow}>{roles.map((role) => <Pressable key={role} onPress={() => setRoleFilter(role)} style={[styles.roleButton, roleFilter === role && styles.roleButtonActive]}><Text style={[styles.roleText, roleFilter === role && styles.roleTextActive]}>{role}</Text></Pressable>)}</View>
      <View style={styles.statusRow}>{statuses.map((status) => <Pressable key={status} onPress={() => setStatusFilter(status)} style={[styles.statusButton, statusFilter === status && styles.statusButtonActive]}><Text style={[styles.statusButtonText, statusFilter === status && styles.statusButtonTextActive]}>{status}</Text></Pressable>)}</View>
      {filtered.length ? filtered.map((user) => <UserCard key={user.id} user={user} onVerify={() => updateAdminUserStatus(user.id, 'Verified')} onSuspend={() => updateAdminUserStatus(user.id, user.status === 'Suspended' ? 'Active' : 'Suspended')} />) : <View style={styles.emptyState}><Ionicons name="people-outline" size={34} color={colors.primary} /><Text style={styles.emptyTitle}>No users found</Text><Text style={styles.emptyText}>Try a different role, status, or search term.</Text></View>}
    </ScrollView>
  );
}

function UserCard(props: { user: AdminUser; onVerify: () => void; onSuspend: () => void }) {
  const user = props.user;
  const initials = user.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const statusStyles = user.status === 'Verified' ? styles.verifiedPill : user.status === 'Suspended' ? styles.suspendedPill : user.status === 'Requires Correction' || user.status === 'Verification Issue' ? styles.issuePill : styles.pendingPill;
  return (
    <View style={styles.card}>
      <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View>
      <View style={styles.userContent}>
        <View style={styles.nameRow}><Text style={styles.name} numberOfLines={1}>{user.name}</Text><View style={[styles.statusPill, statusStyles]}><Text style={styles.pillText}>{user.status}</Text></View></View>
        <Text style={styles.email}>{user.email ?? 'Email not provided'}</Text>
        <UserDetail icon="school-outline" value={user.school ?? user.role} />
        {user.matricNumber ? <UserDetail icon="id-card-outline" value={`Matric No: ${user.matricNumber}`} /> : null}
        {user.registeredAt ? <UserDetail icon="calendar-outline" value={`Registered: ${user.registeredAt}`} /> : null}
        <UserDetail icon="shield-checkmark-outline" value={`Verified: ${user.verifiedAt ?? '---'}`} />
        <View style={styles.actions}>
          {user.status !== 'Verified' && <Pressable accessibilityLabel={`Verify ${user.name}`} onPress={props.onVerify} style={styles.verifyAction}><Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" /><Text style={styles.verifyText}>Verify</Text></Pressable>}
          <Pressable accessibilityLabel={`${user.status === 'Suspended' ? 'Restore' : 'Suspend'} ${user.name}`} onPress={props.onSuspend} style={styles.suspendAction}><Ionicons name={user.status === 'Suspended' ? 'refresh-outline' : 'ban-outline'} size={15} color={colors.primary} /><Text style={styles.suspendText}>{user.status === 'Suspended' ? 'Restore' : 'Suspend'}</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

function UserDetail(props: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return <View style={styles.detailRow}><Ionicons name={props.icon} size={15} color={colors.primary} /><Text style={styles.detailText} numberOfLines={1}>{props.value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, paddingHorizontal: 21, paddingTop: 16, paddingBottom: 35 },
  backButton: { width: 35, height: 35, justifyContent: 'center' },
  title: { color: '#171426', fontSize: 25, lineHeight: 31, fontWeight: '800', marginTop: 3 },
  subtitle: { color: '#383440', fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 14 },
  searchBox: { minHeight: 47, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 13, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: colors.text, fontSize: 12 },
  roleRow: { flexDirection: 'row', gap: 8, marginTop: 13 },
  roleButton: { minHeight: 34, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center' },
  roleButtonActive: { backgroundColor: colors.soft },
  roleText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  roleTextActive: { color: colors.text },
  statusRow: { flexDirection: 'row', gap: 7, marginTop: 10, marginBottom: 14 },
  statusButton: { flex: 1, minHeight: 39, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  statusButtonActive: { backgroundColor: colors.primary },
  statusButtonText: { color: colors.primary, fontSize: 13 },
  statusButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 13, marginBottom: 13, flexDirection: 'row', gap: 12, shadowColor: '#261B3E', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  initials: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  userContent: { flex: 1 },
  nameRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  name: { color: '#15131A', fontSize: 16, fontWeight: '700', flex: 1 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
  verifiedPill: { backgroundColor: '#178D10' },
  pendingPill: { backgroundColor: '#FFF000' },
  issuePill: { backgroundColor: '#FFD900' },
  suspendedPill: { backgroundColor: '#FF895E' },
  pillText: { color: '#171426', fontSize: 10, fontWeight: '600' },
  email: { color: colors.text, fontSize: 12, marginTop: 6, marginBottom: 9 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  detailText: { color: colors.text, fontSize: 12, flex: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  verifyAction: { minHeight: 31, paddingHorizontal: 11, borderRadius: 7, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 5 },
  verifyText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  suspendAction: { minHeight: 31, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 5 },
  suspendText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  emptyState: { minHeight: 180, backgroundColor: colors.surface, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 12 },
});
