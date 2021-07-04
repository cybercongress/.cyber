import React, { PureComponent } from 'react';
import { SigningCosmosClient, GasPrice } from '@cosmjs/launchpad';
import { SigningCyberClient, SigningCyberClientOptions } from 'js-cyber';
import { Decimal } from '@cosmjs/math';
import { CYBER } from '../../utils/config';
import { Loading } from '../../components';

const { DirectSecp256k1HdWallet, Registry } = require('@cosmjs/proto-signing');
const { stringToPath } = require('@cosmjs/crypto');

const configKeplr = () => {
  return {
    // Chain-id of the Cosmos SDK chain.
    chainId: CYBER.CHAIN_ID,
    // The name of the chain to be displayed to the user.
    chainName: CYBER.CHAIN_ID,
    // RPC endpoint of the chain.
    rpc: CYBER.CYBER_NODE_URL_API,
    rest: CYBER.CYBER_NODE_URL_LCD,
    stakeCurrency: {
      coinDenom: 'BOOT',
      coinMinimalDenom: 'boot',
      coinDecimals: 0,
    },
    bip44: {
      // You can only set the coin type of BIP44.
      // 'Purpose' is fixed to 44.
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cyber',
      bech32PrefixAccPub: 'cyberpub',
      bech32PrefixValAddr: 'cybervaloper',
      bech32PrefixValPub: 'cybervaloperpub',
      bech32PrefixConsAddr: 'cybervalcons',
      bech32PrefixConsPub: 'cybervalconspub',
    },
    currencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: 'BOOT',
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: 'boot',
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 0,
      },
    ],
    // List of coin/tokens used as a fee token in this chain.
    feeCurrencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: 'BOOT',
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: 'boot',
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 0,
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0,
    },
  };
};

const injectKeplr = (InnerComponent) =>
  class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        keplr: null,
        accountKeplr: null,
        loading: true,
      };
      this.getWeb3 = this.getWeb3.bind(this);
    }

    componentDidMount() {
      this.getWeb3().then(() => this.setState({ loading: false }));
    }

    getWeb3 = async () => {
      try {
        if (window.keplr || window.getOfflineSigner) {
          if (window.keplr.experimentalSuggestChain) {
            await window.keplr.experimentalSuggestChain(configKeplr());
            await window.keplr.enable(CYBER.CHAIN_ID);
            const offlineSigner = window.getOfflineSigner(CYBER.CHAIN_ID);

            const firstAddress = (await offlineSigner.getAccounts())[0].address;
            const gasPrice = new GasPrice(Decimal.fromAtomics(0, 0), 'nick');
            const gasLimits = { send: 100000, cyberlink: 150000 };
            // const cosmJS = new SigningCyberClient(
            //   CYBER.CYBER_NODE_URL_LCD,
            //   firstAddress,
            //   offlineSigner,
            //   gasPrice,
            //   gasLimits,
            //   'sync'
            // );

            const mnemonic =
              'diet tragic tell acquire one wash fiber reopen surprise duty discover inner kind ketchup guilt exit three elegant sausage utility slab banner yellow asset';
            const rpcUrl = 'http://localhost:26657';
            const prefix = 'cyber';
            const tokenDenom = 'nick';
            const hdPath = stringToPath("m/44'/118'/0'/0/0");
            const signer = await DirectSecp256k1HdWallet.fromMnemonic(
              mnemonic,
              hdPath,
              prefix
            );
            console.log('signer', signer);

            const cosmJS = await SigningCyberClient.connectWithSigner(
              'http://localhost:26657',
              signer
            );

            if (firstAddress === null) {
              this.setState({
                keplr: cosmJS,
                accountKeplr: null,
              });
            } else {
              this.setState({
                keplr: cosmJS,
                accountKeplr: firstAddress,
              });
            }
          } else {
            this.setState({
              keplr: null,
              accountKeplr: null,
            });
          }
        } else {
          this.setState({
            keplr: null,
            accountKeplr: null,
          });
        }
      } catch (e) {
        console.log('e :>> ', e);
        this.setState({ loading: false });
      }
    };

    render() {
      const { keplr, accountKeplr, loading } = this.state;

      if (loading) {
        return (
          <div
            style={{
              width: '100%',
              height: '50vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Loading />
          </div>
        );
      }

      return (
        <InnerComponent
          keplr={keplr}
          accountKeplr={accountKeplr}
          {...this.props}
        />
      );
    }
  };

export default injectKeplr;
