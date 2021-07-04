import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  Pane,
  Text,
  TableEv as Table,
  Icon,
  Tooltip,
} from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { trimString, formatNumber, formatCurrency } from '../../../utils/utils';
import { NoItems, MsgType, Dots, TextTable } from '../../../components';
import { CYBER } from '../../../utils/config';

const dateFormat = require('dateformat');
const imgDropdown = require('../../../image/arrow-dropdown.svg');
const imgDropup = require('../../../image/arrow-dropup.svg');
const statusTrueImg = require('../../../image/ionicons_svg_ios-checkmark-circle.svg');
const statusFalseImg = require('../../../image/ionicons_svg_ios-close-circle.svg');

const TableTxs = ({ data, type, accountUser, amount }) => {
  const [itemsToShow, setItemsToShow] = useState(30);

  const setNextDisplayedPalettes = useCallback(() => {
    setTimeout(() => {
      setItemsToShow(itemsToShow + 10);
    }, 250);
  }, [itemsToShow, setItemsToShow]);

  const displayedPalettes = useMemo(() => data.slice(0, itemsToShow), [
    itemsToShow,
  ]);

  const validatorRows = displayedPalettes.map((item, index) => (
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
        {item.height && <TextTable>{formatNumber(item.height)}</TextTable>}
      </Table.TextCell>
      <Table.TextCell textAlign="center">
        {item.messages && (
          <TextTable display="flex" flexDirection="column">
            {item.messages.length > 4 ? (
              <Pane display="flex" alignItems="center">
                <MsgType
                  type={
                    item.messages[0]['@type'].includes('MsgSend')
                      ? 'cosmos-sdk/MsgMultiSend'
                      : item.messages[0]['@type']
                  }
                />
                <div style={{ marginLeft: '5px', color: '#36d6ae' }}>
                  +{item.messages.length}
                </div>
              </Pane>
            ) : (
              item.messages.map((items, i) => {
                let typeTx = items['@type'];
                if (
                  typeTx.includes('MsgSend') &&
                  items.to_address === accountUser
                ) {
                  typeTx = 'Receive';
                }
                return <MsgType key={i} type={typeTx} />;
              })
            )}
          </TextTable>
        )}
      </Table.TextCell>
      {amount && (
        <Table.TextCell textAlign="end">
          {item.messages.map((items, i) => (
            // <Tooltip
            //   position="bottom"
            //   key={i}
            //   content={`${formatNumber(
            //     Math.floor(items.value.amount.amount)
            //   )} ${CYBER.DENOM_CYBER.toUpperCase()}`}
            // >
            <TextTable
              color={
                items['@type'].includes('MsgDelegate') ? '#4ed6ae' : '#f4516b'
              }
            >
              {items['@type'].includes('MsgDelegate')
                ? `+ ${formatCurrency(
                    items.amount.amount,
                    CYBER.DENOM_CYBER.toUpperCase(),
                    0
                  )}`
                : `- ${formatCurrency(
                    items.amount.amount,
                    CYBER.DENOM_CYBER.toUpperCase(),
                    0
                  )}`}
            </TextTable>
            // </Tooltip>
          ))}
        </Table.TextCell>
      )}
    </Table.Row>
  ));

  return (
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
            height{' '}
            {/* <Tooltip content="UTC" position="bottom">
              <Icon icon="info-sign" color="#3ab793d4" marginLeft={5} />
            </Tooltip> */}
          </TextTable>
        </Table.TextHeaderCell>
        <Table.TextHeaderCell textAlign="center">
          <TextTable>type</TextTable>
        </Table.TextHeaderCell>
        {amount && (
          <Table.TextHeaderCell textAlign="center">
            <TextTable>amount</TextTable>
          </Table.TextHeaderCell>
        )}
      </Table.Head>
      <Table.Body
        style={{
          backgroundColor: '#000',
          overflowY: 'hidden',
          padding: 7,
        }}
      >
        <InfiniteScroll
          dataLength={Object.keys(displayedPalettes).length}
          next={setNextDisplayedPalettes}
          hasMore={itemsToShow < data.length}
          loader={
            <h4>
              Loading
              <Dots />
            </h4>
          }
          pullDownToRefresh
          pullDownToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>
              &#8595; Pull down to refresh
            </h3>
          }
          releaseToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
          }
          refreshFunction={setNextDisplayedPalettes}
        >
          {data.length > 0 ? (
            validatorRows
          ) : (
            <NoItems text={`No txs ${type || ' '}`} />
          )}
        </InfiniteScroll>
      </Table.Body>
    </Table>
  );
};

export default TableTxs;
