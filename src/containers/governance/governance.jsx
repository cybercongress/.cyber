import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pane, ActionBar } from '@cybercongress/gravity';
import { connect } from 'react-redux';
import ActionBarContainer from './actionBarContainer';
import { getProposals, getMinDeposit } from '../../utils/governance';
import Columns from './components/columns';
import { AcceptedCard, ActiveCard, RejectedCard } from './components/card';
import { Card, ContainerCard } from '../../components';
import { CYBER } from '../../utils/config';
import { formatNumber } from '../../utils/utils';
import { getcommunityPool } from '../../utils/search/utils';

const dateFormat = require('dateformat');

const Statistics = ({ communityPoolCyber }) => (
  <ContainerCard styles={{ alignItems: 'center' }} col="1">
    <Card
      title={`Community pool, ${CYBER.DENOM_CYBER.toUpperCase()}`}
      value={formatNumber(communityPoolCyber)}
      // tooltipValue="The number of the total ETH, currently, raised"
      positionTooltip="bottom"
    />
  </ContainerCard>
);

function Governance({ defaultAccount }) {
  const [tableData, setTableData] = useState([]);
  const [minDeposit, setMinDeposit] = useState(0);
  const [communityPoolCyber, steCommunityPoolCyber] = useState(0);
  const [account, steAccount] = useState(null);

  useEffect(() => {
    feachCommunityPool();
    feachMinDeposit();
    feachProposals();
  }, []);

  useEffect(() => {
    if (
      defaultAccount.account !== null &&
      defaultAccount.account.cyber &&
      defaultAccount.account.cyber.keys !== 'read-only'
    ) {
      steAccount(defaultAccount.account.cyber);
    } else {
      steAccount(null);
    }
  }, [defaultAccount.name]);

  const feachMinDeposit = async () => {
    const responseMinDeposit = await getMinDeposit();

    if (responseMinDeposit !== null) {
      setMinDeposit(parseFloat(responseMinDeposit.min_deposit[0].amount));
    }
  };

  const feachCommunityPool = async () => {
    const responseCommunityPool = await getcommunityPool();

    if (responseCommunityPool !== null) {
      steCommunityPoolCyber(Math.floor(responseCommunityPool[0].amount));
    }
  };

  const feachProposals = async () => {
    const responseProposals = await getProposals();
    if (responseProposals !== null) {
      setTableData(responseProposals);
    }
  };
console.log('tableData', tableData)
  const active = tableData
    .reverse()
    .filter(
      (item) =>
        item.proposal_status !== 'Passed' && item.proposal_status !== 'Rejected'
    )
    .map((item) => (
      <Link
        key={item.id}
        style={{ color: 'unset' }}
        to={`/governance/${item.id}`}
      >
        <ActiveCard
          key={item.id}
          id={item.id}
          name={item.content.value.title}
          minDeposit={minDeposit}
          totalDeposit={item.total_deposit}
          type={item.content.type}
          state={item.proposal_status}
          timeEndDeposit={dateFormat(
            new Date(item.deposit_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
          timeEndVoting={dateFormat(
            new Date(item.voting_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
          amount={item.total_deposit[0]}
        />
      </Link>
    ));

  const accepted = tableData
    .filter((item) => item.proposal_status === 'Passed')
    .map((item) => (
      <Link
        key={item.id}
        style={{ color: 'unset' }}
        to={`/governance/${item.id}`}
      >
        <AcceptedCard
          key={item.id}
          id={item.id}
          name={item.content.value.title}
          votes={item.final_tally_result}
          type={item.content.type}
          amount={item.total_deposit[0]}
          timeEnd={dateFormat(
            new Date(item.voting_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
        />
      </Link>
    ));

  const rejected = tableData
    .reverse()
    .filter((item) => item.proposal_status === 'Rejected')
    .map((item) => (
      <Link
        key={item.id}
        style={{ color: 'unset' }}
        to={`/governance/${item.id}`}
      >
        <RejectedCard
          key={item.id}
          id={item.id}
          name={item.content.value.title}
          votes={item.final_tally_result}
          type={item.content.type}
          amount={item.total_deposit[0]}
          timeEnd={dateFormat(
            new Date(item.voting_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
        />
      </Link>
    ));

  return (
    <div>
      <main className="block-body">
        <Statistics communityPoolCyber={communityPoolCyber} />
        <Pane
          display="grid"
          justifyItems="center"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gridGap="20px"
        >
          <Columns title="Active">{active}</Columns>
          <Columns title="Accepted">{accepted}</Columns>
          <Columns title="Rejected">{rejected}</Columns>
        </Pane>
      </main>
      {account !== null ? (
        <ActionBarContainer account={account} update={feachProposals} />
      ) : (
        <ActionBar>
          <Pane>
            <Link
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                display: 'block',
              }}
              className="btn"
              to="/pocket"
            >
              add address to your pocket
            </Link>
          </Pane>
        </ActionBar>
      )}
    </div>
  );
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    defaultAccount: store.pocket.defaultAccount,
  };
};

export default connect(mapStateToProps)(Governance);
