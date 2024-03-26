import { styled } from '@foundation';

export const ActionsBoxWrapperStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderBottom: `2px solid ${theme.palette.background.default}`,
  paddingRight: theme.spacing(5),
}));

export const ActionsWrapperStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
}));

export const SearchWrapperStyled = styled('div')(() => ({
  width: '50%',
}));
