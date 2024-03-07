import * as React from 'react';
import IconSearch from '@icons/search.svg';
import Input from '@mui/material/Input/Input';
import styled from '@mui/material/styles/styled';

export const InputStyled = styled(Input)(({ theme }) => ({
  '&.MuiInput-root': {
    padding: theme.spacing(3, 6),
    width: '100%',
    boxSizing: 'border-box',
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
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
    placeholder={placeholder}
    id={placeholder}
    value={query}
    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    }}
  />
);
