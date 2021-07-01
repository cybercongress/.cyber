import React, { useState, useEffect, useContext } from 'react';
import { coins } from '@cosmjs/launchpad';
import { AppContext, AppContextSigner } from '../../context';
import { CYBER, CYBER_SIGNER } from '../../utils/config';
const uint8ArrayConcat = require('uint8arrays/concat');


import Signer from '../signer';

// dune pottery shield bracket shuffle orchard frown mail exercise destroy enroll nothing scheme allow pudding match mass world glow razor that attend blame follow

function TestKeplr() {
  const { keplr } = useContext(AppContext);
  const {
    cyberSigner,
    updateValueTxs,
    updateValueIsVisible,
    updateCallbackSigner,
    updateStageSigner,
  } = useContext(AppContextSigner);

  const [hashTx, setHashTx] = useState('');

  useEffect(() => {
    const seed =
      'dune pottery shield bracket shuffle orchard frown mail exercise destroy enroll nothing scheme allow pudding match mass world glow razor that attend blame follow';
    const seedBase64 = btoa(seed);
    console.log(`seedBase64`, seedBase64);

    const string = atob(seedBase64);
    console.log(`string`, string)
  }, []);

  console.log('keplr', keplr);
  //   cybervaloper15zs0cjct43xs4z4sesxcrynar5mxm82ftahux2;

  const signerTest = async () => {
    const signer = new Signer();
    const addT = await signer.generationAccount();
    console.log(`addT`, addT);
  };

  const changeValue = () => {
    updateValueIsVisible(true);
  };

  const sendTxSigner = async () => {
    if (cyberSigner !== null) {
      const [{ address }] = await cyberSigner.getAccounts();
      const msgs = [];
      msgs.push({
        type: 'cosmos-sdk/MsgSend',
        value: {
          amount: coins(10, 'eul'),
          from_address: address,
          to_address: 'cyber1ak2zkkde8zaq3fv8dh8d5hclhm80e9q587wmnz',
        },
      });

      updateValueTxs(msgs);
    }
  };

  const callbackSigner = async (signerCyber) => {
    console.log(`callbackSigner`, signerCyber);
    const [{ address }] = await signerCyber.getAccounts();
    const pk = Buffer.from(signerCyber.pubkey).toString('hex');
    console.log(`callbackSigner address`, address);
    console.log(`callbackSigner pk`, pk);
    updateCallbackSigner(null);
  };

  const restore = () => {
    updateCallbackSigner(callbackSigner);
    updateValueIsVisible(true);
    updateStageSigner(CYBER_SIGNER.STAGE_INIT_ACC);
  };

  return (
    <main className="block-body">
      <button
        className="btn"
        style={{ maxWidth: 200, marginTop: 50 }}
        onClick={sendTxSigner}
        type="button"
      >
        sendTxSigner
      </button>

      <button
        className="btn"
        style={{ maxWidth: 200, marginTop: 50 }}
        onClick={changeValue}
        type="button"
      >
        inViseble
      </button>
      <button
        className="btn"
        style={{ maxWidth: 200, marginTop: 50 }}
        onClick={signerTest}
        type="button"
      >
        signerTest
      </button>

      <button
        className="btn"
        style={{ maxWidth: 200, marginTop: 50 }}
        onClick={restore}
        type="button"
      >
        StateRestore
      </button>
      <span>{hashTx}</span>
    </main>
  );
}

export default TestKeplr;
