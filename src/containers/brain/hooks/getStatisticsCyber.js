import { useEffect, useState, useContext } from 'react';
import { getInlfation } from '../../../utils/search/utils';
import { getProposals } from '../../../utils/governance';
import { AppContext } from '../../../context';
import { coinDecimals } from '../../../utils/utils';

function useGetStatisticsCyber() {
  const { jsCyber } = useContext(AppContext);
  const [knowledge, setKnowledge] = useState({
    linksCount: 0,
    cidsCount: 0,
    accountsCount: 0,
    inlfation: 0,
    stakedCyb: 0,
    activeValidatorsCount: 0,
  });
  const [government, setGovernment] = useState({
    proposals: 0,
    communityPool: 0,
  });

  useEffect(() => {
    const getGovernment = async () => {
      if (jsCyber !== null) {
        let communityPool = 0;
        let proposals = 0;

        const dataCommunityPool = await jsCyber.communityPool();
        const { pool } = dataCommunityPool;
        if (dataCommunityPool !== null) {
          communityPool = coinDecimals(Math.floor(parseFloat(pool[0].amount)));
        }

        const dataProposals = await getProposals();
        if (dataProposals !== null && dataProposals.length > 0) {
          proposals = dataProposals[dataProposals.length - 1].id;
        }

        setGovernment({ proposals, communityPool });
      }
    };
    getGovernment();
  }, [jsCyber]);

  useEffect(() => {
    const getStatisticsBrain = async () => {
      if (jsCyber !== null) {
        const totalCyb = {};
        let stakedCyb = 0;
        let inlfation = 0;

        const responseGraphStats = await jsCyber.graphStats();
        const { cids, links } = responseGraphStats;
        setKnowledge((item) => ({
          ...item,
          linksCount: links,
          cidsCount: cids,
        }));

        const responseHeroesActive = await jsCyber.validators(
          'BOND_STATUS_BONDED'
        );
        const { validators } = responseHeroesActive;
        setKnowledge((item) => ({
          ...item,
          activeValidatorsCount: validators.length,
        }));

        const datagetTotalSupply = await jsCyber.totalSupply();
        if (Object.keys(datagetTotalSupply).length > 0) {
          datagetTotalSupply.forEach((item) => {
            totalCyb[item.denom] = parseFloat(item.amount);
          });
        }

        if (totalCyb.boot && totalCyb.sboot) {
          const { boot, sboot } = totalCyb;
          stakedCyb = sboot / boot;
        }
        setKnowledge((item) => ({
          ...item,
          stakedCyb,
        }));

        const dataInlfation = await getInlfation();
        if (dataInlfation !== null) {
          inlfation = dataInlfation;
        }
        setKnowledge((item) => ({
          ...item,
          inlfation,
        }));
      }
    };
    getStatisticsBrain();
  }, [jsCyber]);

  return {
    government,
    knowledge,
  };
}

export default useGetStatisticsCyber;
