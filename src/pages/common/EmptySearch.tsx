import React from 'react';
import { Typography, styled } from '@foundation';
import IconEmpty from '@icons/empty_search.svg';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

const TextStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginTop: theme.spacing(2),
  textAlign: 'center',
}));

interface IProps {
  height: number;
  width: number;
}

export const EmptySearch: React.FC<IProps> = ({ height, width }) => {
  const { t } = useTranslation();

  return (
    <RootStyled style={{ height, width }}>
      <img width={56} height={56} src={IconEmpty} alt={t('EMPTY_SEARCH.TITLE')} />
      <TextStyled>
        <Typography color="text.secondary" variant="h3" component="h3">
          {t('EMPTY_SEARCH.TITLE')}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {t('EMPTY_SEARCH.DESCRIPTION')}
        </Typography>
      </TextStyled>
    </RootStyled>
  );
};
