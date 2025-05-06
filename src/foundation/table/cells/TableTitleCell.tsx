import { Typography, styled } from '@foundation';
import IconNoAsset from '@icons/no_asset_image.svg';
import { Tooltip } from '@mui/material';
import { getCryptoIconUrl } from '../../../api-embedded-wallet';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
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
  position: 'relative', // Added for positioning the secondary icon
}));

const SecondaryIconStyled = styled('div')(() => ({
  position: 'absolute',
  width: 14,
  height: 14,
  bottom: 17,
  right: 15,
  zIndex: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  backgroundColor: 'white',
  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2)',
  border: '2px solid black',
}));

const TextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  overflow: 'hidden',
  maxWidth: '100%',
}));

const TypographyStyled = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

// Function to get the secondary icon URL based on the asset symbol
const getSecondaryIconUrl = (symbol: string): string => {
  try {
    return getCryptoIconUrl(symbol);
  } catch (error) {
    // Return the empty icon if there's an error
    return IconNoAsset;
  }
};

interface IProps {
  title: string;
  subtitle: string;
  iconUrl: string;
  // The asset symbol is used to determine the secondary icon
  assetSymbol?: string;
}

export const TableTitleCell: React.FC<IProps> = ({ title, subtitle, iconUrl, assetSymbol }) => {
  // Get the secondary icon URL based on the asset symbol
  const secondaryIconUrl = assetSymbol ? getSecondaryIconUrl(assetSymbol) : null;

  return (
    <RootStyled>
      <ImageStyled>
        <img width="24px" height="24px" src={iconUrl} alt={title} />
        {/* Render the secondary icon if assetSymbol is provided */}
        {assetSymbol && (
          <SecondaryIconStyled>
            <img width="14px" height="14px" src={secondaryIconUrl || IconNoAsset} alt={assetSymbol} />
          </SecondaryIconStyled>
        )}
      </ImageStyled>
      <TextStyled>
        {title && title !== '--' ? (
          <Tooltip title={title} arrow placement="top">
            <TypographyStyled component="p" color="text.primary" variant="body1">
              {title}
            </TypographyStyled>
          </Tooltip>
        ) : (
          <TypographyStyled component="p" color="text.primary" variant="body1">
            {title}
          </TypographyStyled>
        )}
        {subtitle && subtitle !== '--' ? (
          <Tooltip title={subtitle} arrow placement="top">
            <TypographyStyled component="p" color="text.secondary" variant="body1">
              {subtitle}
            </TypographyStyled>
          </Tooltip>
        ) : (
          <TypographyStyled component="p" color="text.secondary" variant="body1">
            {subtitle}
          </TypographyStyled>
        )}
      </TextStyled>
    </RootStyled>
  );
};
