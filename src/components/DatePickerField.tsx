import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Props {
  label: string;
  value: string;
  onChange: (formatted: string) => void;
  error?: boolean;
  placeholder?: string;
  /** If true, dates before today are disabled */
  futureOnly?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function parseDisplayDate(str: string): Date {
  if (!str) return new Date();
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
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

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DatePickerField({
  label,
  value,
  onChange,
  error,
  placeholder,
  futureOnly,
}: Props) {
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShow(false);
    if (event.type === 'set' && selectedDate) {
      onChange(formatDate(selectedDate));
    }
  }

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)} activeOpacity={0.7}>
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          style={styles.input}
          error={error}
          editable={false}
          placeholder={placeholder || 'Tap to select date'}
          right={<TextInput.Icon icon="calendar" onPress={() => setShow(true)} />}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={parseDisplayDate(value)}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={futureOnly ? getToday() : undefined}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 12 },
});
