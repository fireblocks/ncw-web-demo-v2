import React from 'react';
import { CopyText, Progress } from '@foundation';
import QRCode from 'react-qr-code';
import {
  JoinWalletContainerStyled,
  StepRowStyled,
  StepNumberStyled,
  StepTextStyled,
  QRCodeContainerStyled,
  QRLinkTextStyled,
  IdContainerStyled,
} from './styles';

interface JoinWalletUIProps {
  encodedRequestId: string | null;
}

export const JoinWalletUI: React.FC<JoinWalletUIProps> = ({ encodedRequestId }) => (
  <JoinWalletContainerStyled>
    <StepRowStyled>
      <StepNumberStyled>1</StepNumberStyled>
      <StepTextStyled variant="body1">Launch Embedded Wallets on existing device.</StepTextStyled>
    </StepRowStyled>

    <StepRowStyled>
      <StepNumberStyled>2</StepNumberStyled>
      <StepTextStyled variant="body1">Open the settings menu.</StepTextStyled>
    </StepRowStyled>

    <StepRowStyled>
      <StepNumberStyled>3</StepNumberStyled>
      <StepTextStyled variant="body1">Tap "Add new device".</StepTextStyled>
    </StepRowStyled>

    <StepRowStyled>
      <StepNumberStyled>4</StepNumberStyled>
      <StepTextStyled variant="body1">Scan the QR code or paste the link.</StepTextStyled>
    </StepRowStyled>

    {encodedRequestId ? (
      <>
        <QRCodeContainerStyled>
          <QRCode value={encodedRequestId} style={{ width: '184px', height: '184px' }} />
        </QRCodeContainerStyled>

        <QRLinkTextStyled variant="body1">QR code link</QRLinkTextStyled>

        <IdContainerStyled>
          <CopyText text={encodedRequestId} size={'large'} />
        </IdContainerStyled>
      </>
    ) : (
      <Progress size="medium" />
    )}
  </JoinWalletContainerStyled>
);
