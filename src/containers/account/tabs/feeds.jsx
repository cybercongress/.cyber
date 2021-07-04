import React from 'react';
import { Link } from 'react-router-dom';
import { Pane } from '@cybercongress/gravity';
import ContentItem from '../../ipfs/contentItem';
import { Rank, NoItems } from '../../../components';

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

function FeedsTab({ data, mobile, nodeIpfs }) {
  if (data && data.length > 0) {
    const d = new Date();
    return (
      <div className="container-contentItem" style={{ width: '100%' }}>
        {data
          .sort((a, b) => {
            const x = Date.parse(a.timestamp);
            const y = Date.parse(b.timestamp);
            return y - x;
          })
          .map((item, i) => {
            const cid = item.tx.value.msg[0].value.links[0].to;
            let timeAgoInMS = 0;
            const time = Date.parse(d) - Date.parse(item.timestamp);
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
                key={`${cid}_${i}`}
              >
                {!mobile && (
                  <Pane
                    className="time-discussion rank-contentItem"
                    position="absolute"
                  >
                    <Rank
                      hash={item.object_to}
                      rank="n/a"
                      grade={{ from: 'n/a', to: 'n/a', value: 'n/a' }}
                    />
                  </Pane>
                )}
                <ContentItem
                  nodeIpfs={nodeIpfs}
                  cid={cid}
                  item={item}
                  className="contentItem-discussion"
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
          })}
      </div>
    );
  }
  return (
    <div className="container-contentItem">
      <NoItems text="No feeds" />
    </div>
  );
}

export default FeedsTab;
