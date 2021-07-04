import React, { useEffect, useStatea } from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import {
  Pane,
  Text,
  TableEv as Table,
  Icon,
  Tooltip,
} from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import { getGraphQLQuery } from '../../utils/search/utils';
import { trimString, formatNumber, formatCurrency } from '../../utils/utils';
import { CardTemplate, MsgType, Loading, TextTable } from '../../components';

const dateFormat = require('dateformat');

const statusTrueImg = require('../../image/ionicons_svg_ios-checkmark-circle.svg');
const statusFalseImg = require('../../image/ionicons_svg_ios-close-circle.svg');

const GET_CHARACTERS = gql`
  subscription Query {
    transaction(offset: 0, limit: 200, order_by: { height: desc }) {
      success
      messagesByTransactionHash {
        type
        transaction_hash
      }
      height
      hash
    }
  }
`;

const Txs = () => {
  const { loading, error, data: dataTxs } = useSubscription(GET_CHARACTERS);

  if (error) {
    return `Error! ${error.message}`;
  }

  if (loading) {
    return <div>...</div>;
  }

  console.log(dataTxs);

  const validatorRows = dataTxs.transaction.map((item, index) => (
    <Table.Row
      // borderBottom="none"
      paddingX={0}
      paddingY={5}
      borderTop={index === 0 ? 'none' : '1px solid #3ab79340'}
      borderBottom="none"
      display="flex"
      minHeight="48px"
      height="fit-content"
      key={item.hash}
    >
      <Table.TextCell flex={0.5} textAlign="center">
        <TextTable>
          <img
            style={{ width: '20px', height: '20px', marginRight: '5px' }}
            src={item.success ? statusTrueImg : statusFalseImg}
            alt="statusImg"
          />
        </TextTable>
      </Table.TextCell>
      <Table.TextCell textAlign="center">
        <TextTable>
          <Link to={`/network/bostrom/tx/${item.hash}`}>
            {trimString(item.hash, 6, 6)}
          </Link>
        </TextTable>
      </Table.TextCell>
      <Table.TextCell flex={1.3} textAlign="center">
        {/* <TextTable>{dateFormat(item.height, 'dd/mm/yyyy, HH:MM:ss')}</TextTable> */}
        <TextTable>{formatNumber(item.height)}</TextTable>
      </Table.TextCell>
      <Table.TextCell textAlign="start">
        <TextTable display="flex" alignItems="start" flexDirection="column">
          {item.messagesByTransactionHash.length > 4 ? (
            <Pane display="flex" alignItems="center">
              <MsgType
                key={item.messagesByTransactionHash[0].transaction_hash}
                type={item.messagesByTransactionHash[0].type}
              />
              <div style={{ marginLeft: '5px' }}>
                ({item.messagesByTransactionHash.length} messages)
              </div>
            </Pane>
          ) : (
            item.messagesByTransactionHash.map((items, i) => {
              return (
                <MsgType
                  key={`${item.transaction_hash}_${i}`}
                  type={items.type}
                />
              );
            })
          )}
        </TextTable>
      </Table.TextCell>
    </Table.Row>
  ));

  return (
    <main className="block-body">
      <Table>
        <Table.Head
          style={{
            backgroundColor: '#000',
            borderBottom: '1px solid #ffffff80',
            marginTop: '10px',
            padding: 7,
            paddingBottom: '10px',
          }}
        >
          <Table.TextHeaderCell flex={0.5} textAlign="center">
            <TextTable>status</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>tx</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell flex={1.3} textAlign="center">
            <TextTable>
              timestamp{' '}
              <Tooltip content="UTC" position="bottom">
                <Icon icon="info-sign" color="#3ab793d4" marginLeft={5} />
              </Tooltip>
            </TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>type</TextTable>
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.Body
          style={{
            backgroundColor: '#000',
            overflowY: 'hidden',
            padding: 7,
          }}
        >
          {validatorRows}
        </Table.Body>
      </Table>
    </main>
  );
};

export default Txs;
