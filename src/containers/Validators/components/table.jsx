import React from 'react';
import { TableEv as Table, Tooltip, Icon } from '@cybercongress/gravity';
import { TextTable } from './ui';
import { CYBER } from '../../../utils/config'

function TableHeroes({ mobile, showJailed, children }) {
  return (
    <Table>
      <Table.Head
        style={{
          backgroundColor: '#000',
          borderBottom: '1px solid #ffffff80',
          marginTop: '10px',
          paddingBottom: '10px',
        }}
      >
        <Table.TextHeaderCell
          paddingX={5}
          textAlign="center"
          flexBasis={mobile ? 30 : 60}
          flex="none"
        >
          <TextTable fontSize={14}>#</TextTable>
        </Table.TextHeaderCell>
        <Table.TextHeaderCell textAlign="center" paddingX={5}>
          <TextTable fontSize={13}>Moniker</TextTable>
        </Table.TextHeaderCell>
        <Table.TextHeaderCell flex={0.7} paddingX={5} textAlign="center">
          <TextTable fontSize={13} whiteSpace="nowrap">
            Commission
          </TextTable>
        </Table.TextHeaderCell>
        <Table.TextHeaderCell paddingX={5} textAlign="center">
          <TextTable fontSize={13}>Power</TextTable>
        </Table.TextHeaderCell>
        {!mobile && (
          <>
            {' '}
            <Table.TextHeaderCell paddingX={5} textAlign="center">
              <TextTable fontSize={13}>Power, %</TextTable>
            </Table.TextHeaderCell>
            <Table.TextHeaderCell paddingX={5} textAlign="center">
              <TextTable fontSize={14}>Self</TextTable>
            </Table.TextHeaderCell>
            <Table.TextHeaderCell paddingX={5} textAlign="center">
              <TextTable fontSize={14}>
                Your bond
                <Tooltip
                  position="bottom"
                  content={`Amount of ${CYBER.DENOM_CYBER.toUpperCase()} (tokens you bonded to validator in)`}
                >
                  <Icon icon="info-sign" color="#3ab793d4" marginLeft={5} />
                </Tooltip>
              </TextTable>
            </Table.TextHeaderCell>{' '}
          </>
        )}
        {showJailed && (
          <Table.TextHeaderCell paddingX={5} flex={1} textAlign="end">
            <TextTable fontSize={14}>Unbonding height</TextTable>
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
        {children}
      </Table.Body>
    </Table>
  );
}

export default TableHeroes;
