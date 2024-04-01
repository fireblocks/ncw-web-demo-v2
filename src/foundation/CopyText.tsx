import React from 'react';
import { Typography, styled } from '@foundation';
import IconCopy from '@icons/copy.svg';
import IconEyeOff from '@icons/eye_off.svg';
import IconButton from '@mui/material/IconButton/IconButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  alignItems: 'center',
  maxWidth: '100%',
}));

const TextStyled = styled(Typography)(({ theme }) => ({
  textWrap: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 130,
  color: theme.palette.text.primary,
  margin: 0,
  padding: 0,
}));

const TextLargeStyled = styled(Typography)(({ theme }) => ({
  textWrap: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.palette.text.primary,
  maxWidth: '95%',
  margin: 0,
  padding: 0,
}));

interface IProps {
  text: string;
  size?: 'small' | 'large';
  hidden?: boolean;
}

export const CopyText: React.FC<IProps> = ({ text, size = 'small', hidden = false }) => {
  const { t } = useTranslation();
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const [isHiddenText, setIsHiddenText] = React.useState(hidden);

  const Text = size === 'small' ? TextStyled : TextLargeStyled;
  const hiddenText = '•'.repeat(text.length);

  const showTooltip = () => {
    setIsTooltipOpen(true);
  };

  const hideTooltip = () => {
    setIsTooltipOpen(false);
  };

  const copyTextHandler = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showTooltip();
      })
      .catch(() => {});
  };

  return (
    <RootStyled>
      <Text variant="body1">{isHiddenText ? hiddenText : text}</Text>
      {hidden && (
        <IconButton
          size="small"
          onClick={() => {
            setIsHiddenText(!isHiddenText);
          }}
        >
          <img src={IconEyeOff} />
        </IconButton>
      )}
      <Tooltip arrow placement="top" title={t('COMMON.COPIED')} open={isTooltipOpen} onClose={hideTooltip}>
        <IconButton
          onMouseLeave={hideTooltip}
          size="small"
          onClick={() => {
            copyTextHandler();
          }}
        >
          <img src={IconCopy} />
        </IconButton>
      </Tooltip>
    </RootStyled>
  );
};
