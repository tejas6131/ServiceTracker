import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { TextInput, useTheme, Portal, Modal, Text, Button } from 'react-native-paper';

interface Props {
  label: string;
  value: string;
  onChange: (formatted: string) => void;
  error?: boolean;
  placeholder?: string;
}

function formatDate(date: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = date.getDate().toString().padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function parseDisplayDate(str: string): Date {
  const months: Record<string, number> = {
    Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11
  };
  const parts = str.split('-');
  if (parts.length === 3) {
    const monthNum = months[parts[1]];
    if (monthNum !== undefined) {
      return new Date(Number(parts[2]), monthNum, Number(parts[0]));
    }
  }
  return new Date();
}

export default function DatePickerField({ label, value, onChange, error, placeholder }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ? parseDisplayDate(value) : new Date());
  const [tempYear, setTempYear] = useState('');
  const [tempMonth, setTempMonth] = useState(-1);
  const [tempDay, setTempDay] = useState(-1);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function open() {
    const d = value ? parseDisplayDate(value) : new Date();
    setTempDate(d);
    setTempYear(d.getFullYear().toString());
    setTempMonth(d.getMonth());
    setTempDay(d.getDate());
    setVisible(true);
  }

  function confirm() {
    const d = new Date(Number(tempYear), tempMonth, tempDay);
    if (!isNaN(d.getTime())) {
      onChange(formatDate(d));
    }
    setVisible(false);
  }

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  const yr = Number(tempYear) || new Date().getFullYear();
  const daysInMonth = tempMonth >= 0 ? getDaysInMonth(yr, tempMonth) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() + 5 - i));

  return (
    <>
      <TouchableOpacity onPress={open} activeOpacity={0.7}>
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          style={styles.input}
          error={error}
          editable={false}
          placeholder={placeholder || 'Tap to select date'}
          right={<TextInput.Icon icon="calendar" onPress={open} />}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Select Date</Text>

          {/* Year selector */}
          <Text variant="labelMedium" style={styles.sectionLabel}>Year</Text>
          <View style={styles.chipRow}>
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setTempYear(y.toString())}
                style={[
                  styles.chip,
                  { borderColor: theme.colors.outline },
                  Number(tempYear) === y && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={[
                  styles.chipText,
                  Number(tempYear) === y && { color: theme.colors.onPrimary },
                ]}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Month selector */}
          <Text variant="labelMedium" style={styles.sectionLabel}>Month</Text>
          <View style={styles.chipRow}>
            {months.map((m, i) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setTempMonth(i); if (tempDay > getDaysInMonth(yr, i)) setTempDay(getDaysInMonth(yr, i)); }}
                style={[
                  styles.chip,
                  { borderColor: theme.colors.outline },
                  tempMonth === i && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={[
                  styles.chipText,
                  tempMonth === i && { color: theme.colors.onPrimary },
                ]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Day selector */}
          <Text variant="labelMedium" style={styles.sectionLabel}>Day</Text>
          <View style={styles.chipRow}>
            {days.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setTempDay(d)}
                style={[
                  styles.chipSmall,
                  { borderColor: theme.colors.outline },
                  tempDay === d && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={[
                  styles.chipText,
                  tempDay === d && { color: theme.colors.onPrimary },
                ]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          {tempDay > 0 && tempMonth >= 0 && tempYear ? (
            <Text variant="bodyLarge" style={styles.preview}>
              {tempDay.toString().padStart(2,'0')}-{months[tempMonth]}-{tempYear}
            </Text>
          ) : null}

          <View style={styles.modalButtons}>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={confirm}>Select</Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 12 },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '85%',
  },
  modalTitle: { fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  sectionLabel: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 38,
    alignItems: 'center',
  },
  chipText: { fontSize: 13 },
  preview: { textAlign: 'center', marginTop: 16, fontWeight: '600' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
});
