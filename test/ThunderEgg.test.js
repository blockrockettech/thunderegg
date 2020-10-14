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
      console.log(pid);


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
    //
    // it('should not distribute tokens if no one deposit', async () => {
    //   // 100 per block farming rate starting at block 200 with all issuance ending on block 300
    //   this.chef = await MasterChef.new(
    //     this.deFiCasinoToken.address,
    //     TEN_THOUSAND_TOKENS, //mint limit
    //     '200', // start mining
    //     '300', // end mining
    //     whitelister,
    //     {from: alice}
    //   );
    //
    //   await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //   await this.chef.whitelistStakingToken(this.xtp.address, '100', false, {from: alice});
    //   const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //   await time.advanceBlockTo('199');
    //   assert.equal((await this.chef.rewardTokensAccrued()).toString(), '0');
    //
    //   await time.advanceBlockTo('204');
    //   assert.equal((await this.chef.rewardTokensAccrued()).toString(), '0');
    //
    //   await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: bob});
    //   await time.advanceBlockTo('209');
    //   const depositAmount = new BN('10');
    //   await this.chef.deposit(stakeTokenInternalId, depositAmount, referer, {from: bob}); // block 210
    //
    //   assert.equal((await this.chef.rewardTokensAccrued()).toString(), '0');
    //   assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '0');
    //   assert.equal((await this.deFiCasinoToken.balanceOf(dev)).toString(), '0');
    //   (await this.xtp.balanceOf(bob)).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.sub(depositAmount));
    //
    //   await time.advanceBlockTo('219');
    //   await this.chef.withdraw(stakeTokenInternalId, depositAmount, {from: bob}); // block 220
    //
    //   (await this.chef.rewardTokensAccrued()).should.be.bignumber.equal(ONE_THOUSAND_TOKENS);
    //   (await this.deFiCasinoToken.balanceOf(bob)).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.div(new BN('100')).mul(new BN('80')));
    //   (await this.deFiCasinoToken.balanceOf(referer)).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.div(new BN('100')).mul(new BN('20')));
    //   (await this.xtp.balanceOf(bob)).should.be.bignumber.equal(ONE_THOUSAND_TOKENS);
    //
    //   // all 1k tokens accrued will have been withdrawn so chef should have nothing
    //   (await this.deFiCasinoToken.balanceOf(this.chef.address)).should.be.bignumber.equal('0');
    // });
    //
    // it('should distribute tokens properly for each staker', async () => {
    //   // 100 per block farming rate starting at block 300 with all issuance ending on block 400
    //   this.chef = await MasterChef.new(
    //     this.deFiCasinoToken.address,
    //     TEN_THOUSAND_TOKENS,
    //     '300',
    //     '400',
    //     whitelister,
    //     {from: alice}
    //   );
    //
    //   await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //   await this.chef.whitelistStakingToken(this.xtp.address, '100', false, {from: alice});
    //   const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //   await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: alice});
    //   await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: bob});
    //   await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: carol});
    //
    //   // Alice deposits 10 LPs at block 310
    //   await time.advanceBlockTo('309');
    //   const aliceFirstDeposit = to18DP('100');
    //   await this.chef.deposit(stakeTokenInternalId, aliceFirstDeposit, referer, {from: alice});
    //
    //   // Bob deposits 20 LPs at block 314
    //   await time.advanceBlockTo('313');
    //   const bobFirstDeposit = to18DP('200');
    //   await this.chef.deposit(stakeTokenInternalId, bobFirstDeposit, referer, {from: bob});
    //
    //   // at block 314, 400 tokens will have been issued - all which should be due to alice
    //   const FOUR_HUNDRED = to18DP('400');
    //   assert.equal((await this.chef.rewardTokensAccrued()).toString(), FOUR_HUNDRED);
    //
    //   // Carol deposits 30 LPs at block 318
    //   await time.advanceBlockTo('317');
    //   const carolFirstDeposit = to18DP('300');
    //   await this.chef.deposit(stakeTokenInternalId, carolFirstDeposit, referer, {from: carol});
    //
    //   assert.equal((await this.chef.rewardTokensAccrued()).toString(), FOUR_HUNDRED.mul(new BN('2')));
    //
    //   (await this.deFiCasinoToken.balanceOf(this.chef.address)).should.be.bignumber.equal(FOUR_HUNDRED.mul(new BN('2')));
    //
    //   // Alice deposits 10 more LPs at block 320.
    //   await time.advanceBlockTo('319');
    //   const aliceSecondDeposit = to18DP('100');
    //   await this.chef.deposit(stakeTokenInternalId, aliceSecondDeposit, referer, {from: alice});
    //
    //   assert.equal((await this.chef.rewardTokensAccrued()).toString(), ONE_THOUSAND_TOKENS);
    //
    //   //As of block #320:
    //   //   Alice should have:
    //   //     - from the first 4 blocks (#314 - when bob deposits): 4 blocks * 100 reward per block = 400
    //   //     - from the next 4 blocks (#318 - when carol deposits): 4 * 1/3 * 100 (1/3 of the share of the reward token based on deposits thus far) = 133.33
    //   //     - block #320 when Alice adds 10 more LPs: 2 * 1/6 * 100 = 33.33
    //   //     - total = 400 + 133.33 + 33.33
    //   //     HOWEVER, Alice only gets 80% of the total vs 20% for her referer
    //   const TWO_HUNDRED = to18DP('200');
    //   const first4BlockReward = FOUR_HUNDRED;
    //   const next4BlockReward = FOUR_HUNDRED.div(new BN('3'));
    //   const next2BlockReward = TWO_HUNDRED.div(new BN('6'));
    //   const aliceTotal = first4BlockReward.add(next4BlockReward).add(next2BlockReward);
    //   const aliceTotalMinusReferralShare = aliceTotal.div(new BN('100')).mul(new BN('80'));
    //   const referralShare = aliceTotal.div(new BN('100')).mul(new BN('20'));
    //
    //   (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal(aliceTotalMinusReferralShare);
    //   (await this.deFiCasinoToken.balanceOf(referer)).should.be.bignumber.equal(referralShare);
    //
    //   assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '0');
    //   assert.equal((await this.deFiCasinoToken.balanceOf(carol)).toString(), '0');
    //
    //   (await this.deFiCasinoToken.balanceOf(this.chef.address)).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.sub(aliceTotalMinusReferralShare.add(referralShare)));
    //
    //   // Bob withdraws 5 LPs at block 330. At this point:
    //   //   Bob should have: 4 * 2/3 * 100 + 2 * 2/6 * 100 + 10 * 2/7 * 100
    //   await time.advanceBlockTo('329');
    //   const bobFirstWithdrawal = to18DP('5');
    //   await this.chef.withdraw(stakeTokenInternalId, bobFirstWithdrawal, {from: bob});
    //
    //   (await this.chef.rewardTokensAccrued()).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.mul(new BN('2')));
    //   (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal(aliceTotalMinusReferralShare);
    //
    //   //   Bob should have: 4 * 2/3 * 100 + 2 * 2/6 * 100 + 10 * 2/7 * 100
    //   const firstRewardBob = FOUR_HUNDRED.mul(new BN('2')).div(new BN('3'));
    //   const secondRewardBob = TWO_HUNDRED.div(new BN('3'));
    //   const thirdRewardBob = ONE_THOUSAND_TOKENS.mul(new BN('2')).div(new BN('7'));
    //   const bobTotalReward = firstRewardBob.add(secondRewardBob).add(thirdRewardBob);
    //   //(await this.deFiCasinoToken.balanceOf(bob)).should.be.bignumber.equal(bobTotalReward);
    //
    //   assert.equal((await this.deFiCasinoToken.balanceOf(carol)).toString(), '0');
    //   // assert.equal((await this.deFiCasinoToken.balanceOf(this.chef.address)).toString(), '8815');
    //   //
    //   // // Alice withdraws 20 LPs at block 340.
    //   // // Bob withdraws 15 LPs at block 350.
    //   // // Carol withdraws 30 LPs at block 360.
    //   // await time.advanceBlockTo('339');
    //   // await this.chef.withdraw('20', {from: alice});
    //   // await time.advanceBlockTo('349');
    //   // await this.chef.withdraw('15', {from: bob});
    //   // await time.advanceBlockTo('359');
    //   // await this.chef.withdraw('30', {from: carol});
    //   //
    //   // assert.equal((await this.chef.rewardTokensAccrued()).toString(), '5000');
    //   //
    //   // // FIXME rounding error? 1 wei out?
    //   // assert.equal((await this.deFiCasinoToken.balanceOf(this.chef.address)).toString(), '5001');
    //   //
    //   // // Alice should have: 566 + (10 * 2/7 * 100)+ (10 * 2/6.5 * 100) = 1159
    //   // assert.equal((await this.deFiCasinoToken.balanceOf(alice)).toString(), '1159');
    //   //
    //   // // Bob should have: 619 + (10 * 1.5/6.5 * 100) + (10 * 1.5/4.5 * 100) = 1183
    //   // assert.equal((await this.deFiCasinoToken.balanceOf(bob)).toString(), '1183');
    //   //
    //   // // Carol should have: (2* 3/6 *100) + (10* 3/7 *100) + (10* 3/6.5 *100) + (10* 3/4.5 *100) + 10*100 = 2657
    //   // assert.equal((await this.deFiCasinoToken.balanceOf(carol)).valueOf(), '2657');
    //   //
    //   // // FIXME rounding error? 1 wei out?
    //   // assert.equal(1159 + 1183 + 2657, 4999);
    //   //
    //   // // All of them should have 1000 LPs back.
    //   // assert.equal((await this.xtp.balanceOf(alice)).valueOf(), '1000');
    //   // assert.equal((await this.xtp.balanceOf(bob)).valueOf(), '1000');
    //   // assert.equal((await this.xtp.balanceOf(carol)).valueOf(), '1000');
    // });
    //
    // it('should stop giving bonus tokens after the end of the farming period', async () => {
    //   // 100 token block reward starting at block 500 and finishing at block 600
    //   this.chef = await MasterChef.new(
    //     this.deFiCasinoToken.address,
    //     '10000',
    //     '500',
    //     '600',
    //     whitelister,
    //     {from: alice}
    //   );
    //
    //   await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //   await this.chef.whitelistStakingToken(this.xtp.address, '100', false, {from: alice});
    //   const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //   // Alice deposits 10 LPs at block 590
    //   await this.xtp.approve(this.chef.address, '1000', {from: alice});
    //   await time.advanceBlockTo('589');
    //   await this.chef.deposit(stakeTokenInternalId, '10', referer, {from: alice});
    //
    //   // At block 605, she should have 10 blocks * 100 token per block reward = 1000 pending.
    //   await time.advanceBlockTo('605');
    //   const {
    //     _userRewards,
    //     _refererRewards
    //   } = await this.chef.pendingRewards(stakeTokenInternalId, alice);
    //   assert.equal(_userRewards.toString(), '800');
    //   assert.equal(_refererRewards.toString(), '200');
    //
    //   // At block 606, Alice withdraws all pending rewards and should get 1000 tokens (no more than block 605 as token rewards ended on block 600).
    //   await this.chef.harvest(stakeTokenInternalId, {from: alice});
    //   assert.equal((await this.chef.pendingRewards(stakeTokenInternalId, alice))._userRewards.toString(), '0');
    //   assert.equal((await this.deFiCasinoToken.balanceOf(alice)).toString(), '800');
    // });
    //
    // describe('harvestWithRisk', () => {
    //   it('Harvests more tokens when a user wins', async () => {
    //     // 100 per block farming rate starting at block 300 with all issuance ending on block 400
    //     this.chef = await MockChef.new(
    //       this.deFiCasinoToken.address,
    //       TEN_THOUSAND_TOKENS,
    //       '700',
    //       '800',
    //       whitelister,
    //       {from: alice}
    //     );
    //
    //     await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //     await this.chef.whitelistStakingToken(this.xtp.address, '100', false, {from: alice});
    //     const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //     await this.chef.setRandom('77'); // WIN state
    //
    //     await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: alice});
    //
    //     // Alice deposits 10 LPs at block 310
    //     await time.advanceBlockTo('709');
    //     const aliceDeposit = to18DP('100');
    //     await this.chef.deposit(stakeTokenInternalId, aliceDeposit, referer, {from: alice});
    //
    //     // Roulette at block 314 - alice would have farmed 400 $CASINO at this point
    //     await time.advanceBlockTo('713');
    //     await this.chef.harvestWithRisk(stakeTokenInternalId, '100', {from: alice});
    //
    //     // Rewards accrued should be 400
    //     (await this.chef.rewardTokensAccrued()).should.be.bignumber.equal(to18DP('400'));
    //
    //     // As Alice wins the game, her harvest should be as follows:
    //     // (80% of 400 $CASINO farmed) + (winnings (i.e. 0.8 * 400 * 0.5)) =
    //     // (0.8 * 400) + (0.8 * 400 * 1) = 320 + 320 = 640
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal(to18DP('640'));
    //
    //
    //     // chef balance of $CASINO should be 0
    //     (await this.deFiCasinoToken.balanceOf(this.chef.address)).should.be.bignumber.equal('0');
    //
    //     // total supply of $CASINO should be 560
    //     // 400 farmed + 320 extra from winning the roulette
    //     (await this.deFiCasinoToken.totalSupply()).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.add(to18DP('800')));
    //   });
    //
    //   it('Slashes a users farmed rewards when they lose the game at 100% risk', async () => {
    //     // 100 per block farming rate starting at block 300 with all issuance ending on block 400
    //     this.chef = await MockChef.new(
    //       this.deFiCasinoToken.address,
    //       TEN_THOUSAND_TOKENS,
    //       '900',
    //       '1000',
    //       whitelister,
    //       {from: alice}
    //     );
    //
    //     await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //     await this.chef.whitelistStakingToken(this.xtp.address, '100', false, {from: alice});
    //     const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //     await this.chef.setRandom('11'); // LOSE state
    //
    //     // check alice owns zero $CASINO
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal('0');
    //
    //     await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: alice});
    //
    //     // Alice deposits 10 LPs at block 910
    //     await time.advanceBlockTo('909');
    //     const aliceDeposit = to18DP('100');
    //     await this.chef.deposit(stakeTokenInternalId, aliceDeposit, referer, {from: alice});
    //
    //     // check alice owns zero $CASINO
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal('0');
    //
    //     // Roulette at block 914 - alice would have farmed 400 $CASINO at this point
    //     await time.advanceBlockTo('913');
    //     await this.chef.harvestWithRisk(stakeTokenInternalId, '100', {from: alice});
    //
    //     // Alice should still own 0 $CASINO as she would have lost the flip
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal('0');
    //     (await this.deFiCasinoToken.balanceOf(referer)).should.be.bignumber.equal('0');
    //
    //     // Rewards accrued should be 400
    //     (await this.chef.rewardTokensAccrued()).should.be.bignumber.equal(to18DP('400'));
    //
    //     // chef balance of $CASINO should be 0
    //     (await this.deFiCasinoToken.balanceOf(this.chef.address)).should.be.bignumber.equal('0');
    //
    //     // total supply of $CASINO should be 80 - as we still pay referrer (we have pre-minted 1000 so add them in)
    //     (await this.deFiCasinoToken.totalSupply()).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.add(to18DP('0')));
    //   });
    //
    //   it('Slashes a users farmed rewards when they lose the game at 50% risk', async () => {
    //     // 100 per block farming rate starting at block 300 with all issuance ending on block 400
    //     this.chef = await MockChef.new(
    //       this.deFiCasinoToken.address,
    //       TEN_THOUSAND_TOKENS,
    //       '1000',
    //       '1100',
    //       whitelister,
    //       {from: alice}
    //     );
    //
    //     await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //     await this.chef.whitelistStakingToken(this.xtp.address, '100', false, {from: alice});
    //     const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //     await this.chef.setRandom('23'); // LOSE state
    //
    //     // check alice owns zero $CASINO
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal('0');
    //
    //     await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: alice});
    //
    //     // Alice deposits 10 LPs at block 910
    //     await time.advanceBlockTo('1009');
    //     const aliceDeposit = to18DP('100');
    //     await this.chef.deposit(stakeTokenInternalId, aliceDeposit, referer, {from: alice});
    //
    //     // check alice owns zero $CASINO
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal('0');
    //
    //     // Roulette at block 914 - alice would have farmed 400 $CASINO at this point
    //     await time.advanceBlockTo('1013');
    //     await this.chef.harvestWithRisk(stakeTokenInternalId, '50', {from: alice});
    //
    //     // Alice should still own 0 $CASINO as she would have lost the roulette
    //     // 200 for alice minus the 20% for referer
    //     (await this.deFiCasinoToken.balanceOf(alice)).should.be.bignumber.equal(to18DP('160'));
    //
    //     // Rewards accrued should be 400
    //     (await this.chef.rewardTokensAccrued()).should.be.bignumber.equal(to18DP('400'));
    //
    //     // chef balance of $CASINO should be 0
    //     (await this.deFiCasinoToken.balanceOf(this.chef.address)).should.be.bignumber.equal('0');
    //
    //     // total supply of $CASINO should be 80 - as we still pay referrer (we have pre-minted 1000 so add them in)
    //     (await this.deFiCasinoToken.totalSupply()).should.be.bignumber.equal(ONE_THOUSAND_TOKENS.add(to18DP('200')));
    //   });
    // });
    //
    // describe('whitelisted pools', () => {
    //   it('can not stake into a pool if not whitelisted', async () => {
    //     this.chef = await MasterChef.new(
    //       this.deFiCasinoToken.address,
    //       TEN_THOUSAND_TOKENS,
    //       '2000',
    //       '3000',
    //       whitelister,
    //       {from: alice}
    //     );
    //
    //     await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //     await this.chef.whitelistStakingToken(this.xtp.address, '100', true, {from: alice});
    //     const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //     await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: alice});
    //
    //     // Alice deposits 10 LPs at block 310
    //     await time.advanceBlockTo('2001');
    //     const aliceDeposit = to18DP('100');
    //
    //     await expectRevert(
    //       this.chef.deposit(stakeTokenInternalId, aliceDeposit, referer, {from: alice}),
    //       'Must be whitelisted'
    //     );
    //   });
    //
    //   it('can stake into a pool if whitelisted', async () => {
    //     this.chef = await MasterChef.new(
    //       this.deFiCasinoToken.address,
    //       TEN_THOUSAND_TOKENS,
    //       '2000',
    //       '3000',
    //       whitelister,
    //       {from: alice}
    //     );
    //
    //     await this.deFiCasinoToken.changeMinter(this.chef.address, {from: alice});
    //
    //     await this.chef.whitelistStakingToken(this.xtp.address, '100', true, {from: alice});
    //     const stakeTokenInternalId = await this.chef.stakingTokenAddressToInternalId(this.xtp.address);
    //
    //     await this.xtp.approve(this.chef.address, ONE_THOUSAND_TOKENS, {from: alice});
    //
    //     // Alice deposits 10 LPs at block 310
    //     await time.advanceBlockTo('2022');
    //     const aliceDeposit = to18DP('100');
    //
    //     await this.chef.addToWhitelist(stakeTokenInternalId, alice, {from: whitelister});
    //
    //     await this.chef.deposit(stakeTokenInternalId, aliceDeposit, referer, {from: alice});
    //   });
    // });


    // describe('owner functions', () => {
    //
    //   // function updateOwner(address _owner) external {
    //   //   require(msg.sender == owner, "World computer says no...");
    //   //   owner = _owner;
    //   // }
    //   //
    //   // function updateWhitelister(address _account) external {
    //   //   require(msg.sender == owner, "World computer says no...");
    //   //   whitelister = _account;
    //   // }
    //   //
    //   // function updateRiskPercentage(uint256 _riskPercentage) external {
    //   //   require(msg.sender == owner, "World computer says no...");
    //   //   riskPercentage = _riskPercentage;
    //   // }
    //
    //   it('can not stake into a pool if not whitelisted', async () => {
    //     this.chef = await MasterChef.new(
    //       this.deFiCasinoToken.address,
    //       TEN_THOUSAND_TOKENS,
    //       '2000',
    //       '3000',
    //       whitelister,
    //       {from: alice}
    //     );
    //
    //     await expectRevert(
    //       this.chef.updateOwner(alice, {from: bob}),
    //       'World computer says no...'
    //     );
    //
    //
    //     await this.chef.updateOwner(bob, {from: alice});
    //
    //   });
    //
    // });
  });
});
