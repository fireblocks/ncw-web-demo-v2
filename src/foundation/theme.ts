import { ThemeOptions, createTheme } from '@mui/material/styles';

const theme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#121213',
      dark: '#2D68FF',
      light: '#2a2a2a',
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
      disabled: '#767676',
    },
    background: {
      default: '#1B1B1B',
      paper: '#2a2a2a',
    },
  },
  typography: {
    fontFamily: 'Figtree',
    body1: {
      fontSize: 14,
      lineHeight: '24px',
      fontWeight: 500,
      letterSpacing: 0.5,
    },
    body2: {
      fontSize: 16,
      lineHeight: '24px',
      fontWeight: 500,
      letterSpacing: 0.5,
    },
    subtitle1: {
      fontSize: 14,
      lineHeight: '24px',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    subtitle2: {
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: 0.5,
    },
    h1: {
      fontSize: 60,
      fontWeight: 500,
      lineHeight: '72px',
      letterSpacing: 2.5,
    },
    h2: {
      fontSize: 48,
      lineHeight: '64px',
      fontWeight: 600,
      letterSpacing: 2.5,
    },
    h3: {
      fontSize: 24,
      lineHeight: '32px',
      fontWeight: 500,
      letterSpacing: 2.5,
    },
    h4: {
      fontSize: 20,
      lineHeight: '32px',
      fontWeight: 600,
      letterSpacing: 1.5,
    },
    h5: {
      fontSize: 28,
      lineHeight: '40px',
      fontWeight: 500,
      letterSpacing: 1,
    },
    h6: {
      fontSize: 14,
      lineHeight: '24px',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  },
};

export const webDemoTheme = createTheme(theme);
