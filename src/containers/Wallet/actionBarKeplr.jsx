import React, { useEffect, useState } from 'react';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Link } from 'react-router-dom';
import { Pane, Text, ActionBar, Button, Input } from '@cybercongress/gravity';
import { coins } from '@cosmjs/launchpad';
import { CosmosDelegateTool } from '../../utils/ledger';
import {
  ConnectLadger,
  Dots,
  ActionBarContentText,
  TransactionSubmitted,
  Confirmed,
  TransactionError,
} from '../../components';
import {
  LEDGER,
  CYBER,
  PATTERN_COSMOS,
  PATTERN_CYBER,
  POCKET,
} from '../../utils/config';
import { getTxs } from '../../utils/search/utils';
import { deletPubkey } from './utils';

const imgKeplr = require('../../image/keplr-icon.svg');

const {
  STAGE_INIT,
  STAGE_ERROR,
  STAGE_SUBMITTED,
  STAGE_CONFIRMING,
  STAGE_CONFIRMED,
} = LEDGER;

const STAGE_SEND = 1.1;

function ActionBarKeplr({
  keplr,
  updateAddress,
  updateBalance,
  selectAccount,
  defaultAccounts,
}) {
  const [stage, setStage] = useState(STAGE_SEND);
  const [amountSend, setAmountSend] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientInputValid, setRecipientInputValid] = useState(null);
  const [amountSendInputValid, setAmountSendInputValid] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txHeight, setTxHeight] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [disabledGenerate, setDisabledGenerate] = useState(true);

  const generateTxSend = async () => {
    const amount = parseFloat(amountSend);
    if (keplr !== null) {
      setStage(STAGE_SUBMITTED);
      const [{ address }] = await keplr.signer.getAccounts();
      const result = await keplr.sendTokens(
        address,
        recipient,
        coins(amount, CYBER.DENOM_CYBER)
      );
      console.log('result: ', result);
      const hash = result.transactionHash;
      console.log('hash :>> ', hash);
      setTxHash(hash);
    }
  };

  const cleatState = () => {
    setStage(STAGE_SEND);
    setRecipientInputValid(null);
    setAmountSendInputValid(null);
    setRecipient('');
    setAmountSend('');
    setErrorMessage(null);
    setTxHeight(null);
    setTxHash(null);
    if (updateAddress) {
      updateAddress();
    }
  };

  useEffect(() => {
    const confirmTx = async () => {
      console.log('txHash :>> ', txHash);
      if (txHash && txHash !== null) {
        setStage(STAGE_CONFIRMING);
        const response = await getTxs(txHash);
        console.log('response :>> ', response);
        if (response && response !== null) {
          if (response.logs) {
            setStage(STAGE_CONFIRMED);
            setTxHeight(response.height);
            if (updateBalance) {
              updateBalance();
            }
            return;
          }
          if (response.code) {
            setStage(STAGE_ERROR);
            setTxHeight(response.height);
            setErrorMessage(response.raw_log);
            return;
          }
        }
        setTimeout(confirmTx, 1500);
      }
    };
    confirmTx();
  }, [txHash]);

  useEffect(() => {
    if (parseFloat(amountSend) === 0) {
      setAmountSendInputValid('Invalid amount');
    } else {
      setAmountSendInputValid(null);
    }
  }, [amountSend]);

  useEffect(() => {
    if (recipient !== '') {
      if (!recipient.match(PATTERN_CYBER)) {
        setRecipientInputValid('Invalid bech32 address');
      } else {
        setRecipientInputValid(null);
      }
    }
  }, [recipient]);

  useEffect(() => {
    if (recipient.match(PATTERN_CYBER) && parseFloat(amountSend) > 0) {
      setDisabledGenerate(false);
    } else {
      setDisabledGenerate(true);
    }
  }, [recipient, amountSend]);

  const changeDefaultAccounts = async () => {
    if (selectAccount !== null && selectAccount.cyber) {
      localStorage.setItem(
        'pocket',
        JSON.stringify({ [selectAccount.cyber.bech32]: selectAccount })
      );
    }
    if (updateAddress) {
      updateAddress();
    }
  };

  // if (stage === STAGE_INIT) {
  //   return (
  //     <ActionBar>
  //       <Pane>
  //         <Button
  //           marginX={10}
  //           onClick={() => ()}
  //         >
  //           Connect
  //         </Button>
  //         <Button marginX={10} onClick={() => setStage(STAGE_SEND)}>
  //           Send EUL{' '}
  //           <img
  //             style={{
  //               width: 20,
  //               height: 20,
  //               marginLeft: '5px',
  //               paddingTop: '2px',
  //             }}
  //             src={imgKeplr}
  //             alt="keplr"
  //           />
  //         </Button>
  //         {!defaultAccounts && (
  //           <Button marginX={10} onClick={() => changeDefaultAccounts()}>
  //             Make active
  //           </Button>
  //         )}
  //       </Pane>
  //     </ActionBar>
  //   );
  // }

  if (stage === STAGE_SEND) {
    return (
      <ActionBar>
        <Pane display="flex" className="contentItem">
          <ActionBarContentText>
            <Input
              value={recipient}
              height={42}
              marginRight={10}
              width="300px"
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="cyber address To"
              isInvalid={recipientInputValid !== null}
              message={recipientInputValid}
            />

            <Input
              value={amountSend}
              height={42}
              width="24%"
              onChange={(e) => setAmountSend(e.target.value)}
              placeholder="EUL"
              isInvalid={amountSendInputValid !== null}
              message={amountSendInputValid}
            />
          </ActionBarContentText>

          <button
            type="button"
            className="btn-disabled"
            disabled={disabledGenerate}
            onClick={() => generateTxSend()}
          >
            Generate Tx
          </button>
        </Pane>
      </ActionBar>
    );
  }
  if (stage === STAGE_SUBMITTED) {
    return (
      <ActionBar>
        <ActionBarContentText>
          check the transaction <Dots big />
        </ActionBarContentText>
      </ActionBar>
    );
  }

  if (stage === STAGE_CONFIRMING) {
    return <TransactionSubmitted />;
  }

  if (stage === STAGE_CONFIRMED) {
    return (
      <Confirmed
        txHash={txHash}
        txHeight={txHeight}
        onClickBtnCloce={() => cleatState()}
      />
    );
  }

  if (stage === STAGE_ERROR && errorMessage !== null) {
    return (
      <TransactionError
        errorMessage={errorMessage}
        onClickBtn={() => cleatState()}
      />
    );
  }

  return null;
}

export default ActionBarKeplr;
