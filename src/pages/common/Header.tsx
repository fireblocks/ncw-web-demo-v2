import { Button, Typography, styled } from '@foundation';
import IconArrowLeft from '@icons/arrow-left.svg';
import IconLogo from '@icons/logo.svg';
import IconSettings from '@icons/settings.svg';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '200px 1fr 200px',
  padding: theme.spacing(4, 8),
}));

const TreasuryPagesStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
}));

const LogoStyled = styled('div')(() => ({
  display: 'flex',
  alignItems: 'flex-start',
}));

const SettingsAndProfileStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(3),
}));

export const Header: React.FC = observer(function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const userStore = useUserStore();

  const onBackClick = () => {
    navigate(-1);
  };

  const isNotSettingsPage = location.pathname !== '/settings';

  return (
    <RootStyled>
      <LogoStyled>
        {isNotSettingsPage ? (
          <img src={IconLogo} />
        ) : (
          <Button variant="contained" onClick={onBackClick}>
            <img src={IconArrowLeft} />
          </Button>
        )}
      </LogoStyled>
      <TreasuryPagesStyled>
        {isNotSettingsPage && (
          <>
            <NavLink to="/assets">
              <Typography variant="h6" color="text.primary">
                {t('NAVIGATION.ASSETS')}
              </Typography>
            </NavLink>
            <NavLink to="/transactions">
              <Typography variant="h6" color="text.primary">
                {t('NAVIGATION.TRANSACTIONS')}
              </Typography>
            </NavLink>
            <NavLink to="/nfts">
              <Typography variant="h6" color="text.primary">
                {t('NAVIGATION.NFTs')}{' '}
              </Typography>
            </NavLink>
          </>
        )}
      </TreasuryPagesStyled>
      <SettingsAndProfileStyled>
        <NavLink to="/settings">
          <Button variant="contained">
            <img src={IconSettings} />
          </Button>
        </NavLink>
        <Button variant="contained">{userStore.userShortDisplayName}</Button>
      </SettingsAndProfileStyled>
    </RootStyled>
  );
});
