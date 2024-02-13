import { Typography, styled } from '@foundation';
import { observer } from 'mobx-react';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const NFTsPage: React.FC = observer(function NFTsPage() {
  return (
    <RootStyled>
      <Typography variant="h4" color="text.primary">
        Hello im NFTsPage
      </Typography>
    </RootStyled>
  );
});
