const user = artifacts.require('User');
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

contract('Mkt', accounts => {
  const owner = accounts[1];
  const friend = accounts[2];
  const version = '0.0.1';
  const contractName = "User";
  let usr;

  beforeEach(async () => {
    usr = await user.new({from: owner});
    const callData = encodeCall('initialize', ['bytes32', 'bytes32', 'bytes32', 'address'], [web3.fromAscii('Albert'), web3.fromAscii('pk'), web3.fromAscii('pk'), owner]);
    await usr.sendTransaction({data: callData, from: owner});
  });

  describe('user actions', () => {

    //creates users
    it('changes PK', async () => {
      await usr.changePK(web3.fromAscii('dingo'), web3.fromAscii('dingo'), {from: owner});
      let resp = await usr.getPK();
      assert.equal(web3.toUtf8(resp[0]), 'dingo');
      assert.equal(web3.toUtf8(resp[1]), 'dingo');
    });

    //selfdestructs user, should only be done after deleting user from mkt
    it('deletes user contract without error', async () => {
      await usr.remove({from: owner});
    })
  });
});
