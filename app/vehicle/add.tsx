import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { insertVehicle } from '../../src/database/operations';

export default function AddVehicleScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [vehicleName, setVehicleName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!vehicleName.trim()) e.vehicleName = 'Vehicle name is required';
    if (!registrationNo.trim()) e.registrationNo = 'Registration number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await insertVehicle(db, {
        vehicleName: vehicleName.trim(),
        registrationNo: registrationNo.trim().toUpperCase(),
        makeModel: makeModel.trim(),
        year: year.trim(),
        fuelType: fuelType.trim(),
        currentOdometer: currentOdometer.trim(),
      });
      router.back();
    } catch (err) {
      console.error('Failed to save vehicle:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label="Vehicle Name *"
        placeholder="e.g. Baleno, Swift"
        value={vehicleName}
        onChangeText={setVehicleName}
        mode="outlined"
        style={styles.input}
        error={!!errors.vehicleName}
      />
      {errors.vehicleName ? (
        <HelperText type="error">{errors.vehicleName}</HelperText>
      ) : null}

      <TextInput
        label="Registration No. *"
        placeholder="e.g. MH50L4120"
        value={registrationNo}
        onChangeText={setRegistrationNo}
        mode="outlined"
        style={styles.input}
        autoCapitalize="characters"
        error={!!errors.registrationNo}
      />
      {errors.registrationNo ? (
        <HelperText type="error">{errors.registrationNo}</HelperText>
      ) : null}

      <TextInput
        label="Make & Model"
        placeholder="e.g. Maruti Suzuki Baleno"
        value={makeModel}
        onChangeText={setMakeModel}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Year"
        placeholder="e.g. 2019"
        value={year}
        onChangeText={setYear}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Fuel Type"
        placeholder="e.g. Petrol, Diesel, CNG, Electric"
        value={fuelType}
        onChangeText={setFuelType}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Current Odometer"
        placeholder="e.g. 79928 Km"
        value={currentOdometer}
        onChangeText={setCurrentOdometer}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
        >
          Save Vehicle
        </Button>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  input: { marginBottom: 8 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: { flex: 1 },
});
