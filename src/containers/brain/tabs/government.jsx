import React from 'react';
import { Link } from 'react-router-dom';
import { Pane, Icon } from '@cybercongress/gravity';
import { CardStatisics, LinkWindow } from '../../../components';
import { formatNumber } from '../../../utils/utils';
import { CYBER } from '../../../utils/config';

function GovernmentTab({
  communityPool,
  proposals,
  activeValidatorsCount,
  stakedCyb,
  inlfation,
}) {
  try {
    return (
      <>
        <CardStatisics
          title={`Community pool, ${CYBER.DENOM_CYBER.toLocaleUpperCase()}`}
          value={formatNumber(communityPool)}
        />
        <Link to="/governance">
          <CardStatisics
            title="Proposals"
            value={formatNumber(proposals)}
            link
          />
        </Link>
        <Link to="/network/bostrom/parameters">
          <CardStatisics title="Network parameters" value={30} link />
        </Link>
        {/* <Link
          to="/heroes"
          style={{
            display: 'contents',
            textDecoration: 'none',
          }}
        >
          <CardStatisics title="Heroes" value={activeValidatorsCount} link />
        </Link> */}
        {/* <CardStatisics
          title="% of staked EUL"
          value={formatNumber(stakedCyb * 100, 3)}
        /> */}
        <LinkWindow to="https://mainnet.aragon.org/#/eulerfoundation/home/">
          <CardStatisics
            // title="Homestead"
            styleContainer={{
              justifyContent: 'center',
              padding: '65px 0',
              fontSize: '26px',
            }}
            styleTitle={{ fontSize: '26px' }}
            title="Euler Foundation"
            link
          />
        </LinkWindow>
      </>
    );
  } catch (error) {
    console.log(error);
    return <div>oops...</div>;
  }
}

export default GovernmentTab;
