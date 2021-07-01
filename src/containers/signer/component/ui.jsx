import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pane, Button, Tablist } from '@cybercongress/gravity';
import MsgType from '../../txs/msgType';
import { PillNumber, TabBtn, Dots } from '../../../components';
import { trimString } from '../../../utils/utils';
import MsgsSigner from './MsgsSigner';

const HeaderSigner = ({ children }) => (
  <Pane
    fontSize="18px"
    textAlign="center"
    borderBottom="1px solid #ffffff52"
    paddingY={10}
  >
    {children}
  </Pane>
);

const ContainerSigner = ({ children }) => (
  <Pane
    position="fixed"
    backgroundColor="#6b696954"
    zIndex="999999"
    top={0}
    bottom={0}
    right={0}
    left={0}
  >
    <Pane className="signer-container">{children}</Pane>
  </Pane>
);

function StateSign({ msgData, onClick, onClickReject }) {
  let content;

  if (msgData !== null) {
    content = (
      <Pane overflow="auto" width="100%" paddingY={5} paddingX={10}>
        <Pane display="flex">
          Messages{' '}
          <PillNumber marginLeft={5} height="20px">
            {Object.keys(msgData).length}
          </PillNumber>{' '}
        </Pane>
        <Pane width="100%" paddingLeft={20}>
          {Object.keys(msgData).map((key) => (
            <Pane paddingY={5} width="100%">
              <MsgsSigner msgData={msgData[key]} />
              {/* {msgData[key].type} */}
              <Pane paddingTop={5} borderBottom="1px solid #ffffff52" />
            </Pane>
          ))}
        </Pane>
      </Pane>
    );
  }

  return (
    <ContainerSigner>
      <HeaderSigner>sign tx</HeaderSigner>
      <Pane
        display="flex"
        height="100%"
        width="100%"
        alignItems="flex-start"
        paddingY={10}
        flexDirection="column"
        overflow="hidden"
      >
        {content}
      </Pane>
      <Pane display="flex" justifyContent="center" paddingY={10}>
        <Button marginX={10} onClick={() => onClickReject()}>
          reject
        </Button>
        <Button marginX={10} onClick={() => onClick()}>
          sign
        </Button>
      </Pane>
    </ContainerSigner>
  );
}

function StateBroadcast() {
  return (
    <Pane className="signer-container">
      <HeaderSigner>Broadcast txs</HeaderSigner>
      <Pane position="relative" height="100%">
        <Pane position="absolute" top="20%" paddingX={20} fontSize="18px">
          Please wait while we confirm the transaction on the blockchain{' '}
          <Dots big />
        </Pane>
      </Pane>
    </Pane>
  );
}

function StateConfirmed({ txHash, onClick }) {
  return (
    <Pane className="signer-container">
      <HeaderSigner>Confirmed</HeaderSigner>
      <Pane position="relative" height="100%">
        <Pane
          position="absolute"
          top="20%"
          paddingX={20}
          whiteSpace="nowrap"
          fontSize="18px"
        >
          Transaction hash:{' '}
          <Link to={`/network/euler/tx/${txHash}`}>
            {trimString(txHash, 6, 6)}
          </Link>
        </Pane>
      </Pane>
      <Pane
        paddingY={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Button onClick={() => onClick()}>Fuck Google</Button>
      </Pane>
    </Pane>
  );
}

function StateInitAccount({ onClickCreateNew, onClickRestore }) {
  return (
    <ContainerSigner>
      <HeaderSigner>Init Account</HeaderSigner>
      <Pane position="relative" height="100%">
        <Pane
          position="absolute"
          top="20%"
          fontSize="18px"
          width="100%"
          display="grid"
          gridTemplateColumns="200px"
          gridAutoRows="50px 50px"
          gridGap="20px"
          justifyContent="center"
        >
          <Button onClick={() => onClickCreateNew()}>create new</Button>
          <Button onClick={() => onClickRestore()}>restore phrase</Button>
        </Pane>
      </Pane>
    </ContainerSigner>
  );
}

function StateRestore({ valuePhrase, onChangeInputPhrase, onClick }) {
  return (
    <ContainerSigner>
      <HeaderSigner>Restore phrase</HeaderSigner>
      <Pane position="relative" height="100%">
        <Pane
          position="absolute"
          top="10%"
          width="100%"
          paddingX={20}
          fontSize="18px"
        >
          <Pane paddingY={10}>Input your seed :</Pane>
          <textarea
            style={{ minHeight: '130px', padding: '8px' }}
            onChange={onChangeInputPhrase}
            value={valuePhrase}
            className="resize-none"
            placeholder="Type your mnemonic"
          />
        </Pane>
      </Pane>
      <Pane
        paddingY={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Button onClick={() => onClick()}>Fuck Google</Button>
      </Pane>
    </ContainerSigner>
  );
}

function StateCreateNew({ valuePhrase = '', onClick }) {
  const [copyPhrase, setCopyPhrase] = useState(false);

  return (
    <ContainerSigner>
      <HeaderSigner>Create new account</HeaderSigner>
      <Pane position="relative" height="100%">
        <Pane paddingX={20} fontSize="18px">
          <Pane textAlign="center" paddingY={10} fontWeight="600">
            Backup your mnemonic seed securely.
          </Pane>
          <Pane paddingY={10}>Mnemonic Seed:</Pane>
          <textarea
            style={{ minHeight: '130px', padding: '8px' }}
            value={valuePhrase}
            className="resize-none"
          />
          <Pane display="flex" alignItems="center" marginTop={30}>
            <input
              type="checkbox"
              style={{ marginRight: '8px' }}
              className="checkbox"
              onChange={() => setCopyPhrase(!copyPhrase)}
            />{' '}
            I saved the mnemonic phrase
          </Pane>
        </Pane>
      </Pane>
      <Pane
        paddingY={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Button disabled={!copyPhrase} onClick={() => onClick()}>
          Fuck Google
        </Button>
      </Pane>
    </ContainerSigner>
  );
}

export {
  StateSign,
  StateBroadcast,
  StateConfirmed,
  StateInitAccount,
  StateCreateNew,
  StateRestore,
};
