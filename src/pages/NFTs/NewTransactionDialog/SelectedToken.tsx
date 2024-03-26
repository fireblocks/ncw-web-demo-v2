import { Typography, styled } from '@foundation';
import IconNoNft from '@icons/no_nft_image.svg';
import { NFTTokenStore } from '@store';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 8,
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(2),
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
  marginBottom: theme.spacing(1),
}));

interface IProps {
  token: NFTTokenStore;
}

export const SelectedToken: React.FC<IProps> = ({ token }) => (
  <RootStyled>
    <div>
      <ImageStyled>
        <img width="224px" height="224px" src={token.imageUrl ? token.imageUrl : IconNoNft} alt={token.name} />
      </ImageStyled>
      <TextStyled>
        <TokenNameStyled variant="h3" color="text.primary">
          {token.name}
        </TokenNameStyled>
        <Typography variant="body2" color="text.secondary">
          {token.collectionName}
        </Typography>
      </TextStyled>
    </div>
  </RootStyled>
);
