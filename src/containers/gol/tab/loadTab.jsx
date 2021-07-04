import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TableEv as Table, Pane } from '@cybercongress/gravity';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loading, TextTable, Dots } from '../../../components';
import { DISTRIBUTION, TAKEOFF } from '../../../utils/config';
import { formatNumber, trimString } from '../../../utils/utils';
import setLeaderboard from '../hooks/leaderboard';

function LoadTab({ data }) {
  const [itemsToShow, setItemsToShow] = useState(40);

  const setNextDisplayedPalettes = useCallback(() => {
    setTimeout(() => {
      setItemsToShow(itemsToShow + 5);
    }, 250);
  }, [itemsToShow, setItemsToShow]);

  const displayedPalettes = useMemo(
    () => Object.entries(data).slice(0, itemsToShow),
    [itemsToShow]
  );

  const itemTable = displayedPalettes.map((item) => (
    <Table.Row
      paddingX={0}
      paddingY={5}
      display="flex"
      minHeight="48px"
      borderBottom="none"
      height="fit-content"
      key={item[0]}
    >
      <Table.TextCell flex={2}>
        <TextTable>
          <Link to={`/network/bostrom/contract/${item[0]}`}>{item[0]}</Link>
        </TextTable>
      </Table.TextCell>
      <Table.TextCell flex={0.5} textAlign="end">
        <TextTable>{formatNumber(Math.floor(item[1].sum))}</TextTable>
      </Table.TextCell>
    </Table.Row>
  ));

  return (
    <Table width="100%">
      <Table.Head
        style={{
          backgroundColor: '#000',
          borderBottom: '1px solid #ffffff80',
          marginTop: '10px',
          padding: 7,
          paddingBottom: '10px',
        }}
      >
        <Table.TextHeaderCell flex={2} textAlign="center">
          <TextTable>Address</TextTable>
        </Table.TextHeaderCell>
        <Table.TextHeaderCell flex={0.5} textAlign="center">
          <TextTable>CYB won</TextTable>
        </Table.TextHeaderCell>
      </Table.Head>
      <Table.Body
        style={{
          backgroundColor: '#000',
          overflowY: 'hidden',
          padding: 7,
        }}
      >
        <InfiniteScroll
          dataLength={Object.keys(displayedPalettes).length}
          next={setNextDisplayedPalettes}
          hasMore={data.length !== Object.keys(displayedPalettes).length}
          loader={
            <h4>
              Loading
              <Dots />
            </h4>
          }
          pullDownToRefresh
          pullDownToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>
              &#8595; Pull down to refresh
            </h3>
          }
          releaseToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
          }
          refreshFunction={setNextDisplayedPalettes}
        >
          {Object.keys(data).length > 0 && itemTable}
        </InfiniteScroll>
      </Table.Body>
    </Table>
  );
}

export default LoadTab;
