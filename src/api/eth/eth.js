/**
 * Mkt core eth interacion
 */
import Mkt from './Mkt.js';
import User from './User.js';

export default class Core {

  constructor(web3, account, ec) {
    this.web3 = web3;
    this.account = account;
    this.ec = ec;

    //expects environment variable for mkt address & network
    const MKT_ADDRESS = process ? process.env.MKT_ADDRESS : "address";
    this.mkt = new Mkt(this.web3, this.account, MKT_ADDRESS);
  }

  //target user and return it
  async getUser(username) {
    const address = await this.mkt.getPublicKey(username);
    return new User(this.web3, this.account, address);
  }

  //create new user
  async newUser(username) {

    //Generate keys
    const key = this.ec.genKeyPair();
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
      let checkForTransaction = setInterval(async () => {
        let blockMined = await this.web3.eth.getTransactionReceipt(tx);
        if (blockMined) {
          const addr = blockMined.contractAddress;
          const blockNum = blockMined.blockNumber.toString();
          clearInterval(checkForTransaction);
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
