import React from 'react';
import { styled } from '@foundation';
import IconCopy from '@icons/copy.svg';
import IconButton from '@mui/material/IconButton/IconButton';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

const RootStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(0.5),
  alignItems: 'center',
  maxWidth: '100%',
}));

const TextStyled = styled('p')(({ theme }) => ({
  textWrap: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 130,
  color: theme.palette.text.primary,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
}));

interface IProps {
  text: string;
}

export const CopyText: React.FC<IProps> = ({ text }) => {
  const { t } = useTranslation();
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

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
      <TextStyled>{text}</TextStyled>
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
