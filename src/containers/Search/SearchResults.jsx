import React, { useState, useEffect } from 'react';
import { Pane, SearchItem, Text } from '@cybercongress/gravity';
import { useParams, useLocation, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getIpfsHash, search, getRankGrade } from '../../utils/search/utils';
import {
  formatNumber,
  exponentialToDecimal,
  trimString,
} from '../../utils/utils';
import {
  Loading,
  Account,
  Copy,
  Tooltip,
  LinkWindow,
  Rank,
} from '../../components';
import ActionBarContainer from './ActionBar';
import {
  PATTERN,
  PATTERN_CYBER,
  PATTERN_TX,
  PATTERN_CYBER_VALOPER,
  PATTERN_BLOCK,
  PATTERN_IPFS_HASH,
} from '../../utils/config';
import { setQuery } from '../../redux/actions/query';
import ContentItem from '../ipfs/contentItem';

function SearchResults({ node, mobile, setQueryProps }) {
  const { query } = useParams();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [keywordHash, setKeywordHash] = useState('');
  const [update, setUpdate] = useState(1);
  const [rankLink, setRankLink] = useState(null);

  useEffect(() => {
    const feachData = async () => {
      setLoading(true);
      setQueryProps(query);
      let keywordHashTemp = '';
      let keywordHashNull = '';
      let searchResultsData = [];
      if (query.match(PATTERN_IPFS_HASH)) {
        keywordHashTemp = query;
      } else {
        keywordHashTemp = await getIpfsHash(query.toLowerCase());
      }

      let responseSearchResults = await search(keywordHashTemp);
      if (responseSearchResults.length === 0) {
        const queryNull = 'zero';
        keywordHashNull = await getIpfsHash(queryNull);
        responseSearchResults = await search(keywordHashNull);
      }
      searchResultsData = responseSearchResults.reduce(
        (obj, item) => ({
          ...obj,
          [item.cid]: {
            cid: item.cid,
            rank: item.rank,
            grade: getRankGrade(item.rank),
            status: node !== null ? 'understandingState' : 'impossibleLoad',
            query,
            text: item.cid,
            content: false,
          },
        }),
        {}
      );
      setKeywordHash(keywordHashTemp);
      setSearchResults(searchResultsData);
      setLoading(false);
    };
    feachData();
  }, [query, location, update]);

  useEffect(() => {
    setRankLink(null);
  }, [update]);

  const onClickRank = async (key) => {
    if (rankLink === key) {
      setRankLink(null);
    } else {
      setRankLink(key);
    }
  };

  const searchItems = [];

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
        <div style={{ color: '#fff', marginTop: 20, fontSize: 20 }}>
          Searching
        </div>
      </div>
    );
  }

  if (query.match(PATTERN)) {
    searchItems.push(
      <Pane
        position="relative"
        className="hover-rank"
        display="flex"
        alignItems="center"
        marginBottom="10px"
      >
        <Link className="SearchItem" to={`/gift/${query}`}>
          <SearchItem
            hash={`${query}_PATTERN`}
            text="Don't wait! Claim your gift, and join the Game of Links!"
            status="sparkApp"
            // address={query}
          />
        </Link>
      </Pane>
    );
  }

  if (query.match(PATTERN_CYBER)) {
    searchItems.push(
      <Pane
        position="relative"
        className="hover-rank"
        display="flex"
        alignItems="center"
        marginBottom="10px"
      >
        <Link className="SearchItem" to={`/network/euler/contract/${query}`}>
          <SearchItem
            hash={`${query}_PATTERN_CYBER`}
            text="Explore details of contract"
            contentApp={<Pane color="#000">{trimString(query, 8, 5)}</Pane>}
            status="sparkApp"
          />
        </Link>
      </Pane>
    );
  }

  if (query.match(PATTERN_CYBER_VALOPER)) {
    searchItems.push(
      <Pane
        position="relative"
        className="hover-rank"
        display="flex"
        alignItems="center"
        marginBottom="10px"
      >
        <Link className="SearchItem" to={`/network/euler/hero/${query}`}>
          <SearchItem
            hash={`${query}_PATTERN_CYBER_VALOPER`}
            text="Explore details of hero"
            contentApp={<Account colorText="#000" address={query} />}
            status="sparkApp"
          />
        </Link>
      </Pane>
    );
  }

  if (query.match(PATTERN_TX)) {
    searchItems.push(
      <Pane
        position="relative"
        className="hover-rank"
        display="flex"
        alignItems="center"
        marginBottom="10px"
      >
        <Link className="SearchItem" to={`/network/euler/tx/${query}`}>
          <SearchItem
            hash={`${query}_PATTERN_TX`}
            text="Explore details of tx "
            status="sparkApp"
            contentApp={<Pane color="#000">{trimString(query, 4, 4)}</Pane>}
          />
        </Link>
      </Pane>
    );
  }

  if (query.match(PATTERN_BLOCK)) {
    searchItems.push(
      <Pane
        position="relative"
        className="hover-rank"
        display="flex"
        alignItems="center"
        marginBottom="10px"
      >
        <Link className="SearchItem" to={`/network/euler/block/${query}`}>
          <SearchItem
            hash={`${query}_PATTERN_BLOCK`}
            text="Explore details of block "
            status="sparkApp"
            contentApp={
              <Pane color="#000">{formatNumber(parseFloat(query))}</Pane>
            }
          />
        </Link>
      </Pane>
    );
  }
  // QmRSnUmsSu7cZgFt2xzSTtTqnutQAQByMydUxMpm13zr53;
  searchItems.push(
    Object.keys(searchResults).map((key) => {
      return (
        <Pane
          position="relative"
          className="hover-rank"
          display="flex"
          alignItems="center"
          marginBottom="10px"
        >
          {!mobile && (
            <Pane
              className={`time-discussion ${
                rankLink === key ? '' : 'hover-rank-contentItem'
              }`}
              position="absolute"
              cursor="pointer"
            >
              <Rank
                hash={key}
                rank={exponentialToDecimal(
                  parseFloat(searchResults[key].rank).toPrecision(3)
                )}
                grade={searchResults[key].grade}
                onClick={() => onClickRank(key)}
              />
            </Pane>
          )}
          <ContentItem
            nodeIpfs={node}
            cid={key}
            item={searchResults[key]}
            className="SearchItem"
          />
        </Pane>
      );
    })
  );

  return (
    <div>
      <main className="block-body" style={{ paddingTop: 30 }}>
        <Pane
          width="90%"
          marginX="auto"
          marginY={0}
          display="flex"
          flexDirection="column"
        >
          <div className="container-contentItem" style={{ width: '100%' }}>
            {searchItems}
          </div>
        </Pane>
      </main>

      {!mobile && (
        <ActionBarContainer
          keywordHash={keywordHash}
          update={() => setUpdate(update + 1)}
          rankLink={rankLink}
        />
      )}
    </div>
  );
}

const mapStateToProps = (store) => {
  return {
    node: store.ipfs.ipfs,
    mobile: store.settings.mobile,
  };
};

const mapDispatchprops = (dispatch) => {
  return {
    setQueryProps: (query) => dispatch(setQuery(query)),
  };
};

export default connect(mapStateToProps, mapDispatchprops)(SearchResults);
