import React from 'react';
import { Link } from 'react-router-dom';
import { Pane } from '@cybercongress/gravity';
import { Rank, NoItems } from '../../../components';
import { exponentialToDecimal } from '../../../utils/utils';
import ContentItem from '../../ipfs/contentItem';

function AppsTab({ data, node, mobile }) {
  try {
    const apps = [];
    if (Object.keys(data).length > 0) {
      apps.push(
        Object.keys(data).map((key, i) => {
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
                    rank={exponentialToDecimal(
                      parseFloat(data[key].rank).toPrecision(3)
                    )}
                    grade={data[key].grade}
                    // onClick={() => onClickRank(key)}
                  />
                </Pane>
              )}
              <ContentItem
                nodeIpfs={node}
                cid={key}
                item={data[key]}
                className="contentItem"
              />
            </Pane>
          );
        })
      );
    }
    return (
      <Pane
        width="90%"
        marginX="auto"
        marginY={0}
        display="flex"
        flexDirection="column"
      >
        <div className="container-contentItem" style={{ width: '100%' }}>
          {Object.keys(data).length > 0 ? apps : <NoItems text="No apps" />}
        </div>
      </Pane>
    );
  } catch (error) {
    console.log(error);
    return <div>oops...</div>;
  }
}

export default AppsTab;
