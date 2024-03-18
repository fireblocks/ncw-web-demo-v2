import { Typography, styled } from '@foundation';
import { NFTTokenStore } from '@store';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 8,
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(3),
}));

const ImageStyled = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const TextStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const TokenNameStyled = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
}));

interface IProps {
  token: NFTTokenStore;
}

export const SelectedToken: React.FC<IProps> = ({ token }) => (
  <RootStyled>
    <div>
      <ImageStyled>
        {token.imageUrl ? (
          <img width="224px" height="224px" src={token.imageUrl} alt={token.name} />
        ) : (
          <Typography component="p" color="text.primary" variant="h1">
            NFT
          </Typography>
        )}
      </ImageStyled>
      <TextStyled>
        <TokenNameStyled variant="h5" color="text.primary">
          {token.name}
        </TokenNameStyled>
        <Typography variant="h6" color="text.secondary">
          {token.collectionName}
        </Typography>
      </TextStyled>
    </div>
  </RootStyled>
);
