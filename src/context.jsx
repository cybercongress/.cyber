import React, { useState, useEffect, useContext } from 'react';
import { SigningCosmosClient, GasPrice } from '@cosmjs/launchpad';
import { SigningCyberClient, CyberClient } from 'js-cyber';
import { Decimal } from '@cosmjs/math';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

import { CYBER } from './utils/config';

const valueContext = {
  keplr: null,
  ws: null,
  jsCyber: null,
  updatejsCyber: () => {},
};

export const AppContext = React.createContext(valueContext);

export const useContextProvider = () => useContext(AppContext);

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
      bech32PrefixAccAddr: CYBER.BECH32_PREFIX_ACC_ADDR_CYBER,
      bech32PrefixAccPub: `${CYBER.BECH32_PREFIX_ACC_ADDR_CYBER}pub`,
      bech32PrefixValAddr: CYBER.BECH32_PREFIX_ACC_ADDR_CYBERVALOPER,
      bech32PrefixValPub: `${CYBER.BECH32_PREFIX_ACC_ADDR_CYBERVALOPER}pub`,
      bech32PrefixConsAddr: `${CYBER.BECH32_PREFIX_ACC_ADDR_CYBER}valcons`,
      bech32PrefixConsPub: `${CYBER.BECH32_PREFIX_ACC_ADDR_CYBER}valconspub`,
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

export async function createClient(signer) {
  if (signer) {
    const firstAddress = (await signer.getAccounts())[0].address;
    const gasPrice = new GasPrice(Decimal.fromAtomics(0, 0), 'boot');
    const gasLimits = { send: 200000 };

    const client = await SigningCyberClient.connectWithSigner(
      CYBER.CYBER_NODE_URL_API,
      signer
    );

    // client.firstAddress = firstAddress;
    // const cosmJS = new SigningCyberClient(
    //   CYBER.CYBER_NODE_URL_LCD,
    //   firstAddress,
    //   signer,
    //   gasPrice,
    //   gasLimits,
    //   'sync'
    // );

    return client;
  }
  return null;
}

const AppContextProvider = ({ children }) => {
  const [value, setValue] = useState(valueContext);
  const [signer, setSigner] = useState(null);
  const [client, setClient] = useState(null);

  const updatejsCyber = (rpc) => {
    const createQueryCliet = async () => {
      const tendermintClient = await Tendermint34Client.connect(rpc);
      const queryClient = new CyberClient(tendermintClient);

      setValue((item) => ({
        ...item,
        jsCyber: queryClient,
      }));
    };
    createQueryCliet();
  };

  useEffect(() => {
    const createQueryCliet = async () => {
      const tendermintClient = await Tendermint34Client.connect(
        CYBER.CYBER_NODE_URL_API
      );
      const queryClient = new CyberClient(tendermintClient);
      setValue((item) => ({
        ...item,
        jsCyber: queryClient,
      }));
    };
    createQueryCliet();
  }, []);

  useEffect(() => {
    if (signer !== null) {
      const updateClient = async () => {
        const clientJs = await createClient(signer);
        setClient(clientJs);
      };
      updateClient();
    }
  }, [signer]);

  useEffect(() => {
    console.log('window.getOfflineSigner', window.getOfflineSigner);
    console.log('window.keplr', window.keplr);
    if (window.keplr || window.getOfflineSigner) {
      if (window.keplr.experimentalSuggestChain) {
        const init = async () => {
          await window.keplr.experimentalSuggestChain(configKeplr());
          await window.keplr.enable(CYBER.CHAIN_ID);
          const offlineSigner = window.getOfflineSigner(CYBER.CHAIN_ID);
          setSigner(offlineSigner);
        };
        init();
      }
    }
    console.log('window.getOfflineSigner', window.getOfflineSigner);
    console.log('window.keplr', window.keplr);
  }, [window.keplr, window.getOfflineSigner]);

  useEffect(() => {
    if (client !== null) {
      setValue((item) => ({
        ...item,
        keplr: client,
        ws: CYBER.CYBER_WEBSOCKET_URL,
      }));
    }
  }, [client]);

  console.log('value', value);

  if (value.jsCyber && value.jsCyber === null) {
    return <div>...</div>;
  }

  return (
    <AppContext.Provider value={{ ...value, updatejsCyber }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
