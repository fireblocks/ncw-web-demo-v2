import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

export const TableWrapper: React.FC = () => <RootStyled>here will be table</RootStyled>;
