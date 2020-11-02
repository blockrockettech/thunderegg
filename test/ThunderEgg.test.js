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

contract('ThunderEgg', ([thor, alice, bob, carol]) => {
  const ONE_THOUSAND_TOKENS = to18DP('1000');
  const ONE = new BN('1');
  const EGG_ID_ONE = new BN('1');
  const ZERO = new BN('0');

  const LAVA_PER_BLOCK = to18DP('1');

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

  context('Spawning', () => {
    beforeEach(async () => {
      this.lava = await LavaToken.new(ZERO, thor, thor, {from: thor});

      this.stakingToken = await MockERC20.new('LPToken', 'LP', ONE_THOUSAND_TOKENS.mul(new BN('4')), {from: thor});
      await this.stakingToken.transfer(alice, ONE_THOUSAND_TOKENS, {from: thor});
      await this.stakingToken.transfer(bob, ONE_THOUSAND_TOKENS, {from: thor});
      await this.stakingToken.transfer(carol, ONE_THOUSAND_TOKENS, {from: thor});

      this.thunderEgg = await ThunderEgg.new(
        this.lava.address,
        LAVA_PER_BLOCK,
        new BN('50'),
        new BN('50'), // bonus block
        {from: thor}
      );

      await this.lava.changeMinter(this.thunderEgg.address, {from: thor});

      await this.thunderEgg.addSacredGrove(ONE, this.stakingToken.address, true, {from: thor});

      this.groveId = (await this.thunderEgg.sacredGroveLength()).sub(ONE);

      await this.stakingToken.approve(this.thunderEgg.address, ONE_THOUSAND_TOKENS, {from: alice});
    });

    it('should spawn eggs when LP stones are offered to the gods', async () => {

      await time.advanceBlockTo('50');

      await this.thunderEgg.spawn(this.groveId, ONE_THOUSAND_TOKENS, ethers.utils.formatBytes32String("test"), {from: alice});

      (await this.thunderEgg.balanceOf(alice)).should.be.bignumber.equal(ONE);
      (await this.thunderEgg.totalSupply()).should.be.bignumber.equal(ONE);
      (await this.thunderEgg.exists(EGG_ID_ONE)).should.be.equal(true);

      await time.advanceBlockTo('55');

      await this.thunderEgg.massUpdateSacredGroves();

      const {_owner, _birth, _lp, _lava, _name} = await this.thunderEgg.thunderEggStats(this.groveId, ONE);
      _owner.should.be.equal(alice);
      _birth.should.be.bignumber.equal('51'); // first block after start
      _lp.should.be.bignumber.equal(ONE_THOUSAND_TOKENS);
      _lava.should.be.bignumber.equal(LAVA_PER_BLOCK.mul(new BN(5)));
      _name.should.be.equal(ethers.utils.formatBytes32String("test"));
    });

    it.only('should spawn and release Lava and LP stones when destroyed', async () => {

      await time.advanceBlockTo('150');

      await this.thunderEgg.spawn(this.groveId, ONE_THOUSAND_TOKENS, ethers.utils.formatBytes32String("test"), {from: alice});

      // before any updates
      (await this.lava.balanceOf(thor)).should.be.bignumber.equal(ZERO);

      (await this.thunderEgg.balanceOf(alice)).should.be.bignumber.equal(ONE);
      (await this.thunderEgg.totalSupply()).should.be.bignumber.equal(ONE);
      (await this.thunderEgg.exists(EGG_ID_ONE)).should.be.equal(true);

      await time.advanceBlockTo('155');

      await this.thunderEgg.massUpdateSacredGroves();

      const {_owner, _lp, _lava} = await this.thunderEgg.thunderEggStats(this.groveId, ONE);
      _owner.should.be.equal(alice);
      _lp.should.be.bignumber.equal(ONE_THOUSAND_TOKENS);
      _lava.should.be.bignumber.equal(LAVA_PER_BLOCK.mul(new BN(5)));

      // let's smash the egg!

      (await this.lava.balanceOf(alice)).should.be.bignumber.equal(ZERO);
      (await this.stakingToken.balanceOf(alice)).should.be.bignumber.equal(ZERO);

      await this.thunderEgg.destroy(this.groveId, {from: alice});

      // 6 blocks * lava per block (1) * 0.0125 (aka 1.25 %)
      const godsOffering = await this.thunderEgg.godsOffering();
      (await this.lava.balanceOf(thor)).should.be.bignumber.equal(LAVA_PER_BLOCK.mul(new BN('6')).div(godsOffering));

      // one more block passed when destroying so 5 + 1 x lava per block
      (await this.lava.balanceOf(alice)).should.be.bignumber.equal(LAVA_PER_BLOCK.mul(new BN('6')));
      (await this.stakingToken.balanceOf(alice)).should.be.bignumber.equal(ONE_THOUSAND_TOKENS);

      (await this.thunderEgg.balanceOf(alice)).should.be.bignumber.equal(ZERO);
      (await this.thunderEgg.totalSupply()).should.be.bignumber.equal(ZERO);
      (await this.thunderEgg.exists(EGG_ID_ONE)).should.be.equal(false);

      const statsPostDestroy = await this.thunderEgg.thunderEggStats(this.groveId, ONE);
      statsPostDestroy._owner.should.be.equal('0x0000000000000000000000000000000000000000');
      statsPostDestroy._lp.should.be.bignumber.equal(ZERO);
      statsPostDestroy._lava.should.be.bignumber.equal(ZERO);
    });

    it('reverts when amount is zero', async () => {
      await expectRevert(
        this.thunderEgg.spawn(this.groveId, ZERO, ethers.utils.formatBytes32String("test"), {from: alice}),
        "You must sacrifice your LP tokens to the gods!"
      );
    });
  });

  context('God operations', () => {
    beforeEach(async () => {
      this.lava = await LavaToken.new(ZERO, thor, thor, {from: thor});

      this.stakingToken = await MockERC20.new('LPToken', 'LP', ONE_THOUSAND_TOKENS.mul(new BN('4')), {from: thor});
      await this.stakingToken.transfer(alice, ONE_THOUSAND_TOKENS, {from: thor});

      this.thunderEgg = await ThunderEgg.new(
        this.lava.address,
        LAVA_PER_BLOCK,
        ZERO,
        ZERO, // bonus block
        {from: thor}
      );

      await this.thunderEgg.addSacredGrove(ONE, this.stakingToken.address, true, {from: thor});
      this.pid = (await this.thunderEgg.sacredGroveLength()).sub(ONE);
    });

    it('should only allow god to addToPools', async () => {
      this.newStakingToken = await MockERC20.new('LPToken', 'LP', ONE_THOUSAND_TOKENS.mul(new BN('4')), {from: thor});

      await expectRevert(
        this.thunderEgg.addSacredGrove(new BN('100'), this.newStakingToken.address, false, {from: alice}),
        'Godable: caller is not the god'
      );

      await this.thunderEgg.addSacredGrove(new BN('100'), this.newStakingToken.address, false, {from: thor});
    });

    it('should only allow god to set allocation points', async () => {

      await expectRevert(
        this.thunderEgg.set(this.pid, new BN('1000'), false, {from: alice}),
        'Godable: caller is not the god'
      );

      await this.thunderEgg.set(this.pid, new BN('1000'), false, {from: thor});
      const sacredGrove = await this.thunderEgg.sacredGrove(this.pid);
      sacredGrove.allocPoint.should.be.bignumber.equal('1000');
    });

    it('should only allow god to end allocation points', async () => {

      await expectRevert(
        this.thunderEgg.end(this.pid, new BN('1000'), false, {from: alice}),
        'Godable: caller is not the god'
      );

      await this.thunderEgg.end(this.pid, new BN('1000'), false, {from: thor});
      const sacredGrove = await this.thunderEgg.sacredGrove(this.pid);
      sacredGrove.endBlock.should.be.bignumber.equal('1000');
    });

    it('only god should be able to set base token', async () => {

      await expectRevert(
        this.thunderEgg.setBaseTokenURI(('https://example.com/path/resource.txt#fragment'), {from: alice}),
        'Godable: caller is not the god'
      );

    });

    it('after initial setting only god can set name of egg', async () => {
      await expectRevert(
        this.thunderEgg.setName(new BN('1111'), ethers.utils.formatBytes32String('test'), {from: alice}),
        'Godable: caller is not the god'
      );

      // spawn a thunderegg
      await this.stakingToken.approve(this.thunderEgg.address, ONE_THOUSAND_TOKENS, {from: alice});
      await this.thunderEgg.spawn(this.pid, ONE_THOUSAND_TOKENS, ethers.utils.formatBytes32String("something dodgy"), {from: alice});

      // only thor can set names
      await this.thunderEgg.setName(EGG_ID_ONE, ethers.utils.formatBytes32String('Luke'), {from: thor});

      const stats = await this.thunderEgg.thunderEggStats(this.pid, EGG_ID_ONE);
      stats._name.should.be.equal(ethers.utils.formatBytes32String('Luke'));
    });

    it('can only destroy if a egg exists', async () => {

      await expectRevert(
        this.thunderEgg.destroy(new BN('1111'), {from: thor}),
        'No ThunderEgg!'
      );
    });

    it('can only have one egg each', async () => {
      await this.stakingToken.approve(this.thunderEgg.address, ONE_THOUSAND_TOKENS, {from: alice});

      // create first thunderegg
      await this.thunderEgg.spawn(this.pid, new BN('100'), ethers.utils.formatBytes32String("test"), {from: alice});

      // not allowed a second!
      await expectRevert(
       this.thunderEgg.spawn(this.pid, new BN('100'), ethers.utils.formatBytes32String("test"), {from: alice}),
       'Thor has already blessed you with a ThunderEgg!'
      );

    });
  });
});
