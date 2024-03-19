import React from 'react';
import { Progress, styled } from '@foundation';

const RootStyled = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
}));

export const LoadingPage: React.FC = () => (
  <RootStyled>
    <Progress size="large" />
  </RootStyled>
);
