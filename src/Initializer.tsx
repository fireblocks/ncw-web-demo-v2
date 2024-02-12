import { CssBaseline } from '@foundation';
import { RootStore } from '@store';
import i18n from '@translation';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

configure({ enforceActions: 'always' });

export const Initializer = () => {
  const rootStore = new RootStore();

  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <Provider rootStore={rootStore}>
            <App />
          </Provider>
        </I18nextProvider>
      </BrowserRouter>
    </>
  );
};
