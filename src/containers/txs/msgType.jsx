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

const ContainerTitle = ({ img, children }) => (
  <Pane display="flex" alignItems="center">
    <img
      alt={children}
      style={{
        width: '30px',
        height: '30px',
        marginRight: '5px',
      }}
      src={img}
    />
    {children}
  </Pane>
);

const MsgType = ({ type }) => {
  switch (type) {
    // cyberd
    case 'cyberd/Link':
      return <ContainerTitle img={link}>Link</ContainerTitle>;

    case 'cyber/Link':
      return <ContainerTitle img={link}>Link</ContainerTitle>;

    // bank
    case 'cosmos-sdk/MsgSend':
      return <ContainerTitle img={bank}>Send</ContainerTitle>;
    case 'cosmos-sdk/MsgMultiSend':
      return <ContainerTitle img={bank}>Multi Send</ContainerTitle>;

    // staking
    case 'cosmos-sdk/MsgCreateValidator':
      return <ContainerTitle img={stake}>Create Validator</ContainerTitle>;
    case 'cosmos-sdk/MsgEditValidator':
      return <ContainerTitle img={stake}>Edit Validator</ContainerTitle>;
    case 'cosmos-sdk/MsgDelegate':
      return <ContainerTitle img={stake}>Delegate</ContainerTitle>;
    case 'cosmos-sdk/MsgUndelegate':
      return <ContainerTitle img={stake}>Undelegate</ContainerTitle>;
    case 'cosmos-sdk/MsgBeginRedelegate':
      return <ContainerTitle img={stake}>Redelegate</ContainerTitle>;

    // gov
    case 'cosmos-sdk/MsgSubmitProposal':
      return <ContainerTitle img={gov}>Submit Proposal</ContainerTitle>;
    case 'cosmos-sdk/MsgDeposit':
      return <ContainerTitle img={gov}>Deposit</ContainerTitle>;
    case 'cosmos-sdk/MsgVote':
      return <ContainerTitle img={gov}>Vote</ContainerTitle>;

    // distribution
    case 'cosmos-sdk/MsgWithdrawValidatorCommission':
      return (
        <ContainerTitle img={distribution}>Withdraw Commission</ContainerTitle>
      );
    case 'cosmos-sdk/MsgWithdrawDelegationReward':
      return (
        <ContainerTitle img={distribution}>Withdraw Reward</ContainerTitle>
      );
    case 'cosmos-sdk/MsgModifyWithdrawAddress':
      return (
        <ContainerTitle img={distribution}>
          Modify Withdraw Address
        </ContainerTitle>
      );

    // slashing
    case 'cosmos-sdk/MsgUnjail':
      return <ContainerTitle img={slashing}>Unjail</ContainerTitle>;

    // ibc
    case 'cosmos-sdk/IBCTransferMsg':
      return 'IBCTransfer';
    case 'cosmos-sdk/IBCReceiveMsg':
      return 'IBC Receive';

    default:
      return <Pane>{type}</Pane>;
  }
};

export default MsgType;
