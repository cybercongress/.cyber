import React from 'react';
import { Text, Pane, Tablist, Tab } from '@cybercongress/gravity';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import {
  formatNumber,
  getStatistics,
  getValidators,
  statusNode,
  getBalance,
  getTotalEUL,
  getAmountATOM,
  getInlfation,
  getcommunityPool,
  getTxCosmos,
  getTotalSupply,
} from '../../utils/search/utils';
import { roundNumber } from '../../utils/utils';
import { CardStatisics, Loading } from '../../components';
import { cybWon } from '../../utils/fundingMath';
import injectWeb3 from './web3';
import { CYBER, AUCTION, GENESIS_SUPPLY } from '../../utils/config';
import { getProposals } from '../../utils/governance';

import ActionBarContainer from './actionBarContainer';
import {
  GovernmentTab,
  MainTab,
  ConsensusTab,
  CybernomicsTab,
  KnowledgeTab,
} from './tabs';

const { DIVISOR_CYBER_G } = CYBER;

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

class Brain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inlfation: 0,
      addressLedger: null,
      linksCount: 0,
      cidsCount: 0,
      accountsCount: 0,
      totalCyb: 0,
      stakedCyb: 0,
      activeValidatorsCount: 0,
      selected: 'main',
      loading: true,
      chainId: '',
      amount: 0,
      takeofPrice: 0,
      capATOM: 0,
      communityPool: 0,
      proposals: 0,
      cybernomics: {
        gol: {
          supply: 0,
          price: 0,
          cap: 0,
        },
        eul: {
          supply: 0,
          price: 0,
          cap: 0,
        },
        cyb: {
          supply: 0,
          price: 0,
          cap: 0,
        },
      },
    };
  }

  async componentDidMount() {
    this.chekPathname();
    await this.checkAddressLocalStorage();
    this.getStatisticsBrain();
    // this.getPriceGol();
    this.getTxsCosmos();
    this.getContract();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (prevProps.location.pathname !== location.pathname) {
      this.chekPathname();
    }
  }

  chekPathname = () => {
    const { location } = this.props;
    const { pathname } = location;

    if (
      pathname.match(/cybernomics/gm) &&
      pathname.match(/cybernomics/gm).length > 0
    ) {
      this.select('cybernomics');
    } else if (
      pathname.match(/knowledge/gm) &&
      pathname.match(/knowledge/gm).length > 0
    ) {
      this.select('knowledge');
    } else if (
      pathname.match(/consensus/gm) &&
      pathname.match(/consensus/gm).length > 0
    ) {
      this.select('consensus');
    } else if (
      pathname.match(/government/gm) &&
      pathname.match(/government/gm).length > 0
    ) {
      this.select('government');
    } else {
      this.select('main');
    }
  };

  getContract = async () => {
    const { cybernomics } = this.state;
    const {
      contract: { methods },
    } = this.props;
    const roundThis = await methods.today().call();

    const totalSupplyEul = await getTotalSupply();
    const createOnDay = await methods.createOnDay(roundThis).call();
    const dailyTotals = await methods.dailyTotals(roundThis).call();

    const currentPrice = dailyTotals / (createOnDay * Math.pow(10, 9));
    cybernomics.gol = {
      supply: parseFloat(AUCTION.TOKEN_ALOCATION * CYBER.DIVISOR_CYBER_G),
      price: currentPrice,
      cap: parseFloat(currentPrice * AUCTION.TOKEN_ALOCATION),
    };

    cybernomics.eul = {
      supply: parseFloat(totalSupplyEul),
      price: currentPrice,
      cap: parseFloat((totalSupplyEul / CYBER.DIVISOR_CYBER_G) * currentPrice),
    };

    this.setState({
      cybernomics,
    });
  };

  getTxsCosmos = async () => {
    const dataTx = await getTxCosmos();
    console.log(dataTx);
    if (dataTx !== null) {
      this.getATOM(dataTx.txs);
    }
  };

  getATOM = async dataTxs => {
    const { cybernomics } = this.state;
    let amount = 0;
    let won = 0;
    let currentPrice = 0;

    if (dataTxs) {
      amount = await getAmountATOM(dataTxs);
    }

    console.log('amount', amount);

    won = cybWon(amount);
    if (amount === 0) {
      currentPrice = 0;
    } else {
      currentPrice = won / amount;
    }

    console.log('won', won);
    console.log('currentPrice', currentPrice);

    const supplyEUL = parseFloat(GENESIS_SUPPLY);
    const takeofPrice = currentPrice / DIVISOR_CYBER_G;
    const capATOM = (supplyEUL / DIVISOR_CYBER_G) * takeofPrice;
    console.log('capATOM', capATOM);

    cybernomics.cyb = {
      cap: capATOM,
      price: takeofPrice,
      supply: GENESIS_SUPPLY,
    };

    this.setState({
      cybernomics,
    });
  };

  checkAddressLocalStorage = async () => {
    let address = [];

    const localStorageStory = await localStorage.getItem('ledger');
    if (localStorageStory !== null) {
      address = JSON.parse(localStorageStory);
      console.log('address', address);
      this.setState({ addressLedger: address });
      this.getAddressInfo();
    } else {
      this.setState({
        addAddress: true,
        loading: false,
      });
    }
  };

  getAddressInfo = async () => {
    const { addressLedger } = this.state;
    const addressInfo = {
      address: '',
      amount: '',
      token: '',
      keys: '',
    };
    let total = 0;

    const result = await getBalance(addressLedger.bech32);
    console.log('result', result);

    if (result) {
      total = await getTotalEUL(result);
    }
    this.setState({
      addAddress: false,
      loading: false,
      // addressInfo,
      amount: total.total,
    });
  };

  getStatisticsBrain = async () => {
    const statisticContainer = await getStatistics();
    const validatorsStatistic = await getValidators();
    const status = await statusNode();
    const dataInlfation = await getInlfation();
    const dataCommunityPool = await getcommunityPool();
    const dataProposals = await getProposals();
    const {
      linksCount,
      cidsCount,
      accountsCount,
      height,
      bandwidthPrice,
      bondedTokens,
      supplyTotal,
    } = statisticContainer;
    let inlfation = 0;
    let communityPool = 0;
    const activeValidatorsCount = validatorsStatistic;

    const chainId = status.node_info.network;

    const totalCyb = supplyTotal;
    const stakedCyb = Math.floor((bondedTokens / totalCyb) * 100 * 1000) / 1000;
    const linkPrice = (400 * +bandwidthPrice).toFixed(0);

    if (dataInlfation !== null) {
      inlfation = dataInlfation;
    }

    if (dataCommunityPool !== null) {
      communityPool = Math.floor(parseFloat(dataCommunityPool[0].amount));
    }

    this.setState({
      linksCount,
      cidsCount,
      proposals: dataProposals.length,
      accountsCount,
      totalCyb,
      communityPool,
      stakedCyb,
      activeValidatorsCount: activeValidatorsCount.length,
      chainId,
      inlfation,
    });
  };

  select = selected => {
    this.setState({ selected });
  };

  render() {
    const {
      linksCount,
      cidsCount,
      accountsCount,
      totalCyb,
      stakedCyb,
      activeValidatorsCount,
      addAddress,
      amount,
      loading,
      chainId,
      takeofPrice,
      capATOM,
      selected,
      communityPool,
      inlfation,
      cybernomics,
      proposals,
    } = this.state;
    const { block } = this.props;

    let content;

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

    if (selected === 'main') {
      content = (
        <MainTab
          linksCount={linksCount}
          capATOM={cybernomics.eul.cap}
          activeValidatorsCount={activeValidatorsCount}
        />
      );
    }

    if (selected === 'knowledge') {
      content = (
        <Route
          path="/brain/knowledge"
          render={() => (
            <KnowledgeTab
              linksCount={linksCount}
              cidsCount={cidsCount}
              accountsCount={accountsCount}
            />
          )}
        />
      );
    }

    if (selected === 'cybernomics') {
      content = (
        <Route
          path="/brain/cybernomics"
          render={() => <CybernomicsTab data={cybernomics} />}
        />
      );
    }

    if (selected === 'consensus') {
      content = (
        <Route
          path="/brain/consensus"
          render={() => (
            <ConsensusTab
              activeValidatorsCount={activeValidatorsCount}
              stakedCyb={stakedCyb}
              inlfation={inlfation}
            />
          )}
        />
      );
    }

    if (selected === 'government') {
      content = (
        <Route
          path="/brain/government"
          render={() => (
            <GovernmentTab
              proposals={proposals}
              communityPool={communityPool}
            />
          )}
        />
      );
    }

    return (
      <div>
        <main className="block-body">
          {amount === 0 && (
            <Pane
              boxShadow="0px 0px 5px #36d6ae"
              paddingX={20}
              paddingY={20}
              marginY={20}
            >
              <Text fontSize="16px" color="#fff">
                You do not have control over the brain. You need EUL tokens to
                let Her hear you. If you came from Ethereum or Cosmos you can
                claim the gift of the Gods and start preparing for the greatest
                tournament in the universe: <a href="gol">Game of Links</a>.
              </Text>
            </Pane>
          )}
          <Pane
            marginY={20}
            display="grid"
            gridTemplateColumns="max-content"
            justifyContent="center"
          >
            <Link to="/network/euler/block">
              <CardStatisics title={chainId} value={formatNumber(block)} />
            </Link>
          </Pane>

          <Tablist
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
            gridGap="10px"
            marginTop={25}
          >
            <TabBtn
              text="Knowledge"
              isSelected={selected === 'knowledge'}
              to="/brain/knowledge"
            />
            <TabBtn
              text="Cybernomics"
              isSelected={selected === 'cybernomics'}
              to="/brain/cybernomics"
            />
            <TabBtn text="Main" isSelected={selected === 'main'} to="/brain" />
            <TabBtn
              text="Consensus"
              isSelected={selected === 'consensus'}
              to="/brain/consensus"
            />
            <TabBtn
              text="Government"
              isSelected={selected === 'government'}
              to="/brain/government"
            />
          </Tablist>
          <Pane marginTop={50} marginBottom={50}>
            {content}
          </Pane>
        </main>
        <ActionBarContainer
          addAddress={addAddress}
          updateFunc={this.checkAddressLocalStorage}
        />
      </div>
    );
  }
}

const mapStateToProps = store => {
  return {
    block: store.block.block,
  };
};

export default connect(mapStateToProps)(injectWeb3(Brain));
