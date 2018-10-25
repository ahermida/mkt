import mkt from '../../../build/contracts/Mkt.json';
import { utils } from 'web3';

//Part of PKI on Ethereum
export default class Mkt {
  constructor(web3, account, address) {
    this.account = account;
    this.mkt = new web3.eth.Contract(mkt.abi, address, {
      from: account,
      data: mkt.bytecode,
    });
  }

  //Get public key belonging to user
  async getPublicKey(name) {
    const result = await this.mkt.methods.getKey(utils.fromAscii(name)).call();

    //since keys are stored in 2 parts, assemble them and reinsert the 04 prefix
    const key = `04${result[0].slice(2)}${result[1].slice(2)}`;
    return key;
  }

  //Insert a new user into the user registry, owned by sender
  async newUser(name, pk) {
    const pka = pk.slice(2, 66);
    const pkb = pk.slice(66);
    const tx = await this.mkt.methods.newUser(
      utils.fromAscii(name),
      `0x${pka}`,
      `0x${pkb}`,
    ).send({
      from: this.account,
      gas: 3000000,
    });
    return tx;
  }

  //Update the user that the handle points to
  async updateUser(name, newOwner) {
    const tx = await this.mkt.methods.update(utils.fromAscii(name), utils.fromAscii(newOwner)).send({from: this.account});
    return tx;
  }

  //Update the owner of the handle in Mkt
  async transfer(name, newOwner) {
    const tx = await this.mkt.methods.transfer(utils.fromAscii(name), utils.fromAscii(newOwner)).send({from: this.account});
    return tx;
  }

  //Remove the owner
  async remove(name) {
    const tx = await this.mkt.methods.remove(utils.fromAscii(name), utils.fromAscii(newOwner)).send({from: this.account});
    return tx;
  }

  //Check if user is contained in the registry
  async contains(name) {
    const tx = await this.mkt.methods.contains(utils.fromAscii(name)).call();
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
