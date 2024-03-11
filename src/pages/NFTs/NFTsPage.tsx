import { Typography, styled } from '@foundation';
import { useNFTStore } from '@store';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const NFTsPage: React.FC = observer(function NFTsPage() {
  const NFTStore = useNFTStore();

  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im NFTs page
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Amount of collections: {NFTStore.collections.length}
        <br />
        Amount of assets: {NFTStore.assets.length}
        <br />
        Amount of tokens: {NFTStore.tokens.length}
        <br />
      </Typography>
    </RootStyled>
  );
});
