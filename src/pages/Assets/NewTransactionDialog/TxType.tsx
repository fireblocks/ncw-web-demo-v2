import { RadioButtonsGroup, RadioButton } from '@foundation';
import { useTranslation } from 'react-i18next';

interface IProps {
  setType: (type: string) => void;
}

export const TxType: React.FC<IProps> = ({ setType }) => {
  const { t } = useTranslation();

  return (
    <RadioButtonsGroup
      onChange={setType}
      defaultValue="TRANSFER"
      caption={t('ASSETS.NEW_TRANSACTION_DIALOG.TRANSACTION_TYPE.CAPTION')}
    >
      <RadioButton value="TRANSFER" label={t('ASSETS.NEW_TRANSACTION_DIALOG.TRANSACTION_TYPE.TRANSFER')} />
      <RadioButton value="TYPED_MESSAGE" label={t('ASSETS.NEW_TRANSACTION_DIALOG.TRANSACTION_TYPE.TYPED_MESSAGE')} />
    </RadioButtonsGroup>
  );
};
