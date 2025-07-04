import React from 'react';
import { DropDownMenu, IconButton, MenuItem, Tooltip, Typography, styled } from '@foundation';
import IconArrowLeft from '@icons/arrow-left.svg';
import IconLogo from '@icons/login-ew-icon.svg';
import IconSettings from '@icons/settings.svg';
import { useTransactionsStore, useUserStore } from '@store';
import { ENV_CONFIG } from 'env_config';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { RestartWalletDialog } from './Dialogs/RestartWalletDialog';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '200px 1fr 200px',
  padding: theme.spacing(4, 0),
}));

const NavLinkStyled = styled(NavLink)(({ theme }) => ({
  position: 'relative',
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

const NotificationBadgeStyled = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: 8,
  height: 8,
  top: 6,
  right: -14,
  backgroundColor: theme.palette.error.main,
  borderRadius: '50%',
}));

const LinkMarkerStyled = styled('div')(({ theme }) => ({
  width: '50%',
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
  gap: theme.spacing(2),
}));

export const Header: React.FC = observer(function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const userStore = useUserStore();
  const transactionsStore = useTransactionsStore();

  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isRestartWalletDialogOpen, setIsRestartWalletDialogOpen] = React.useState(false);

  const isNotSettingsPage = location.pathname !== '/settings';
  const isAssetsPage = location.pathname === '/assets';
  const isTransactionsPage = location.pathname === '/transactions';
  const isNftsPage = location.pathname === '/nfts';
  const isWeb3Page = location.pathname === '/web3';
  const isUserMenuOpen = Boolean(userMenuAnchorEl);
  const showTransactionsNotification = transactionsStore.hasPendingSignature;

  const onOpenUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const onCloseUserMenuClick = () => {
    setUserMenuAnchorEl(null);
  };

  const onLogoutClick = () => {
    userStore.logout();
    setUserMenuAnchorEl(null);
  };

  const onRestartClick = () => {
    setIsRestartWalletDialogOpen(true);
    setUserMenuAnchorEl(null);
  };

  return (
    <RootStyled>
      <LogoStyled>
        {isNotSettingsPage ? (
          <IconButton
            large
            onClick={() => {
              navigate('/assets');
            }}
          >
            <img src={IconLogo} />
          </IconButton>
        ) : (
          <IconButton
            large
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
            <NavLinkStyled to="assets">
              <Typography variant="h6" color="inherit">
                {t('NAVIGATION.ASSETS')}
              </Typography>
              {isAssetsPage && <LinkMarkerStyled />}
            </NavLinkStyled>
            <NavLinkStyled to="nfts">
              <Typography variant="h6" color="inherit">
                {t('NAVIGATION.NFTs')}{' '}
              </Typography>
              {isNftsPage && <LinkMarkerStyled />}
            </NavLinkStyled>
            {ENV_CONFIG.USE_EMBEDDED_WALLET_SDK && (
              <NavLinkStyled to="web3">
                <Typography variant="h6" color="inherit">
                  {t('NAVIGATION.WEB3')}
                </Typography>
                {isWeb3Page && <LinkMarkerStyled />}
              </NavLinkStyled>
            )}
            <NavLinkStyled to="transactions">
              <Typography variant="h6" color="inherit">
                {t('NAVIGATION.TRANSACTIONS')}
              </Typography>
              {isTransactionsPage && <LinkMarkerStyled />}
              {showTransactionsNotification && (
                <Tooltip title={t('NAVIGATION.TRANSACTIONS_NOTIFICATION')} arrow placement="right">
                  <NotificationBadgeStyled />
                </Tooltip>
              )}
            </NavLinkStyled>
          </>
        )}
      </TreasuryPagesStyled>
      <SettingsAndProfileStyled>
        <IconButton
          large
          tooltip={t('SETTINGS.NAME')}
          onClick={() => {
            navigate('/settings');
          }}
        >
          <img src={IconSettings} />
        </IconButton>
        <IconButton onClick={onOpenUserMenuClick} large>
          <Typography variant="subtitle2" component="span">
            {userStore.userShortDisplayName}
          </Typography>
        </IconButton>
      </SettingsAndProfileStyled>
      <DropDownMenu anchorEl={userMenuAnchorEl} isOpen={isUserMenuOpen} onClose={onCloseUserMenuClick}>
        <MenuItem disabled>{userStore.loggedUser?.email}</MenuItem>
        <MenuItem onClick={onRestartClick}>{t('USER_MENU.RESTART_WALLET.MENU_ITEM')}</MenuItem>
        <MenuItem onClick={onLogoutClick}>{t('USER_MENU.LOG_OUT')}</MenuItem>
      </DropDownMenu>
      <RestartWalletDialog
        isOpen={isRestartWalletDialogOpen}
        onClose={() => {
          setIsRestartWalletDialogOpen(false);
        }}
      />
    </RootStyled>
  );
});
