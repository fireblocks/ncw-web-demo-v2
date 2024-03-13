import React from 'react';
import { Typography, styled } from '@foundation';

export const AmountsStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(5),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(10),
}));

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

interface IProps {
  title: string;
  titleColor: string;
  value: number | string;
}

export const HeadingAmount: React.FC<IProps> = ({ title, titleColor, value }) => (
  <RootStyled>
    <Typography variant="h6" color={titleColor}>
      {title}
    </Typography>
    <Typography variant="h1" color="text.primary">
      {value}
    </Typography>
  </RootStyled>
);
