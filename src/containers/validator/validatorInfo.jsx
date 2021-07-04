import React from 'react';
import { Pane, Text } from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import {
  CardTemplate,
  ContainerCard,
  Card,
  StatusTooltip,
  FormatNumber,
} from '../../components';
import { formatNumber } from '../../utils/utils';
import { CYBER } from '../../utils/config';
import KeybaseCheck from './keybaseCheck';
import KeybaseAvatar from './keybaseAvatar';
import UptimeHook from './UptimeHook';

export const Row = ({ value, title, marginBottom }) => (
  <Pane
    key={`${value}-container`}
    style={{ marginBottom: marginBottom || 0 }}
    className="txs-contaiter-row"
    display="flex"
  >
    <Text
      key={`${title}-title`}
      display="flex"
      fontSize="15px"
      textTransform="capitalize"
      color="#fff"
      whiteSpace="nowrap"
      width="240px"
      marginBottom="5px"
      lineHeight="20px"
    >
      {title} :
    </Text>
    <Text
      key={`${value}-value`}
      display="flex"
      color="#fff"
      fontSize="14px"
      wordBreak="break-all"
      lineHeight="20px"
      marginBottom="5px"
      flexDirection="column"
      alignItems="flex-start"
    >
      {value}
    </Text>
  </Pane>
);

const ValidatorInfo = ({ data }) => {
  const { moniker, identity, website, details } = data.description;

  return (
    <Pane
      marginBottom="50px"
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
      gridGap="10px"
    >
      <Card
        title="Voting Power"
        value={`${formatNumber(data.votingPower, 3)} %`}
        stylesContainer={{
          width: '100%',
          maxWidth: 'unset',
          margin: 0,
        }}
      />
      <Pane display="flex" flexDirection="column" alignItems="center">
        <Pane
          width={80}
          height={80}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <KeybaseAvatar identity={identity} />
        </Pane>
        <Pane display="flex" alignItems="center">
          <StatusTooltip status={data.status} size={10} />
          <Pane marginLeft={10} fontSize="25px">
            {website !== undefined ? <a href={website}>{moniker}</a> : moniker}
          </Pane>
        </Pane>
      </Pane>
      <Card
        title="Uptime"
        value={<UptimeHook accountUser={data.consensus_pubkey} />}
        stylesContainer={{
          width: '100%',
          maxWidth: 'unset',
          margin: 0,
        }}
      />
    </Pane>
  );
};

export default ValidatorInfo;
