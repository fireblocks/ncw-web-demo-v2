import { ThemeOptions, createTheme } from '@mui/material/styles';

const theme: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA',
    },
  },
  typography: {
    fontFamily: 'Figtree',
  },
};

export const webDemoTheme = createTheme(theme);
