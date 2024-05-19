import React, { useMemo } from 'react';
import { CustomTabPanel, Dialog, Tab, Table, TableBody, Tabs, styled } from '@foundation';
import { useAssetsStore, useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { ExportPrivateKeysDialogVM } from './ExportPrivateKeysDialogVM';
import { PrivateKeyListItem } from './PrivateKeyListItem';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: 545,
}));

const TabsStyled = styled(Tabs)(({ theme }) => ({
  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.text.primary,
  },
}));
interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPrivateKeysDialog: React.FC<IProps> = observer(function ExportPrivateKeysDialog({
  isOpen,
  onClose,
}) {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const fireblocksSDKStore = useFireblocksSDKStore();
  const vm = useMemo(
    () => new ExportPrivateKeysDialogVM(assetsStore, fireblocksSDKStore),
    [assetsStore, fireblocksSDKStore],
  );

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.TITLE')}
      description={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="large"
    >
      <RootStyled>
        <div>
          <TabsStyled
            value={vm.value}
            onChange={vm.handleTabChange}
            aria-label="privateKeysAlgorithmTabs"
            textColor="inherit"
          >
            {assetsStore.myEDDSAAssets.length && (
              <Tab
                label={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.EDDSA')}
                sx={{ textTransform: 'none', marginLeft: 2.5, fontWeight: 'bold' }}
              />
            )}
            {assetsStore.myECDSAAssets.length && (
              <Tab
                label={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.ECDSA')}
                sx={{ textTransform: 'none', marginLeft: 2.5, fontWeight: 'bold' }}
              />
            )}
          </TabsStyled>
        </div>
        <div>
          <CustomTabPanel value={vm.value} index={0}>
            <Table>
              <TableBody>
                <PrivateKeyListItem items={vm.ecdsaLIstItems} />
              </TableBody>
            </Table>
          </CustomTabPanel>
          <CustomTabPanel value={vm.value} index={1}>
            <Table>
              <TableBody>
                <PrivateKeyListItem items={vm.eddsaLIstItems} />
              </TableBody>
            </Table>
          </CustomTabPanel>
        </div>
      </RootStyled>
    </Dialog>
  );
});
