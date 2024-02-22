import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.primary.light,
}));

export const TableWrapper: React.FC = () => <RootStyled>here will be table</RootStyled>;
