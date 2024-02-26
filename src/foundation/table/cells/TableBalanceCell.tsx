import { Typography, styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

interface IProps {
  balance: number;
  balanceInUsd: number;
}

export const TableBalanceCell: React.FC<IProps> = ({ balance, balanceInUsd }) => (
  <RootStyled>
    <Typography component="p" color="text.primary">
      {balance}
    </Typography>
    <Typography component="p" color="text.primary">
      ${balanceInUsd}
    </Typography>
  </RootStyled>
);
