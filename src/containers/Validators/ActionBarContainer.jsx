import React, { Component } from 'react';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Pane, Text, ActionBar, Button } from '@cybercongress/gravity';
import LocalizedStrings from 'react-localization';
import { coins, coin } from '@cosmjs/launchpad';
import { CosmosDelegateTool } from '../../utils/ledger';
import {
  JsonTransaction,
  ConnectLadger,
  Confirmed,
  ContainetLedger,
  FormatNumber,
  TransactionSubmitted,
  Delegate,
  ReDelegate,
  TransactionError,
  CheckAddressInfo,
  Dots,
} from '../../components';

import { trimString, formatNumber } from '../../utils/utils';
import {
  getBalanceWallet,
  selfDelegationShares,
  getValidators,
  statusNode,
} from '../../utils/search/utils';

import { LEDGER, CYBER } from '../../utils/config';
import { AppContext } from '../../context';

import { i18n } from '../../i18n/en';

const { DIVISOR_CYBER_G } = CYBER;
const {
  MEMO,
  HDPATH,
  LEDGER_OK,
  LEDGER_NOAPP,
  STAGE_INIT,
  STAGE_LEDGER_INIT,
  STAGE_READY,
  STAGE_WAIT,
  STAGE_SUBMITTED,
  STAGE_CONFIRMING,
  STAGE_CONFIRMED,
  STAGE_ERROR,
} = LEDGER;

const T = new LocalizedStrings(i18n);

export const TXTYPE_DELEGATE = 0;
export const TXTYPE_UNDELEGATE = 1;
export const TXTYPE_REDELEGATE = 2;
const LEDGER_TX_ACOUNT_INFO = 10;
const LEDGER_GENERATION = 23;

const ActionBarContentText = ({ children, ...props }) => (
  <Pane
    display="flex"
    fontSize="20px"
    justifyContent="center"
    alignItems="center"
    flexGrow={1}
    marginRight="15px"
    {...props}
  >
    {children}
  </Pane>
);

class ActionBarContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: STAGE_INIT,
      ledger: null,
      address: null,
      returnCode: null,
      addressInfo: null,
      ledgerVersion: [0, 0, 0],
      balance: 0,
      time: 0,
      toSend: '',
      txMsg: null,
      txContext: null,
      txBody: null,
      txHeight: null,
      txHash: null,
      error: null,
      txType: null,
      valueSelect: '',
      errorMessage: null,
      validatorsAll: null,
      connectLedger: null,
    };
    this.timeOut = null;
    this.transport = null;
    this.ledger = null;
  }

  componentDidMount() {
    this.ledger = new CosmosDelegateTool();
  }

  componentDidUpdate(prevProps) {
    const { validators } = this.props;
    const { stage, addressInfo, address } = this.state;
    if (prevProps.validators !== validators && stage === STAGE_READY) {
      this.stageInit();
    }
    if (
      addressInfo !== null &&
      address !== null &&
      stage === LEDGER_GENERATION
    ) {
      this.generateTx();
    }
  }

  stageInit = () => {
    this.setState({
      stage: STAGE_INIT,
    });
  };

  getLedgerAddress = async () => {
    const { addressPocket } = this.props;
    this.transport = await TransportWebUSB.create(120 * 1000);
    this.ledger = new CosmosDelegateTool(this.transport);

    const connect = await this.ledger.connect();
    if (connect.return_code === LEDGER_OK) {
      this.setState({
        connectLedger: true,
      });

      const address = await this.ledger.retrieveAddressCyber(HDPATH);
      if (addressPocket !== null && addressPocket.bech32 === address.bech32) {
        this.setState({
          address,
        });
        this.getAddressInfo();
      } else {
        this.setState({
          stage: STAGE_ERROR,
          errorMessage: `Add address ${trimString(
            address.bech32,
            9,
            5
          )} to your pocket or make active `,
        });
      }
    } else {
      this.setState({
        connectLedger: false,
      });
    }
  };

  getAddressInfo = async () => {
    const { address } = this.state;
    const { validators } = this.props;
    this.setState({
      stage: LEDGER_TX_ACOUNT_INFO,
    });

    const validatorAddres = validators.operator_address;

    let addressInfo = {};
    const balance = 0;
    try {
      const responseNode = await statusNode();
      console.log('responseNode', responseNode);
      const response = await getBalanceWallet(address.bech32);
      console.log('getBalanceWallet', response);
      const delegate = await selfDelegationShares(
        address.bech32,
        validatorAddres
      );
      console.log(delegate);

      if (response) {
        const data = response.account;
        addressInfo = {
          chainId: responseNode.node_info.network,
          ...data,
          delegate,
        };
      }

      console.log('addressInfo', addressInfo);

      this.setState({
        addressInfo,
        balance,
        stage: LEDGER_GENERATION,
      });
    } catch (error) {
      const { message, statusCode } = error;
      if (message !== "Cannot read property 'length' of undefined") {
        //     // this just means we haven't found the device yet...
        //     // eslint-disable-next-line
        console.error('Problem reading address data', message, statusCode);
      }
      this.setState({ time: Date.now() }); // cause componentWillUpdate to call again.
    }
  };

  generateTxKeplr = async () => {
    const { validators, addressPocket } = this.props;
    const { keplr } = this.context;
    const { toSend, txType, valueSelect } = this.state;
    const amount = parseFloat(toSend) * DIVISOR_CYBER_G;
    const validatorAddres = validators.operatorAddress;
    this.setState({
      stage: LEDGER_GENERATION,
    });

    if (keplr !== null) {
      const [{ address }] = await keplr.signer.getAccounts();
      if (addressPocket !== null && addressPocket.bech32 === address) {
        let response = null;
        if (txType === TXTYPE_DELEGATE) {
          response = await keplr.delegateTokens(
            address,
            validatorAddres,
            coin(parseFloat(amount), 'boot'),
            CYBER.MEMO_KEPLR
          );
        }
        if (txType === TXTYPE_UNDELEGATE) {
          response = await keplr.undelegateTokens(
            address,
            validatorAddres,
            coin(parseFloat(amount), 'boot'),
            CYBER.MEMO_KEPLR
          );
        }
        if (txType === TXTYPE_REDELEGATE) {
          response = await keplr.redelegateTokens(
            address,
            validatorAddres,
            valueSelect,
            coin(parseFloat(amount), 'boot'),
            CYBER.MEMO_KEPLR
          );
          // msgs.push({
          //   type: 'cosmos-sdk/MsgBeginRedelegate',
          //   value: {
          //     amount: {
          //       amount: amount.toString(),
          //       denom: CYBER.DENOM_CYBER,
          //     },
          //     delegator_address: address,
          //     validator_dst_address: valueSelect,
          //     validator_src_address: validatorAddres,
          //   },
          // });
        }

        console.log('result: ', response);
        if (response !== null) {
          const hash = response.transactionHash;
          console.log('hash :>> ', hash);
          this.setState({ stage: STAGE_SUBMITTED, txHash: hash });
          this.timeOut = setTimeout(this.confirmTx, 1500);
        }
      } else {
        this.setState({
          stage: STAGE_ERROR,
          errorMessage: `Add address ${trimString(
            address,
            9,
            5
          )} to your pocket or make active `,
        });
      }
    }
  };

  generateTx = async () => {
    const { address, addressInfo, toSend, txType, valueSelect } = this.state;
    const { validators } = this.props;

    let tx = {};

    const validatorAddres = validators.operator_address;

    console.log(validatorAddres);

    const amount = Math.floor(parseFloat(toSend) * DIVISOR_CYBER_G);

    const { denom } = addressInfo.coins[0];

    const txContext = {
      accountNumber: addressInfo.account_number,
      chainId: addressInfo.chainId,
      sequence: addressInfo.sequence,
      bech32: address.bech32,
      pk: address.pk,
      path: address.path,
    };

    switch (txType) {
      case TXTYPE_DELEGATE:
        tx = await this.ledger.txCreateDelegateCyber(
          txContext,
          validatorAddres,
          amount,
          MEMO,
          denom
        );
        break;
      case TXTYPE_UNDELEGATE:
        tx = await this.ledger.txCreateUndelegateCyber(
          txContext,
          validatorAddres,
          amount,
          MEMO
        );
        break;
      case TXTYPE_REDELEGATE:
        tx = await this.ledger.txCreateRedelegateCyber(
          txContext,
          validatorAddres,
          valueSelect,
          amount,
          MEMO
        );
        break;
      default:
        break;
    }
    // console.log('txContext', txContext);
    console.log('tx', tx);
    await this.setState({
      txMsg: tx,
      txContext,
      txBody: null,
      error: null,
    });
    // debugger;
    this.signTx();
  };

  signTx = async () => {
    const { txMsg, txContext } = this.state;
    // console.log('txContext', txContext);
    this.setState({ stage: STAGE_WAIT });
    const sing = await this.ledger.sign(txMsg, txContext);
    console.log('sing', sing);
    if (sing.return_code === LEDGER.LEDGER_OK) {
      const applySignature = await this.ledger.applySignature(
        sing,
        txMsg,
        txContext
      );
      if (applySignature !== null) {
        this.setState({
          txMsg: null,
          txBody: applySignature,
          stage: STAGE_SUBMITTED,
        });
        await this.injectTx();
      }
    } else {
      this.setState({
        stage: STAGE_ERROR,
        txBody: null,
        errorMessage: sing.error_message,
      });
    }
  };

  injectTx = async () => {
    const { txBody } = this.state;
    const txSubmit = await this.ledger.txSubmitCyber(txBody);
    const data = txSubmit;
    console.log('data', data);
    if (data.error) {
      // if timeout...
      // this.setState({stage: STAGE_CONFIRMING})
      // else
      this.setState({ stage: STAGE_ERROR, errorMessage: data.error });
    } else {
      this.setState({ stage: STAGE_SUBMITTED, txHash: data.data.txhash });
      this.timeOut = setTimeout(this.confirmTx, 1500);
    }
  };

  confirmTx = async () => {
    const { updateTable } = this.props;
    if (this.state.txHash !== null) {
      this.setState({ stage: STAGE_CONFIRMING });
      const data = await this.ledger.txStatusCyber(this.state.txHash);
      // console.log(data);
      if (data.logs) {
        this.setState({
          stage: STAGE_CONFIRMED,
          txHeight: data.height,
        });
        if (updateTable) {
          updateTable();
        }
        return;
      }
      if (data.code) {
        this.setState({
          stage: STAGE_ERROR,
          txHeight: data.height,
          errorMessage: data.raw_log,
        });
        return;
      }
    }
    this.timeOut = setTimeout(this.confirmTx, 1500);
  };

  initDevice = () => {
    const { addressPocket } = this.props;
    if (addressPocket !== null && addressPocket.keys === 'keplr') {
      this.generateTxKeplr();
    } else {
      this.getLedgerAddress();
    }
  };

  onChangeInputAmount = (e) => {
    this.setState({
      toSend: e.target.value,
    });
  };

  onChangeReDelegate = (e) => {
    this.setState({
      valueSelect: e.target.value,
    });
  };

  cleatState = () => {
    this.setState({
      stage: STAGE_INIT,
      ledger: null,
      address: null,
      returnCode: null,
      addressInfo: null,
      ledgerVersion: [0, 0, 0],
      balance: 0,
      time: 0,
      toSend: '',
      txMsg: null,
      txContext: null,
      txBody: null,
      txHeight: null,
      errorMessage: null,
      txHash: null,
      error: null,
    });
    this.timeOut = null;
    this.transport = null;
  };

  onClickMax = () => {
    const { txType } = this.state;
    if (txType === TXTYPE_DELEGATE) {
      this.setState((prevState) => ({
        toSend: prevState.balance / DIVISOR_CYBER_G,
      }));
    } else {
      this.setState((prevState) => ({
        toSend: prevState.addressInfo.delegate / DIVISOR_CYBER_G,
      }));
    }
  };

  onClickDelegate = async () => {
    await this.setState({
      stage: STAGE_READY,
      txType: TXTYPE_DELEGATE,
    });
  };

  onClickUnDelegate = async () => {
    await this.setState({
      stage: STAGE_READY,
      txType: TXTYPE_UNDELEGATE,
    });
  };

  onClickRestake = async () => {
    await this.setState({
      stage: STAGE_READY,
      txType: TXTYPE_REDELEGATE,
    });
  };

  render() {
    const {
      validators,
      addressPocket,
      unStake,
      mobile,
      validatorsAll,
      keplr,
    } = this.props;

    const {
      stage,
      ledgerVersion,
      returnCode,
      address,
      balance,
      toSend,
      txMsg,
      txHash,
      txHeight,
      txType,
      addressInfo,
      valueSelect,
      errorMessage,
      connectLedger,
    } = this.state;

    const validRestakeBtn = parseFloat(toSend) > 0 && valueSelect.length > 0;

    const T_AB = T.actionBar.delegate;

    if (mobile) {
      return (
        <ActionBar>
          <a
            className="btn"
            target="_blank"
            href="https://cybercongress.ai/docs/cyberd/run_validator/"
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {T_AB.btnBecome}
          </a>
        </ActionBar>
      );
    }

    if (
      Object.keys(validators).length === 0 &&
      (stage === STAGE_INIT || stage === STAGE_READY)
    ) {
      return (
        <ActionBar>
          <ActionBarContentText>
            <Text fontSize="18px" color="#fff">
              {T_AB.joinValidator}
            </Text>
          </ActionBarContentText>
          <a
            className="btn"
            target="_blank"
            href="https://cybercongress.ai/docs/cyberd/run_validator/"
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {T_AB.btnBecome}
          </a>
        </ActionBar>
      );
    }

    if (
      Object.keys(validators).length !== 0 &&
      stage === STAGE_INIT &&
      addressPocket === null
    ) {
      return (
        <ActionBar>
          <ActionBarContentText>
            <Pane fontSize="18px">
              you don't have cyber address in your pocket
            </Pane>
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (
      Object.keys(validators).length !== 0 &&
      stage === STAGE_INIT &&
      addressPocket !== null &&
      addressPocket.keys === 'read-only'
    ) {
      return (
        <ActionBar>
          <ActionBarContentText>
            <Pane fontSize="18px">
              this {trimString(addressPocket.bech32, 8, 6)} address is read-only
            </Pane>
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (
      Object.keys(validators).length !== 0 &&
      stage === STAGE_INIT &&
      addressPocket !== null &&
      addressPocket.keys !== 'read-only'
    ) {
      return (
        <ActionBar>
          <ActionBarContentText>
            <Text fontSize="18px" color="#fff" marginRight={5}>
              {T_AB.heroes}
            </Text>
            <Text fontSize="18px" color="#fff" fontWeight={600}>
              {validators.description.moniker}
            </Text>
          </ActionBarContentText>
          <Button onClick={this.onClickDelegate}>Stake</Button>
          {unStake && (
            <div>
              <Button marginX={25} onClick={this.onClickUnDelegate}>
                Unstake
              </Button>
              <Button onClick={this.onClickRestake}>Restake</Button>
            </div>
          )}
        </ActionBar>
      );
    }

    if (
      stage === STAGE_READY &&
      Object.keys(validators).length !== 0 &&
      (txType === TXTYPE_DELEGATE || txType === TXTYPE_UNDELEGATE)
    ) {
      // if (stage === STAGE_READY) {
      // if (this.state.stage === STAGE_READY) {
      return (
        <Delegate
          moniker={validators.description.moniker}
          onChangeInputAmount={(e) => this.onChangeInputAmount(e)}
          toSend={toSend}
          disabledBtn={toSend.length === 0}
          generateTx={() => this.initDevice()}
          delegate={txType === TXTYPE_DELEGATE}
        />
      );
    }

    if (
      stage === STAGE_READY &&
      Object.keys(validators).length !== 0 &&
      txType === TXTYPE_REDELEGATE
    ) {
      // if (stage === STAGE_READY) {
      // if (this.state.stage === STAGE_READY) {
      return (
        <ReDelegate
          onClickBtnCloce={this.cleatState}
          generateTx={() => this.initDevice()}
          onChangeInputAmount={(e) => this.onChangeInputAmount(e)}
          toSend={toSend}
          disabledBtn={!validRestakeBtn}
          validatorsAll={validatorsAll}
          validators={validators}
          onChangeReDelegate={(e) => this.onChangeReDelegate(e)}
          valueSelect={valueSelect}
        />
      );
    }

    if (stage === STAGE_LEDGER_INIT) {
      return (
        <ConnectLadger
          onClickConnect={() => this.getLedgerAddress()}
          connectLedger={connectLedger}
        />
      );
    }

    if (stage === LEDGER_TX_ACOUNT_INFO) {
      return <CheckAddressInfo />;
    }

    if (stage === LEDGER_GENERATION) {
      return (
        <ActionBar>
          <ActionBarContentText>
            transaction generation <Dots big />
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_WAIT) {
      return (
        <JsonTransaction txMsg={txMsg} onClickBtnCloce={this.cleatState} />
      );
    }

    if (stage === STAGE_SUBMITTED || stage === STAGE_CONFIRMING) {
      return <TransactionSubmitted onClickBtnCloce={this.cleatState} />;
    }

    if (stage === STAGE_CONFIRMED) {
      return (
        <Confirmed
          txHash={txHash}
          txHeight={txHeight}
          onClickBtn={this.cleatState}
          onClickBtnCloce={this.cleatState}
        />
      );
    }

    if (stage === STAGE_ERROR && errorMessage !== null) {
      return (
        <TransactionError
          errorMessage={errorMessage}
          onClickBtn={this.cleatState}
          onClickBtnCloce={this.cleatState}
        />
      );
    }

    return null;
  }
}

ActionBarContainer.contextType = AppContext;

export default ActionBarContainer;
