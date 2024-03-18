import React from 'react';
import { Dialog, SearchInput, Skeleton, Table, TableBody, styled } from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { AssetListItem } from './AssetListItem';

const TABLE_ROW_HEIGHT = 106;

const TableWrapperStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: 450,
}));

const SearchWrapperStyled = styled('div')(({ theme }) => ({
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetDialog: React.FC<IProps> = observer(function AddAssetDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const [query, setQuery] = React.useState('');

  const filteredAssets = assetsStore.supportedAssets.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  const handleDialogClose = () => {
    onClose();
    setQuery('');
  };

  return (
    <Dialog
      title={t('ASSETS.ADD_DIALOG.TITLE')}
      description={t('ASSETS.ADD_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={handleDialogClose}
      size='small'
    >
      <div>
        {assetsStore.isLoading ? (
          <Skeleton mode="TABLE" />
        ) : (
          <>
            <SearchWrapperStyled>
              <SearchInput query={query} setQuery={setQuery} placeholder={t('ASSETS.ADD_DIALOG.SEARCH')} />
            </SearchWrapperStyled>
            <TableWrapperStyled>
              <Table>
                <TableBody>
                  <AutoSizer>
                    {({ height, width }) => (
                      <FixedSizeList
                        height={height}
                        width={width}
                        itemCount={filteredAssets.length}
                        itemSize={TABLE_ROW_HEIGHT}
                      >
                        {({ index, style }) => (
                          <AssetListItem
                            filteredAssets={filteredAssets}
                            index={index}
                            style={style}
                            onDialogClose={onClose}
                          />
                        )}
                      </FixedSizeList>
                    )}
                  </AutoSizer>
                </TableBody>
              </Table>
            </TableWrapperStyled>
          </>
        )}
      </div>
    </Dialog>
  );
});
