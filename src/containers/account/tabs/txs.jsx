import React from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import TableTxs from '../component/tableTxs';
import { Dots } from '../../../components';

/*
  subscription MyQuery {
    transaction(order_by: {block: {height: desc}}, where: {_or: [{
      subject: {_eq: "${accountUser}"}}, 
      {messagesByTxhash: {value: 
        {_contains: {to_address: "${accountUser}"}
      }}}]}
    ) {
      txhash
      code
      timestamp
      subject
      messages
    }
  }
*/

export default function GetTxs({ accountUser }) {
  const GET_CHARACTERS = gql`
    subscription MyQuery {
      _transaction(
        order_by: { height: desc }
        where: {
          _or: [
            {
              subject1: {
                _eq: "bostrom1p0r7uxstcw8ehrwuj4kn8qzzs0yypsjwxgd445"
              }
            }
            {
              subject2: {
                _eq: "bostrom1p0r7uxstcw8ehrwuj4kn8qzzs0yypsjwxgd445"
              }
            }
          ]
        }
      ) {
        hash
        height
        memo
        type
        success
        messages
      }
    }
  `;
  const { loading, error, data: dataTxs } = useSubscription(GET_CHARACTERS);

  if (error) {
    return `Error! ${error.message}`;
  }

  if (loading) {
    return <Dots />;
  }

  console.log('data wss', dataTxs);

  const { _transaction: transaction } = dataTxs;

  return (
    <div>
      {loading ? (
        <div className="container-loading">
          <Dots />
        </div>
      ) : (
        <TableTxs accountUser={accountUser} data={transaction} />
      )}
    </div>
  );
}
