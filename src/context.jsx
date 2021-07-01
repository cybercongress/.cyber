import React, { useState, useEffect, useContext } from 'react';
import { SigningCosmosClient, GasPrice } from '@cosmjs/launchpad';
import { Decimal } from '@cosmjs/math';
import { CYBER, CYBER_SIGNER } from './utils/config';

const valueContext = {
  keplr: null,
  ws: null,
};

const valueSignerContxt = {
  tx: null,
  isVisible: false,
  cyberSigner: null,
  callbackFnc: null,
  stage: CYBER_SIGNER.STAGE_INIT,
};

export const AppContext = React.createContext(valueContext);
export const AppContextSigner = React.createContext(valueSignerContxt);

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
      coinDenom: 'EUL',
      coinMinimalDenom: 'eul',
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
        coinDenom: 'EUL',
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: 'eul',
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 0,
      },
    ],
    // List of coin/tokens used as a fee token in this chain.
    feeCurrencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: 'EUL',
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: 'eul',
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
    const gasPrice = new GasPrice(Decimal.fromAtomics(0, 0), 'uatom');
    const gasLimits = { send: 100000 };

    const cosmJS = new SigningCosmosClient(
      CYBER.CYBER_NODE_URL_LCD,
      firstAddress,
      signer,
      gasPrice,
      gasLimits,
      'sync'
    );

    return cosmJS;
  }
  return null;
}

const AppContextProvider = ({ children }) => {
  const [value, setValue] = useState(valueContext);
  const [valueSigner, setValueSigner] = useState(valueSignerContxt);

  const [signer, setSigner] = useState(null);
  const [client, setClient] = useState(null);

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
  }, [window.keplr, window.getOfflineSigner]);

  useEffect(() => {
    if (client !== null) {
      setValue((item) => ({ ...item, keplr: client }));
    }
  }, [client]);

  console.log('value', value);

  const updateValueIsVisible = (isVisible) => {
    setValueSigner((item) => ({ ...item, isVisible }));
  };

  const updateValueTxs = (tx) => {
    setValueSigner((item) => ({ ...item, tx }));
  };

  const updateCyberSigner = (cyberSigner) => {
    setValueSigner((item) => ({ ...item, cyberSigner }));
  };

  const updateCallbackSigner = (callbackFnc) => {
    setValueSigner((item) => ({ ...item, callbackFnc }));
  };

  const updateStageSigner = (stage) => {
    setValueSigner((item) => ({ ...item, stage }));
  };

  return (
    <AppContext.Provider value={value}>
      <AppContextSigner.Provider
        value={{
          ...valueSigner,
          updateValueIsVisible,
          updateValueTxs,
          updateCyberSigner,
          updateCallbackSigner,
          updateStageSigner,
        }}
      >
        {children}
      </AppContextSigner.Provider>
    </AppContext.Provider>
  );
};

export default AppContextProvider;
