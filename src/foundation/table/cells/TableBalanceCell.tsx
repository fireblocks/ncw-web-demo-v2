import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

interface IProps {
  balance: number;
  balanceInUsd: string;
}

export const TableBalanceCell: React.FC<IProps> = ({ balance, balanceInUsd }) => (
  <RootStyled>
    <Typography component="p" color="text.primary" variant="body1">
      {balance}
    </Typography>
    <Typography component="p" color="text.primary" variant="body1">
      {balanceInUsd}
    </Typography>
  </RootStyled>
);
