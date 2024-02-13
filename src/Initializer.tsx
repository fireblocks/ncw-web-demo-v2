import { CssBaseline, webDemoTheme } from '@foundation';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { RootStore } from '@store';
import i18n from '@translation';
import { App } from 'App';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

configure({ enforceActions: 'always' });

export const Initializer: React.FC = () => {
  const rootStore = new RootStore();

  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <Provider rootStore={rootStore}>
            <ThemeProvider theme={webDemoTheme}>
              <App />
            </ThemeProvider>
          </Provider>
        </I18nextProvider>
      </BrowserRouter>
    </>
  );
};
