import { styled } from '@foundation';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const RootStyled = styled('ul')(({ theme }) => ({
  display: 'inline-flex',
  listStyle: 'none',
  gap: theme.spacing(2),
}));

export const Navigation = observer(function Navigation() {
  const { t } = useTranslation();

  return (
    <RootStyled>
      <li>
        <NavLink to="/assets">{t('PAGE_NAME.ASSETS')}</NavLink>
      </li>
      <li>
        <NavLink to="/transactions">{t('PAGE_NAME.TRANSACTIONS')}</NavLink>
      </li>
      <li>
        <NavLink to="/nfts">{t('PAGE_NAME.NFTs')}</NavLink>
      </li>
      <li>
        <NavLink to="/settings">{t('PAGE_NAME.SETTINGS')}</NavLink>
      </li>
    </RootStyled>
  );
});
