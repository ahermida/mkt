import user from '../../../build/contracts/User.json';
import { utils } from 'web3';

//Part of PKI on Ethereum
export default class User {
  constructor(eth, account, address) {
    this.account = account;
    this.address = address;
    this.user = new web3.eth.Contract(user.abi, address, {
      from: account,
      gas: 300000,
      data: user.bytecode,
    });
  }

  //shouldn't be used directly, prefer use from api
  async changePK(pka, pkb) {
    const tx = await this.user.methods.changePK(utils.fromAscii(pka), utils.fromAscii(pkb)).send({from: this.account});
    return tx;
  }
}
