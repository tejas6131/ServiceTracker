import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { insertPartRecord } from '../../src/database/operations';

export default function AddPartScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [partName, setPartName] = useState('');
  const [partCategory, setPartCategory] = useState('');
  const [dateOfReplacement, setDateOfReplacement] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  const [replacedAt, setReplacedAt] = useState('');
  const [cost, setCost] = useState('');
  const [warranty, setWarranty] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!partName.trim()) e.partName = 'Part name is required';
    if (!dateOfReplacement.trim()) e.dateOfReplacement = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !vehicleId) return;
    setSaving(true);
    try {
      await insertPartRecord(db, {
        vehicleId,
        partName: partName.trim(),
        partCategory: partCategory.trim(),
        dateOfReplacement: dateOfReplacement.trim(),
        odometerReading: odometerReading.trim(),
        replacedAt: replacedAt.trim(),
        cost: cost.trim(),
        warranty: warranty.trim(),
        notes: notes.trim(),
      });
      router.back();
    } catch (err) {
      console.error('Failed to save part record:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label="Part Name *"
        placeholder="e.g. Brake Pad, Air Filter"
        value={partName}
        onChangeText={setPartName}
        mode="outlined"
        style={styles.input}
        error={!!errors.partName}
      />
      {errors.partName ? (
        <HelperText type="error">{errors.partName}</HelperText>
      ) : null}

      <TextInput
        label="Part Category"
        placeholder="e.g. Engine, Brakes, Electrical, Tyre"
        value={partCategory}
        onChangeText={setPartCategory}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Date of Replacement *"
        placeholder="e.g. 15-Mar-2026"
        value={dateOfReplacement}
        onChangeText={setDateOfReplacement}
        mode="outlined"
        style={styles.input}
        error={!!errors.dateOfReplacement}
      />
      {errors.dateOfReplacement ? (
        <HelperText type="error">{errors.dateOfReplacement}</HelperText>
      ) : null}

      <TextInput
        label="Odometer Reading"
        placeholder="e.g. 82000 Km"
        value={odometerReading}
        onChangeText={setOdometerReading}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Replaced At"
        placeholder="e.g. Local Garage, Pune"
        value={replacedAt}
        onChangeText={setReplacedAt}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Cost (₹)"
        placeholder="e.g. 2500"
        value={cost}
        onChangeText={setCost}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Warranty"
        placeholder="e.g. 6 months"
        value={warranty}
        onChangeText={setWarranty}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Notes"
        placeholder="Any additional remarks"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={3}
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
          Save
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  input: { marginBottom: 12 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: { flex: 1 },
});
