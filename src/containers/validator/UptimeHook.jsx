import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Loading, Dots } from '../../components';
import { formatNumber } from '../../utils/utils';

function useUptime({ accountUser }) {
  try {
    const GET_CHARACTERS = gql`
    query uptime {
      pre_commit(where: {validator: {consensus_pubkey: {_eq: "${accountUser}"}}}, limit: 1) {
        validator {
          blocks(order_by: {height: asc}, limit: 1) {
            height
          }
        }
      }
      pre_commit_aggregate(where: {validator: {consensus_pubkey: {_eq: "${accountUser}"}}}) {
        aggregate {
          count
        }
      }
      block_aggregate(limit: 1, order_by: {height: desc}) {
        nodes {
          height
        }
      }
    }
  `;

    const { loading, error, data } = useQuery(GET_CHARACTERS);

    if (loading) {
      return <Dots />;
    }

    let uptime = 0;

    console.log('data', data);

    if (data !== undefined) {
      if (
        Object.keys(data.pre_commit).length !== 0 &&
        Object.keys(data.pre_commit_aggregate).length !== 0 &&
        Object.keys(data.block_aggregate).length !== 0
      ) {
        const thisBlock = data.block_aggregate.nodes[0].height;
        const firstPreCommit = data.pre_commit[0].validator.blocks[0].height;
        const countPreCommit = data.pre_commit_aggregate.aggregate.count;
        uptime = countPreCommit / (thisBlock - firstPreCommit);
      }
    }

    return `${formatNumber(uptime * 100, 2)} %`;
  } catch (error) {
    console.warn(error);
    return '∞';
  }
}

export default useUptime;
