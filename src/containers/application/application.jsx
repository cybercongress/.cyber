import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Navigation,
  AppSideBar,
  NavigationLeft,
  Pane,
} from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import Menu from './ToggleMenu';
import AppMenu from './AppMenu';
import { MenuButton, BandwidthBar, Tooltip } from '../../components';
import Electricity from '../home/electricity';
import { getAccountBandwidth } from '../../utils/search/utils';
import { setBandwidth } from '../../redux/actions/bandwidth';
import { setDefaultAccount, setAccounts } from '../../redux/actions/pocket';
import { setQuery } from '../../redux/actions/query';
import { CYBER, WP } from '../../utils/config';
import { formatNumber } from '../../utils/utils';

const cyber = require('../../image/blue-circle.png');
const cybFalse = require('../../image/cyb.svg');
const cybTrue = require('../../image/cybTrue.svg');
const bug = require('../../image/alert-circle-outline.svg');

const ListAccounts = ({
  accounts,
  defaultAccount,
  children,
  onClickChangeActiveAcc,
}) => {
  let items = {};
  if (accounts && accounts !== null) {
    items = Object.keys(accounts).map((key, i) => {
      let active = false;
      if (
        defaultAccount &&
        defaultAccount.name &&
        defaultAccount.name === key
      ) {
        active = true;
      }
      return (
        <Pane
          key={`${key}_${i}`}
          paddingX={10}
          paddingY={5}
          color={active ? '#ff9100' : '#fff'}
          onClick={() =>
            active ? '' : onClickChangeActiveAcc(key, accounts[key])
          }
          className={active ? '' : 'account-popaps'}
        >
          {key}
        </Pane>
      );
    });
  }
  return (
    <Tooltip
      placement="bottom"
      trigger={['click', 'hover']}
      tooltip={
        Object.keys(items).length > 0
          ? items
          : "you don't have accounts in your pocket"
      }
    >
      <Pane>{children}</Pane>
    </Tooltip>
  );
};

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    let story = false;
    const localStorageStory = localStorage.getItem('story');
    if (localStorageStory !== null) {
      story = localStorageStory;
    }

    this.state = {
      openMenu: false,
      story,
      valueSearchInput: '',
      home: false,
      battery: false,
      address: null,
    };
    this.textInput = React.createRef();
    this.routeChange = this.routeChange.bind(this);
    // this.handleKeyFocus = this.handleKeyFocus.bind(this);
  }

  componentDidMount() {
    this.chekHomePage();
    this.chekEvangelism();
    this.checkAddressLocalStorage();
    document.onkeypress = (e) => {
      if (e.key === '/') {
        document.getElementById('search-input-searchBar').focus();
      }
    };
  }

  componentDidUpdate(prevProps) {
    const { location, query, defaultAccount } = this.props;
    if (prevProps.location.pathname !== location.pathname) {
      this.chekHomePage();
      this.updateInput();
      this.chekEvangelism();
      if (location.pathname.indexOf(query) === -1) {
        this.clearInrut();
      }
      this.checkAddressLocalStorage();
      document.onkeypress = (e) => {
        if (e.key === '/') {
          document.getElementById('search-input-searchBar').focus();
        }
      };
    }
    if (prevProps.defaultAccount.name !== defaultAccount.name) {
      this.checkAddressLocalStorage();
    }
  }

  checkAddressLocalStorage = async () => {
    const {
      setBandwidthProps,
      setDefaultAccountProps,
      defaultAccount,
      setAccountsProps,
    } = this.props;
    const { account } = defaultAccount;
    if (account !== null && account.cyber) {
      this.getBandwidth(account.cyber.bech32);
    } else {
      let defaultAccounts = null;
      let defaultAccountsKeys = null;
      let accounts = null;

      const localStoragePocketAccount = await localStorage.getItem(
        'pocketAccount'
      );
      const localStoragePocket = localStorage.getItem('pocket');

      if (localStoragePocket !== null) {
        const localStoragePocketData = JSON.parse(localStoragePocket);
        const keyPocket = Object.keys(localStoragePocketData)[0];
        const accountPocket = Object.values(localStoragePocketData)[0];
        defaultAccounts = accountPocket;
        defaultAccountsKeys = keyPocket;
      }

      if (localStoragePocketAccount !== null) {
        const localStoragePocketAccountData = JSON.parse(
          localStoragePocketAccount
        );
        if (localStoragePocket === null) {
          const keys0 = Object.keys(localStoragePocketAccountData)[0];
          localStorage.setItem(
            'pocket',
            JSON.stringify({ [keys0]: localStoragePocketAccountData[keys0] })
          );
          defaultAccounts = localStoragePocketAccountData[keys0];
          defaultAccountsKeys = keys0;
        } else {
          accounts = {
            [defaultAccountsKeys]:
              localStoragePocketAccountData[defaultAccountsKeys],
            ...localStoragePocketAccountData,
          };
        }
      } else {
        localStorage.clear();
      }

      setDefaultAccountProps(defaultAccountsKeys, defaultAccounts);
      setAccountsProps(accounts);
      if (
        defaultAccounts !== null &&
        Object.prototype.hasOwnProperty.call(defaultAccounts, 'cyber')
      ) {
        this.getBandwidth(defaultAccounts.cyber.bech32);
      } else {
        setBandwidthProps(0, 0);
      }
    }
  };

  getBandwidth = async (address) => {
    const { setBandwidthProps } = this.props;
    if (address !== null) {
      const dataAccountBandwidth = await getAccountBandwidth(address);
      if (dataAccountBandwidth !== null) {
        const {
          remained_value: remained,
          max_value: maxValue,
        } = dataAccountBandwidth.account_bandwidth;
        setBandwidthProps(remained, maxValue);
      }
    }
  };

  updateInput = () => {
    const { query, setQueryProps } = this.props;

    setQueryProps(query);
  };

  clearInrut = () => {
    const { setQueryProps } = this.props;
    setQueryProps('');
  };

  chekEvangelism = () => {
    const { location } = this.props;
    const { search } = location;

    if (search.match(/thanks=/gm) && search.match(/thanks=/gm).length > 0) {
      const parsed = queryString.parse(search);
      console.log('parsed', parsed);
      localStorage.setItem('thanks', JSON.stringify(parsed.thanks));
    }
  };

  chekHomePage = () => {
    const { location } = this.props;
    if (location.pathname === '/') {
      // document.onkeypress = e => {
      //   document.getElementById('search-input-home').focus();
      // };
      this.setState({
        home: true,
      });
    } else {
      this.setState({
        home: false,
      });
    }
  };

  routeChange = (newPath) => {
    const { history } = this.props;
    const path = newPath;
    history.push(path);
  };

  onChangeInput = async (e) => {
    const { query, setQueryProps } = this.props;
    const { value } = e.target;

    if (query.length === 0 && value === '/') {
      setQueryProps('');
    } else {
      setQueryProps(value);
    }
  };

  handleKeyPress = async (e) => {
    const { query, setQueryProps } = this.props;

    if (query.length > 0) {
      if (e.key === 'Enter') {
        this.routeChange(`/search/${query}`);
        setQueryProps(query);
      }
    }
  };

  closeStory = () => {
    // console.log('dfd');
    this.setState({
      story: true,
    });
  };

  onClickChangeActiveAcc = async (key) => {
    const { setDefaultAccountProps, setAccountsProps, accounts } = this.props;
    if (
      accounts !== null &&
      Object.prototype.hasOwnProperty.call(accounts, key)
    ) {
      const defaultAccount = { [key]: accounts[key] };
      const accountsPocket = {
        [key]: accounts[key],
        ...accounts,
      };
      setDefaultAccountProps(key, accounts[key]);
      setAccountsProps(accountsPocket);
      localStorage.setItem('pocket', JSON.stringify(defaultAccount));
    }
  };

  render() {
    const { openMenu, story, home, battery } = this.state;
    const {
      defaultAccount,
      query,
      ipfsStatus,
      bandwidth,
      block = 0,
      accounts,
    } = this.props;

    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            padding: 0,
          }}
          className="container-distribution"
        >
          <Pane position="relative">
            <MenuButton to="/brain" imgLogo={cyber} />
            <Pane bottom="-10px" right="-20%" position="absolute">
              <Tooltip
                placement="bottom"
                tooltip={
                  <span>
                    You are on the{' '}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://github.com/cybercongress/cyberd/releases"
                    >
                      {CYBER.CHAIN_ID}
                    </a>{' '}
                    network at block{' '}
                    <span style={{ color: '#4ed6ae' }}>
                      {formatNumber(parseFloat(block))}
                    </span>
                    . {CYBER.CHAIN_ID} is incentivized test network. Be careful.
                    Details in{' '}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://ipfs.io/ipfs/QmQ1Vong13MDNxixDyUdjniqqEj8sjuNEBYMyhQU4gQgq3"
                    >
                      whitepaper
                    </a>
                    .
                  </span>
                }
              >
                <img
                  alt="bugs"
                  style={{ width: '20px', height: '20px' }}
                  src={bug}
                />
              </Tooltip>
            </Pane>
            {/* <Pane
              className="battery-container"
              width="65px"
              position="absolute"
              right="60px"
            >
              <BandwidthBar
                height="15px"
                styleText={{ whiteSpace: 'nowrap' }}
                fontSize={12}
                colorText="#000"
                bwRemained={bandwidth.remained}
                bwMaxValue={bandwidth.maxValue}
              />
            </Pane> */}
          </Pane>
          <Pane
            className="battery-container"
            width="65px"
            position="absolute"
            left="60px"
          >
            <BandwidthBar
              height="15px"
              styleText={{ whiteSpace: 'nowrap' }}
              fontSize={12}
              colorText="#000"
              bwRemained={bandwidth.remained}
              bwMaxValue={bandwidth.maxValue}
            />
          </Pane>
          {!home && (
            <Pane
              position="absolute"
              left="50%"
              transform="translate(-50%, 0)"
              marginRight="-50%"
              zIndex={1}
              backgroundColor="#000"
              borderRadius={20}
              width="60%"
              // className="box-shadow-input"
              height="100%"
            >
              <input
                onChange={(e) => this.onChangeInput(e)}
                onKeyPress={this.handleKeyPress}
                className="search-input"
                ref={this.textInput}
                value={query}
                autoComplete="off"
                id="search-input-searchBar"
                style={{
                  width: '100%',
                  height: 41,
                  fontSize: 20,
                  textAlign: 'center',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(0, -50%)',
                  zIndex: 1,
                  backgroundColor: '#000',
                }}
              />
            </Pane>
          )}
          <Electricity />
          {defaultAccount.name !== null && (
            <Pane
              className="battery-container"
              width="fit-content"
              position="absolute"
              right="60px"
              whiteSpace="nowrap"
              fontSize="14px"
              backgroundColor="#000"
              boxShadow="0 0 5px 5px #000"
            >
              <ListAccounts
                accounts={accounts}
                onClickChangeActiveAcc={this.onClickChangeActiveAcc}
                defaultAccount={defaultAccount}
              >
                {defaultAccount.name}
              </ListAccounts>
            </Pane>
          )}
          <Pane position="relative">
            <MenuButton
              to="/pocket"
              imgLogo={ipfsStatus ? cybTrue : cybFalse}
              positionBugLeft
            />
            <Pane bottom="-10px" left="-20%" position="absolute">
              <Tooltip
                placement="bottom"
                tooltip={
                  <span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://github.com/cybercongress/dot-cyber"
                    >
                      The dot-cyber
                    </a>{' '}
                    app has not been audited yet. Please, use it with caution.
                  </span>
                }
              >
                <img
                  alt="bugs"
                  style={{ width: '20px', height: '20px' }}
                  src={bug}
                />
              </Tooltip>
            </Pane>
          </Pane>
        </div>
        {/* </Navigation> */}
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    ipfsStatus: store.ipfs.statusIpfs,
    bandwidth: store.bandwidth.bandwidth,
    query: store.query.query,
    mobile: store.settings.mobile,
    block: store.block.block,
    defaultAccount: store.pocket.defaultAccount,
    accounts: store.pocket.accounts,
  };
};

const mapDispatchprops = (dispatch) => {
  return {
    setBandwidthProps: (remained, maxValue) =>
      dispatch(setBandwidth(remained, maxValue)),
    setQueryProps: (query) => dispatch(setQuery(query)),
    setDefaultAccountProps: (name, account) =>
      dispatch(setDefaultAccount(name, account)),
    setAccountsProps: (accounts) => dispatch(setAccounts(accounts)),
  };
};

export default connect(mapStateToProps, mapDispatchprops)(App);
