import { Typography, styled } from '@foundation';
import { AssetStore } from '@store';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `2px solid ${theme.palette.secondary.main}`,
  borderRadius: 8,
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(2),
}));

const AssetInfoStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const AssetValueStyled = styled('div')(() => ({
  textAlign: 'right',
}));

const ImageStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  minWidth: 56,
  minHeight: 56,
  maxWidth: 56,
  maxHeight: 56,
  overflow: 'hidden',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 12,
}));

const TextStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

interface IProps {
  asset: AssetStore;
}

export const SelectedAsset: React.FC<IProps> = ({ asset }) => (
  <RootStyled>
    <AssetInfoStyled>
      <ImageStyled>
        {asset.iconUrl ? (
          <img width="24px" height="24px" src={asset.iconUrl} alt={asset.name} />
        ) : (
          <Typography component="p" color="text.primary" variant="subtitle2">
            {asset.name[0]}
          </Typography>
        )}
      </ImageStyled>
      <TextStyled>
        <Typography component="p" color="text.primary" variant="subtitle2">
          {asset.name}
        </Typography>
        <Typography component="p" color="text.secondary" variant="body1">
          {asset.symbol}
        </Typography>
      </TextStyled>
    </AssetInfoStyled>
    <AssetValueStyled>
      <Typography variant="subtitle2">{asset.totalBalance}</Typography>
      <Typography color="text.secondary" variant="body1">
        {asset.totalBalanceInUSD}
      </Typography>
    </AssetValueStyled>
  </RootStyled>
);
