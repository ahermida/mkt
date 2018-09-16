/**
 * API for p2p interaction based on usernames
 */
import Core from './eth/eth.js';
import { getEth } from './eth/ethutil.js';
import Peer from './lib/peer.js';
import Channel from './lib/signal.js';
import Room from 'ipfs-pubsub-room';
import EventEmitter from 'events';
import elliptic from 'elliptic';

export default class App extends EventEmitter {

  //setup requires a user's id, eth, and optionally webrtc for Node.js Users
  constructor({ipfs, id, pk, webrtc}) {
    super();
    this.id = id;
    this.pk = pk ? this.ec.keyFromSecret(pk, 'hex') : "";
    this.peers = {};
    this.ipfs = ipfs;
    this.webrtc = webrtc;
    this.eth = null;
    this.core = null;
    this.ec = new elliptic.ec('secp256k1');
    this.room = null;

    //setup eth api
    getEth().then(async (eth) => {
      this.eth = eth;
      const accounts = await eth.accounts();
      this.core = new Core(eth, accounts[0], this.ec);
      this.emit('eth');
    });

    //if we have an id and private key -> get started listening for connections
    if (this.id && this.pk) {
      this.on('eth', () => this.listen(this.id, this.pk));
    }
  }

  //listen to new connection
  listen(id, pk) {

    if (!this.ipfs || !this.ipfs.pubsub) {
      throw new Error('Cannot listen to messages without IPFS (with pubsub enabled)');
    }

    //listen for messages in a room labeled by your name.
    this.room = Room(ipfs, `mkt#${id}`);

    //listen to eth booting up
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
