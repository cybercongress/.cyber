import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, Route, useLocation } from 'react-router-dom';
import { Text, Pane, Tablist } from '@cybercongress/gravity';
import { LinkWindow, TabBtn } from '../../components';
import TableDiscipline from './table';

import ActionBarContainer from './actionBarContainer';
import LoadTab from './tab/loadTab';
import { setGolTakeOff } from '../../redux/actions/gol';
import setLeaderboard from './hooks/leaderboard';

import { WP } from '../../utils/config';

function GOL({ setGolTakeOffProps, mobile, defaultAccount, block }) {
  const { data: dataLeaderboard } = setLeaderboard();
  const location = useLocation();
  const [selected, setSelected] = useState('disciplines');
  const [address, setAddress] = useState(null);
  const [addAddress, setAddAddress] = useState(false);

  useEffect(() => {
    chekPathname();
  }, [location.pathname]);

  useEffect(() => {
    checkAddressLocalStorage();
  }, [defaultAccount.name]);

  const chekPathname = () => {
    const { pathname } = location;

    if (
      pathname.match(/leaderboard/gm) &&
      pathname.match(/leaderboard/gm).length > 0
    ) {
      setSelected('leaderboard');
    } else if (
      pathname.match(/content/gm) &&
      pathname.match(/content/gm).length > 0
    ) {
      setSelected('content');
    } else {
      setSelected('disciplines');
    }
  };

  const checkAddressLocalStorage = async () => {
    const { account } = defaultAccount;
    if (
      account !== null &&
      Object.prototype.hasOwnProperty.call(account, 'cyber')
    ) {
      setAddAddress(false);
      setAddress(account.cyber.bech32);
    } else {
      setAddAddress(true);
      // setLoading(false);
    }
  };

  let content;

  if (selected === 'leaderboard') {
    content = (
      <Route
        path="/gol/leaderboard"
        render={() => <LoadTab data={dataLeaderboard} />}
      />
    );
  }

  if (selected === 'disciplines') {
    content = <TableDiscipline address={address} />;
  }

  return (
    <div>
      <main
        // style={{ justifyContent: 'space-between' }}
        className="block-body"
      >
        <Pane
          borderLeft="3px solid #3ab793e3"
          paddingY={0}
          paddingLeft={20}
          paddingRight={5}
          marginY={5}
        >
          <Pane>Looking back, important things feel obvious.</Pane>
          <Pane>
            It takes phenomenal talent and incredible will to see them from
            afar.
          </Pane>
          <Pane>Those who can, define the future.</Pane>
          <Pane>Founders</Pane>
        </Pane>
        <Pane
          boxShadow="0px 0px 5px #36d6ae"
          paddingX={20}
          paddingY={20}
          marginY={20}
        >
          <Text fontSize="16px" color="#fff">
            <Pane paddingY={20}>
              <Text fontSize="18px" color="#fff">
                The Game of Links has already played
              </Text>
            </Pane>
            Welcome to the intergalactic tournament - Game of Links. GoL is the
            main preparation stage before{' '}
            <Link to="/search/genesis">the main network launch</Link> of{' '}
            <LinkWindow to={WP}>the cyber protocol</LinkWindow>. The main goal
            of the tournament is to collectively bootstrap the{' '}
            <Link to="/brain">Superintelligence</Link>. Everyone can find
            themselves in this fascinating process: we need to set up physical
            infrastructure, upload the initial knowledge and create a reserve to
            sustain the project during its infancy. Athletes need to solve
            different parts of the puzzle and can win up to 10% of CYB in the
            Genesis.Participation requere EUL tokens which you can get by{' '}
            <Link to="/gift">claiming gift</Link>, using{' '}
            <Link to="/gol/faucet">ETH faucet</Link> or{' '}
            <Link to="/gol/takeoff">donating ATOM</Link> during Takeoff. Read
            the full rules of the tournament{' '}
            <LinkWindow to="https://cybercongress.ai/game-of-links/">
              in the organizator&apos;s blog
            </LinkWindow>
            .
          </Text>
        </Pane>

        <Tablist
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(110px, 1fr))"
          gridGap="10px"
          marginY={20}
        >
          <TabBtn
            text="Disciplines"
            isSelected={selected === 'disciplines'}
            to="/gol"
          />
          <TabBtn
            text="Leaderboard"
            isSelected={selected === 'leaderboard'}
            to="/gol/leaderboard"
          />
        </Tablist>
        <Pane display="flex" marginBottom={50} justifyContent="center">
          {content}
        </Pane>
      </main>
      {!mobile && (
        <ActionBarContainer
          addAddress={addAddress}
          updateFunc={checkAddressLocalStorage}
        />
      )}
    </div>
  );
}

const mapStateToProps = (store) => {
  return {
    mobile: store.settings.mobile,
    defaultAccount: store.pocket.defaultAccount,
    block: store.block.block,
  };
};

const mapDispatchprops = (dispatch) => {
  return {
    setGolTakeOffProps: (amount, prize) =>
      dispatch(setGolTakeOff(amount, prize)),
  };
};

export default connect(mapStateToProps, mapDispatchprops)(GOL);
