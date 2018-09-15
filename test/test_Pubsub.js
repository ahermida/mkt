/**
 * Test Pubsub features and connecting users
 */
const mkt = require('../build/js/api.node.bundle.js');
const IPFS = require('ipfs');
const wrtc = require('wrtc');

const ipfs = new IPFS({
    repo: 'mkt',
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        ],
      },
    },
    EXPERIMENTAL: {
        pubsub: true,
    },
});

mkt()
