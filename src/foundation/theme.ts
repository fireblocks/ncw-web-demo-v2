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
    subtitle1: {
      fontSize: 16,
      textTransform: 'uppercase',
    },
  },
};

export const webDemoTheme = createTheme(theme);
