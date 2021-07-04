import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import { connect } from 'react-redux';
import { Loading } from '../../components';

import useGetDataGql from './hooks';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const ForceQuitter = ({ nodeIpfs }) => {
  let graph;
  const [hasLoaded, setHasLoaded] = useState(true);
  const { data: dataGql } = useGetDataGql(nodeIpfs);
  const [data, setItems] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();

  useEffect(() => {
    const feachData = async () => {
      if (dataGql.length > 0) {
        const from = dataGql.map((a) => a.subject);
        const to = dataGql.map((a) => a.to);
        const set = new Set(from.concat(to));
        const object = [];
        set.forEach((value) => {
          object.push({ id: value });
        });

        const dataGqlObj = dataGql.reduce(
          (obj, item) => [
            ...obj,
            {
              source: item.subject,
              target: item.to,
              name: item.txhash,
              subject: item.subject,
            },
          ],
          []
        );
        // console.log('dataGqlObj', dataGqlObj);
        // console.log('object', object);
        graph = {
          nodes: object,
          links: dataGqlObj,
        };
        setItems(graph);
        setLoading(false);
      }
    };
    feachData();
  }, [dataGql]);

  const handleNodeClick = useCallback(
    (node) => {
      const distance = 300;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        5000
      );
    },
    [fgRef]
  );

  const handleLinkClick = useCallback(
    (link) => {
      const node = link.target;
      const distance = 300;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        5000
      );
    },
    [fgRef]
  );

  const handleNodeRightClick = useCallback(
    (node) => {
      window.open(`https://cyber.page/network/bostrom/contract/${node.id}`, '_blank');
    },
    [fgRef]
  );

  const handleLinkRightClick = useCallback(
    (link) => {
      window.open(`https://cyber.page/network/bostrom/tx/${link.name}`, '_blank');
    },
    [fgRef]
  );

  const handleEngineStop = useCallback(() => {
    console.log('rendering engine is stopped!');
    setHasLoaded(false);

  });

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
          receiving data
        </div>
      </div>
    );
  }

  let pocket;
  if (localStorage.getItem('pocket') != null) {
    const localStoragePocketData = JSON.parse(localStorage.getItem('pocket'));
    const keyPocket = Object.keys(localStoragePocketData)[0];
    pocket = localStoragePocketData[keyPocket].cyber.bech32;
  }

  return (
    <div>
      {hasLoaded && (
        <div
          style={{
            width: '100%',
            height: '50vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'absolute',
            zIndex: 2,
          }}
        >
          <Loading />
          <div style={{ color: '#fff', marginTop: 20, fontSize: 20 }}>
            rendering brain
          </div>
        </div>
      )}
      <ForceGraph3D
        graphData={data}
        ref={fgRef}
        showNavInfo
        backgroundColor="#000000"
        warmupTicks={64}
        cooldownTicks={0}
        enableNodeDrag={false}
        enablePointerInteraction
        nodeLabel="id"
        nodeColor={(link) =>
          localStorage.getItem('pocket') != null
            ? link.id == pocket
              ? 'red'
              : 'white'
            : 'white'}
        nodeOpacity={1.0}
        nodeRelSize={8}
        nodeResolution={16}
        linkColor={(link) =>
          localStorage.getItem('pocket') != null
            ? link.subject == pocket
              ? 'red'
              : 'blue'
            : 'blue'
        }
        linkWidth={2}
        linkCurvature={0.2}
        linkOpacity={0.7}
        linkDirectionalParticles={1}
        linkDirectionalParticleColor={(link) =>
          localStorage.getItem('pocket') != null
            ? link.subject == pocket
              ? 'red'
              : 'blue'
            : 'blue'
        }
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.01}
        
        linkDirectionalArrowRelPos={1.15}
        linkDirectionalArrowLength={10}
        linkDirectionalArrowResolution={16}
        linkDirectionalArrowColor={(link) =>
          localStorage.getItem('pocket') != null
            ? link.subject == pocket
              ? 'red'
              : 'blue'
            : 'blue'
        }

        onNodeClick={handleNodeRightClick}
        onNodeRightClick={handleNodeClick}
        onLinkClick={handleLinkRightClick}
        onLinkRightClick={handleLinkClick}
        onEngineStop={handleEngineStop}
      />
    </div>
  );
};

const mapStateToProps = (store) => {
  return {
    nodeIpfs: store.ipfs.ipfs,
  };
};

export default connect(mapStateToProps)(ForceQuitter);
