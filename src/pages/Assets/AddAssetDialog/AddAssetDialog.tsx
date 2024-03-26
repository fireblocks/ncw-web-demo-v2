import React from 'react';
import { Dialog, SearchInput, Table, TableBody, styled, LoadingPage } from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { EmptySearch } from '../../common/EmptySearch';
import { AssetListItem } from './AssetListItem';

const TABLE_ROW_HEIGHT = 114;

const TableWrapperStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: 340,
}));

const SearchWrapperStyled = styled('div')(({ theme }) => ({
  borderBottom: `2px solid ${theme.palette.secondary.main}`,
  backgroundColor: theme.palette.background.paper,
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

  const handleDialogExited = () => {
    assetsStore
      .getSupported()
      .then(() => {
        setQuery('');
      })
      .catch(() => {});
  };

  return (
    <Dialog
      title={t('ASSETS.ADD_DIALOG.TITLE')}
      description={t('ASSETS.ADD_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      onExited={handleDialogExited}
    >
      <div>
        {assetsStore.isLoading ? (
          <LoadingPage />
        ) : (
          <>
            <SearchWrapperStyled>
              <SearchInput query={query} setQuery={setQuery} placeholder={t('ASSETS.ADD_DIALOG.SEARCH')} />
            </SearchWrapperStyled>
            <TableWrapperStyled>
              <Table>
                <TableBody>
                  <AutoSizer>
                    {({ height, width }) => {
                      if (filteredAssets.length === 0) {
                        return <EmptySearch height={height} width={width} />;
                      }

                      return (
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
                      );
                    }}
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
