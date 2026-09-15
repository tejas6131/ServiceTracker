import React, { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

interface Props {
  label: string;
  value: string;
  onChange: (formatted: string) => void;
  error?: boolean;
  placeholder?: string;
  /** If true, dates before today are disabled (for reminders, future events) */
  futureOnly?: boolean;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function parseDisplayDate(str: string): Date | undefined {
  if (!str) return undefined;
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
  return undefined;
}

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DatePickerField({ label, value, onChange, error, placeholder, futureOnly }: Props) {
  const [open, setOpen] = useState(false);

  const onDismiss = useCallback(() => setOpen(false), []);

  const onConfirm = useCallback(
    (params: { date: Date | undefined }) => {
      setOpen(false);
      if (params.date) {
        onChange(formatDate(params.date));
      }
    },
    [onChange]
  );

  const validRange = futureOnly
    ? { startDate: getToday() }
    : undefined;

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7}>
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          style={styles.input}
          error={error}
          editable={false}
          placeholder={placeholder || 'Tap to select date'}
          right={<TextInput.Icon icon="calendar" onPress={() => setOpen(true)} />}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismiss}
        date={parseDisplayDate(value)}
        onConfirm={onConfirm}
        label={label}
        saveLabel="Select"
        animationType="slide"
        validRange={validRange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 12 },
});
