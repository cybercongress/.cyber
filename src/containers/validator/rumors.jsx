import React from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import TableTxs from '../account/component/tableTxs';
import { Loading } from '../../components';

function Rumors({ accountUser }) {
  const GET_CHARACTERS = gql`
    subscription getRumors {
      transaction(
        order_by: { height: desc }
        where: {
          _and: [
            {
              messagesByTransactionHash: {
                type: {
                  _in: [
                    "cosmos.staking.v1beta1.MsgDelegate"
                    "cosmos.staking.v1beta1.MsgUndelegate"
                  ]
                }
              }
            }
            {
              messagesByTransactionHash: {
                value: {
                  _contains: {
                    validator_address: "${accountUser}"
                  }
                }
              }
            }
          ]
        }
      ) {
        messages
        success
        hash
        height
      }
    }
  `;
  const { loading, error, data: dataTxs } = useSubscription(GET_CHARACTERS);

  if (error) {
    return `Error! ${error.message}`;
  }

  console.log('data wss', dataTxs);

  return (
    <div>
      {loading ? (
        <div className="container-loading">
          <Loading />
        </div>
      ) : (
        <TableTxs accountUser={accountUser} amount data={dataTxs.transaction} />
      )}
    </div>
  );
}

export default Rumors;
