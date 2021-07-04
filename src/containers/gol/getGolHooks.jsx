import { useEffect, useState } from 'react';
import finalResultGoL from '../../utils/finalResultGoL';
import { fromBech32 } from '../../utils/utils';

function useGetGol(address) {
  const [resultGol, setResultGol] = useState({
    comm_pool: 0,
    delegation: 0,
    'euler-4': 0,
    lifetime: 0,
    load: 0,
    relevance: 0,
    takeoff: 0,
    sum: 0,
  });
  const [totalGol, setTotalGol] = useState(0);

  useEffect(() => {
    if (address && address !== null) {
      const cyberAddress = fromBech32(address, 'cyber');
      if (Object.prototype.hasOwnProperty.call(finalResultGoL, cyberAddress)) {
        const resultGolData = finalResultGoL[cyberAddress];
        setResultGol(resultGolData);
        setTotalGol(resultGolData.sum);
      } else {
        setTotalGol(0);
        setResultGol({
          comm_pool: 0,
          delegation: 0,
          'euler-4': 0,
          lifetime: 0,
          load: 0,
          relevance: 0,
          takeoff: 0,
          sum: 0,
        });
      }
    }
  }, [address]);

  return { totalGol, resultGol };
}

export default useGetGol;
