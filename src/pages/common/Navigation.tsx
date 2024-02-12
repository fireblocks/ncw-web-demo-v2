import { Typography, styled } from '@foundation';
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
        <NavLink to="/assets">
          <Typography variant="h6" color="text.primary">
            {t('PAGE_NAME.ASSETS')}
          </Typography>
        </NavLink>
      </li>
      <li>
        <NavLink to="/transactions">
          <Typography variant="h6" color="text.primary">
            {t('PAGE_NAME.TRANSACTIONS')}
          </Typography>
        </NavLink>
      </li>
      <li>
        <NavLink to="/nfts">
          <Typography variant="h6" color="text.primary">
            {t('PAGE_NAME.NFTs')}{' '}
          </Typography>
        </NavLink>
      </li>
      <li>
        <NavLink to="/settings">
          <Typography variant="h6" color="text.primary">
            {t('PAGE_NAME.SETTINGS')}{' '}
          </Typography>
        </NavLink>
      </li>
    </RootStyled>
  );
});
