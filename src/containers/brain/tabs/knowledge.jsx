import React from 'react';
import { Link } from 'react-router-dom';
import { Pane, Icon } from '@cybercongress/gravity';
import { CardStatisics } from '../../../components';
import { formatNumber } from '../../../utils/utils';
import Txs from '../tx';
import AccountCount from '../accountCount';

function KnowledgeTab({ linksCount, cidsCount, accountsCount, inlfation }) {
  try {
    return (
      <>
        <Link to="/graph">
          <CardStatisics
            title="Cyberlinks"
            link
            value={formatNumber(linksCount)}
          />
        </Link>
        <CardStatisics title="Objects" value={formatNumber(cidsCount)} link />

        <CardStatisics title="Subjects" value={<AccountCount />} />

        <Link to="/network/bostrom/tx">
          <CardStatisics title="Transactions" value={<Txs />} link />
        </Link>
        <CardStatisics
          title="Inflation"
          value={`${formatNumber(inlfation * 100, 2)} %`}
        />
      </>
    );
  } catch (error) {
    console.log(error);
    return <div>oops...</div>;
  }
}

export default KnowledgeTab;
