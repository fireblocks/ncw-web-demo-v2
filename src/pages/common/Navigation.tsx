import { Typography, styled } from '@foundation';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const RootStyled = styled('ul')(({ theme }) => ({
  display: 'inline-flex',
  listStyle: 'none',
  gap: theme.spacing(2),
}));

export const Navigation: React.FC = observer(function Navigation() {
  const { t } = useTranslation();
  const userStore = useUserStore();

  return (
    <RootStyled>
      {userStore.loggedUser ? (
        <>
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
        </>
      ) : (
        <li>
          <NavLink to="/login">
            <Typography variant="h6" color="text.primary">
              {t('PAGE_NAME.LOGIN')}
            </Typography>
          </NavLink>
        </li>
      )}
    </RootStyled>
  );
});
