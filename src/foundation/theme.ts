import { ThemeOptions, createTheme } from '@mui/material/styles';

const theme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#000000',
      light: '#2a2a2a',
    },
    secondary: {
      main: '#1B1B1B',
      light: '#222222',
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
      fontSize: 13,
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
  },
};

export const webDemoTheme = createTheme(theme);
