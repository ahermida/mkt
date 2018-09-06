/**
 * API for p2p interaction based on usernames
 */
import IPFS from 'ipfs';
import Core from './eth/eth.js';
import { getEth } from './eth/ethutil.js';
import Peer from './lib/peer.js';
import Channel from './lib/signal.js';
import Room from 'ipfs-pubsub-room';
import EventEmitter from 'events';
import elliptic from 'elliptic';

export default class Mkt extends EventEmitter {

  //setup requires a user's id, eth, and optionally webrtc for Node.js Users
  constructor(id, pk, webrtc) {
    super();
    this.id = id;
    this.peers = {};
    this.webrtc = webrtc;
    this.eth = null;
    this.core = null;
    this.ec = new elliptic.ec('secp256k1');
    this.pk = this.ec.keyFromSecret(pk, 'hex');
    this.ipfs = new IPFS({
        repo: id,
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
    this.ipfs.once('ready', () => ipfs.id((err, info) => {
        if (err) { throw err }
        this.ipfsID = info.id;
        this.emit('ipfs');
    }));

    //listen for messages in a room labeled by your name.
    this.room = Room(ipfs, `WNS#${id}`);

    //setup Eth api
    getEth().then(async (eth) => {
      this.eth = eth;
      const accounts = await eth.accounts();
      this.core = new Core(eth, accounts[0], this.ec);
      this.emit('eth');
    });

    //once our eth API is ready, start setting up new connections
    this.on('eth', () => {
      this.room.on('message', async (message) => {
        let parsed;
        try {
          parsed = JSON.parse(message.data);
          if (data.id == id)
            return;
        } catch(e) {
          console.log('Error parsing message', e, message);
          return;
        }


        //if peer not yet seen, derive sk and try to create peer
        let peerID = parsed.id
        if (!this.peers[peerID]) {
          const user = await this.core.getUserByName(peerID);
          if (user) {
            const sk = await this._deriveSK(user);

            //create peer
            this.peers[peerID] = new Peer(peerID, sk, new Channel({ room: this.room, id }));

            //listen for disconnects, delete if need be
            this.peers[peerID].on('disconnect', () => {
              if (!this.peers[peerID].connected()) {
                delete this.peers[peerID];
                console.log(peerID, "disconnected");
              }
            });

            //when we connect to a peer, remove peer
            this.peers[peerID].on('connect', () => {
              console.log(peerID, "connected");
              this.emit('peer', this.peers[peerID]);
            });
          }
        }
      });
    })
  }

  //connect to another peer
  connect(username) {

  }

  //Derive shared key
  async _deriveSK(user) {
    const pub = await user.getPublicKey();
    const pubk = this.ec.keyFromPublic(pub, 'hex');
    return this.pk.derive(pubk).toString(16);
  }
}
