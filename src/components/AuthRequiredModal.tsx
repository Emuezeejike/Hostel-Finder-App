import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';

interface AuthRequiredModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ visible, onClose }: AuthRequiredModalProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Create an account to continue</Text>
          <Text style={styles.subtitle}>
            Your account helps us manage inspections, reviews and your accommodation requests.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              onClose();
              router.push('/auth/register');
            }}
          >
            <Text style={styles.primaryText}>Create Account</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              onClose();
              router.push('/auth/login');
            }}
          >
            <Text style={styles.secondaryText}>Log In</Text>
          </Pressable>

          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Continue Browsing</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.soft,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
});
