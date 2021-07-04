import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Pane, SearchItem } from '@cybercongress/gravity';
import Iframe from 'react-iframe';
import { NoItems, LinkWindow, Dots, Rank } from '../../../components';
import { formatNumber } from '../../../utils/utils';
import CodeBlock from '../../ipfs/codeBlock';
import ContentItem from '../../ipfs/contentItem';

const htmlParser = require('react-markdown/plugins/html-parser');

const parseHtml = htmlParser({
  isValidNode: (node) => node.type !== 'script',
});

function timeSince(timeMS) {
  const seconds = Math.floor(timeMS / 1000);

  if (seconds === 0) {
    return 'now';
  }

  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return `${interval} years`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes`;
  }
  return `${Math.floor(seconds)} seconds`;
}

function MainTab({ loadingTwit, mobile, tweets, nodeIpfs }) {
  try {
    const searchItems = [];
    const d = new Date();

    if (loadingTwit) {
      return <Dots />;
    }

    searchItems.push(
      Object.keys(tweets)
        .sort((a, b) => {
          const x = Date.parse(tweets[a].time);
          const y = Date.parse(tweets[b].time);
          return y - x;
        })
        .map((key, i) => {
          let timeAgoInMS = 0;
          const time = Date.parse(d) - Date.parse(tweets[key].time);
          if (time > 0) {
            timeAgoInMS = time;
          }
          return (
            <Pane
              position="relative"
              className="hover-rank"
              display="flex"
              alignItems="center"
              marginBottom="10px"
              key={`${key}_${i}`}
            >
              {!mobile && (
                <Pane
                  className="time-discussion rank-contentItem"
                  position="absolute"
                >
                  <Rank
                    hash={key}
                    rank="n/a"
                    grade={{ from: 'n/a', to: 'n/a', value: 'n/a' }}
                  />
                </Pane>
              )}
              <ContentItem
                nodeIpfs={nodeIpfs}
                cid={key}
                item={tweets[key]}
                className="contentItem"
              />
              <Pane
                className="time-discussion rank-contentItem"
                position="absolute"
                right="0"
                fontSize={12}
                whiteSpace="nowrap"
                top="5px"
              >
                {timeSince(timeAgoInMS)} ago
              </Pane>
            </Pane>
          );
        })
    );

    return (
      <Pane
        width="90%"
        marginX="auto"
        marginY={0}
        display="flex"
        flexDirection="column"
      >
        <div className="container-contentItem" style={{ width: '100%' }}>
          {Object.keys(tweets).length > 0 ? (
            searchItems
          ) : (
            <NoItems text="No feeds" />
          )}
        </div>
      </Pane>
    );
  } catch (error) {
    console.log(error);
    return <div>oops...</div>;
  }
}

export default MainTab;
