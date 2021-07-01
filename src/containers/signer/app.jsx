import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import Signer from './index';
import { AppContextSigner } from '../../context';
import {
  StateSign,
  StateBroadcast,
  StateConfirmed,
  StateInitAccount,
  StateCreateNew,
  StateRestore,
} from './component/ui';
import { CYBER_SIGNER } from '../../utils/config';

const {
  STAGE_INIT,
  STAGE_SIGN,
  STAGE_INIT_ACC,
  STAGE_CREATE_NEW_ACCOUNT,
  STAGE_RESTORE_PHARSE,
} = CYBER_SIGNER;

function AppSign({ defaultAccount }) {
  const {
    tx,
    stage,
    isVisible,
    cyberSigner,
    callbackFnc,
    updateValueIsVisible,
    updateValueTxs,
    updateCyberSigner,
    updateStageSigner,
  } = useContext(AppContextSigner);
  const location = useLocation();
  const [msgData, setMsgData] = useState(null);
  const [cyberSignerTemp, SetCyberSignerTemp] = useState(null);
  const [valuePhrase, setValuePhrase] = useState('');

  useEffect(() => {
    rejectStage();
  }, [location.pathname]);

  useEffect(() => {
    const getSigner = async () => {
      const signerObj = new Signer();
      const signerCyber = await signerObj.initSigner(defaultAccount);
      if (signerCyber !== null) {
        const pk = Buffer.from(signerCyber.pubkey).toString('hex');
        console.log(`pk`, pk);
      }
      console.log(`signerCyber`, signerCyber);
      updateCyberSigner(signerCyber);
    };
    getSigner();
  }, [defaultAccount.name]);

  useEffect(() => {
    if (tx !== null) {
      setMsgData(tx);
      updateStageSigner(STAGE_SIGN);
      updateValueIsVisible(true);
    }
  }, [tx]);

  const restorePhrase = async () => {
    const signerObj = new Signer();
    const signerCyber = await signerObj.restorePhrase(valuePhrase, callbackFnc);
    updateCyberSigner(signerCyber);
    setValuePhrase('');
    updateStageSigner(STAGE_INIT);
  };

  const createNewAcc = async () => {
    updateStageSigner(CYBER_SIGNER.STAGE_CREATE_NEW_ACCOUNT);
    const signerObj = new Signer();
    const signerCyber = await signerObj.getVanityAccount();
    // updateCyberSigner(signerCyber);
    SetCyberSignerTemp(signerCyber);
    setValuePhrase(signerCyber.secret.data);
  };

  const signTx = async () => {
    console.log(`signer`, cyberSigner);
    console.log(`msgData`, msgData);
    if (cyberSigner !== null && msgData !== null) {
      const signerObj = new Signer();
      const response = await signerObj.sendTxs(
        cyberSigner,
        msgData,
        callbackFnc
      );
      console.log(`response Txs`, response);
      updateValueTxs(null);
      setMsgData(null);
      rejectStage();
    }
  };

  const rejectStage = () => {
    updateStageSigner(STAGE_INIT);
    setMsgData(null);
    updateValueTxs(null);
    updateValueIsVisible(false);
  };

  if (isVisible && stage === STAGE_SIGN) {
    return (
      <StateSign
        msgData={msgData}
        onClickReject={rejectStage}
        onClick={signTx}
      />
    );
  }

  const fuckGoogleCreateAcc = async () => {
    updateStageSigner(STAGE_INIT);
    setValuePhrase('');
    if (callbackFnc !== null) {
      callbackFnc(cyberSignerTemp);
    }
  };

  if (isVisible && stage === STAGE_INIT_ACC) {
    return (
      <StateInitAccount
        onClickCreateNew={() => createNewAcc()}
        onClickRestore={() =>
          updateStageSigner(CYBER_SIGNER.STAGE_RESTORE_PHARSE)
        }
      />
    );
  }

  if (isVisible && stage === STAGE_CREATE_NEW_ACCOUNT) {
    return (
      <StateCreateNew
        valuePhrase={valuePhrase}
        onClick={() => fuckGoogleCreateAcc()}
      />
    );
  }

  if (isVisible && stage === STAGE_RESTORE_PHARSE) {
    return (
      <StateRestore
        valuePhrase={valuePhrase}
        onChangeInputPhrase={(e) => setValuePhrase(e.target.value)}
        onClick={() => restorePhrase()}
      />
    );
  }

  return null;
}

const mapStateToProps = (store) => {
  return {
    defaultAccount: store.pocket.defaultAccount,
  };
};

export default connect(mapStateToProps)(AppSign);
