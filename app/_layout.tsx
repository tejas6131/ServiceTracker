import React from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme } from '../src/config/theme';
import { initializeDatabase, getDbName } from '../src/database/schema';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SQLiteProvider databaseName={getDbName()} onInit={initializeDatabase}>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: 'Service Tracker', headerTitleAlign: 'center' }}
          />
          <Stack.Screen
            name="vehicle/add"
            options={{ title: 'Add Vehicle', presentation: 'modal' }}
          />
          <Stack.Screen
            name="vehicle/[id]"
            options={{ title: 'Vehicle' }}
          />
          <Stack.Screen
            name="vehicle/edit"
            options={{ title: 'Edit Vehicle', presentation: 'modal' }}
          />
          <Stack.Screen
            name="servicing/[vehicleId]"
            options={{ title: 'Service History' }}
          />
          <Stack.Screen
            name="servicing/add"
            options={{ title: 'Add Service Record', presentation: 'modal' }}
          />
          <Stack.Screen
            name="parts/[vehicleId]"
            options={{ title: 'Parts Changed' }}
          />
          <Stack.Screen
            name="parts/add"
            options={{ title: 'Add Part Record', presentation: 'modal' }}
          />
          <Stack.Screen
            name="insurance/[vehicleId]"
            options={{ title: 'Insurance History' }}
          />
          <Stack.Screen
            name="insurance/add"
            options={{ title: 'Add Insurance Record', presentation: 'modal' }}
          />
          <Stack.Screen
            name="reminders/[vehicleId]"
            options={{ title: 'Reminders' }}
          />
          <Stack.Screen
            name="reminders/add"
            options={{ title: 'Add Reminder', presentation: 'modal' }}
          />
        </Stack>
      </PaperProvider>
    </SQLiteProvider>
  );
}
