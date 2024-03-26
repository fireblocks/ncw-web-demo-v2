import { Typography, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { AssetStore } from '@store';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `2px solid ${theme.palette.background.default}`,
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
  minWidth: 64,
  minHeight: 64,
  maxWidth: 64,
  maxHeight: 64,
  overflow: 'hidden',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 8,
}));

const TextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

interface IProps {
  asset: AssetStore;
}

export const SelectedAsset: React.FC<IProps> = ({ asset }) => (
  <RootStyled>
    <AssetInfoStyled>
      <ImageStyled>
        <img width="24px" height="24px" src={asset.iconUrl ? asset.iconUrl : IconNoAsset} alt={asset.name} />
      </ImageStyled>
      <TextStyled>
        <Typography component="p" color="text.primary" variant="body1">
          {asset.name}
        </Typography>
        <Typography component="p" color="text.secondary" variant="body1">
          {asset.symbol}
        </Typography>
      </TextStyled>
    </AssetInfoStyled>
    <AssetValueStyled>
      <Typography variant="body1">{asset.totalBalance}</Typography>
      <Typography color="text.secondary" variant="body1">
        {asset.totalBalanceInUSD}
      </Typography>
    </AssetValueStyled>
  </RootStyled>
);
