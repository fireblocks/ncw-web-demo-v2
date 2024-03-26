import React from 'react';
import { Typography, styled } from '@foundation';

export const AmountsStyled = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(15),
}));

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
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
    <Typography variant="h2" color="text.primary">
      {value}
    </Typography>
  </RootStyled>
);
