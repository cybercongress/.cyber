import React from 'react';
import { Pane } from '@cybercongress/gravity';
import ContentItem from '../contentItem';
import { Rank, NoItems } from '../../../components';
import { getRankGrade } from '../../../utils/search/utils';
import { exponentialToDecimal } from '../../../utils/utils';

function AnswersTab({ data, mobile, nodeIpfs }) {
  if (data.length > 0) {
    return (
      <div className="container-contentItem" style={{ width: '100%' }}>
        {data.map((item, i) => {
          const grade = getRankGrade(item.rank);
          return (
            <Pane
              position="relative"
              className="hover-rank"
              display="flex"
              alignItems="center"
              marginBottom="10px"
              key={`${item.cid}_${i}`}
            >
              {!mobile && (
                <Pane
                  className="time-discussion rank-contentItem"
                  position="absolute"
                >
                  <Rank
                    hash={item.cid}
                    rank={exponentialToDecimal(
                      parseFloat(item.rank).toPrecision(3)
                    )}
                    grade={grade}
                  />
                </Pane>
              )}
              <ContentItem
                nodeIpfs={nodeIpfs}
                cid={item.cid}
                item={item}
                className="contentItem"
              />
            </Pane>
          );
        })}
      </div>
    );
  }
  return (
    <div className="container-contentItem">
      <NoItems text="no answers" />
    </div>
  );
}

export default AnswersTab;
