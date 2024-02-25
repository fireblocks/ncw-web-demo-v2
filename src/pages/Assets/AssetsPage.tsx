import React from 'react';
import { Button, ContentSection, ModeSwitcher, TViewMode, TableWrapper, Typography, styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { AddAssetDialog } from './AddAssetDialog';
import { AssetsList } from './AssetsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const ModeWrapperStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}));

export const AssetsPage: React.FC = observer(function AssetsPage() {
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<TViewMode>('CARD');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const handleModeChange = (_: React.MouseEvent<HTMLElement>, value: TViewMode) => {
    setMode(value);
  };
  const onDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const onDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        {t('ASSETS.TITLE')}
      </Typography>
      <div>
        <Typography variant="subtitle1" color="text.secondary">
          {t('ASSETS.CURRENT_BALANCE')}
        </Typography>
        <Typography variant="h1" color="text.primary">
          $45,873.03
        </Typography>
      </div>
      <ContentSection>
        <ModeWrapperStyled>
          <ModeSwitcher value={mode} onChange={handleModeChange} />
          <Button variant="contained" color="primary" onClick={onDialogOpen}>
            {t('ASSETS.ADD_ASSET')}
          </Button>
        </ModeWrapperStyled>
      </ContentSection>
      <TableWrapper>
        <AssetsList />
      </TableWrapper>
      <AddAssetDialog isOpen={isDialogOpen} onClose={onDialogClose} />
    </RootStyled>
  );
});
