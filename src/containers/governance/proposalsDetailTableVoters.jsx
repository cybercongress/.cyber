import React from 'react';
import { Link } from 'react-router-dom';
import { Pane, Text, TableEv as Table } from '@cybercongress/gravity';
import {
  IconStatus,
  ContainerPane,
  Item,
  Legend,
  Account,
} from '../../components';

const ProposalsIdDetailTableVoters = ({ votes, data, ...props }) => {
  const { yes, abstain, no, noWithVeto } = votes;

  const rowsTable = data.map(item => (
    <Table.Row
      borderBottom="none"
      paddingLeft={20}
      height={50}
      // isSelectable
      key={item.voter}
    >
      <Table.TextCell>
        <Text color="#fff">
          <Account address={item.voter} />
          {/* <Link to={`/network/bostrom/contract/${item.voter}`}>{item.voter}</Link> */}
        </Text>
      </Table.TextCell>
      <Table.TextCell>
        <Text color="#fff">{item.option}</Text>
      </Table.TextCell>
    </Table.Row>
  ));

  return (
    <Pane>
      <Pane
        display="flex"
        height={70}
        alignItems="center"
        paddingLeft={20}
        justifyContent="space-between"
      >
        <Text fontSize="18px" color="#fff">
          Voters
        </Text>
        <Pane display="flex">
          <Legend color="#3ab793" marginRight={20} text={`Yes: ${yes}`} />
          <Legend
            color="#ccdcff"
            marginRight={20}
            text={`Abstain: ${abstain}`}
          />
          <Legend color="#ffcf65" marginRight={20} text={`No: ${no}`} />
          <Legend color="#fe8a8a" text={`NoWithVeto: ${noWithVeto}`} />
        </Pane>
      </Pane>
      <ContainerPane>
        <Table>
          <Table.Head
            style={{
              backgroundColor: '#000',
              borderBottom: '1px solid #ffffff80',
            }}
            paddingLeft={20}
          >
            <Table.TextHeaderCell>
              <Text color="#fff" fontSize="17px">
                Voter
              </Text>
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>
              <Text color="#fff" fontSize="17px">
                Vote Option
              </Text>
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {rowsTable}
          </Table.Body>
        </Table>
      </ContainerPane>
    </Pane>
  );
};

export default ProposalsIdDetailTableVoters;
