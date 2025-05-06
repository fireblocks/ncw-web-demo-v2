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
  balance: number;
  balanceInUsd: string;
}

export const TableBalanceCell: React.FC<IProps> = ({ balance, balanceInUsd }) => (
  <RootStyled>
    <Tooltip title={String(balance)} arrow placement="top">
      <TypographyStyled component="p" color="text.primary" variant="body1">
        {balance}
      </TypographyStyled>
    </Tooltip>
    <Tooltip title={balanceInUsd} arrow placement="top">
      <TypographyStyled component="p" color="text.primary" variant="body1">
        {balanceInUsd}
      </TypographyStyled>
    </Tooltip>
  </RootStyled>
);
