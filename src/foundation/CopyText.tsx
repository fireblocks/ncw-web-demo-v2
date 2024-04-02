import React from 'react';
import { SecondaryIconButton, Typography, styled } from '@foundation';
import IconCopy from '@icons/copy.svg';
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
}

export const CopyText: React.FC<IProps> = ({ text, size = 'small' }) => {
  const { t } = useTranslation();
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  const Text = size === 'small' ? TextStyled : TextLargeStyled;

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
      <Text variant="body1">{text}</Text>
      <Tooltip arrow placement="top" title={t('COMMON.COPIED')} open={isTooltipOpen} onClose={hideTooltip}>
        <div>
          <SecondaryIconButton
            iconSrc={IconCopy}
            onMouseLeave={hideTooltip}
            onClick={() => {
              copyTextHandler();
            }}
          />
        </div>
      </Tooltip>
    </RootStyled>
  );
};
