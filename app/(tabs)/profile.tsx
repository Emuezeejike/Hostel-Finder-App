import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../src/store/app-store';
import { clearApiToken } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const user = useAppStore((state) => state.authUser);
  const logout = useAppStore((state) => state.logout);
  const palette = {
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    muted: colors.muted,
    primary: colors.primary,
    secondary: colors.soft,
    border: colors.border,
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}> 
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
          <Ionicons name="person-circle-outline" size={72} color={palette.primary} />
          <Text style={[styles.title, { color: palette.text }]}>Guest Profile</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>Browse properties without signing in.</Text>
        </View>

        <Pressable style={[styles.button, { backgroundColor: palette.primary }]} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

      </View>
    );
  }

  const renderRoleActions = () => {
    if (user.role === 'provider') {
      return (
        <>
          <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/provider/dashboard')}>
            <Text style={[styles.menuText, { color: palette.text }]}>Provider Dashboard</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/provider/add-property')}>
            <Text style={[styles.menuText, { color: palette.text }]}>Add Property</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/provider/inspections')}>
            <Text style={[styles.menuText, { color: palette.text }]}>Inspection Requests</Text>
          </Pressable>
        </>
      );
    }

    if (user.role === 'admin') {
      return (
        <>
          <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/admin/dashboard')}>
            <Text style={[styles.menuText, { color: palette.text }]}>Admin Dashboard</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/admin/approvals')}>
            <Text style={[styles.menuText, { color: palette.text }]}>Approval Queue</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/admin/reports')}>
            <Text style={[styles.menuText, { color: palette.text }]}>Reports</Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/student/verification')}>
          <Text style={[styles.menuText, { color: palette.text }]}>Student Verification</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/inspection/status')}>
          <Text style={[styles.menuText, { color: palette.text }]}>Inspection Status</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/student/proceed')}>
          <Text style={[styles.menuText, { color: palette.text }]}>Proceed Status</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/student/review')}>
          <Text style={[styles.menuText, { color: palette.text }]}>Submit Review</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={() => router.push('/student/report')}>
          <Text style={[styles.menuText, { color: palette.text }]}>Report Problem</Text>
        </Pressable>
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.authContainer, { backgroundColor: palette.background }]}>
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <Ionicons name="person-circle-outline" size={72} color={palette.primary} />
        <Text style={[styles.title, { color: palette.text }]}>{user.name}</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>{user.email}</Text>
        <Text style={[styles.roleBadge, { backgroundColor: palette.secondary, color: palette.text }]}>{user.role.toUpperCase()}</Text>
      </View>

      {renderRoleActions()}

      <Pressable style={[styles.button, { backgroundColor: palette.primary }]} onPress={() => { void clearApiToken(); logout(); router.replace('/'); }}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 36,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  menuItem: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  menuText: {
    fontWeight: '700',
    fontSize: 15,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
