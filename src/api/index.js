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

    //Let ourselves know we're ready
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
        this.getPeer(peerID);
      });
    })
  }

  //connect to peer
  async connect(username) {
    const peer = await getPeer(username);
    if (peer) {
      peer.initialize();
      return peer;
    }
  }

  //setup peer object
  async getPeer(username) {

    //if peer not yet seen, derive sk and try to create peer
    if (!this.peers[username]) {
      const user = await this.core.mkt.contains(username);
      if (user) {
        const sk = await this._deriveSK(user);

        //create peer with room
        this.peers[username] = new Peer(username, sk, new Channel({ room: this.room }), this.webrtc);

        //listen for disconnects, delete if need be
        this.peers[username].on('disconnect', () => {
          if (!this.peers[username].connected()) {
            delete this.peers[username];
            console.log(username, "disconnected");
          }
        });

        //when we connect to a peer, remove peer
        this.peers[username].on('connect', () => {
          console.log(username, "connected");
          this.emit('peer', this.peers[username]);
        });

        return this.peers[username];
      }
    }
  }

  //Derive shared key
  async _deriveSK(user) {
    const pub = await this.core.mkt.getPublicKey(user);
    const pubk = this.ec.keyFromPublic(pub, 'hex');
    return this.pk.derive(pubk).toString(16);
  }
}
