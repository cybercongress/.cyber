import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pane,
  ActionBar as ActionBarGravity,
  Button,
} from '@cybercongress/gravity';
import ActionBarTweet from './actionBarTweet';
import ActionBarKeplr from './actionBarKeplr';
import ActionBarWeb3 from './actionBarWeb3';
import ActionBarUser from './actionBarUser';
import ActionBarLedger from './actionBarLedger';
import ActionBarConnect from './actionBarConnect';
import ActionBarCyberSigner from './actionBarCyberSigner';

const imgLedger = require('../../image/ledger.svg');
const imgKeplr = require('../../image/keplr-icon.svg');
const imgRead = require('../../image/duplicate-outline.svg');
const imgCyberSigner = require('../../image/wallet-outline.svg');

const STAGE_INIT = 1;
const STAGE_CONNECT = 2;
const STAGE_SEND_LEDGER = 3.1;
const STAGE_SEND_KEPLR = 4.1;
const STAGE_SEND_READ_ONLY = 5.1;
const STAGE_SEND_CYBER_SIGNER = 6.1;

const ButtonImgText = ({ img, text = 'Send', ...props }) => (
  <Button marginX={10} {...props}>
    {text}{' '}
    <img
      style={{
        width: 20,
        height: 20,
        marginLeft: '5px',
        paddingTop: '2px',
      }}
      src={img}
      alt="img"
    />
  </Button>
);

function ActionBar({
  selectCard,
  selectAccount,
  hoverCard,
  // actionBar keplr props
  keplr,
  // actionBar web3
  web3,
  accountsETH,
  // actionBar tweet
  refreshTweet,
  updateTweetFunc,
  // global props
  updateAddress,
  defaultAccounts,
  defaultAccountsKeys,
}) {
  const [typeActionBar, setTypeActionBar] = useState('');
  const [stage, setStage] = useState(STAGE_INIT);
  const [makeActive, setMakeActive] = useState(false);
  const [connect, setConnect] = useState(false);

  useEffect(() => {
    if (stage === STAGE_INIT) {
      setMakeActive(false);
      setTypeActionBar('');
      switch (true) {
        case selectCard === 'tweet' || hoverCard === 'tweet':
          setTypeActionBar('tweet');
          break;

        case selectCard.indexOf('pubkey') !== -1 ||
          hoverCard.indexOf('pubkey') !== -1:
          changeActionBar(selectAccount);
          break;

        case selectCard === 'gol' || hoverCard === 'gol':
          setTypeActionBar('gol');
          break;

        default:
          setTypeActionBar('');
          break;
      }
    }
  }, [selectCard, hoverCard, selectAccount]);

  useEffect(() => {
    if (defaultAccountsKeys !== null && selectAccount !== null) {
      if (selectAccount.key && defaultAccountsKeys === selectAccount.key) {
        setMakeActive(false);
      } else {
        setMakeActive(true);
      }
    }
  }, [defaultAccounts, selectAccount]);

  useEffect(() => {
    if (selectAccount !== null) {
      if (selectAccount.cyber && selectAccount.cosmos && selectAccount.eth) {
        setConnect(false);
      } else {
        setConnect(true);
      }
    }
  }, [selectAccount]);

  const changeActionBar = (account) => {
    if (account !== null) {
      if (account.cyber) {
        const { keys } = account.cyber;
        setTypeActionBar(keys);
      } else {
        setTypeActionBar('noCyber');
      }
    }
  };

  const changeDefaultAccounts = async () => {
    if (selectAccount !== null && selectAccount.key) {
      const copy = { ...selectAccount };
      delete copy.key;
      localStorage.setItem(
        'pocket',
        JSON.stringify({ [selectAccount.key]: copy })
      );
    }
    if (updateAddress) {
      updateAddress();
    }
  };

  const onClickDefaultAccountSend = () => {
    if (defaultAccounts !== null && defaultAccounts.cyber) {
      if (defaultAccounts.cyber.keys === 'keplr') {
        setStage(STAGE_SEND_KEPLR);
      }
      if (defaultAccounts.cyber.keys === 'ledger') {
        setStage(STAGE_SEND_LEDGER);
      }
      if (defaultAccounts.cyber.keys === 'read-only') {
        setStage(STAGE_SEND_READ_ONLY);
      }
    }
  };

  const updateFuncActionBar = () => {
    setTypeActionBar('');
    setStage(STAGE_INIT);
    setMakeActive(false);
    setConnect(false);
  };

  if (typeActionBar === '' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          <Button marginX={10} onClick={() => setStage(STAGE_CONNECT)}>
            Connect
          </Button>
          {defaultAccounts !== null && defaultAccounts.cyber && (
            <Button marginX={10} onClick={() => onClickDefaultAccountSend()}>
              Send
            </Button>
          )}
        </Pane>
      </ActionBarGravity>
    );
  }

  if (stage === STAGE_CONNECT) {
    return (
      <ActionBarConnect
        web3={web3}
        accountsETH={accountsETH}
        keplr={keplr}
        updateAddress={updateAddress}
        updateFuncActionBar={updateFuncActionBar}
        selectAccount={selectAccount}
      />
    );
  }

  if (typeActionBar === 'noCyber' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          {connect && (
            <Button marginX={10} onClick={() => setStage(STAGE_CONNECT)}>
              Connect
            </Button>
          )}
          {makeActive && (
            <Button marginX={10} onClick={() => changeDefaultAccounts()}>
              Activate
            </Button>
          )}
        </Pane>
      </ActionBarGravity>
    );
  }

  if (typeActionBar === 'keplr' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          {connect && (
            <Button marginX={10} onClick={() => setStage(STAGE_CONNECT)}>
              Connect
            </Button>
          )}
          {keplr && (
            <ButtonImgText
              img={imgKeplr}
              onClick={() => setStage(STAGE_SEND_KEPLR)}
            />
          )}
          {makeActive && (
            <Button marginX={10} onClick={() => changeDefaultAccounts()}>
              Activate
            </Button>
          )}
        </Pane>
      </ActionBarGravity>
    );
  }

  if (typeActionBar === 'ledger' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          {connect && (
            <Button marginX={10} onClick={() => setStage(STAGE_CONNECT)}>
              Connect
            </Button>
          )}
          <ButtonImgText
            img={imgLedger}
            onClick={() => setStage(STAGE_SEND_LEDGER)}
          />
          {makeActive && (
            <Button marginX={10} onClick={() => changeDefaultAccounts()}>
              Activate
            </Button>
          )}
        </Pane>
      </ActionBarGravity>
    );
  }

  if (typeActionBar === 'read-only' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          {connect && (
            <Button marginX={10} onClick={() => setStage(STAGE_CONNECT)}>
              Connect
            </Button>
          )}
          <ButtonImgText
            img={imgRead}
            onClick={() => setStage(STAGE_SEND_READ_ONLY)}
          />
          {makeActive && (
            <Button marginX={10} onClick={() => changeDefaultAccounts()}>
              Activate
            </Button>
          )}
        </Pane>
      </ActionBarGravity>
    );
  }

  if (typeActionBar === 'cyberSigner' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          {connect && (
            <Button marginX={10} onClick={() => setStage(STAGE_CONNECT)}>
              Connect
            </Button>
          )}
          <ButtonImgText
            img={imgCyberSigner}
            onClick={() => setStage(STAGE_SEND_CYBER_SIGNER)}
          />
          {makeActive && (
            <Button marginX={10} onClick={() => changeDefaultAccounts()}>
              Activate
            </Button>
          )}
        </Pane>
      </ActionBarGravity>
    );
  }

  if (typeActionBar === 'gol' && stage === STAGE_INIT) {
    return (
      <ActionBarGravity>
        <Pane>
          <Link
            style={{ paddingTop: 10, paddingBottom: 10, display: 'block' }}
            className="btn"
            to="/gol"
          >
            Play Game of Links
          </Link>
        </Pane>
      </ActionBarGravity>
    );
  }

  if (typeActionBar === 'tweet' && stage === STAGE_INIT) {
    if (defaultAccounts !== null && defaultAccounts.cyber) {
      return (
        <ActionBarTweet
          keplr={keplr}
          refresh={refreshTweet}
          update={updateTweetFunc}
          defaultAccountsKeys={defaultAccounts.cyber.keys}
        />
      );
    }
    return (
      <ActionBarGravity>
        <Pane>Add cyber address to active account</Pane>
      </ActionBarGravity>
    );
  }

  if (stage === STAGE_SEND_KEPLR) {
    return (
      <ActionBarKeplr
        keplr={keplr}
        selectAccount={selectAccount}
        updateAddress={updateFuncActionBar}
        updateBalance={updateAddress}
      />
    );
  }

  if (stage === STAGE_SEND_CYBER_SIGNER) {
    return (
      <ActionBarCyberSigner
        selectAccount={selectAccount}
        updateAddress={updateFuncActionBar}
        updateBalance={updateAddress}
      />
    );
  }

  if (stage === STAGE_SEND_LEDGER) {
    return (
      <ActionBarLedger
        selectAccount={selectAccount}
        updateAddress={updateFuncActionBar}
        defaultAccounts={defaultAccounts}
        updateBalance={updateAddress}
      />
    );
    // return <div />;u
  }

  if (stage === STAGE_SEND_READ_ONLY) {
    return (
      <ActionBarUser
        selectAccount={selectAccount}
        updateAddress={updateFuncActionBar}
      />
    );
  }

  return null;
}

export default ActionBar;
