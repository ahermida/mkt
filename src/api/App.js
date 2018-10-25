/**
 * API for p2p interaction based on usernames
 */
import Core from './eth/eth.js';
import { getWeb3 } from './eth/ethutil.js';
import Peer from './lib/peer.js';
import Channel from './lib/signal.js';
import Room from 'ipfs-pubsub-room';
import EventEmitter from 'events';
import elliptic from 'elliptic';

export default class App extends EventEmitter {

  //setup requires a user's id, eth, and optionally webrtc for Node.js Users
  constructor({ipfs, id, pk, webrtc} = {}) {
    super();
    this.id = id;
    this.ec = new elliptic.ec('secp256k1');
    this.pk = pk ? this.ec.keyFromPrivate(pk, 'hex') : "";
    this.peers = {};
    this.ipfs = ipfs;
    this.webrtc = webrtc;
    this.core = null;
    this.room = null;

    //setup eth api
    getWeb3().then(async (web3) => {
      this.web3 = web3;
      const accounts = await web3.eth.getAccounts();
      this.core = new Core(web3, accounts[0], this.ec);
      this.emit('eth');
    });

    if (this.pk) {
      this.pk.getPublic();
    }

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

    if (pk) {
      this.pk = this.ec.keyFromPrivate(pk, 'hex');
      this.pk.getPublic();
    } else if (!this.pk) {
      throw new Error('Cannot listen to messages without passing in private key');
    }

    return new Promise((resolve, reject) => {

      //listen for messages in a room labeled by your name.
      this.room = Room(this.ipfs, `mkt#${id}`);

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

      //resolve when you're actually subscribed to the room, reject if error
      this.room.on('subscribed', () => resolve());
      this.room.on('error', err => reject(err));
    });
  }

  //connect to peer
  async connect(username) {
    const peer = await this.getPeer(username);
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
      console.log("USER", user);
      if (user) {
        const sk = await this._deriveSK(username);
        console.log("SK", sk);
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
    const pubk = this.ec.keyFromPublic(pub, 'hex').getPublic();
    return this.pk.derive(pubk).toString(16);
  }

  async waitFor(username) {

  }
}
