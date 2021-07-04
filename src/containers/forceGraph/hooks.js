import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
// import { useSubscription } from '@apollo/react-hooks';
import QUERY_GET_FOLLOWERS from './query';
import getIndexdDb from './utils';

const useGetDataGql = (nodeIpfs) => {
  const { data: dataGql, loading: loadingGql } = useQuery(QUERY_GET_FOLLOWERS);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!loadingGql && nodeIpfs !== null) {
      if (dataGql !== null && dataGql.cyberlinks) {
        const { cyberlinks } = dataGql;

        cyberlinks.forEach(async (item) => {
          const response = await getIndexdDb(item.object_to, nodeIpfs);
          if (response && response !== null) {
            setData((itemData) => [
              ...itemData,
              {
                to: response,
                subject: item.subject,
                txhash: item.transaction_hash,
              },
            ]);
          }
        });
      }
    }
  }, [dataGql, loadingGql, nodeIpfs]);

  return { data };
};

export default useGetDataGql;
