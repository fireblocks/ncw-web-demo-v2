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

  console.log('Collections', NFTStore.collections);
  console.log('Tokens', NFTStore.tokens);
  console.log('Assets', NFTStore.assets);

  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im NFTs page
      </Typography>
    </RootStyled>
  );
});
