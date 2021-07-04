import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pane, TableEv as Table, Text, Tooltip } from '@cybercongress/gravity';
import { LinkWindow, TextTable, Copy } from '../../components';
import { trimString, formatNumber, formatCurrency } from '../../utils/utils';
import { CYBER } from '../../utils/config';

const statusMapping = ['Believed', 'Blessed', 'Unblessed'];

const noitem = require('../../image/noitem.svg');
const cosmos = require('../../image/cosmos.svg');
const eth = require('../../image/Ethereum_logo_2014.svg');
const gitLogo = require('../../image/logo-github.svg');
const keybase = require('../../image/keybase.svg');

const Img = ({ img }) => (
  <img style={{ width: '45px', height: '45px' }} src={img} alt="img" />
);

const Noitem = ({ text }) => (
  <Pane display="flex" paddingY={40} alignItems="center" flexDirection="column">
    <Img img={noitem} />
    <Text fontSize="18px" color="#fff">
      {text}
    </Text>
  </Pane>
);

function TableEvangelists({ data, blessed }) {
  try {
    let rowTableEvangelists;
    let header;

    if (blessed) {
      rowTableEvangelists = Object.keys(data)
        .filter(keys => parseInt(data[keys].status, 10) === 1)
        .sort((a, b) => data[b].amount - data[a].amount)
        .map(key => {
          return (
            <Table.Row
              borderBottom="none"
              key={key}
              display="flex"
              marginBottom={10}
              minHeight="48px"
              height="fit-content"
              paddingY={5}
              paddingX={5}
            >
              <Table.TextCell flex={1.5} textAlign="start">
                <TextTable>
                  <Link
                    style={{ marginRight: '5px' }}
                    to={`/network/bostrom/contract/${data[key].cyberAddress}`}
                  >
                    {data[key].nickname}
                  </Link>
                  <LinkWindow
                    to={`https://www.mintscan.io/account/${data[key].cosmosAddress}`}
                  >
                    <img
                      alt="cosmos"
                      src={cosmos}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </LinkWindow>
                  <LinkWindow
                    to={`https://etherscan.io/address/${data[key].ethereumAddress}`}
                  >
                    <img
                      alt="eth"
                      src={eth}
                      style={{ width: '20px', height: '20px', margin: '0 2px' }}
                    />
                  </LinkWindow>
                  <LinkWindow to={`http://github.com/${data[key].github}`}>
                    <img
                      alt="gitLogo"
                      src={gitLogo}
                      style={{ width: '20px', height: '20px', margin: '0 2px' }}
                    />
                  </LinkWindow>
                  <LinkWindow to={`https://keybase.io/${data[key].keybase}`}>
                    <img
                      alt="keybase"
                      src={keybase}
                      style={{ width: '20px', height: '20px', margin: '0 2px' }}
                    />
                  </LinkWindow>
                  <Copy
                    style={{
                      margin: '0px 2px 3px',
                      width: '18px',
                      height: '18px',
                    }}
                    text={`https://cyber.page/?thanks=${data[key].nickname}`}
                  />
                </TextTable>
              </Table.TextCell>
              <Table.TextCell textAlign="end">
                <TextTable>{formatNumber(data[key].amount, 3)} ATOMs</TextTable>
              </Table.TextCell>
              <Table.TextCell textAlign="end">
                <TextTable>
                  {formatNumber(data[key].amount * 0.1, 3)} ATOMs
                </TextTable>
              </Table.TextCell>
              <Table.TextCell textAlign="end">
                <Tooltip
                  position="bottom"
                  content={`${formatNumber(
                    Math.floor(data[key].amount / 1000) * CYBER.DIVISOR_CYBER_G
                  )} CYB`}
                >
                  <TextTable>{`${Math.floor(
                    data[key].amount / 1000
                  )} GCYB`}</TextTable>
                </Tooltip>
              </Table.TextCell>
            </Table.Row>
          );
        });
    } else {
      rowTableEvangelists = Object.keys(data)
        .filter(keys => parseInt(data[keys].status, 10) !== 1)
        .sort((a, b) => {
          const x = a.amount;
          const y = b.amount;
          return x - y;
        })
        .map(key => {
          return (
            <Table.Row
              borderBottom="none"
              key={key}
              display="flex"
              marginBottom={10}
              minHeight="48px"
              height="fit-content"
              paddingY={5}
              paddingX={5}
            >
              <Table.TextCell flex={1.5} textAlign="start">
                <TextTable>
                  <Link
                    style={{ marginRight: '5px' }}
                    to={`/network/bostrom/contract/${data[key].cyberAddress}`}
                  >
                    {data[key].nickname}
                  </Link>
                  <LinkWindow
                    to={`https://www.mintscan.io/account/${data[key].cosmosAddress}`}
                  >
                    <img
                      alt="cosmos"
                      src={cosmos}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </LinkWindow>
                  <LinkWindow
                    to={`https://etherscan.io/address/${data[key].ethereumAddress}`}
                  >
                    <img
                      alt="eth"
                      src={eth}
                      style={{ width: '20px', height: '20px', margin: '0 2px' }}
                    />
                  </LinkWindow>
                  <LinkWindow to={`http://github.com/${data[key].github}`}>
                    <img
                      alt="gitLogo"
                      src={gitLogo}
                      style={{ width: '20px', height: '20px', margin: '0 2px' }}
                    />
                  </LinkWindow>
                  <LinkWindow to={`https://keybase.io/${data[key].keybase}`}>
                    <img
                      alt="keybase"
                      src={keybase}
                      style={{ width: '20px', height: '20px', margin: '0 2px' }}
                    />
                  </LinkWindow>
                </TextTable>
              </Table.TextCell>
              <Table.TextCell textAlign="end">
                <TextTable>0 ATOMs</TextTable>
              </Table.TextCell>
              <Table.TextCell textAlign="end">
                <Tooltip
                  position="bottom"
                  content={`${formatNumber(
                    Math.floor(data[key].golRewards)
                  )} CYB`}
                >
                  <TextTable>
                    {formatCurrency(data[key].golRewards, 'CYB')}
                  </TextTable>
                </Tooltip>
              </Table.TextCell>
              <Table.TextCell textAlign="end">
                <TextTable>{data[key].karma}</TextTable>
              </Table.TextCell>
            </Table.Row>
          );
        });
    }

    if (blessed) {
      header = (
        <>
          <Table.TextHeaderCell flex={1.5} textAlign="center">
            <TextTable>Evangelist</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>Donations brought</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>ATOM Rewards</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>CYB rewards</TextTable>
          </Table.TextHeaderCell>
        </>
      );
    } else {
      header = (
        <>
          <Table.TextHeaderCell flex={1.5} textAlign="center">
            <TextTable>Evangelist</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>Donations brought</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>GOL rewards</TextTable>
          </Table.TextHeaderCell>
          <Table.TextHeaderCell textAlign="center">
            <TextTable>Karma</TextTable>
          </Table.TextHeaderCell>
        </>
      );
    }

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
          {header}
        </Table.Head>
        <Table.Body
          style={{
            backgroundColor: '#000',
            overflowY: 'hidden',
            padding: 7,
          }}
        >
          {rowTableEvangelists.length > 0 ? (
            rowTableEvangelists
          ) : (
            <Noitem text="No Evangelists" />
          )}
        </Table.Body>
      </Table>
    );
  } catch (error) {
    return <div>oops..</div>;
  }
}

export default TableEvangelists;
