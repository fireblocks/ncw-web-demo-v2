import * as React from 'react';
import IconSearch from '@icons/search.svg';
import Input from '@mui/material/Input/Input';
import styled from '@mui/material/styles/styled';

export const InputStyled = styled(Input)(({ theme }) => ({
  '&.MuiInput-root': {
    padding: theme.spacing(2, 5),
    width: '100%',
    boxSizing: 'border-box',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    letterSpacing: theme.typography.body1.letterSpacing,
  },
}));

export const StartAdornmentStyled = styled('img')(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

interface IProps {
  query: string;
  placeholder: string;
  setQuery: (query: string) => void;
}

export const SearchInput: React.FC<IProps> = ({ query, placeholder, setQuery }) => (
  <InputStyled
    startAdornment={<StartAdornmentStyled src={IconSearch} />}
    disableUnderline
    placeholder={placeholder.toUpperCase()}
    id={placeholder}
    value={query}
    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    }}
  />
);
