import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import { getGraphQLQuery } from '../../utils/search/utils';
import { Loading } from '../../components';

// const CYBERLINK_SUBSCRIPTION = gql`
//   subscription newCyberlinkLink {
//     cyberlink(limit: 1, order_by: { height: desc }) {
//       object_from
//       object_to
//       subject
//       txhash
//     }
//   }
// `;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const ForceGraph = ({ match }) => {
  let graph;
  const { agent } = match.params;
  const [hasLoaded, setHasLoaded] = useState(true);
  const [data, setItems] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();

  var limit = 1024
  var where
  useEffect(() => {
    const feachData = async () => {
      if (typeof(agent) != "undefined") {
        where = `{subject: {_eq: "${agent}"}}`
      } else { 
        where = "{}"
      }
      var GET_CYBERLINKS = `
      query Cyberlinks {
        cyberlinks(limit: ${String(
          limit
        )}, order_by: {height: desc}, where: ${where}) {
          object_from
          object_to
          subject
          transaction_hash
        }
      }
      `;
      const { cyberlinks } = await getGraphQLQuery(GET_CYBERLINKS);
      const from = cyberlinks.map((a) => a.object_from);
      const to = cyberlinks.map((a) => a.object_to);
      const set = new Set(from.concat(to));
      const object = [];
      set.forEach(function (value) {
        object.push({ id: value });
      });

      for (let i = 0; i < cyberlinks.length; i++) {
        cyberlinks[i] = {
          source: cyberlinks[i].object_from,
          target: cyberlinks[i].object_to,
          name: cyberlinks[i].transaction_hash,
          subject: cyberlinks[i].subject,
          // curvative: getRandomInt(20, 500) / 1000,
        };
      }
      graph = {
        nodes: object,
        links: cyberlinks,
      };
      setItems(graph);
      setLoading(false);
    };
    feachData();
  }, []);

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
      window.open(`https://cyber.page/ipfs/${node.id}`, '_blank');
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
    console.log('engine stopped!');
    setHasLoaded(false);
  });

  // const handleNewLink = useCallback(subscription => {
  //   let link = subscription["subscriptionData"].data["cyberlink"][0]
  //     let { nodes, links } = data;
  //     let l = {
  //       source: link["object_from"],
  //       target: link["object_to"],
  //       name: link["txhash"]
  //     }

  //     if (!nodes.some(node => node["id"] == l["source"])) {
  //       nodes.push({id: l["source"]})
  //     }

  //     if (!nodes.some(node => node["id"] == l["target"])) {
  //       nodes.push({id: l["target"]})
  //     }

  //     setItems({
  //         nodes: [...nodes],
  //         links: [...links, {
  //           source: l["source"],
  //           target: l["target"],
  //           name: l["name"],
  //           curvative: getRandomInt(20,500)/1000
  //         }]
  //     })
  // }, [data])

  // const { loading: loadingLinks, data: dataNew } = useSubscription(CYBERLINK_SUBSCRIPTION, {
  //   onSubscriptionData: handleNewLink
  // });

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

  var pocket
  if (localStorage.getItem('pocket') != null) {
    var localStoragePocketData = JSON.parse(localStorage.getItem('pocket'));
    var keyPocket = Object.keys(localStoragePocketData)[0];
    pocket = localStoragePocketData[keyPocket]["cyber"].bech32
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
        warmupTicks={420}
        cooldownTicks={0}
        enableNodeDrag={false}
        enablePointerInteraction
        nodeLabel="id"
        nodeColor={() => 'rgba(0,100,235,1)'}
        nodeOpacity={1.0}
        nodeRelSize={8}
        linkColor={(link) =>
          localStorage.getItem('pocket') != null
            ? link.subject == pocket
              ? 'red'
              : 'rgba(9,255,13,1)'
            : 'rgba(9,255,13,1)'
        }
        linkWidth={4}
        linkCurvature={0.2}
        linkOpacity={0.7}
        linkDirectionalParticles={1}
        linkDirectionalParticleColor={() => 'rgba(9,255,13,1)'}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleSpeed={0.015}
        
        // linkDirectionalArrowRelPos={1}
        // linkDirectionalArrowLength={10}
        // linkDirectionalArrowColor={() => 'rgba(9,255,13,1)'}

        onNodeClick={handleNodeRightClick}
        onNodeRightClick={handleNodeClick}
        onLinkClick={handleLinkRightClick}
        onLinkRightClick={handleLinkClick}
        onEngineStop={handleEngineStop}
      />
    </div>
  );
};

export default ForceGraph;
