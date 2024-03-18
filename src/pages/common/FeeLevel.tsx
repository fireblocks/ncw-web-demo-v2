import { ButtonsGroup } from '@foundation';
import { useTranslation } from 'react-i18next';

interface IProps {
  setLevel: (level: string) => void;
  level: string;
}

export const FeeLevel: React.FC<IProps> = ({ setLevel, level }) => {
  const { t } = useTranslation();

  const buttons = [
    { value: 'LOW', label: t('ASSETS.NEW_TRANSACTION_DIALOG.FEE_LEVEL.LOW') },
    { value: 'MEDIUM', label: t('ASSETS.NEW_TRANSACTION_DIALOG.FEE_LEVEL.MEDIUM') },
    { value: 'HIGH', label: t('ASSETS.NEW_TRANSACTION_DIALOG.FEE_LEVEL.HIGH') },
  ];

  return (
    <ButtonsGroup
      buttons={buttons}
      onChange={setLevel}
      currentValue={level}
      caption={t('ASSETS.NEW_TRANSACTION_DIALOG.FEE_LEVEL.CAPTION')}
    />
  );
};
