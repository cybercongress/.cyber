import React from 'react';
import { Pane } from '@cybercongress/gravity';
import { CardStatisics, Vitalik } from '../../../components';
import { formatNumber, formatCurrency } from '../../../utils/utils';
import { dhm } from '../../../utils/utils';

const NS_TO_MS = 1 * 10 ** 6;

function GovParam({ data }) {
  try {
    return (
      <Pane
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gridGap="20px"
      >
        <CardStatisics
          title="quorum"
          value={`${parseFloat(data.voting.quorum) * 100} %`}
        />
        <CardStatisics
          title="threshold"
          value={`${parseFloat(data.voting.threshold) * 100} %`}
        />
        <CardStatisics
          title="veto"
          value={`${parseFloat(data.voting.veto_threshold) * 100} %`}
        />
        <CardStatisics
          title="min deposit"
          value={formatCurrency(
            parseFloat(data.deposit.min_deposit[0].amount),
            data.deposit.min_deposit[0].denom
          )}
        />
        <CardStatisics
          title="max deposit period"
          value={dhm(parseFloat(data.deposit.max_deposit_period / NS_TO_MS))}
        />
        <CardStatisics
          title="voting period"
          value={dhm(parseFloat(data.tallying.voting_period / NS_TO_MS))}
        />
      </Pane>
    );
  } catch (error) {
    console.warn('BandwidthParam', error);
    return (
      <Pane
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        display="flex"
      >
        <Vitalik />
        Error !
      </Pane>
    );
  }
}

export default GovParam;
