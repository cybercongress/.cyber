import React, { Component } from 'react';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Pane, Text, ActionBar, Button } from '@cybercongress/gravity';
import LocalizedStrings from 'react-localization';
import { connect } from 'react-redux';
import { coins } from '@cosmjs/launchpad';
import { CosmosDelegateTool } from '../../utils/ledger';
import {
  JsonTransaction,
  TransactionSubmitted,
  Confirmed,
  SendLedger,
  ConnectLadger,
  RewardsDelegators,
  Cyberlink,
  StartStageSearchActionBar,
  TransactionError,
  CheckAddressInfo,
  Dots,
  ActionBarContentText,
} from '../../components';
import { LEDGER, CYBER, PATTERN_IPFS_HASH } from '../../utils/config';

import {
  getBalanceWallet,
  getTotalRewards,
  getIpfsHash,
  getAccountBandwidth,
  statusNode,
  getPin,
} from '../../utils/search/utils';

const { DIVISOR_CYBER_G } = CYBER;

const {
  STAGE_INIT,
  STAGE_LEDGER_INIT,
  HDPATH,
  LEDGER_VERSION_REQ,
  LEDGER_OK,
  LEDGER_NOAPP,
  STAGE_READY,
  STAGE_WAIT,
  STAGE_SUBMITTED,
  STAGE_CONFIRMING,
  STAGE_CONFIRMED,
  STAGE_ERROR,
  MEMO,
} = LEDGER;

const LEDGER_TX_ACOUNT_INFO = 10;

const groupLink = (linkArr) => {
  const link = [];
  const size = 6;
  for (let i = 0; i < Math.ceil(linkArr.length / size); i += 1) {
    link[i] = linkArr.slice(i * size, i * size + size);
  }
  return link;
};

class InnerActionBarContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: STAGE_INIT,
      ledger: null,
      ledgerVersion: [0, 0, 0],
      returnCode: null,
      addressInfo: null,
      address: null,
      file: null,
      balance: 0,
      time: 0,
      toSend: '',
      toSendAddres: '',
      contentHash: '',
      txBody: null,
      txContext: null,
      txMsg: null,
      txHash: null,
      txHeight: null,
      rewards: null,
      errorMessage: null,
      connectLedger: null,
      bandwidth: {
        remained: 0,
        max_value: 0,
      },
    };
    this.timeOut = null;
    this.inputOpenFileRef = React.createRef();
  }

  componentDidMount() {
    this.ledger = new CosmosDelegateTool();
  }

  componentDidUpdate() {
    const { stage, address, addressInfo } = this.state;
    const { type } = this.props;
    if (
      (stage === STAGE_LEDGER_INIT || stage === STAGE_READY) &&
      type === 'tweets'
    ) {
      if (address !== null && addressInfo !== null) {
        this.generateTx();
      }
    }
  }

  getLedgerAddress = async () => {
    this.transport = await TransportWebUSB.create(120 * 1000);
    this.ledger = new CosmosDelegateTool(this.transport);

    const connect = await this.ledger.connect();
    if (connect.return_code === LEDGER_OK) {
      this.setState({
        connectLedger: true,
      });

      const address = await this.ledger.retrieveAddressCyber(HDPATH);
      console.log('address', address);
      this.setState({
        address,
      });
      this.getAddressInfo();
    } else {
      this.setState({
        connectLedger: false,
      });
    }
  };

  getAddressInfo = async () => {
    const { address } = this.state;
    const { addressSend } = this.props;
    let toSendAddres = '';
    let addressInfo = {};
    let balance = 0;
    try {
      this.setState({
        stage: LEDGER_TX_ACOUNT_INFO,
      });
      const responsStatusNode = await statusNode();

      if (responsStatusNode !== null) {
        addressInfo.chainId = responsStatusNode.node_info.network;
      }
      const response = await getBalanceWallet(address.bech32);

      if (response) {
        const data = response;
        addressInfo = { ...addressInfo, ...data.account };
        balance = addressInfo.coins[0].amount;
      }

      if (addressSend) {
        toSendAddres = addressSend;
      }

      const dataTotalRewards = await getTotalRewards(address.bech32);

      this.setState({
        addressInfo,
        toSendAddres,
        balance,
        stage: STAGE_READY,
        rewards: dataTotalRewards,
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

  calculationIpfsTo = async (contentHash) => {
    const { file } = this.state;
    const { node } = this.props;

    let toCid = contentHash;
    if (file !== null) {
      toCid = file;
    }

    if (file !== null) {
      toCid = await getPin(node, toCid);
    } else if (!toCid.match(PATTERN_IPFS_HASH)) {
      toCid = await getPin(node, toCid);
    }

    return toCid;
  };

  generateTxSendKplr = async () => {
    const { valueAppContext } = this.props;
    const { keplr } = valueAppContext;

    if (keplr !== null) {
      await window.keplr.enable(CYBER.CHAIN_ID);
      const { address } = await keplr.getAccount();
      const msg = await this.getTxs(address);
      console.log(`msg`, msg);
      if (msg.length > 0) {
        const fee = {
          amount: coins(0, 'uatom'),
          gas: '100000',
        };
        const result = await keplr.signAndBroadcast(msg, fee, CYBER.MEMO_KEPLR);
        console.log('result: ', result);
        const hash = result.transactionHash;
        console.log('hash :>> ', hash);
        this.setState({ stage: STAGE_SUBMITTED, txHash: hash });
        this.timeOut = setTimeout(this.confirmTx, 1500);
      }
    }
  };

  getTxs = async (address) => {
    const { type, addressSend, node, follow, tweets } = this.props;
    const { contentHash, toSendAddres, toSend } = this.state;
    const amount = parseFloat(toSend) * DIVISOR_CYBER_G;

    const msg = [];
    if (type === 'heroes') {
      if (address === addressSend) {
        const dataTotalRewards = await getTotalRewards(address);
        if (dataTotalRewards !== null && dataTotalRewards.rewards) {
          const { rewards } = dataTotalRewards;
          Object.keys(rewards).forEach((key) => {
            if (rewards[key].reward !== null) {
              const tempMsg = {
                type: 'cosmos-sdk/MsgWithdrawDelegationReward',
                value: {
                  delegator_address: address,
                  validator_address: rewards[key].validator_address,
                },
              };
              msg.push(tempMsg);
            }
          });
        }
      }
    } else if (type === 'tweets' && follow) {
      const fromCid = await getPin(node, 'follow');
      const toCid = await getPin(node, addressSend);
      msg.push({
        type: 'cyber/Link',
        value: {
          address,
          links: [
            {
              from: fromCid,
              to: toCid,
            },
          ],
        },
      });
    } else if (type === 'tweets' && tweets) {
      const fromCid = await getPin(node, 'tweet');
      const toCid = await this.calculationIpfsTo(contentHash);
      msg.push({
        type: 'cyber/Link',
        value: {
          address,
          links: [
            {
              from: fromCid,
              to: toCid,
            },
          ],
        },
      });
    } else {
      msg.push({
        type: 'cosmos-sdk/MsgSend',
        value: {
          amount: coins(amount, CYBER.DENOM_CYBER),
          from_address: address,
          to_address: toSendAddres,
        },
      });
    }
    return msg;
  };

  getTxType = async (type, txContext) => {
    const {
      address,
      addressInfo,
      toSend,
      rewards,
      toSendAddres,
      contentHash,
    } = this.state;
    const { addressSend, node, follow, tweets } = this.props;
    const uatomAmount = toSend * DIVISOR_CYBER_G;

    const { denom } = addressInfo.coins[0];

    let tx;

    if (type === 'heroes') {
      tx = await this.ledger.withdrawDelegationReward(
        txContext,
        address.bech32,
        MEMO,
        rewards.rewards
      );
    } else if (type === 'mentions') {
      const fromCid = await getIpfsHash(addressSend);
      const toCid = contentHash;
      tx = await this.ledger.txCreateLink(
        txContext,
        address.bech32,
        fromCid,
        toCid,
        MEMO
      );
    } else if (type === 'tweets' && follow) {
      const fromCid = await getPin(node, 'follow');
      const toCid = await getPin(node, addressSend);
      tx = await this.ledger.txCreateLink(
        txContext,
        address.bech32,
        fromCid,
        toCid,
        MEMO
      );
    } else if (type === 'tweets' && tweets) {
      const fromCid = await getPin(node, 'tweet');
      const toCid = await this.calculationIpfsTo(contentHash);
      tx = await this.ledger.txCreateLink(
        txContext,
        address.bech32,
        fromCid,
        toCid,
        MEMO
      );
    } else {
      tx = await this.ledger.txCreateSendCyber(
        txContext,
        toSendAddres,
        uatomAmount,
        MEMO,
        denom
      );
    }
    return tx;
  };

  generateTx = async () => {
    const { address, addressInfo } = this.state;
    const { type } = this.props;

    const txContext = {
      accountNumber: addressInfo.account_number,
      chainId: addressInfo.chainId,
      sequence: addressInfo.sequence,
      bech32: address.bech32,
      pk: address.pk,
      path: address.path,
    };
    console.log('txContext :>> ', txContext);
    const tx = await this.getTxType(type, txContext);

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
    const { updateAddress } = this.props;
    if (this.state.txHash !== null) {
      this.setState({ stage: STAGE_CONFIRMING });
      const status = await this.ledger.txStatusCyber(this.state.txHash);
      const data = await status;
      if (data.logs) {
        this.setState({
          stage: STAGE_CONFIRMED,
          txHeight: data.height,
        });
        if (updateAddress) {
          updateAddress();
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

  generateTxCyberSigner = async () => {
    const { valueAppContextSigner } = this.props;
    const {
      cyberSigner,
      updateValueTxs,
      updateCallbackSigner,
    } = valueAppContextSigner;

    if (cyberSigner !== null) {
      await window.keplr.enable(CYBER.CHAIN_ID);
      const [{ address }] = await cyberSigner.getAccounts();
      const msg = await this.getTxs(address);
      console.log(`msg`, msg);
      if (msg.length > 0) {
        updateCallbackSigner(this.updateCallbackFnc);
        updateValueTxs(msg);
      }
    }
  };

  updateCallbackFnc = (result) => {
    const { valueAppContextSigner } = this.props;
    const { updateCallbackSigner } = valueAppContextSigner;
    const hash = result.transactionHash;
    updateCallbackSigner(null);
    console.log('hash :>> ', hash);
    this.setState({ stage: STAGE_SUBMITTED, txHash: hash });
    this.timeOut = setTimeout(this.confirmTx, 1500);
  };

  onChangeInputAmount = (e) => {
    this.setState({
      toSend: e.target.value,
    });
  };

  onChangeInputInputAddressT = (e) => {
    this.setState({
      toSendAddres: e.target.value,
    });
  };

  onClickSend = () => {
    const { defaultAccount } = this.props;
    if (defaultAccount.keys === 'ledger') {
      this.setState({
        stage: STAGE_LEDGER_INIT,
      });
      this.getLedgerAddress();
    }
    if (defaultAccount.keys === 'keplr') {
      this.generateTxSendKplr();
    }
    if (defaultAccount.keys === 'cyberSigner') {
      this.generateTxCyberSigner();
    }
  };

  cleatState = () => {
    this.setState({
      stage: STAGE_INIT,
      ledger: null,
      ledgerVersion: [0, 0, 0],
      returnCode: null,
      addressInfo: null,
      address: null,
      balance: 0,
      time: 0,
      toSend: '',
      toSendAddres: '',
      txBody: null,
      txContext: null,
      txMsg: null,
      txHash: null,
      txHeight: null,
      contentHash: '',
    });
    this.timeOut = null;
  };

  onChangeInput = async (e) => {
    const { value } = e.target;
    this.setState({
      contentHash: value,
    });
  };

  showOpenFileDlg = () => {
    this.inputOpenFileRef.current.click();
  };

  onFilePickerChange = (files) => {
    const file = files.current.files[0];

    this.setState({
      file,
    });
  };

  onClickClear = () => {
    this.setState({
      file: null,
    });
  };

  hasKey() {
    return this.state.address !== null;
  }

  hasWallet() {
    return this.state.addressInfo !== null;
  }

  render() {
    const {
      type,
      addressSend,
      tweets,
      follow,
      defaultAccount,
      totalRewards,
    } = this.props;
    const {
      stage,
      address,
      returnCode,
      ledgerVersion,
      toSend,
      balance,
      toSendAddres,
      txMsg,
      txHash,
      txHeight,
      rewards,
      bandwidth,
      contentHash,
      errorMessage,
      connectLedger,
      file,
    } = this.state;

    // if (stage === STAGE_INIT && (type === 'wallet' || type === 'txs')) {
    //   return (
    //     <ActionBar>
    //       <Pane>
    //         <Button onClick={(e) => this.onClickSend(e)}>Send</Button>
    //       </Pane>
    //     </ActionBar>
    //   );
    // }

    console.log('rewards', groupLink(totalRewards.rewards));

    if (stage === STAGE_INIT && type === 'tweets' && follow) {
      return (
        <ActionBar>
          <Pane>
            <Button onClick={(e) => this.onClickSend(e)}>Follow</Button>
          </Pane>
        </ActionBar>
      );
    }

    if (stage === STAGE_INIT && type === 'tweets' && tweets) {
      return (
        <StartStageSearchActionBar
          onClickBtn={this.onClickSend}
          contentHash={
            file !== null && file !== undefined ? file.name : contentHash
          }
          onChangeInputContentHash={this.onChangeInput}
          textBtn="Tweet"
          placeholder="What's happening?"
          inputOpenFileRef={this.inputOpenFileRef}
          showOpenFileDlg={this.showOpenFileDlg}
          onChangeInput={this.onFilePickerChange}
          onClickClear={this.onClickClear}
          file={file}
          keys={defaultAccount !== null ? defaultAccount.keys : false}
        />
      );
    }
    // console.log('rewards', rewards);

    if (
      stage === STAGE_INIT &&
      type === 'heroes' &&
      defaultAccount !== null &&
      defaultAccount.keys !== 'ledger'
    ) {
      return (
        <ActionBar>
          <Pane>
            <Button
              disabled={addressSend !== defaultAccount.bech32}
              onClick={(e) => this.onClickSend(e)}
            >
              Claim rewards
            </Button>
          </Pane>
        </ActionBar>
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
    // console.log('rewards', rewards);

    // console.log('rewards', groupLink(rewards.rewards));
    if (stage === STAGE_READY) {
      // if (this.state.stage === STAGE_READY) {
      if (type === 'heroes') {
        return (
          <RewardsDelegators
            data={rewards}
            onClickBtnCloce={this.cleatState}
            onClickBtn={this.generateTx}
          />
        );
      }
      if (type === 'mentions') {
        return (
          <Cyberlink
            onClickBtnCloce={this.cleatState}
            query={addressSend}
            onClickBtn={this.generateTx}
            bandwidth={bandwidth}
            address={address.bech32}
            contentHash={contentHash}
            disabledBtn={parseFloat(bandwidth.max_value) === 0}
          />
        );
      }
      if (type === 'tweets') {
        return (
          <ActionBar>
            <ActionBarContentText>
              transaction generation <Dots big />
            </ActionBarContentText>
          </ActionBar>
        );
      }
      // return (
      //   <SendLedger
      //     onClickBtn={() => this.generateTx()}
      //     address={address.bech32}
      //     availableStake={
      //       balance !== 0
      //         ? Math.floor((balance / DIVISOR_CYBER_G) * 1000) / 1000
      //         : 0
      //     }
      //     onChangeInputAmount={(e) => this.onChangeInputAmount(e)}
      //     valueInputAmount={toSend}
      //     onClickBtnCloce={this.cleatState}
      //     valueInputAddressTo={toSendAddres}
      //     onChangeInputAddressTo={(e) => this.onChangeInputInputAddressT(e)}
      //     disabledBtn={
      //       toSend.length === 0 || toSendAddres.length === 0 || balance === 0
      //     }
      //   />
      // );
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

const mapStateToProps = (store) => {
  return {
    node: store.ipfs.ipfs,
  };
};

export default connect(mapStateToProps)(InnerActionBarContainer);
