import React from 'react';
import {
  useAccountsStore,
  useAssetsStore,
  useDeviceStore,
  useFireblocksSDKStore,
  useTransactionsStore,
  useUserStore,
} from '@store';
import { observer } from 'mobx-react';

export const StoreInitializer: React.FC = observer(function StoreInitializer() {
  const deviceStore = useDeviceStore();
  const assetsStore = useAssetsStore();
  const accountsStore = useAccountsStore();
  const userStore = useUserStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const transactionsStore = useTransactionsStore();

  // Load device and accounts data
  React.useEffect(() => {
    deviceStore.init();

    const fetchData = async () => {
      await deviceStore.assignDeviceToNewWallet();
      await accountsStore.init();
    };

    if (userStore.accessToken && deviceStore.deviceId) {
      fetchData().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStore.accessToken, deviceStore.deviceId]);

  // Load assets data only after accounts are loaded
  React.useEffect(() => {
    const fetchAssets = async () => {
      await assetsStore.init();
      await fireblocksSDKStore.init();
      await transactionsStore.init();
    };

    if (accountsStore.currentAccount) {
      fetchAssets().catch(() => {});
    }

    return () => {
      transactionsStore.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsStore.currentAccount]);

  return null;
});
