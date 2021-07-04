import React from 'react';
import gql from 'graphql-tag';
import { useSubscription, useQuery } from '@apollo/react-hooks';
import { Pane, Tooltip } from '@cybercongress/gravity';
import { NoItems } from '../../components';

function Burden({ accountUser }) {
  const GET_CHARACTERS = gql`
  query all_by_subject {
    pre_commit(where: {validator: {consensus_pubkey: {_eq: "${accountUser}"}}}, limit: 1) {
      validator {
        blocks(order_by: {height: desc}, limit: 300) {
          height
        }
      }
    }
    block_aggregate(limit: 300, order_by: {height: desc}) {
      nodes {
        height
      }
    }
  }
`;
  const { loading, error, data } = useQuery(GET_CHARACTERS);

  if (loading) {
    return 'Loading...';
  }
  if (error) {
    return `Error! ${error.message}`;
  }
  console.log(data);

  const blockAggregate = data.block_aggregate.nodes;
  const preCommit = data.pre_commit[0].validator.blocks;
  const block = [];

  if (Object.keys(preCommit).length !== 0) {
    Object.keys(blockAggregate).forEach(key => {
      if (blockAggregate[key].height - 1 === preCommit[key].height) {
        block.push({
          status: true,
          height: blockAggregate[key].height,
        });
      } else {
        block.push({
          status: false,
          height: blockAggregate[key].height,
        });
      }
    });
  }

  const blocks = block.map((item, index) => (
    <Tooltip position="bottom" content={item.height}>
      <Pane
        width="25px"
        height="15px"
        backgroundColor={item.status ? '#009624' : '#9b0000'}
        boxShadow="inset 0 0 0px 1px #000"
        key={index}
      />
    </Tooltip>
  ));

  return (
    <div>
      Last 300 blocks
      {block.length > 0 ? (
        <Pane
          display="grid"
          gridTemplateColumns="repeat(auto-fill, 25px)"
          width="100%"
        >
          {blocks}
        </Pane>
      ) : (
        <NoItems text="No preCommit" />
      )}
    </div>
  );
}

export default Burden;
