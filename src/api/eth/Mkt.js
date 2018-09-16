import mkt from '../../../build/contracts/Mkt.json';
import { fromUtf8, toUtf8 } from 'ethjs';

//Part of PKI on Ethereum
export default class Mkt {
  constructor(eth, account, address) {
    this.mkt = eth.contract(mkt.abi, mkt.bytecode, {
      from: account,
      gas: 300000,
    }).at(address);
  }

  //Get public key belonging to user
  async getPublicKey(name) {
    const result = await this.mkt.getKey(fromUtf8(name));
    return result;
  }

  //Get user contract pointed to by Mkt
  async getUserAddress(name) {
      require(contains(handle));
      return register[handle].user;
  }

  //Insert a new user into the user registry, owned by sender
  async newUser(name, pk) {

    const tx = await this.mkt.newUser(fromUtf8(name), fromUtf8(pk));
    return tx;
  }

  //Update the user that the handle points to
  async updateUser(name, newOwner) {
    const tx = await this.mkt.update(fromUtf8(name), fromUtf8(newOwner));
    return tx;
  }

  //Update the owner of the handle in Mkt
  async transfer(name, newOwner) {
    const tx = await this.mkt.transfer(fromUtf8(name), fromUtf8(newOwner));
    return tx;
  }

  //Remove the owner
  async remove(name) {
    const tx = await this.mkt.remove(fromUtf8(name), fromUtf8(newOwner));
    return tx;
  }

  //Check if user is contained in the registry
  async contains(name) {
    const tx = await this.mkt.contains(fromUtf8(name));
    return tx;
  }

  //withdraw
  /**
   * @dev Transfer funds from contract to owner's wallet

      function withdraw(address _wallet) public onlyOwner {
          require(address(this).balance > 0);
          require(_wallet != address(0));
          uint256 value = address(this).balance;
          _wallet.transfer(value);
          emit Withdrawal(_wallet, value);
      }
  */
}
