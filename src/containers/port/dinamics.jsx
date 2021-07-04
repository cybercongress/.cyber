import React, { Component, useCallback, useMemo, useState } from 'react';
import Plotly from 'react-plotly.js';
import { Pane } from '@cybercongress/gravity';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { x, cap, p } from './list';
import { CYBER } from '../../utils/config';
import { formatNumber, trimString } from '../../utils/utils';
import { layout, config, dataDiscount } from './configPlotly';
import { LinkWindow, Tooltip, FormatNumber, Dots } from '../../components';

import reader from '../../image/reader-outline.svg';

const Progress = ({ data }) => {
  const [itemsToShow, setItemsToShow] = useState(30);

  const setNextDisplayedPalettes = useCallback(() => {
    setTimeout(() => {
      setItemsToShow(itemsToShow + 10);
    }, 50);
  }, [itemsToShow, setItemsToShow]);

  const displayedPalettes = useMemo(() => data.slice(0, itemsToShow), [
    itemsToShow,
  ]);

  const items = displayedPalettes.map((item) => (
    <Pane
      key={item.eth_txhash}
      display="flex"
      paddingX={20}
      paddingY={20}
      alignItems="center"
      // boxShadow="0 0 2px #3ab793"
      borderBottom="1px solid #3ab79375"
      // borderRadius="5px"
      marginBottom={10}
    >
      <Pane fontSize="18px" display="flex" flex={1}>
        <LinkWindow to={`http://etherscan.io/address/${item.sender}`}>
          <Pane marginRight={10}>{trimString(item.sender, 8, 5)}</Pane>
        </LinkWindow>
        <Pane>bought</Pane>
      </Pane>
      {item.eul === null ? (
        <Pane color="#FFF" fontSize="18px" marginX={5}>
          PROCESSING
        </Pane>
      ) : (
        <Pane color="#00e676" display="flex" fontSize="18px" marginX={5}>
          +
          <FormatNumber
            marginLeft={3}
            number={formatNumber(
              Math.floor((item.eul / CYBER.DIVISOR_CYBER_G) * 1000) / 1000,
              3
            )}
            currency="GCYB"
            fontSizeDecimal={16}
            // number={item.eul}
          />
          {/* (parseInt(item.eul, 10), 'CYB')} */}
        </Pane>
      )}
      {item.cyber_hash !== null && (
        <Pane>
          <Tooltip placement="top" tooltip="Proof Tx">
            <Link
              style={{ display: 'flex' }}
              to={`/network/bostrom/tx/${item.cyber_hash.toUpperCase()}`}
            >
              <img
                src={reader}
                alt="img"
                style={{ width: '20px', height: '20px' }}
              />
            </Link>
          </Tooltip>
        </Pane>
      )}
    </Pane>
  ));

  return (
    <InfiniteScroll
      dataLength={Object.keys(displayedPalettes).length}
      next={setNextDisplayedPalettes}
      hasMore={itemsToShow < data.length}
      loader={
        <h4>
          Loading
          <Dots />
        </h4>
      }
      pullDownToRefresh
      pullDownToRefreshContent={
        <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
      }
      releaseToRefreshContent={
        <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
      }
      refreshFunction={setNextDisplayedPalettes}
    >
      {data.length > 0 ? items : <div>No txs</div>}
    </InfiniteScroll>
  );
};

class Dinamics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      caps: '',
      width: 890,
      height: 350,
      size: 16,
      margin: {
        l: 40,
        r: 20,
        b: 40,
        t: 10,
        pad: 4,
      },
    };
  }

  componentDidMount() {
    const { mobile } = this.props;
    if (mobile) {
      this.setState({
        width: 360,
        height: 250,
        size: 14,
        margin: {
          l: 30,
          r: 8,
          b: 35,
          t: 0,
          pad: 2,
        },
      });
    }
  }

  plotlyHover = (dataPoint) => {
    const { cap: capProps } = this.props;
    try {
      if (dataPoint.points[0]) {
        if (x.indexOf(dataPoint.points[0].x) !== -1) {
          const capPoint = cap[x.indexOf(dataPoint.points[0].x)];
          this.setState({
            caps: formatNumber(capPoint),
          });
        } else {
          this.setState({
            caps: formatNumber(capProps),
          });
        }
      }
    } catch (error) {
      this.setState({
        caps: formatNumber(capProps),
      });
    }
  };

  plotUnhover = () => {
    this.setState({
      caps: '',
    });
  };

  render() {
    const { caps, width, height, size, margin } = this.state;
    const { data3d, dataTxs } = this.props;

    return (
      <>
        <div className="container-dinamics">
          <Plotly
            data={dataDiscount(caps, data3d)}
            layout={layout(size, width, height, margin)}
            onHover={(figure) => this.plotlyHover(figure)}
            onUnhover={(figure) => this.plotUnhover(figure)}
            config={config}
          />
        </div>
        {!dataTxs.loading && dataTxs.data.length > 0 && (
          <Pane marginTop={15}>
            <Progress data={dataTxs.data} />
          </Pane>
        )}
      </>
    );
  }
}

export default Dinamics;
