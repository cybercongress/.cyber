import React from 'react';
import { Pane } from '@cybercongress/gravity';

import { trimString, formatNumber } from '../../../utils/utils';
import MsgType from '../../txs/msgType';

const CT = ({ children }) => (
  <span style={{ color: '#3ab793' }}>{children}</span>
);

function MsgsSigner({ msgData }) {
  if (msgData.type === 'cosmos-sdk/MsgSend') {
    let recipient;
    let amount;
    if (msgData.value.to_address && msgData.value.amount) {
      recipient = trimString(msgData.value.to_address, 8, 4);
      amount = msgData.value.amount.map((coin, j) => {
        return (
          <span key={j}>
            {' '}
            {formatNumber(coin.amount)} {coin.denom.toUpperCase()}
          </span>
        );
      });
    }
    return (
      <div>
        <MsgType type={msgData.type} />
        <Pane paddingLeft={5}>
          <CT>{recipient}</CT> will receive <CT>{amount}</CT>
        </Pane>
      </div>
    );
  }

  if (msgData.type === 'cosmos-sdk/MsgDelegate') {
    let amount;
    let validator;
    if (msgData.value.validator_address && msgData.value.amount) {
      amount = `${formatNumber(
        msgData.value.amount.amount
      )} ${msgData.value.amount.denom.toUpperCase()}`;
      validator = trimString(msgData.value.validator_address, 16);
    }

    return (
      <div>
        <MsgType type={msgData.type} />
        Delegate Delegate <CT>{amount}</CT> to <CT>{validator}</CT>
      </div>
    );
  }

  if (msgData.type === 'cosmos-sdk/MsgUndelegate') {
    let amount;
    let validator;
    if (msgData.value.validator_address && msgData.value.amount) {
      amount = `${formatNumber(
        msgData.value.amount.amount
      )} ${msgData.value.amount.denom.toUpperCase()}`;
      validator = trimString(msgData.value.validator_address, 16, 4);
    }
    return (
      <div>
        <MsgType type={msgData.type} />
        Undelegate Undelegate <CT>{amount}</CT> from <CT>{validator}</CT>
        <br />
        Asset will be liquid after unbonding period
      </div>
    );
  }

  if (msgData.type === 'cosmos-sdk/MsgBeginRedelegate') {
    let amount;
    let fromValidator;
    let toValidator;
    if (
      msgData.value.validator_dst_address &&
      msgData.value.validator_src_address &&
      msgData.value.amount
    ) {
      amount = `${formatNumber(
        msgData.value.amount.amount
      )} ${msgData.value.amount.denom.toUpperCase()}`;
      fromValidator = trimString(msgData.value.validator_src_address, 16, 4);
      toValidator = trimString(msgData.value.validator_dst_address, 16, 4);
    }

    return (
      <div>
        <MsgType type={msgData.type} />
        Redelegate Redelegate <CT>{amount}</CT> from <CT>{fromValidator}</CT> to{' '}
        <CT>{toValidator}</CT>
      </div>
    );
  }

  if (msgData.type === 'cosmos-sdk/MsgWithdrawDelegatorReward') {
    let validator;
    if (msgData.value.validator_address) {
      validator = trimString(msgData.value.validator_address, 16, 4);
    }
    return (
      <div>
        <MsgType type={msgData.type} />
        Claim Staking Reward Claim pending staking reward from{' '}
        <CT>{validator}</CT>
      </div>
    );
  }

  if (msgData.type === 'cyber/Link') {
    let links;
    let address;
    const cyberlinks = [];
    if (msgData.value.address) {
      address = trimString(msgData.value.address, 8, 4);
    }
    if (msgData.value.links) {
      msgData.value.links.forEach((link) => {
        cyberlinks.push({
          from: link.from,
          to: link.to,
        });
      });
    }
    if (cyberlinks.length > 0) {
      links = cyberlinks
        .map((link) => {
          return `${trimString(link.from, 4, 4)} → ${trimString(
            link.to,
            4,
            4
          )}`;
        })
        .join(', ');
    }

    return (
      <div>
        <MsgType type={msgData.type} />
        <CT>{address}</CT> create link <br />
        <CT>{links}</CT>
      </div>
    );
  }

  return <div>{msgData.type}</div>;
}

export default MsgsSigner;
