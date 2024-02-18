import React from 'react';
import { useAccountsStore, useAssetsStore, useDeviceStore, useUserStore } from '@store';
import { observer } from 'mobx-react';

export const StoreInitializer: React.FC = observer(function StoreInitializer() {
  const deviceStore = useDeviceStore();
  const assetsStore = useAssetsStore();
  const accountsStore = useAccountsStore();
  const userStore = useUserStore();

  React.useEffect(() => {
    deviceStore.init();

    const fetchData = async () => {
      await deviceStore.assignDeviceToNewWallet();
      await assetsStore.init();
      await accountsStore.init();
    };

    if (userStore.accessToken && deviceStore.deviceId) {
      fetchData().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStore.accessToken, deviceStore.deviceId]);

  return null;
});
