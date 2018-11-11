import Mkt from '../api/index.js';
import IPFS from 'ipfs';

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

const app = new Mkt({ipfs});


console.log(app);
