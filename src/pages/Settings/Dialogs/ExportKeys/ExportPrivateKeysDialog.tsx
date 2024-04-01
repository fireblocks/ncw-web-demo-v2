import React from 'react';
import { Dialog, Table, TableBody, styled } from '@foundation';
import { useAssetsStore, useFireblocksSDKStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { AssetListItem } from './AssetListItem';

const TABLE_ROW_HEIGHT = 136;

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: 543,
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

  return (
    <Dialog
      title={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.TITLE')}
      description={t('SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
    >
      <RootStyled>
        <Table>
          <TableBody>
            <AutoSizer>
              {({ height, width }) => {
                if (!fireblocksSDKStore.exportedKeys || !fireblocksSDKStore.exportedKeys.length) {
                  return null;
                } else {
                  return (
                    <FixedSizeList
                      height={height}
                      width={width}
                      itemCount={assetsStore.myBaseAssets.length}
                      itemSize={TABLE_ROW_HEIGHT}
                    >
                      {({ index, style }) => (
                        <AssetListItem
                          privateKey={
                            fireblocksSDKStore.exportedKeys?.length ? fireblocksSDKStore.exportedKeys[0].privateKey : ''
                          }
                          index={index}
                          style={style}
                        />
                      )}
                    </FixedSizeList>
                  );
                }
              }}
            </AutoSizer>
          </TableBody>
        </Table>
      </RootStyled>
    </Dialog>
  );
});
