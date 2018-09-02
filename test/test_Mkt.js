const Mkt = artifacts.require('Mkt');
const assertRevert = require('zos-lib/lib/test/helpers/assertRevert').default;
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Mkt', accounts => {
  const owner = accounts[1];
  const user = accounts[2];
  const friend = accounts[3];
  const version = '0.0.1';
  const contractName = "Mkt";
  let mkt;

  beforeEach(async () => {
    mkt = await Mkt.new({from: owner});
    const callData = encodeCall('initialize', ['address'], [owner]);
    await mkt.sendTransaction({data: callData, from: owner});
  });

  describe('mkt & proxied user crud', () => {

    //creates users
    it('creates users without problem', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key'));
      let resp = await mkt.contains(web3.fromAscii('Albert'));
      assert.equal(resp, true);
    });

    it('checks for contained users properly', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key'));
      let contains = await mkt.contains(web3.fromAscii('Albert'));
      let notContains = await mkt.contains(web3.fromAscii('Jonathan'));
      assert.equal(contains, true);
      assert.equal(notContains, false);
    })

    it('queries users created', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key'));
      let resp = await mkt.getUser(web3.fromAscii('Albert'));
      assert.notEqual(resp, ZERO_ADDRESS);
    });

    it('does not query users that are not created', async () => {
      await assertRevert(mkt.getUser(web3.fromAscii('Jonathan')));
    });

    //edits users
    it('edits handle owner', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key 1'), {from: user});
      let firstOwner = await mkt.getOwner(web3.fromAscii('Albert'));
      await mkt.transfer(web3.fromAscii('Albert'), friend, {from: user});
      let secondOwner = await mkt.getOwner(web3.fromAscii('Albert'));
      assert.notEqual(firstOwner, secondOwner);
    });

    //edits user's address
    it('updates user address for a particular owned name', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key 1'), {from: user});
      let first = await mkt.getUser(web3.fromAscii('Albert'));
      await mkt.update(web3.fromAscii('Albert'), friend, {from: user});
      let second = await mkt.getUser(web3.fromAscii('Albert'));
      assert.notEqual(first, second);
    });

    //just fetch user key and make sure it's what we put in earlier (public key 1)
    it('gets key', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key 1'), {from: user});
      let pk = await mkt.getKey(web3.fromAscii('Albert'));
      assert.equal(web3.toUtf8(pk), 'public key 1');
    });

    it('deletes users from registry', async () => {
      await mkt.newUser(web3.fromAscii('Albert'), web3.fromAscii('public key'));
      await mkt.remove(web3.fromAscii('Albert'));
      let contains = await mkt.contains(web3.fromAscii('Albert'));
      assert.equal(contains, false);
    });
  });

});
