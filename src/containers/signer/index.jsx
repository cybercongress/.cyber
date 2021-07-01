/* eslint-disable no-await-in-loop */
import React from 'react';
import {
  Secp256k1HdWallet,
  SigningCosmosClient,
  coins,
  GasPrice,
} from '@cosmjs/launchpad';
import { Decimal } from '@cosmjs/math';
import { stringToPath } from '@cosmjs/crypto';
import { CYBER } from '../../utils/config';

class Signer {
  constructor() {
    this.prefix = CYBER.BECH32_PREFIX_ACC_ADDR_CYBER;
    this.word = 24;
    this.hdPath = stringToPath("m/44'/118'/0'/0/0");
  }

  initSigner = async (defaultAccount) => {
    const { account } = defaultAccount;
    if (
      account &&
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      if (account.cyber.keys === 'cyberSigner' && account.cyber.secret) {
        const mnemonic = account.cyber.secret;
        const mnemonicString = atob(mnemonic);
        const signer = await Secp256k1HdWallet.fromMnemonic(
          mnemonicString,
          this.hdPath,
          this.prefix
        );
        return signer;
      }
    }

    return null;
  };

  restorePhrase = async (mnemonic, callback) => {
    const signer = await Secp256k1HdWallet.fromMnemonic(
      mnemonic,
      this.hdPath,
      this.prefix
    );
    if (callback) {
      callback(signer);
    }
    return signer;
  };

  generationAccount = async () => {
    const address = await this.getVanityAccount();
    return address;
  };

  getVanityAccount = async (callback) => {
    try {
      let condition = true;
      while (condition) {
        const signer = await Secp256k1HdWallet.generate(
          this.word,
          this.hdPath,
          this.prefix
        );
        const [{ address }] = await signer.getAccounts();
        if (address.match(/^cyber1a[a-zA-Z0-9]{37}$/g)) {
          condition = false;
          if (callback) {
            callback(signer);
          }
          return signer;
        }
      }
    } catch (error) {
      console.log(`error`, error);
      return error;
    }
  };

  sendTxs = async (signer, msgs, callback) => {
    try {
      const [{ address }] = await signer.getAccounts();
      const gasPrice = new GasPrice(Decimal.fromAtomics(0, 0), 'uatom');
      const gasLimits = { send: 100000 };
      const client = new SigningCosmosClient(
        CYBER.CYBER_NODE_URL_LCD,
        address,
        signer,
        gasPrice,
        gasLimits,
        'sync'
      );

      const fee = {
        amount: coins(0, 'uatom'),
        gas: '100000',
      };

      const response = await client.signAndBroadcast(
        msgs,
        fee,
        CYBER.MEMO_CYBER_SIGNER
      );
      if (callback && callback !== null) {
        callback(response);
      }
      return response;
    } catch (error) {
      console.log(`error`, error);
      return error;
    }
  };
}

export default Signer;
