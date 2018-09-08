/**
 * Wavey core eth interacion
 */
import { fromUtf8, toUtf8 } from 'ethjs';
import abi from 'ethjs-abi';
import Mkt from './Mkt.js';
import User from './User.js';

//expects environment variable for mkt address & network
const MKT_ADDRESS = process.env.MKT_ADDRESS;
const MKT_NETWORK = process.env.MKT_NETWORK;

export default class Core {

  constructor(eth, account, ec) {
    this.eth = eth;
    this.account = account;
    this.ec = ec;
    this.MKT_ADDRESS = MKT_ADDRESS;
    this.mkt = new Mkt(this.eth, MKT_ADDRESS);
    this.username = '';
  }

  //target user and return it
  async login(username) {
    const address = await this.mkt.getPublicKey(username);
    return new User(this.eth, this.account, address);
  }

  //create new user
  async newUser(username) {

    //Generate keys
    const key = ec.genKeyPair();
    const keys = {
      public: key.getPublic().encode('hex'),
      private: key.getPrivate().toString(16)
    };

    //shoot out transaction
    const tx = await this.mkt.newUser(username, keys.public);

    //send out a promise, we don't want to await the actual block.
    const completed = new Promise((resolve, reject) => {
      let counter = 0;

      //check if transaction was mined, when done switch routes
      let checkForTransaction = window.setInterval(async () => {
        let blockMined = await this.eth.getTransactionReceipt(tx);
        if (blockMined) {
          const addr = blockMined.contractAddress;
          const blockNum = blockMined.blockNumber.toString();
          window.clearInterval(checkForTransaction);
          resolve(addr);
        }
        if (++counter > 60) {
          reject('Took longer than 2 minutes to mine, maybe try a higher gas price.');
        }
      }, 2000);
    });

    //return keys, the promise, and tx
    return {
      ...keys,
      completed,
      tx,
    };
  }

  //change a user's private key (if we're the owner)
  async changePK(user) {

    //generate keys
    const key = ec.genKeyPair();
    const keys = {
      public: key.getPublic().encode('hex'),
      private: key.getPrivate().toString(16)
    };
    const tx = await user.changePK(keys.public);
    return {
      ...keys,
      tx,
    };
  }
}
