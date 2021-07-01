import { useEffect, useState } from 'react';
import { isMobileTablet } from './utils/utils';

const IPFS = require('ipfs');
const DetectRTC = require('detectrtc');

const initIpfsNode = async () => {
  let nodeIpfs = null;
  let ipfsStatus = false;
  let id = null;
  try {
    const node = await IPFS.create({
      repo: 'ipfs-repo-cyber',
      init: true,
      start: true,
      relay: {
        enabled: true,
        hop: {
          enabled: true,
        },
      },
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Addresses: {
          Swarm: [
            // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
            '/dns4/ws-star.discovery.cybernode.ai/tcp/443/wss/p2p-webrtc-star',
            '/ip4/159.89.24.179/tcp/4001/p2p/QmZBfqaL2L92rrTWR2Cdmor3R3EBLaoYzeVLEEwE3AJmWe',
            '/ip6/2a03:b0c0:3:d0::4ed:8001/tcp/4001/p2p/QmZBfqaL2L92rrTWR2Cdmor3R3EBLaoYzeVLEEwE3AJmWe',
          ],
        },
        Bootstrap: [
          '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
          '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
        ],
      },
    });
    console.log('node init false', node);
    nodeIpfs = node;
    if (nodeIpfs !== null) {
      const status = await node.isOnline();
      ipfsStatus = status;
      const responseId = await node.id();
      id = responseId;
    }
    return {
      nodeIpfs,
      ipfsStatus,
      id,
    };
  } catch (error) {
    console.log(error);
    const node = await IPFS.create({
      repo: 'ipfs-repo-cyber',
      init: false,
      start: true,
      relay: {
        enabled: true,
        hop: {
          enabled: true,
        },
      },
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.cybernode.ai/tcp/443/wss/p2p-webrtc-star',
            '/ip4/159.89.24.179/tcp/4001/p2p/QmZBfqaL2L92rrTWR2Cdmor3R3EBLaoYzeVLEEwE3AJmWe',
            '/ip6/2a03:b0c0:3:d0::4ed:8001/tcp/4001/p2p/QmZBfqaL2L92rrTWR2Cdmor3R3EBLaoYzeVLEEwE3AJmWe',
          ],
        },
        Bootstrap: [
          '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
          '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
        ],
      },
    });
    console.log('node init true', node);
    nodeIpfs = node;
    if (node !== null) {
      const status = await node.isOnline();
      ipfsStatus = status;
      const responseId = await node.id();
      id = responseId;
    }
    return {
      nodeIpfs,
      ipfsStatus,
      id,
    };
  }
};

const useIpfsStart = () => {
  const [node, setNode] = useState(null);
  const [loader, setLoader] = useState(true);
  const [status, setStatus] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const isMobile = isMobileTablet();
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      setMobile(isMobile);
      //     setLoader(false);
      // //     console.log('DetectRTC.isWebRTCSupported', DetectRTC.isWebRTCSupported);
      if (!isMobile) {
        if (DetectRTC.isWebRTCSupported && !isSafari) {
          const data = await initIpfsNode();
          setNode(data.nodeIpfs);
          setStatus(data.ipfsStatus);
          setLoader(false);
          setId(data.id);
        } else {
          setLoader(false);
        }
      } else {
        setLoader(false);
      }
    };
    init();
  }, []);

  return {
    node,
    loader,
    status,
    mobile,
    id,
  };
};

export default useIpfsStart;
