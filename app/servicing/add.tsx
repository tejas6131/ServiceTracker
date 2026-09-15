import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { insertServiceRecord, getVehicleById } from '../../src/database/operations';
import DatePickerField from '../../src/components/DatePickerField';

export default function AddServiceScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [registrationNo, setRegistrationNo] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceCenter, setServiceCenter] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [nextServiceAt, setNextServiceAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  async function loadVehicle() {
    if (!vehicleId) return;
    const v = await getVehicleById(db, vehicleId);
    if (v) setRegistrationNo(v.registrationNo);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!serviceDate.trim()) e.serviceDate = 'Service date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !vehicleId) return;
    setSaving(true);
    try {
      await insertServiceRecord(db, {
        vehicleId,
        registrationNo: registrationNo.trim(),
        serviceDate: serviceDate.trim(),
        odometerReading: odometerReading.trim(),
        serviceType: serviceType.trim(),
        serviceCenter: serviceCenter.trim(),
        workDone: workDone.trim(),
        nextServiceAt: nextServiceAt.trim(),
      });
      router.back();
    } catch (err) {
      console.error('Failed to save service record:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Registration No."
          value={registrationNo}
          onChangeText={setRegistrationNo}
          mode="outlined"
          style={styles.input}
        />

        <DatePickerField
          label="Service Date *"
          value={serviceDate}
          onChange={setServiceDate}
          error={!!errors.serviceDate}
        />
        {errors.serviceDate ? <HelperText type="error">{errors.serviceDate}</HelperText> : null}

        <TextInput
          label="Odometer Reading (Current)"
          placeholder="e.g. 79928 Km"
          value={odometerReading}
          onChangeText={setOdometerReading}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Service Type"
          placeholder="e.g. Paid, Free, Warranty"
          value={serviceType}
          onChangeText={setServiceType}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Service Center"
          placeholder="e.g. Maruti Suzuki, Umbraj"
          value={serviceCenter}
          onChangeText={setServiceCenter}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Work Done"
          placeholder="Describe the work performed"
          value={workDone}
          onChangeText={setWorkDone}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <TextInput
          label="Next Service At (Date / Km)"
          placeholder="e.g. 89928 Km or 28-Aug-2026"
          value={nextServiceAt}
          onChangeText={setNextServiceAt}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.buttons}>
          <Button mode="outlined" onPress={() => router.back()} style={styles.button}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.button}>Save</Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  input: { marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  button: { flex: 1 },
});
