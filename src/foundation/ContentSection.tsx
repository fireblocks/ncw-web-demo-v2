import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  marginBottom: 2,
  padding: theme.spacing(3, 8),
}));

export const ContentSection: React.FC<{ children: JSX.Element }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
