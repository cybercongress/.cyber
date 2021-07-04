/* eslint-disable no-restricted-syntax */
import { useState, useEffect } from 'react';
import finalResultGoL from '../../../utils/finalResultGoL';

function setLeaderboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    const resultGolData = finalResultGoL;
    Object.keys(resultGolData).sort(
      (a, b) => finalResultGoL[b].sum - finalResultGoL[a].sum
    );
    setData(resultGolData);
  }, []);

  return { data };
}

export default setLeaderboard;
