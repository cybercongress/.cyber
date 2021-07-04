import React from 'react';
import { Pane, Text, TableEv as Table } from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import { LinkWindow } from '../../components';
import RowTable from './components/row';
import useGetGol from './getGolHooks';
import { formatNumber } from '../../utils/utils';

const TableDiscipline = ({ address }) => {
  const { resultGol } = useGetGol(address);

  try {
    return (
      <Pane marginTop={15} width="100%">
        <Table>
          <Table.Head
            style={{
              backgroundColor: '#000',
              borderBottom: '1px solid #ffffff80',
              paddingBottom: '15px',
              height: 'auto',
            }}
          >
            <Table.TextHeaderCell textAlign="center">
              <Text fontSize="16px" color="#fff">
                Discipline
              </Text>
            </Table.TextHeaderCell>
            <Table.TextHeaderCell textAlign="center">
              <Text fontSize="18px" color="#fff">
                CYB won
              </Text>
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body
            style={{
              backgroundColor: '#000',
              overflowY: 'hidden',
              padding: 7,
            }}
          >
            <RowTable
              text="takeoff"
              cybWon={formatNumber(Math.floor(resultGol.takeoff))}
            />
            <RowTable
              text="relevance"
              cybWon={formatNumber(Math.floor(resultGol.relevance))}
            />
            <RowTable
              text="load"
              cybWon={formatNumber(Math.floor(resultGol.load))}
            />
            <RowTable
              text="delegation"
              cybWon={formatNumber(Math.floor(resultGol.delegation))}
            />
            <RowTable
              text="lifetime"
              cybWon={formatNumber(Math.floor(resultGol.lifetime))}
            />
            <RowTable
              text="euler 4 rewards"
              cybWon={formatNumber(Math.floor(resultGol['euler-4']))}
            />
            <RowTable text="full validator set" cybWon={0} />
            <RowTable
              text="community pool"
              cybWon={formatNumber(Math.floor(resultGol.comm_pool))}
            />
            <RowTable
              text="total"
              cybWon={formatNumber(Math.floor(resultGol.sum))}
            />
          </Table.Body>
        </Table>
      </Pane>
    );
  } catch (error) {
    return <div>oops</div>;
  }
};

export default TableDiscipline;
