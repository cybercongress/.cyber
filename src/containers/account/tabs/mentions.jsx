import React from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import TableLink from './tableLink';
import { Loading } from '../../../components';

const GET_CHARACTERS = gql`
  subscription MyQuery2($accountUser: String) {
    cyberlink(
      where: {
        _or: [
          { object_from: { _eq: $accountUser } }
          { object_to: { _eq: $accountUser } }
        ]
      }
    ) {
      object_from
      object_to
      subject
      timestamp
      txhash
    }
  }
`;

export default function GetMentions({ accountUser }) {
  const { loading, error, data: dataLink } = useSubscription(GET_CHARACTERS, {
    variables: { accountUser },
  });

  if (error) {
    return `Error! ${error.message}`;
  }

  console.log('data wss', dataLink);

  return (
    <div>
      {loading ? (
        <div className="container-loading">
          <Loading />
        </div>
      ) : (
        <TableLink accountUser={accountUser} data={dataLink.cyberlink} />
        // <div>ok</div>
      )}
    </div>
  );
}
