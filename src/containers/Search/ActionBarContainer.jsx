import React, { Component } from 'react';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Link as LinkRoute } from 'react-router-dom';
import { Pane, Text, ActionBar, Button } from '@cybercongress/gravity';
import { connect } from 'react-redux';
import { coins } from '@cosmjs/launchpad';
import { CosmosDelegateTool } from '../../utils/ledger';
import {
  ConnectLadger,
  JsonTransaction,
  TransactionSubmitted,
  Confirmed,
  StartStageSearchActionBar,
  Cyberlink,
  TransactionError,
  ActionBarContentText,
  CheckAddressInfo,
  Dots,
  ButtonImgText,
} from '../../components';

import {
  getIpfsHash,
  getPin,
  statusNode,
  getAccountBandwidth,
  getCurrentBandwidthPrice,
} from '../../utils/search/utils';

import { LEDGER, CYBER, PATTERN_IPFS_HASH } from '../../utils/config';
import { trimString } from '../../utils/utils';

const imgKeplr = require('../../image/keplr-icon.svg');
const imgLedger = require('../../image/ledger.svg');
const imgCyber = require('../../image/blue-circle.png');
const imgCyberSigner = require('../../image/wallet-outline.svg');

const imgData = {
  ledger: imgLedger,
  keplr: imgKeplr,
  cyber: imgCyber,
  cyberSigner: imgCyberSigner,
};

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
  LEDGER_VERSION_REQ,
} = LEDGER;

const CREATE_LINK = 10;
const ADD_ADDRESS = 11;
const LEDGER_TX_ACOUNT_INFO = 12;
const STAGE_IPFS_HASH = 3.1;
const STAGE_KEPLR_APPROVE = 3.2;
const STAGE_CHECK_TYPE_SIGNER = 8.1;

class InnerActionBarContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: STAGE_INIT,
      init: false,
      address: null,
      addressLocalStor: null,
      returnCode: null,
      addressInfo: null,
      ledgerVersion: [0, 0, 0],
      time: 0,
      bandwidth: {
        remained: 0,
        max_value: 0,
      },
      linkPrice: 0,
      contentHash: '',
      txMsg: null,
      txContext: null,
      txBody: null,
      txHeight: null,
      txHash: null,
      error: null,
      errorMessage: null,
      file: null,
      connectLedger: null,
      fromCid: null,
      toCid: null,
    };
    this.timeOut = null;
    this.inputOpenFileRef = React.createRef();
    this.ledger = null;
    this.transport = null;
  }

  async componentDidMount() {
    console.warn('Looking for Ledger Nano');
    await this.checkAddressLocalStorage();
    this.ledger = new CosmosDelegateTool();
  }

  componentDidUpdate(prevProps) {
    const { stage, address, addressInfo, fromCid, toCid } = this.state;
    const { defaultAccount } = this.props;
    if (
      stage === STAGE_LEDGER_INIT ||
      stage === STAGE_READY ||
      stage === LEDGER_TX_ACOUNT_INFO
    ) {
      if (
        address !== null &&
        addressInfo !== null &&
        toCid &&
        toCid !== null &&
        fromCid &&
        fromCid !== null
      ) {
        this.stageReady();
      }
    }

    if (stage === STAGE_IPFS_HASH) {
      if (toCid && toCid !== null && fromCid && fromCid !== null) {
        this.checkTypeSigner();
      }
    }
    if (prevProps.defaultAccount.name !== defaultAccount.name) {
      this.checkAddressLocalStorage();
    }
  }

  checkAddressLocalStorage = async () => {
    const { defaultAccount } = this.props;
    const { account } = defaultAccount;
    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      const { keys, bech32 } = account.cyber;
      if (keys !== 'read-only') {
        this.setState({
          addressLocalStor: { address: bech32, keys },
        });
      } else {
        this.setState({
          addressLocalStor: null,
        });
      }
    } else {
      this.setState({
        addressLocalStor: null,
      });
    }
  };

  getLedgerAddress = async () => {
    const { stage, addressLocalStor } = this.state;

    this.transport = await TransportWebUSB.create(120 * 1000);
    this.ledger = new CosmosDelegateTool(this.transport);

    const connectLedger = await this.ledger.connect();
    console.log(connectLedger, stage);
    if (connectLedger.return_code === LEDGER_OK) {
      this.setState({
        connectLedger: true,
      });
      if (stage === STAGE_LEDGER_INIT) {
        const address = await this.ledger.retrieveAddressCyber(HDPATH);
        console.log('address', address);
        if (
          addressLocalStor !== null &&
          addressLocalStor.address === address.bech32
        ) {
          this.setState({
            address,
          });
          this.getAddressInfo();
          this.calculationIpfsFrom();
          this.calculationIpfsTo();
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
      }
    } else {
      this.setState({
        connectLedger: false,
      });
    }
  };

  calculationIpfsTo = async () => {
    const { contentHash, file } = this.state;
    const { node } = this.props;

    let toCid = contentHash;
    if (file !== null) {
      toCid = file;
    }
    console.log('toCid', toCid);
    if (file !== null) {
      toCid = await getPin(node, toCid);
    } else if (!toCid.match(PATTERN_IPFS_HASH)) {
      console.log('object');
      toCid = await getPin(node, toCid);
    }

    this.setState({
      toCid,
    });
  };

  calculationIpfsFrom = async () => {
    const { keywordHash, node } = this.props;

    let fromCid = keywordHash;

    if (!fromCid.match(PATTERN_IPFS_HASH)) {
      fromCid = await getPin(node, fromCid);
    }

    this.setState({
      fromCid,
    });
  };

  stageReady = () => {
    this.link();
  };

  getNetworkId = async () => {
    const data = await statusNode();
    return data.node_info.network;
  };

  getAddressInfo = async () => {
    try {
      const { address } = this.state;
      this.setState({
        stage: LEDGER_TX_ACOUNT_INFO,
      });
      const addressInfo = await this.ledger.getAccountInfoCyber(address);
      const chainId = await this.getNetworkId();

      addressInfo.chainId = chainId;

      this.setState({
        addressInfo,
        stage: STAGE_READY,
      });
    } catch (error) {
      const { message, statusCode } = error;
      if (message !== 'getAddressInfo') {
        // this just means we haven't found the device yet...
        // eslint-disable-next-line
        console.error('getAddressInfo', message, statusCode);
      }
      this.setState({ time: Date.now() }); // cause componentWillUpdate to call again.
    }
  };

  onClickInitKeplr = () => {
    this.calculationIpfsFrom();
    this.calculationIpfsTo();
    this.setState({
      stage: STAGE_IPFS_HASH,
    });
  };

  checkTypeSigner = () => {
    const { addressLocalStor } = this.state;

    this.setState({
      stage: STAGE_CHECK_TYPE_SIGNER,
    });

    if (addressLocalStor.keys === 'keplr') {
      this.generateTx();
    }
    if (addressLocalStor.keys === 'cyberSigner') {
      this.sendTxSigner();
    }
  };

  generateTx = async () => {
    const { valueAppContext } = this.props;
    const { keplr } = valueAppContext;
    const { fromCid, toCid, addressLocalStor } = this.state;

    this.setState({
      stage: STAGE_KEPLR_APPROVE,
    });
    if (keplr !== null) {
      const chainId = CYBER.CHAIN_ID;
      await window.keplr.enable(chainId);
      const { address } = await keplr.getAccount();
      console.log('address', address);
      if (addressLocalStor !== null && addressLocalStor.address === address) {
        const msgs = [];
        msgs.push({
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
        const fee = {
          amount: coins(0, 'uatom'),
          gas: '100000',
        };
        console.log('msg', msgs);
        const result = await keplr.signAndBroadcast(
          msgs,
          fee,
          CYBER.MEMO_KEPLR
        );
        console.log('result: ', result);
        const hash = result.transactionHash;
        console.log('hash :>> ', hash);
        this.setState({ stage: STAGE_SUBMITTED, txHash: hash });
        this.timeOut = setTimeout(this.confirmTx, 1500);
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

  link = async () => {
    const { address, addressInfo, fromCid, toCid } = this.state;

    const txContext = {
      accountNumber: addressInfo.accountNumber,
      chainId: addressInfo.chainId,
      sequence: addressInfo.sequence,
      bech32: address.bech32,
      pk: address.pk,
      path: address.path,
    };

    const tx = await this.ledger.txCreateLink(
      txContext,
      address.bech32,
      fromCid,
      toCid,
      MEMO
    );
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
    console.log('<<<!!! data', data);
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
    const { update } = this.props;
    if (this.state.txHash !== null) {
      this.setState({ stage: STAGE_CONFIRMING });
      const status = await this.ledger.txStatusCyber(this.state.txHash);
      console.log('status', status);
      const data = await status;
      if (data.logs) {
        this.setState({
          stage: STAGE_CONFIRMED,
          txHeight: data.height,
        });
        if (update) {
          update();
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

  onChangeInput = async (e) => {
    const { value } = e.target;
    this.setState({
      contentHash: value,
    });
  };

  cleatState = () => {
    this.setState({
      stage: STAGE_INIT,
      init: false,
      ledger: null,
      address: null,
      returnCode: null,
      addressInfo: null,
      ledgerVersion: [0, 0, 0],
      time: 0,
      linkPrice: 0,
      contentHash: '',
      txMsg: null,
      txContext: null,
      txBody: null,
      txHeight: null,
      txHash: null,
      error: null,
      errorMessage: null,
      file: null,
      fromCid: null,
      toCid: null,
    });
    this.timeOut = null;
  };

  onClickInitStage = () => {
    this.cleatState();
    this.setState({
      stage: STAGE_INIT,
    });
  };

  onClickInitLedger = async () => {
    // this.init();
    await this.setState({
      stage: STAGE_LEDGER_INIT,
    });
    this.getLedgerAddress();
  };

  onClickClear = () => {
    this.setState({
      file: null,
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

  updateCallbackFnc = (result) => {
    const { valueAppContextSigner } = this.props;
    const { updateCallbackSigner } = valueAppContextSigner;

    const hash = result.transactionHash;
    updateCallbackSigner(null);
    console.log('hash :>> ', hash);
    this.setState({ stage: STAGE_SUBMITTED, txHash: hash });
    this.timeOut = setTimeout(this.confirmTx, 1500);
  };

  sendTxSigner = async () => {
    const { valueAppContextSigner } = this.props;
    const { fromCid, toCid, addressLocalStor } = this.state;
    const {
      cyberSigner,
      updateValueTxs,
      updateCallbackSigner,
    } = valueAppContextSigner;
    if (cyberSigner !== null) {
      const [{ address }] = await cyberSigner.getAccounts();
      const msgs = [];
      msgs.push({
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
      updateCallbackSigner(this.updateCallbackFnc);
      updateValueTxs(msgs);
      this.setState({
        stage: STAGE_KEPLR_APPROVE,
      });
    }
  };

  onClickBtnRank = async () => {
    const { addressLocalStor } = this.state;
    const { rankLink } = this.props;
    if (rankLink !== null) {
      await this.setState({
        contentHash: rankLink,
      });
    }
    if (addressLocalStor.keys === 'ledger') {
      this.onClickInitLedger();
    }
    if (addressLocalStor.keys === 'keplr') {
      this.onClickInitKeplr();
    }
  };

  onClickInit = () => {
    const { addressLocalStor } = this.state;
    if (addressLocalStor.keys === 'ledger') {
      this.onClickInitLedger();
    }
    if (addressLocalStor.keys === 'keplr') {
      this.onClickInitKeplr();
    }
    if (addressLocalStor.keys === 'cyberSigner') {
      this.onClickInitKeplr();
    }
  };

  render() {
    const {
      address,
      connectLedger,
      bandwidth,
      contentHash,
      returnCode,
      ledgerVersion,
      stage,
      txMsg,
      txHeight,
      txHash,
      errorMessage,
      file,
      linkPrice,
      addressLocalStor,
    } = this.state;

    const { textBtn, placeholder, rankLink, node } = this.props;

    if (stage === STAGE_INIT && addressLocalStor === null) {
      return (
        <ActionBar>
          <ActionBarContentText>
            Play Game of Links. Get EUL with
            <LinkRoute
              style={{
                paddingTop: 10,
                margin: '0 15px',
                paddingBottom: 10,
                display: 'block',
              }}
              className="btn"
              to="/gol/takeoff"
            >
              ATOM
            </LinkRoute>
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_INIT && rankLink && rankLink !== null) {
      let keys = 'ledger';
      if (addressLocalStor !== null) {
        keys = addressLocalStor.keys;
      }
      return (
        <ActionBar>
          <ActionBarContentText>
            <ButtonImgText
              text={
                <Pane alignItems="center" display="flex">
                  Rank{' '}
                  <img
                    src={imgCyber}
                    alt="cyber"
                    style={{
                      width: 20,
                      height: 20,
                      marginLeft: '5px',
                      paddingTop: '2px',
                    }}
                  />
                </Pane>
              }
              onClick={() => this.onClickBtnRank()}
              img={imgData[keys]}
            />
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_INIT) {
      return (
        <StartStageSearchActionBar
          textBtn={textBtn || 'Cyberlink'}
          keys={addressLocalStor !== null ? addressLocalStor.keys : false}
          onClickBtn={this.onClickInit}
          contentHash={
            file !== null && file !== undefined ? file.name : contentHash
          }
          onChangeInputContentHash={this.onChangeInput}
          inputOpenFileRef={this.inputOpenFileRef}
          showOpenFileDlg={this.showOpenFileDlg}
          onChangeInput={this.onFilePickerChange}
          onClickClear={this.onClickClear}
          file={file}
          placeholder={placeholder}
          node={node}
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

    if (stage === STAGE_IPFS_HASH) {
      return (
        <ActionBar>
          <ActionBarContentText>
            adding content to IPFS <Dots big />
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_KEPLR_APPROVE) {
      return (
        <ActionBar>
          <ActionBarContentText>
            approve TX <Dots big />
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_READY) {
      return (
        <ActionBar>
          <ActionBarContentText>
            transaction generation <Dots big />
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_CHECK_TYPE_SIGNER) {
      return (
        <ActionBar>
          <ActionBarContentText>
            <Dots big />
          </ActionBarContentText>
        </ActionBar>
      );
    }

    if (stage === STAGE_WAIT) {
      return (
        <JsonTransaction
          txMsg={txMsg}
          onClickBtnCloce={this.onClickInitStage}
        />
      );
    }

    if (stage === STAGE_SUBMITTED || stage === STAGE_CONFIRMING) {
      return <TransactionSubmitted onClickBtnCloce={this.onClickInitStage} />;
    }

    if (stage === STAGE_CONFIRMED) {
      return (
        <Confirmed
          txHash={txHash}
          txHeight={txHeight}
          onClickBtn={this.onClickInitStage}
          onClickBtnCloce={this.onClickInitStage}
        />
      );
    }

    if (stage === STAGE_ERROR && errorMessage !== null) {
      return (
        <TransactionError
          errorMessage={errorMessage}
          onClickBtn={this.onClickInitStage}
          onClickBtnCloce={this.onClickInitStage}
        />
      );
    }

    return null;
  }
}

const mapStateToProps = (store) => {
  return {
    node: store.ipfs.ipfs,
    defaultAccount: store.pocket.defaultAccount,
  };
};

// ActionBarContainer.contextType = AppContext;
// ActionBarContainer.contextType = AppContextSigner;

export default connect(mapStateToProps)(InnerActionBarContainer);
