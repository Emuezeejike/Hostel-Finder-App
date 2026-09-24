import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { mockProperties } from '../../src/data/properties';

export default function InspectionRequestScreen() {
  const [selectedDate, setSelectedDate] = useState('2026-09-28');
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [message, setMessage] = useState('I would like to inspect this property.');

  const property = mockProperties[0];

  const handleSubmit = () => {
    router.push('/inspection/success');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request inspection</Text>
      <Text style={styles.propertyName}>{property.title}</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Available inspection dates</Text>
        <Pressable style={styles.optionButton} onPress={() => setSelectedDate('Saturday, 28 September 2026')}>
          <Text style={styles.optionText}>Saturday, 28 September 2026</Text>
        </Pressable>
        <Pressable style={styles.optionButton} onPress={() => setSelectedDate('Sunday, 29 September 2026')}>
          <Text style={styles.optionText}>Sunday, 29 September 2026</Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Time</Text>
        <Pressable style={styles.optionButton} onPress={() => setSelectedTime('10:00 AM')}>
          <Text style={styles.optionText}>10:00 AM</Text>
        </Pressable>
        <Pressable style={styles.optionButton} onPress={() => setSelectedTime('2:00 PM')}>
          <Text style={styles.optionText}>2:00 PM</Text>
        </Pressable>
        <Pressable style={styles.optionButton} onPress={() => setSelectedTime('4:30 PM')}>
          <Text style={styles.optionText}>4:30 PM</Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          style={styles.textArea}
          placeholder="I would like to inspect this property."
        />
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Send Inspection Request</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  propertyName: {
    color: '#475569',
    fontSize: 17,
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  label: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 14,
    minHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
