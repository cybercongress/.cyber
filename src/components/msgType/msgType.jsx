import React from 'react';
import { Text, Pane } from '@cybercongress/gravity';
// import { formatNumber } from '../../utils/search/utils';
// import { msgType } from '../../utils/utils';

const link = require('../../image/link.svg');
const bank = require('../../image/send.svg');
const stake = require('../../image/stake.svg');
const gov = require('../../image/gov.svg');
const distribution = require('../../image/distribution.svg');
const slashing = require('../../image/slashing.svg');
const investmint = require('../../image/swap-horizontal.svg');

const ContainerTitle = ({ img, children }) => (
  <Pane display="flex" alignItems="center">
    {img && (
      <img
        alt={children}
        style={{
          width: '30px',
          height: '30px',
          marginRight: '5px',
        }}
        src={img}
      />
    )}
    {children}
  </Pane>
);

const MsgType = ({ type }) => {
  if (type.includes('Link')) {
    return <ContainerTitle img={link}>Link</ContainerTitle>;
  }

  if (type.includes('MsgCyberlink')) {
    return <ContainerTitle img={link}>Link</ContainerTitle>;
  }

  // investmint

  if (type.includes('MsgInvestmint')) {
    return <ContainerTitle img={investmint}>Investmint</ContainerTitle>;
  }

  // bank

  if (type.includes('MsgSend')) {
    return <ContainerTitle img={bank}>Send</ContainerTitle>;
  }
  if (type.includes('MsgMultiSend')) {
    return <ContainerTitle img={bank}>Multi Send</ContainerTitle>;
  }
  if (type.includes('Receive')) {
    return <ContainerTitle img={bank}>Receive</ContainerTitle>;
  }

  // staking
  if (type.includes('MsgCreateValidator')) {
    return <ContainerTitle img={stake}>Create Validator</ContainerTitle>;
  }

  if (type.includes('MsgEditValidator')) {
    return <ContainerTitle img={stake}>Edit Validator</ContainerTitle>;
  }
  if (type.includes('MsgDelegate')) {
    return <ContainerTitle img={stake}>Delegate</ContainerTitle>;
  }
  if (type.includes('MsgUndelegate')) {
    return <ContainerTitle img={stake}>Undelegate</ContainerTitle>;
  }

  if (type.includes('MsgBeginRedelegate')) {
    return <ContainerTitle img={stake}>Redelegate</ContainerTitle>;
  }

  // gov
  if (type.includes('MsgSubmitProposal')) {
    return <ContainerTitle img={gov}>Submit Proposal</ContainerTitle>;
  }

  if (type.includes('MsgDeposit')) {
    return <ContainerTitle img={gov}>Deposit</ContainerTitle>;
  }
  if (type.includes('MsgVote')) {
    return <ContainerTitle img={gov}>Vote</ContainerTitle>;
  }

  // distribution
  if (type.includes('MsgWithdrawValidatorCommission')) {
    return (
      <ContainerTitle img={distribution}>Withdraw Commission</ContainerTitle>
    );
  }

  if (type.includes('MsgWithdrawDelegatorReward')) {
    return <ContainerTitle img={distribution}>Withdraw Reward</ContainerTitle>;
  }
  if (type.includes('MsgModifyWithdrawAddress')) {
    return (
      <ContainerTitle img={distribution}>
        Modify Withdraw Address
      </ContainerTitle>
    );
  }

  // slashing
  if (type.includes('MsgUnjail')) {
    return <ContainerTitle img={slashing}>Unjail</ContainerTitle>;
  }

  // ibc

  return <div>{type}</div>;
};

export default MsgType;
