import React from 'react';
import { hashHistory, IndexRoute, Route, Router, Switch } from 'react-router';
import { createBrowserHistory } from 'history';
import { connect } from 'react-redux';
import App from './containers/application/application';
import Got from './containers/got/got';
import Funding from './containers/funding/index';
import Auction from './containers/auction/index';
import NotFound from './containers/application/notFound';
import Brain from './containers/brain/brain';
import Home from './containers/home/home';
import Wallet from './containers/Wallet/Wallet';
import Governance from './containers/governance/governance';
import Gift from './containers/gift';
import ProposalsDetail from './containers/governance/proposalsDetail';
import Validators from './containers/Validators/Validators';
import SearchResults from './containers/Search/SearchResults';
import Story from './containers/story/story';
import GOL from './containers/gol/gol';
import TxsDetails from './containers/txs/txsDetails';
import AccountDetails from './containers/account';
import ValidatorsDetails from './containers/validator';
import Vesting from './containers/vesting/vesting';
import Ipfs from './containers/ipfs/ipfs';
import { Dots, Timer } from './components';
import { initIpfs, setIpfsStatus } from './redux/actions/ipfs';
import BlockDetails from './containers/blok/blockDetails';
import Txs from './containers/txs';
import Block from './containers/blok';
import ParamNetwork from './containers/parameters';

import { TIME_START } from './utils/config';

const IPFS = require('ipfs');

export const history = createBrowserHistory({});

class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      ipfs: null,
      loader: true,
      days: '00',
      hours: '00',
      seconds: '00',
      minutes: '00',
      time: true,
    };
  }

  async componentDidMount() {
    let resultGMT;
    const offset = new Date().getTimezoneOffset();
    if (offset < 0) {
      resultGMT = `GMT+${offset / -60}`;
    } else {
      resultGMT = `GMT-${offset / 60}`;
    }
    const deadline = `${TIME_START} ${resultGMT}`;
    const startTime = Date.parse(deadline) - Date.parse(new Date());
    console.log(startTime);
    if (startTime <= 0) {
      this.init();
    } else {
      this.initializeClock(deadline);
    }
  }

  init = async () => {
    const { setIpfsStatusProps } = this.props;
    setIpfsStatusProps(false);
    this.setState({
      // loader: false,
      time: false,
    });
    await this.initIpfsNode();
  };

  getTimeRemaining = endtime => {
    const t = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      total: t,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  initializeClock = endtime => {
    let timeinterval;
    const updateClock = () => {
      const t = this.getTimeRemaining(endtime);
      if (t.total <= 0) {
        clearInterval(timeinterval);
        this.init();
        return true;
      }
      this.setState({
        days: t.days,
        hours: `0${t.hours}`.slice(-2),
        minutes: `0${t.minutes}`.slice(-2),
        seconds: `0${t.seconds}`.slice(-2),
      });
    };

    updateClock();
    timeinterval = setInterval(updateClock, 1000);
  };

  funcUpdateValueSearchInput = query => {
    this.setState({
      query,
    });
  };

  initIpfsNode = async () => {
    const { initIpfsProps, setIpfsStatusProps } = this.props;
    try {
      const node = await IPFS.create({
        repo: 'ipfs-repo-cyber',
        init: false,
        start: true,
        relay: {
          enabled: true,
          hop: {
            enabled: true,
          },
        },
        config: {
          Addresses: {
            Swarm: [
              '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
              '/dns4/ws-star.discovery.cybernode.ai/tcp/443/wss/p2p-webrtc-star',
            ],
          },
          Bootstrap: [
            '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
            '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
            '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
            '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
            '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
            '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
          ],
        },
      });
      console.log('node init false', node);
      initIpfsProps(node);
      if (node !== null) {
        const status = await node.isOnline();
        setIpfsStatusProps(status);
      }
      this.setState({ loader: false });
    } catch (error) {
      console.log(error);
      const node = await IPFS.create({
        repo: 'ipfs-repo-cyber',
        init: true,
        start: true,
        relay: {
          enabled: true,
          hop: {
            enabled: true,
          },
        },
        config: {
          Addresses: {
            Swarm: [
              '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
              '/dns4/ws-star.discovery.cybernode.ai/tcp/443/wss/p2p-webrtc-star',
            ],
          },
          Bootstrap: [
            '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
            '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
            '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
            '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
            '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
            '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
          ],
        },
      });
      console.log('node init true', node);
      initIpfsProps(node);
      if (node !== null) {
        const status = await node.isOnline();
        setIpfsStatusProps(status);
      }
      this.setState({ loader: false });
    }
  };

  render() {
    const { query, loader, time, days, hours, seconds, minutes } = this.state;

    if (time) {
      return (
        <div
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            className="countdown-time text-glich"
            data-text="euler-6 will start in"
          >
            euler-6 will start in
          </div>
          <Timer
            days={days}
            hours={hours}
            seconds={seconds}
            minutes={minutes}
          />
        </div>
      );
    }

    if (loader) {
      return <Dots />;
    }

    return (
      <Router history={history}>
        <Route
          path="/"
          render={props => (
            <App
              funcUpdate={this.funcUpdateValueSearchInput}
              query={query}
              {...props}
            />
          )}
          // component={App}
        />
        <Switch>
          <Route
            path="/"
            exact
            render={props => (
              <Home funcUpdate={this.funcUpdateValueSearchInput} {...props} />
            )}
            // component={Home}
          />
          <Route exact path="/search/:query" component={SearchResults} />
          <Route path="/gift/:address?" component={Gift} />
          <Route path="/takeoff" component={Funding} />
          <Route path="/tot" component={Got} />
          <Route path="/auction" component={Auction} />
          <Route path="/brain" component={Brain} />
          <Route exact path="/governance" component={Governance} />
          <Route path="/governance/:proposal_id" component={ProposalsDetail} />
          <Route path="/pocket" component={Wallet} />
          <Route path="/heroes" component={Validators} />
          <Route path="/episode-1" component={Story} />
          <Route path="/gol" component={GOL} />
          <Route exact path="/network/euler-5/tx" component={Txs} />
          <Route path="/network/euler-5/tx/:txHash" component={TxsDetails} />
          <Route
            path="/network/euler-5/contract/:address"
            component={AccountDetails}
          />
          <Route
            path="/network/euler-5/hero/:address"
            component={ValidatorsDetails}
          />
          <Route path="/vesting" component={Vesting} />
          <Route path="/ipfs" component={Ipfs} />
          <Route exact path="/network/euler-5/block" component={Block} />
          <Route
            path="/network/euler-5/block/:idBlock"
            component={BlockDetails}
          />
          <Route path="/network/euler-5/parameters" component={ParamNetwork} />

          <Route exact path="*" component={NotFound} />
        </Switch>
      </Router>
    );
  }
}

const mapDispatchprops = dispatch => {
  return {
    initIpfsProps: ipfsNode => dispatch(initIpfs(ipfsNode)),
    setIpfsStatusProps: status => dispatch(setIpfsStatus(status)),
  };
};

export default connect(null, mapDispatchprops)(AppRouter);
