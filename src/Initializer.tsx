import { CssBaseline, webDemoTheme, Notification } from '@foundation';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { RootStore } from '@store';
import i18n from '@translation';
import { App } from 'App';
import { ENV_CONFIG } from 'env_config';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

configure({ enforceActions: 'always' });

export const Initializer: React.FC = () => {
  const rootStore = new RootStore();

  return (
    <>
      <CssBaseline />
      <BrowserRouter basename={ENV_CONFIG.VITE_BASE_FOLDER}>
        <I18nextProvider i18n={i18n}>
          <Provider rootStore={rootStore}>
            <ThemeProvider theme={webDemoTheme}>
              <SnackbarProvider
                maxSnack={3}
                autoHideDuration={5000}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                Components={{
                  error: Notification,
                  success: Notification,
                }}
              >
                <App />
              </SnackbarProvider>
            </ThemeProvider>
          </Provider>
        </I18nextProvider>
      </BrowserRouter>
    </>
  );
};
