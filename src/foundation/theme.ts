import { ThemeOptions, createTheme } from '@mui/material/styles';

const theme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#000000',
      light: '#2a2a2a',
      dark: '#2D68FF',
    },
    secondary: {
      main: '#1B1B1B',
      dark: '#333333',
      light: '#222222',
    },
    success: {
      main: '#16A34A',
    },
    error: {
      main: '#EF4444',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#767676',
    },
  },
  typography: {
    fontFamily: 'Figtree',
    body2: {
      fontSize: 18,
      lineHeight: 1,
    },
    body1: {
      fontSize: 14,
      lineHeight: '24px',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: 12,
      lineHeight: '24px',
      fontWeight: 500,
      textTransform: 'uppercase',
    },
    subtitle2: {
      fontSize: 13,
      lineHeight: '24px',
      fontWeight: 600,
    },
    h1: {
      fontSize: 60,
      lineHeight: 1,
      fontWeight: 500,
    },
    h2: {
      fontSize: 36,
      lineHeight: '44px',
      fontWeight: 500,
    },
    h5: {
      fontSize: 16,
      lineHeight: '20px',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    h6: {
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
  },
};

export const webDemoTheme = createTheme(theme);
