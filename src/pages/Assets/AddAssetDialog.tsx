import React from 'react';
import {
  Button,
  Dialog,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTextCell,
  TableTitleCell,
  styled,
} from '@foundation';
import { useAssetsStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const RowStyled = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1.7fr 1fr 130px',
}));

const TableWrapperStyled = styled('div')(() => ({
  height: 500,
  overflow: 'auto',
}));

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetDialog: React.FC<IProps> = observer(function AddAssetDialog({ isOpen, onClose }) {
  const { t } = useTranslation();
  const assetsStore = useAssetsStore();
  const [hoveredLine, setHoveredLine] = React.useState<string | null>(null);

  const handleAddAsset = (assetId: string) => {
    assetsStore.addAsset(assetId);
    onClose();
  };

  return (
    <Dialog
      title={t('ASSETS.ADD_DIALOG.TITLE')}
      description={t('ASSETS.ADD_DIALOG.DESCRIPTION')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        {assetsStore.isLoading ? (
          <Skeleton mode="TABLE" />
        ) : (
          <TableWrapperStyled>
            <Table>
              <TableBody>
                {assetsStore.supportedAssets.map((a) => (
                  <TableRow key={a.id}>
                    <RowStyled
                      onMouseEnter={() => {
                        setHoveredLine(a.id);
                      }}
                      onMouseLeave={() => {
                        setHoveredLine(null);
                      }}
                    >
                      <TableTitleCell title={a.name} subtitle={a.symbol} iconUrl={a.iconUrl} />
                      <TableTextCell text={`$${a.rate}`} />
                      <TableCell>
                        {hoveredLine === a.id ? (
                          <Button
                            onClick={() => {
                              handleAddAsset(a.id);
                            }}
                            variant="contained"
                          >
                            {t('ASSETS.ADD_ASSET')}
                          </Button>
                        ) : null}
                      </TableCell>
                    </RowStyled>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapperStyled>
        )}
      </div>
    </Dialog>
  );
});
