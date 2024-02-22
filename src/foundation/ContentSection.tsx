import { styled } from '@foundation';

const RootStyled = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  marginBottom: 2,
  padding: theme.spacing(3, 8),
}));

export const ContentSection: React.FC<{ children: JSX.Element }> = ({ children }) => (
  <RootStyled>{children}</RootStyled>
);
