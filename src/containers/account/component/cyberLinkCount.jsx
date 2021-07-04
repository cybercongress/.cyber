import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Loading, Dots } from '../../../components';
import { formatNumber } from '../../../utils/utils';

function CyberLinkCount({ accountUser }) {
  try {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const GET_CHARACTERS = gql`
   query cyberlink {
    cyberlinks_aggregate(where: {subject: {_eq: "${accountUser}"}}) {
      aggregate {
        count
      }
    }
  }
  `;
    const { loading: loadingQ, error, data } = useQuery(GET_CHARACTERS);

    useEffect(() => {
      if (!loadingQ) {
        if (
          data &&
          data.cyberlinks_aggregate.aggregate.count &&
          data.cyberlinks_aggregate.aggregate.count > 0
        ) {
          setCount(data.cyberlinks_aggregate.aggregate.count);
          setLoading(false);
        } else {
          setCount(0);
          setLoading(false);
        }
      }
    }, [data, loadingQ]);

    if (loading) {
      return <Dots />;
    }

    return count;
  } catch (error) {
    console.warn(error);
    return '∞';
  }
}

export default CyberLinkCount;
