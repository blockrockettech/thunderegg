const {time, BN, expectRevert} = require('@openzeppelin/test-helpers');

// const ethers = require('ethers');

const ThunderEgg = artifacts.require('ThunderEgg');
const LavaToken = artifacts.require('LavaToken');

// to stake
const MockERC20 = artifacts.require('MockERC20');

require('chai').should();

const to18DP = (value) => {
  return new BN(value).mul(new BN('10').pow(new BN('18')));
};

contract('ThunderEgg', ([thor, alice, bob, carol, dev, minter, referer]) => {
  const ONE_THOUSAND_TOKENS = to18DP('1000');
  const ONE = new BN('1');
  const ZERO = new BN('0');

  const LAVA_PER_BLOCK = new BN('100');

  it('should set correct state variables', async () => {
    const rewardLimit = ONE_THOUSAND_TOKENS;
    const startBlock = '0';
    const endBlock = '100';

    this.lava = await LavaToken.new(ONE_THOUSAND_TOKENS, thor, thor, {from: thor});

    this.thunderEgg = await ThunderEgg.new(
      this.lava.address,
      LAVA_PER_BLOCK,
      ZERO,
      ZERO, // bonus block
      {from: thor}
    );

    await this.lava.changeMinter(this.thunderEgg.address, {from: thor});

    (await this.thunderEgg.lavaPerBlock()).should.be.bignumber.equal(LAVA_PER_BLOCK);
    (await this.thunderEgg.startBlock()).should.be.bignumber.equal('0');
  });

  context('With ERC/LP token added to the field', () => {
    beforeEach(async () => {
      this.lava = await LavaToken.new(ZERO, thor, thor, {from: thor});

      this.stakingToken = await MockERC20.new('LPToken', 'LP', ONE_THOUSAND_TOKENS.mul(new BN('4')), {from: thor});
      await this.stakingToken.transfer(alice, ONE_THOUSAND_TOKENS, {from: thor});
      await this.stakingToken.transfer(bob, ONE_THOUSAND_TOKENS, {from: thor});
      await this.stakingToken.transfer(carol, ONE_THOUSAND_TOKENS, {from: thor});
    });

    it('should spawn eggs when LP stones are offered to the gods', async () => {
      this.thunderEgg = await ThunderEgg.new(
        this.lava.address,
        LAVA_PER_BLOCK,
        ZERO,
        ZERO, // bonus block
        {from: thor}
      );

      await this.lava.changeMinter(this.thunderEgg.address, {from: thor});

      await this.thunderEgg.addToPools(ONE, this.stakingToken.address, true, {from: thor});

      const pid = (await this.thunderEgg.poolLength()).sub(ONE);

      await this.stakingToken.approve(this.thunderEgg.address, ONE_THOUSAND_TOKENS, {from: alice});
      await this.thunderEgg.deposit(pid, ONE_THOUSAND_TOKENS, ethers.utils.formatBytes32String("test"), {from: alice});

      (await this.thunderEgg.balanceOf(alice)).should.be.bignumber.equal('1');
      // (await this.thunderEgg.ownerToThunderEggId(alice)).should.be.bignumber.equal('1');
      console.log(await this.thunderEgg.thunderEggStats(pid, ONE));

      await time.advanceBlockTo('89');
      await this.thunderEgg.massUpdatePools();

      console.log(await this.thunderEgg.thunderEggStats(pid, ONE));
      // await this.chef.harvest(stakeTokenInternalId, {from: bob}); // block 90
      // assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '0');
      // await time.advanceBlockTo('94');
      // await this.chef.harvest(stakeTokenInternalId, {from: bob}); // block 95
      // assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '0');
      // await time.advanceBlockTo('99');
      // await this.chef.harvest(stakeTokenInternalId, {from: bob}); // block 100
      // assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '0');
      // await time.advanceBlockTo('100');
      // await this.chef.harvest(stakeTokenInternalId, {from: bob}); // block 101
      // assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '80');
      // await time.advanceBlockTo('104');
      // await this.chef.harvest(stakeTokenInternalId, {from: bob}); // block 105
      // assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '400');
    });

  });
});