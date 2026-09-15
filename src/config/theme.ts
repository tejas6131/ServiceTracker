import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1565C0',
    primaryContainer: '#D1E4FF',
    secondary: '#546E7A',
    secondaryContainer: '#CFD8DC',
    tertiary: '#00897B',
    tertiaryContainer: '#B2DFDB',
    surface: '#FAFAFA',
    surfaceVariant: '#E3E8ED',
    background: '#F5F5F5',
    error: '#D32F2F',
    errorContainer: '#FFCDD2',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#0D47A1',
    secondary: '#90A4AE',
    secondaryContainer: '#37474F',
    tertiary: '#80CBC4',
    tertiaryContainer: '#004D40',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    background: '#121212',
    error: '#EF9A9A',
    errorContainer: '#B71C1C',
  },
};
