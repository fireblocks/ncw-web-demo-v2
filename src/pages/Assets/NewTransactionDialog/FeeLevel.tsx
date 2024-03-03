import { RadioButtonsGroup, RadioButton } from '@foundation';
import { useTranslation } from 'react-i18next';

interface IProps {
  setLevel: (level: string) => void;
}

export const FeeLevel: React.FC<IProps> = ({ setLevel }) => {
  const { t } = useTranslation();

  return (
    <RadioButtonsGroup onChange={setLevel} defaultValue="LOW" caption={t('ASSETS.NEW_TRANSACTION_DIALOG.FEE_LEVEL')}>
      <RadioButton value="LOW" label="LOW" />
      <RadioButton value="MEDIUM" label="MEDIUM" />
      <RadioButton value="HIGH" label="HIGH" />
    </RadioButtonsGroup>
  );
};
