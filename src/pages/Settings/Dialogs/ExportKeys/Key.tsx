import React from 'react';
import { SecondaryIconButton, styled } from '@foundation';
import IconCopy from '@icons/copy.svg';
import IconCopyWhite from '@icons/copy_white.svg';
import IconEye from '@icons/eye.svg';
import IconEyeWhite from '@icons/eye_white.svg';
import IconEyeOff from '@icons/eye_off.svg';
import IconEyeOffWhite from '@icons/eye_off_white.svg';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(3),
  alignItems: 'center',
  maxWidth: '100%',
}));

const ActionsStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const KeyStyled = styled('p')(({ theme }) => ({
  fontFamily: 'Roboto Mono, monospace',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  fontSize: 16,
  padding: 0,
  margin: 0,
  wordBreak: 'break-all',
  width: 628,
}));

interface IProps {
  assetKey: string;
}

export const Key: React.FC<IProps> = ({ assetKey }) => {
  const { t } = useTranslation();
  const [isCopyTooltipOpen, setIsCopyTooltipOpen] = React.useState(false);
  const [isHiddenKey, setIsHiddenKey] = React.useState(true);

  const hiddenKey = '•'.repeat(assetKey.length);

  const showCopyTooltip = () => {
    setIsCopyTooltipOpen(true);
  };

  const hideCopyTooltip = () => {
    setIsCopyTooltipOpen(false);
  };

  const copyTextHandler = () => {
    navigator.clipboard
      .writeText(assetKey)
      .then(() => {
        showCopyTooltip();
      })
      .catch(() => {});
  };

  return (
    <RootStyled>
      <KeyStyled>{isHiddenKey ? hiddenKey : assetKey}</KeyStyled>
      <ActionsStyled>
        <SecondaryIconButton
          tooltip={t(
            isHiddenKey
              ? 'SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.SHOW_KEY'
              : 'SETTINGS.DIALOGS.EXPORT_PRIVATE_KEYS.HIDE_KEY',
          )}
          iconSrc={isHiddenKey ? IconEyeOffWhite : IconEyeWhite}
          onClick={() => {
            setIsHiddenKey(!isHiddenKey);
          }}
        />
        <Tooltip arrow placement="top" title={t('COMMON.COPIED')} open={isCopyTooltipOpen} onClose={hideCopyTooltip}>
          <div>
            <SecondaryIconButton
              iconSrc={IconCopyWhite}
              onMouseLeave={hideCopyTooltip}
              onClick={() => {
                copyTextHandler();
              }}
            />
          </div>
        </Tooltip>
      </ActionsStyled>
    </RootStyled>
  );
};
