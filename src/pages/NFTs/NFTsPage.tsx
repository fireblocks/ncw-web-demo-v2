import { Skeleton, Table, Typography, styled } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NFTsList } from './Table/NFTsList';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const HeadingStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(8),
  height: 204,
}));

const AmountsStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(5),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(4),
}));

const AmountStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const NFTsPage: React.FC = observer(function NFTsPage() {
  const NFTStore = useNFTStore();
  const { t } = useTranslation();

  if (NFTStore.isLoading) {
    return (
      <Table>
        <Skeleton mode="TABLE" />
      </Table>
    );
  }

  return (
    <RootStyled>
      <HeadingStyled>
        <Typography variant="h5" color="text.primary">
          {t('NFT.TITLE')}
        </Typography>
        <AmountsStyled>
          <AmountStyled>
            <Typography variant="h6" color="text.secondary">
              {t('NFT.ITEMS')}
            </Typography>
            <Typography variant="h1" color="text.primary">
              {NFTStore.tokens.length}
            </Typography>
          </AmountStyled>
          <AmountStyled>
            <Typography variant="h6" color="text.secondary">
              {t('NFT.COLLECTIONS')}
            </Typography>
            <Typography variant="h1" color="text.primary">
              {NFTStore.collections.length}
            </Typography>
          </AmountStyled>
        </AmountsStyled>
      </HeadingStyled>
      <NFTsList />
    </RootStyled>
  );
});
