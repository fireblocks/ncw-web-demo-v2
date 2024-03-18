import React from 'react';
import { DropDownMenu, IconButton, MenuItem, Typography, styled } from '@foundation';
import IconArrowLeft from '@icons/arrow-left.svg';
import IconLogo from '@icons/logo.svg';
import IconSettings from '@icons/settings.svg';
import { useUserStore } from '@store';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NavLink, redirect, useLocation, useNavigate } from 'react-router-dom';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '200px 1fr 200px',
  padding: theme.spacing(4, 0),
}));

const NavLinkStyled = styled(NavLink)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textDecoration: 'none',
  gap: theme.spacing(2),
  fontWeight: 700,
  fontSize: 14,
  textTransform: 'uppercase',
  transition: 'color 0.3s',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.text.primary,
  },
  '&.active': {
    color: theme.palette.text.primary,
  },
}));

const LinkMarkerStyled = styled('div')(({ theme }) => ({
  width: 28,
  height: 2,
  backgroundColor: theme.palette.text.primary,
}));

const TreasuryPagesStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: theme.spacing(5),
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

  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const isNotSettingsPage = location.pathname !== '/settings';
  const isAssetsPage = location.pathname === '/assets';
  const isTransactionsPage = location.pathname === '/transactions';
  const isNftsPage = location.pathname === '/nfts';
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const onOpenUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const onCloseUserMenuClick = () => {
    setUserMenuAnchorEl(null);
  };

  const onLogoutClick = () => {
    userStore.logout();
    setUserMenuAnchorEl(null);
    redirect('/login');
  };

  return (
    <RootStyled>
      <LogoStyled>
        {isNotSettingsPage ? (
          <IconButton
            onClick={() => {
              navigate('/assets');
            }}
          >
            <img src={IconLogo} />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
          >
            <img src={IconArrowLeft} />
          </IconButton>
        )}
      </LogoStyled>
      <TreasuryPagesStyled>
        {isNotSettingsPage && (
          <>
            <NavLinkStyled to="/assets">
              <Typography variant="inherit" color="inherit">
                {t('NAVIGATION.ASSETS')}
              </Typography>
              {isAssetsPage && <LinkMarkerStyled />}
            </NavLinkStyled>
            <NavLinkStyled to="/nfts">
              <Typography variant="inherit" color="inherit">
                {t('NAVIGATION.NFTs')}{' '}
              </Typography>
              {isNftsPage && <LinkMarkerStyled />}
            </NavLinkStyled>
            <NavLinkStyled to="/transactions">
              <Typography variant="inherit" color="inherit">
                {t('NAVIGATION.TRANSACTIONS')}
              </Typography>
              {isTransactionsPage && <LinkMarkerStyled />}
            </NavLinkStyled>
          </>
        )}
      </TreasuryPagesStyled>
      <SettingsAndProfileStyled>
        <IconButton
          tooltip={t('SETTINGS.NAME')}
          onClick={() => {
            navigate('/settings');
          }}
        >
          <img src={IconSettings} />
        </IconButton>
        <IconButton onClick={onOpenUserMenuClick}>
          <Typography variant="subtitle2" component="span">
            {userStore.userShortDisplayName}
          </Typography>
        </IconButton>
      </SettingsAndProfileStyled>
      <DropDownMenu anchorEl={userMenuAnchorEl} isOpen={isUserMenuOpen} onClose={onCloseUserMenuClick}>
        <MenuItem onClick={onLogoutClick}>Logout</MenuItem>
      </DropDownMenu>
    </RootStyled>
  );
});
