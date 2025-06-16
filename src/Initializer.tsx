import { useMemo, useEffect } from 'react';
import { CssBaseline, webDemoTheme, Notification } from '@foundation';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { RootStore } from '@store';
import i18n from '@translation';
import { App } from 'App';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { HashRouter } from 'react-router-dom';
import { snackbarService } from './services/Snackbar.service';

configure({ enforceActions: 'always' });

// Component to initialize the snackbar service
const SnackbarInitializer: React.FC = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    snackbarService.setEnqueueSnackbar(enqueueSnackbar);
    snackbarService.setCloseSnackbar(closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);

  return <>{children}</>;
};

export const Initializer: React.FC = () => {
  const rootStore = useMemo(() => new RootStore(), []);

  return (
    <>
      <CssBaseline />
      <HashRouter>
        <I18nextProvider i18n={i18n}>
          <Provider rootStore={rootStore}>
            <ThemeProvider theme={webDemoTheme}>
              <SnackbarProvider
                maxSnack={3}
                autoHideDuration={5000}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                Components={{
                  error: Notification,
                  success: Notification,
                }}
              >
                <SnackbarInitializer>
                  <App />
                </SnackbarInitializer>
              </SnackbarProvider>
            </ThemeProvider>
          </Provider>
        </I18nextProvider>
      </HashRouter>
    </>
  );
};
