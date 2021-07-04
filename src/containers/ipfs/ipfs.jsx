import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Pane,
  SearchItem,
  Tablist,
  TableEv as Table,
  Rank,
  Text,
} from '@cybercongress/gravity';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import Iframe from 'react-iframe';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { ObjectInspector, chromeDark } from '@tableflip/react-inspector';
import gql from 'graphql-tag';
import {
  getRankGrade,
  getToLink,
  getCreator,
  getFromLink,
} from '../../utils/search/utils';
import { Dots, TabBtn, Loading, TextTable, Cid } from '../../components';
import CodeBlock from './codeBlock';
import { formatNumber, trimString, formatCurrency } from '../../utils/utils';
import { PATTERN_HTTP } from '../../utils/config';
import {
  DiscussionTab,
  CommunityTab,
  AnswersTab,
  ContentTab,
  OptimisationTab,
  MetaTab,
} from './tab';
import ActionBarContainer from '../Search/ActionBarContainer';
import AvatarIpfs from '../account/component/avatarIpfs';
import ContentItem from './contentItem';
import useGetIpfsContent from './useGetIpfsContentHook';
import { AppContext } from '../../context';

const dateFormat = require('dateformat');

const FileType = require('file-type');

const Pill = ({ children, active, ...props }) => (
  <Pane
    display="flex"
    fontSize="14px"
    borderRadius="20px"
    height="20px"
    paddingY="5px"
    paddingX="8px"
    alignItems="center"
    lineHeight="1"
    justifyContent="center"
    backgroundColor={active ? '#000' : '#36d6ae'}
    color={active ? '#36d6ae' : '#000'}
    {...props}
  >
    {children}
  </Pane>
);

const search = async (client, hash) => {
  try {
    const responseSearchResults = await client.search(hash);
    console.log(`responseSearchResults`, responseSearchResults);
    return responseSearchResults.result ? responseSearchResults.result : [];
  } catch (error) {
    return [];
  }
};

function Ipfs({ nodeIpfs, mobile }) {
  const { jsCyber } = useContext(AppContext);
  const { cid } = useParams();
  const location = useLocation();
  const dataGetIpfsContent = useGetIpfsContent(cid, nodeIpfs, 10);

  const [content, setContent] = useState('');
  const [typeContent, setTypeContent] = useState('');
  const [communityData, setCommunityData] = useState({});
  // const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('discussion');
  const [gateway, setGateway] = useState(null);
  const [placeholder, setPlaceholder] = useState('');
  const [dataToLink, setDataToLink] = useState([]);
  const [dataFromLink, setDataFromLink] = useState([]);
  const [dataAnswers, setDataAnswers] = useState([]);
  const [creator, setCreator] = useState({
    address: '',
    timestamp: '',
  });
  const [metaData, setMetaData] = useState({
    type: 'file',
    size: 0,
    blockSizes: [],
    data: '',
  });
  const [textBtn, setTextBtn] = useState(false);

  let contentTab;

  useEffect(() => {
    console.log(`dataGetIpfsContent`, dataGetIpfsContent)
    setContent(dataGetIpfsContent.content);
    setTypeContent(dataGetIpfsContent.typeContent);
    setGateway(dataGetIpfsContent.gateway);
    // setLoading(dataGetIpfsContent.loading);
    setMetaData(dataGetIpfsContent.metaData);
  }, [dataGetIpfsContent]);

  useEffect(() => {
    if (jsCyber !== null) {
      getLinks();
    }
  }, [cid, jsCyber]);

  const getLinks = () => {
    feacDataSearch();
    feachCidTo();
    feachCidFrom();
  };

  const feacDataSearch = async () => {
    const responseSearch = await search(jsCyber, cid);
    setDataAnswers(responseSearch);
  };

  const feachCidTo = async () => {
    const response = await getToLink(cid);
    console.log(`response`, response)
    if (response !== null && response.txs && response.txs.length > 0) {
      console.log('response To :>> ', response);
      setDataToLink(response.txs.reverse());
    }
  };

  const feachCidFrom = async () => {
    const response = await getFromLink(cid);
    if (response !== null && response.txs && response.txs.length > 0) {
      console.log('response From :>> ', response);
      const addressCreator = response.txs[0].tx.value.msg[0].value.address;
      const timeCreate = response.txs[0].timestamp;
      setCreator({
        address: addressCreator,
        timestamp: timeCreate,
      });
      const responseDataFromLink = response.txs.slice();
      responseDataFromLink.reverse();
      console.log('responseDataFromLink :>> ', responseDataFromLink);
      setDataFromLink(responseDataFromLink);
    }
  };

  useEffect(() => {
    let dataTemp = {};
    const tempArr = [...dataToLink, ...dataFromLink];
    if (tempArr.length > 0) {
      tempArr.forEach((item) => {
        const subject = item.tx.value.msg[0].value.address;
        if (dataTemp[subject]) {
          dataTemp[subject].amount += 1;
        } else {
          dataTemp = {
            ...dataTemp,
            [subject]: {
              amount: 1,
            },
          };
        }
      });
      setCommunityData(dataTemp);
    }
  }, [dataToLink, dataFromLink]);

  useEffect(() => {
    chekPathname();
  }, [location.pathname]);

  const chekPathname = () => {
    const { pathname } = location;

    if (
      pathname.match(/baclinks/gm) &&
      pathname.match(/baclinks/gm).length > 0
    ) {
      setSelected('meta');
    } else if (
      pathname.match(/community/gm) &&
      pathname.match(/community/gm).length > 0
    ) {
      setSelected('meta');
    } else if (
      pathname.match(/answers/gm) &&
      pathname.match(/answers/gm).length > 0
    ) {
      setTextBtn('add answer');
      setPlaceholder('add keywords, hash or file');
      setSelected('answers');
    } else if (
      pathname.match(/meta/gm) &&
      pathname.match(/meta/gm).length > 0
    ) {
      setSelected('meta');
    } else {
      setPlaceholder('add message');
      setTextBtn('Comment');
      setSelected('discussion');
    }
  };

  // if (loading) {
  //   return (
  //     <div
  //       style={{
  //         width: '100%',
  //         height: '50vh',
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         flexDirection: 'column',
  //       }}
  //     >
  //       <Loading />
  //     </div>
  //   );
  // }

  if (selected === 'answers') {
    contentTab = (
      <AnswersTab data={dataAnswers} mobile={mobile} nodeIpfs={nodeIpfs} />
    );
  }

  if (selected === 'discussion') {
    contentTab = (
      <DiscussionTab data={dataToLink} mobile={mobile} nodeIpfs={nodeIpfs} />
    );
  }

  // if (selected === 'content') {
  //   contentTab = (
  //     <ContentTab
  //       typeContent={typeContent}
  //       gateway={gateway}
  //       content={content}
  //       cid={cid}
  //     />
  //   );
  // }

  if (selected === 'meta') {
    contentTab = (
      <>
        <Pane width="60%" marginX="auto" marginTop="25px" fontSize="18px">
          Creator
        </Pane>
        <Pane
          alignItems="center"
          width="60%"
          marginX="auto"
          justifyContent="center"
          display="flex"
          flexDirection="column"
        >
          <Link to={`/network/bostrom/contract/${creator.address}`}>
            <Pane
              alignItems="center"
              marginX="auto"
              justifyContent="center"
              display="flex"
            >
              {creator.address.length > 11 && (
                <Pane> {creator.address.slice(0, 7)}</Pane>
              )}
              <AvatarIpfs node={nodeIpfs} addressCyber={creator.address} />
              {creator.address.length > 11 && (
                <Pane> {creator.address.slice(-6)}</Pane>
              )}
            </Pane>
          </Link>
          {creator.timestamp.length > 0 && (
            <Pane>{dateFormat(creator.timestamp, 'dd/mm/yyyy, HH:MM:ss')}</Pane>
          )}
        </Pane>
        <CommunityTab node={nodeIpfs} data={communityData} />
        <Pane width="60%" marginX="auto" marginBottom="15px" fontSize="18px">
          Backlinks
        </Pane>
        <OptimisationTab
          data={dataFromLink}
          mobile={mobile}
          nodeIpfs={nodeIpfs}
        />
        <Pane width="60%" marginX="auto" fontSize="18px">
          Meta
        </Pane>
        <MetaTab cid={cid} data={metaData} />
      </>
    );
  }

  return (
    <>
      <main
        className="block-body"
        style={{
          minHeight: 'calc(100vh - 70px)',
          paddingBottom: '5px',
          height: '1px',
          width: '100%',
        }}
      >
        {content.length === 0 ? (
          <div
            style={{
              width: '100%',
              // height: '50vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Loading />
          </div>
        ) : (
          <ContentTab
            typeContent={typeContent}
            gateway={gateway}
            content={content}
            cid={cid}
          />
        )}
        <Tablist
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(110px, 1fr))"
          gridGap="10px"
          marginTop={25}
          marginBottom={selected !== 'meta' ? 25 : 0}
          width="62%"
          marginX="auto"
        >
          {/* <TabBtn
          text="content"
          isSelected={selected === 'content'}
          to={`/ipfs/${cid}`}
        /> */}
          <TabBtn
            // text="answers"
            text={
              <Pane display="flex" alignItems="center">
                <Pane>answers</Pane>
                {dataAnswers.length > 0 && (
                  <Pill marginLeft={5} active={selected === 'answers'}>
                    {formatNumber(dataAnswers.length)}
                  </Pill>
                )}
              </Pane>
            }
            isSelected={selected === 'answers'}
            to={`/ipfs/${cid}/answers`}
          />
          <TabBtn
            // text="discussion"
            text={
              <Pane display="flex" alignItems="center">
                <Pane>discussion</Pane>
                {dataToLink && dataToLink.length > 0 && (
                  <Pill marginLeft={5} active={selected === 'discussion'}>
                    {formatNumber(dataToLink.length)}
                  </Pill>
                )}
              </Pane>
            }
            isSelected={selected === 'discussion'}
            to={`/ipfs/${cid}`}
          />
          <TabBtn
            text="meta"
            isSelected={selected === 'meta'}
            to={`/ipfs/${cid}/meta`}
          />
        </Tablist>
        {contentTab}
      </main>
      {!mobile && (selected === 'discussion' || selected === 'answers') && (
        <ActionBarContainer
          placeholder={placeholder}
          textBtn={textBtn}
          keywordHash={cid}
          update={() => getLinks()}
        />
      )}
    </>
  );
}

const mapStateToProps = (store) => {
  return {
    nodeIpfs: store.ipfs.ipfs,
    mobile: store.settings.mobile,
  };
};

export default connect(mapStateToProps)(Ipfs);
