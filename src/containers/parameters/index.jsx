import React, { useEffect, useState } from 'react';
import { Tablist, Tab, Pane, Text } from '@cybercongress/gravity';
import { Route, Link } from 'react-router-dom';
import { getParamNetwork } from '../../utils/search/utils';
import { Loading } from '../../components';
import {
  BandwidthParam,
  SlashingParam,
  GovParam,
  DistributionParam,
  StakingParam,
  RankParam,
  InlfationParam,
  ParamEnergy,
} from './tabs';

const TabBtn = ({ text, isSelected, onSelect, to }) => (
  <Link to={to}>
    <Tab
      key={text}
      isSelected={isSelected}
      onSelect={onSelect}
      paddingX={10}
      paddingY={20}
      marginX={3}
      borderRadius={4}
      color="#36d6ae"
      boxShadow="0px 0px 5px #36d6ae"
      fontSize="16px"
      whiteSpace="nowrap"
      width="100%"
    >
      {text}
    </Tab>
  </Link>
);

const initParam = {
  staking: null,
  slashing: null,
  distribution: null,
  bandwidth: null,
  gov: null,
  rank: null,
  inlfation: null,
  energy: null,
};

function ParamNetwork({ location }) {
  const [selected, setSelected] = useState('bandwidth');
  const [dataParam, setDataParam] = useState(initParam);
  const [loading, setLoading] = useState(true);

  const chekPathname = () => {
    const { pathname } = location;

    if (pathname.match(/staking/gm) && pathname.match(/staking/gm).length > 0) {
      setSelected('staking');
    } else if (
      pathname.match(/slashing/gm) &&
      pathname.match(/slashing/gm).length > 0
    ) {
      setSelected('slashing');
    } else if (
      pathname.match(/distribution/gm) &&
      pathname.match(/distribution/gm).length > 0
    ) {
      setSelected('distribution');
    } else if (pathname.match(/gov/gm) && pathname.match(/gov/gm).length > 0) {
      setSelected('gov');
    } else if (
      pathname.match(/rank/gm) &&
      pathname.match(/rank/gm).length > 0
    ) {
      setSelected('rank');
    } else if (
      pathname.match(/inlfation/gm) &&
      pathname.match(/inlfation/gm).length > 0
    ) {
      setSelected('inlfation');
    } else if (
      pathname.match(/energy/gm) &&
      pathname.match(/energy/gm).length > 0
    ) {
      setSelected('energy');
    } else {
      setSelected('bandwidth');
    }
  };

  useEffect(() => {
    chekPathname();
    const feachData = async () => {
      const response = await getParamNetwork();
      console.log('response Param', response);
      if (response !== null) {
        setDataParam(response);
      }
      setLoading(false);
    };
    feachData();
  }, []);

  useEffect(() => {
    chekPathname();
  }, [location.pathname]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Loading />
      </div>
    );
  }

  let content;

  if (selected === 'bandwidth') {
    content = <BandwidthParam data={dataParam.bandwidth} />;
  }

  if (selected === 'slashing') {
    content = (
      <Route
        path="/network/bostrom/parameters/slashing"
        render={() => <SlashingParam data={dataParam.slashing} />}
      />
    );
  }

  if (selected === 'staking') {
    content = (
      <Route
        path="/network/bostrom/parameters/staking"
        render={() => <StakingParam data={dataParam.staking} />}
      />
    );
  }

  if (selected === 'distribution') {
    content = (
      <Route
        path="/network/bostrom/parameters/distribution"
        render={() => <DistributionParam data={dataParam.distribution} />}
      />
    );
  }

  if (selected === 'gov') {
    content = (
      <Route
        path="/network/bostrom/parameters/gov"
        render={() => <GovParam data={dataParam.gov} />}
      />
    );
  }

  if (selected === 'rank') {
    content = (
      <Route
        path="/network/bostrom/parameters/rank"
        render={() => <RankParam data={dataParam.rank} />}
      />
    );
  }

  if (selected === 'inlfation') {
    content = (
      <Route
        path="/network/bostrom/parameters/inlfation"
        render={() => <InlfationParam data={dataParam.inlfation} />}
      />
    );
  }

  if (selected === 'energy') {
    content = (
      <Route
        path="/network/bostrom/parameters/energy"
        render={() => <ParamEnergy data={dataParam.energy} />}
      />
    );
  }

  return (
    <main className="block-body">
      <Pane
        boxShadow="0px 0px 5px #36d6ae"
        paddingX={20}
        paddingY={20}
        marginY={20}
      >
        <Text fontSize="16px" color="#fff">
          Parametrs are adjastable by the consensus. Everybody can propose
          change the parametrs to different value.
        </Text>
      </Pane>
      <Tablist
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(110px, 0.5fr))"
        gridGap="10px"
      >
        <TabBtn
          text="Staking"
          isSelected={selected === 'staking'}
          to="/network/bostrom/parameters/staking"
        />
        <TabBtn
          text="Slashing"
          isSelected={selected === 'slashing'}
          to="/network/bostrom/parameters/slashing"
        />
        <TabBtn
          text="Distribution"
          isSelected={selected === 'distribution'}
          to="/network/bostrom/parameters/distribution"
        />
        <TabBtn
          text="Bandwidth"
          isSelected={selected === 'bandwidth'}
          to="/network/bostrom/parameters"
        />
        <TabBtn
          text="Governance"
          isSelected={selected === 'gov'}
          to="/network/bostrom/parameters/gov"
        />
        <TabBtn
          text="Rank"
          isSelected={selected === 'rank'}
          to="/network/bostrom/parameters/rank"
        />
        <TabBtn
          text="Inlfation"
          isSelected={selected === 'inlfation'}
          to="/network/bostrom/parameters/inlfation"
        />
        <TabBtn
          text="Energy"
          isSelected={selected === 'energy'}
          to="/network/bostrom/parameters/energy"
        />
      </Tablist>
      <Pane
        display="flex"
        marginTop={20}
        marginBottom={50}
        justifyContent="center"
        flexDirection="column"
      >
        {content}
      </Pane>
    </main>
  );
}

export default ParamNetwork;
