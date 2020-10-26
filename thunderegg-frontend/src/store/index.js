import {createStore} from 'vuex';
import {ethers} from 'ethers';

import {getContractAddressFromConf} from "@/utils";
import ThunderEggContract from '../contracts/ThunderEgg.json';
import StakingTokenContract from '../contracts/ERC20.json';

const MAX_UINT256 = ethers.BigNumber.from('2').pow(ethers.BigNumber.from('256')).sub(ethers.BigNumber.from('1'));

export default createStore({
  state: {
    account: null,
    contracts: null,
    chain: null,
    signer: null,
    stakingTokenBalance: null,
    hasStakingTokenBalance: null,
    hasStakingTokenAllowance: null,
    myThunderEggStats: null,
    hasThunderEgg: null,
    groveId: 0, // just one exists initially
  },
  mutations: {
    storeSigner(state, signer) {
      state.signer = signer;
    },
    storeAccount(state, account) {
      state.account = account;
    },
    storeContracts(state, contracts) {
      state.contracts = contracts;
    },
    storeChain(state, chain) {
      state.chain = chain;
    },
    storeMyThunderEggStats(state, myThunderEggStats) {
      state.myThunderEggStats = myThunderEggStats;
    },
    storeHasThunderEgg(state, hasThunderEgg) {
      state.hasThunderEgg = hasThunderEgg;
    },
    storeStakingTokenBalance(state, stakingTokenBalance) {
      state.hasStakingTokenBalance = stakingTokenBalance.gt(ethers.BigNumber.from('0'));
      state.stakingTokenBalance = stakingTokenBalance;
    },
    storeHasStakingTokenAllowance(state, hasStakingTokenAllowance) {
      state.hasStakingTokenAllowance = hasStakingTokenAllowance;
    },
  },
  actions: {
    async bootstrap({commit, dispatch}) {
      if (window.ethereum) {

        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        commit('storeSigner', signer);

        const accounts = await provider.listAccounts();
        commit('storeAccount', accounts[0]);

        const chain = await provider.getNetwork();
        commit('storeChain', chain);

        const thunderEgg = new ethers.Contract(
          getContractAddressFromConf(ThunderEggContract, chain.chainId),
          ThunderEggContract.abi,
          signer
        );

        const stakingToken = new ethers.Contract(
          getContractAddressFromConf(StakingTokenContract, chain.chainId.toString()),
          StakingTokenContract.abi,
          signer
        );

        commit('storeContracts', {
          thunderEgg,
          stakingToken,
        });

        console.log('Bootstrapped with account', accounts[0]);

        dispatch('loadThunderEgg');

        const stakingTokenBalance = await stakingToken.balanceOf(accounts[0]);
        commit('storeStakingTokenBalance', stakingTokenBalance);

        const stakingTokenAllowance = await stakingToken.allowance(accounts[0], thunderEgg.address);
        commit('storeHasStakingTokenAllowance', stakingTokenAllowance.gte(stakingTokenBalance));
      } else {
        console.error('Unable to bootstrap as window.ethereum is undefined');
        alert('Unable to bootstrap as window.ethereum is undefined');
      }
    },
    async loadThunderEgg({commit, dispatch, state}) {
      const {thunderEgg} = state.contracts;

      const hasThunderEgg = await thunderEgg.balanceOf(state.account);
      commit('storeHasThunderEgg', hasThunderEgg.eq(ethers.BigNumber.from('1')));

      dispatch('loadThunderEggStats', '1');
    },
    async loadThunderEggStats({commit, state}, eggId) {
      const {thunderEgg} = state.contracts;

      const thunderEggStats = await thunderEgg.thunderEggStats(state.groveId, ethers.BigNumber.from(eggId));
      commit('storeMyThunderEggStats', {
        eggId: eggId,
        owner: thunderEggStats[0],
        birth: thunderEggStats[1].toString(),
        age: '1234',
        lp: ethers.utils.formatEther(thunderEggStats[2]),
        lava: ethers.utils.formatEther(thunderEggStats[3]),
        name: ethers.utils.parseBytes32String(thunderEggStats[4]),
      });
    },
    async spawnThunderEgg({state, dispatch}, eggName) {
      console.log('Spawning egg with name:', eggName);

      const {thunderEgg} = state.contracts;

      const tx = await thunderEgg.spawn(
        state.groveId,
        state.stakingTokenBalance,
        ethers.utils.formatBytes32String(eggName),
        {from: state.account},
      );

      await tx.wait(1);

      dispatch('loadThunderEgg');
    },
    async approveStakingTokens({state, commit}) {
      if (state.contracts && state.account) {
        const {stakingToken, thunderEgg} = state.contracts;

        const tx = await stakingToken.approve(
          thunderEgg.address,
          MAX_UINT256,
          {from: state.account}
        );

        await tx.wait(1);

        const stakingTokenBalance = await stakingToken.balanceOf(state.account);
        commit('storeStakingTokenBalance', stakingTokenBalance);

        const stakingTokenAllowance = await stakingToken.allowance(state.account, thunderEgg.address);
        commit('storeHasStakingTokenAllowance', stakingTokenAllowance.gte(stakingTokenBalance));
      }
    },
  },
  modules: {}
});
