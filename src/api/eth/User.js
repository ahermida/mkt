import user from '../../../build/contracts/User.json';
import { fromUtf8, toUtf8 } from 'ethjs';

//Part of PKI on Ethereum
export default class User {
  constructor(eth, account, address) {
    this.address = address;
    this.user = eth.contract(user.abi, user.bytecode, {
      from: account,
      gas: 300000,
    }).at(address);
  }

  //shouldn't be used directly, prefer use from api
  async changePK(pubKey) {
    const tx = await this.user.changePK(fromUtf8(pubKey));
    return tx;
  }
}
