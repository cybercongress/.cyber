import React from 'react';
import { Pane } from '@cybercongress/gravity';
import { CardStatisics, Vitalik } from '../../../components';
import { formatNumber, formatCurrency, dhm } from '../../../utils/utils';

function ParamEnergy({ data }) {
  try {
    return (
      <Pane
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gridGap="20px"
      >
        <CardStatisics title="max slots" value={parseFloat(data.max_slots)} />
        <CardStatisics
          title="base vesting time"
          value={dhm(data.base_vesting_time * 1000)}
        />
        <CardStatisics
          title="base vesting resource"
          value={formatCurrency(
            parseFloat(data.base_vesting_resource.amount),
            data.base_vesting_resource.denom
          )}
        />
      </Pane>
    );
  } catch (error) {
    console.warn('ParamEnergy', error);
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

export default ParamEnergy;
