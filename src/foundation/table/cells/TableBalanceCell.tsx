import { Typography, styled } from '@foundation';
import { Tooltip } from '@mui/material';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const TypographyStyled = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

interface IProps {
  balance: number | string;
  balanceInUsd: string;
  assetSymbol?: string;
}

export const TableBalanceCell: React.FC<IProps> = ({ balance, balanceInUsd, assetSymbol }) => {
  const balanceStr = String(balance);
  // If balance is already a string, assume it might already include the symbol
  const balanceWithSymbol = typeof balance === 'string' 
    ? balance 
    : (assetSymbol ? `${balance} ${assetSymbol}` : String(balance));

  return (
    <RootStyled>
      <Tooltip title={balanceWithSymbol} arrow placement="top">
        <TypographyStyled component="p" color="text.primary" variant="body1">
          {balanceWithSymbol}
        </TypographyStyled>
      </Tooltip>
      <Tooltip title={balanceInUsd} arrow placement="top">
        <TypographyStyled component="p" color="text.primary" variant="body1">
          {balanceInUsd}
        </TypographyStyled>
      </Tooltip>
    </RootStyled>
  );
};
