import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { insertInsuranceRecord } from '../../src/database/operations';

export default function AddInsuranceScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [policyNo, setPolicyNo] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyType, setPolicyType] = useState('');
  const [policyIssueDate, setPolicyIssueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!policyNo.trim()) e.policyNo = 'Policy number is required';
    if (!insuranceProvider.trim()) e.insuranceProvider = 'Insurance provider is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !vehicleId) return;
    setSaving(true);
    try {
      await insertInsuranceRecord(db, {
        vehicleId,
        policyNo: policyNo.trim(),
        insuranceProvider: insuranceProvider.trim(),
        policyType: policyType.trim(),
        policyIssueDate: policyIssueDate.trim(),
        startDate: startDate.trim(),
        expiryDate: expiryDate.trim(),
        premiumAmount: premiumAmount.trim(),
      });
      router.back();
    } catch (err) {
      console.error('Failed to save insurance record:', err);
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
        label="Policy No. *"
        placeholder="e.g. D219393908"
        value={policyNo}
        onChangeText={setPolicyNo}
        mode="outlined"
        style={styles.input}
        error={!!errors.policyNo}
      />
      {errors.policyNo ? (
        <HelperText type="error">{errors.policyNo}</HelperText>
      ) : null}

      <TextInput
        label="Insurance Provider *"
        placeholder="e.g. GO DIGIT General Insurance Limited"
        value={insuranceProvider}
        onChangeText={setInsuranceProvider}
        mode="outlined"
        style={styles.input}
        error={!!errors.insuranceProvider}
      />
      {errors.insuranceProvider ? (
        <HelperText type="error">{errors.insuranceProvider}</HelperText>
      ) : null}

      <TextInput
        label="Policy Type"
        placeholder="e.g. Comprehensive, Third-Party"
        value={policyType}
        onChangeText={setPolicyType}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Policy Issue Date"
        placeholder="e.g. 13-Aug-2025"
        value={policyIssueDate}
        onChangeText={setPolicyIssueDate}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Start Date"
        placeholder="e.g. 16-Aug-2025"
        value={startDate}
        onChangeText={setStartDate}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Expiry Date"
        placeholder="e.g. 15-Aug-2026"
        value={expiryDate}
        onChangeText={setExpiryDate}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Premium Amount (₹)"
        placeholder="e.g. 10893"
        value={premiumAmount}
        onChangeText={setPremiumAmount}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
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
