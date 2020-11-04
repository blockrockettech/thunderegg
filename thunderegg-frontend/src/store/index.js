import {createStore} from 'vuex';
import {ethers} from 'ethers';

import {getContractAddressFromConf} from "@/utils";
import ThunderEggContract from '../contracts/ThunderEgg.json';
import StakingTokenContract from '../contracts/ERC20.json';
import LavaTokenContract from '../contracts/LavaToken.json';

import axios from 'axios';

const MAX_UINT256 = ethers.BigNumber.from('2').pow(ethers.BigNumber.from('256')).sub(ethers.BigNumber.from('1'));

export default createStore({
  state: {
    isLoading: false,
    account: null,
    contracts: null,
    chain: null,
    signer: null,
    stakingTokenBalance: null,
    hasStakingTokenBalance: null,
    hasStakingTokenAllowance: null,
    myThunderEggStats: null,
    hasThunderEgg: null,
    spawnings: [],
    coreStats: null,
    groveId: 1, // just one exists initially, 0 was messed up!?
    countdown: null,
  },
  mutations: {
    storeIsLoading(state, loading) {
      state.isLoading = loading;
    },
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
    storeSpawnings(state, spawnings) {
      state.spawnings = spawnings;
    },
    storeCoreStats(state, coreStats) {
      state.coreStats = coreStats;
    },
    storeCountdown(state, countdown) {
      state.countdown = countdown;
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

        const lavaToken = new ethers.Contract(
          getContractAddressFromConf(LavaTokenContract, chain.chainId.toString()),
          LavaTokenContract.abi,
          signer
        );

        commit('storeContracts', {
          thunderEgg,
          stakingToken,
          lavaToken,
        });

        console.log('Bootstrapped with account', accounts[0]);

        dispatch('loadThunderEgg');

        const stakingTokenBalance = await stakingToken.balanceOf(accounts[0]);
        commit('storeStakingTokenBalance', stakingTokenBalance);

        const stakingTokenAllowance = await stakingToken.allowance(accounts[0], thunderEgg.address);
        commit('storeHasStakingTokenAllowance', stakingTokenAllowance.gte(stakingTokenBalance));

        dispatch('loadSpawnings');
        dispatch('loadCoreStats');
      } else {
        console.error('Unable to bootstrap as window.ethereum is undefined');
        alert('Unable to bootstrap as window.ethereum is undefined');
      }
    },
    async loadThunderEgg({commit, dispatch, state}) {
      const {thunderEgg} = state.contracts;

      commit('storeIsLoading', true);

      const hasThunderEgg = await thunderEgg.balanceOf(state.account);
      commit('storeHasThunderEgg', hasThunderEgg.eq(ethers.BigNumber.from('1')));

      const eggId = await thunderEgg.ownerToThunderEggId(state.account);

      commit('storeIsLoading', false);

      dispatch('loadThunderEggStats', eggId.toString());
    },
    async heartbeat({dispatch, state, commit}) {
      console.log('heartbeat', state.account);

      const {data, status} = await axios.get('https://api.etherscan.io/api?module=block&action=getblockcountdown&blockno=11189999&apikey=NCKJ3RAKMXS5CPVP2JMUREGBV94YAENAB4');
      if (status === 200) {
        commit('storeCountdown', data.result);
      }

      if (state.account && state.contracts) {
        const {thunderEgg, stakingToken} = state.contracts;

        const eggId = await thunderEgg.ownerToThunderEggId(state.account);

        dispatch('loadThunderEggStats', eggId.toString());
        dispatch('loadCoreStats');

        const hasThunderEgg = await thunderEgg.balanceOf(state.account);
        commit('storeHasThunderEgg', hasThunderEgg.eq(ethers.BigNumber.from('1')));

        const stakingTokenBalance = await stakingToken.balanceOf(state.account);
        commit('storeStakingTokenBalance', stakingTokenBalance);

        const stakingTokenAllowance = await stakingToken.allowance(state.account, thunderEgg.address);
        commit('storeHasStakingTokenAllowance', stakingTokenAllowance.gte(stakingTokenBalance));
      }
    },
    async loadThunderEggStats({commit, state}, eggId) {
      const {thunderEgg} = state.contracts;

      const thunderEggStats = await thunderEgg.thunderEggStats(state.groveId, ethers.BigNumber.from(eggId));

      commit('storeMyThunderEggStats', {
        eggId: eggId,
        owner: thunderEggStats[0],
        birth: thunderEggStats[1].toString(),
        age: thunderEggStats[2].toString(),
        lp: ethers.utils.formatEther(thunderEggStats[3]),
        lava: ethers.utils.formatEther(thunderEggStats[4]),
        name: ethers.utils.parseBytes32String(thunderEggStats[5]),
      });
    },
    async loadCoreStats({commit, state}) {
      const {thunderEgg, stakingToken, lavaToken} = state.contracts;

      const totalSupply = await thunderEgg.totalSupply();
      const lpTotalSupply = await stakingToken.totalSupply();
      const lavaPerBlock = await thunderEgg.lavaPerBlock();
      const totalSpawned = await thunderEgg.totalSpawned();
      const totalDestroyed = await thunderEgg.totalDestroyed();
      const lavaTotalSupply = await lavaToken.totalSupply();

      commit('storeCoreStats', {
        totalSupply: totalSupply.toString(),
        totalSpawned: totalSpawned.toString(),
        totalDestroyed: totalDestroyed.toString(),
        lavaPerBlock: ethers.utils.formatEther(lavaPerBlock.toString()),
        lpTotalSupply: ethers.utils.formatEther(lpTotalSupply.toString()),
        lavaTotalSupply: ethers.utils.formatEther(lavaTotalSupply.toString()),
      });
    },
    async loadSpawnings({commit, state}) {
      const {thunderEgg} = state.contracts;

      const supply = await thunderEgg.tokenPointer();

      const spawnings = [];
      for (let x = 1; x <= parseInt(supply.toString()); x++) {
        const exists = await thunderEgg.exists(ethers.BigNumber.from(x));
        if (exists) {
          const thunderEggStats = await thunderEgg.thunderEggStats(state.groveId, ethers.BigNumber.from(ethers.BigNumber.from(x)));
          spawnings.push({
            eggId: x.toString(),
            owner: thunderEggStats[0],
            birth: thunderEggStats[1].toString(),
            age: thunderEggStats[2].toString(),
            lp: ethers.utils.formatEther(thunderEggStats[3]),
            lava: ethers.utils.formatEther(thunderEggStats[4]),
            name: ethers.utils.parseBytes32String(thunderEggStats[5]),
          });
        }
      }

      commit('storeSpawnings', spawnings);
    },
    async spawnThunderEgg({state, dispatch, commit}, eggName) {
      console.log('Spawning egg with name:', eggName);

      const {thunderEgg} = state.contracts;

      commit('storeIsLoading', true);

      const tx = await thunderEgg.spawn(
        state.groveId,
        state.stakingTokenBalance,
        ethers.utils.formatBytes32String(eggName),
        {from: state.account},
      );

      await tx.wait(1);

      commit('storeIsLoading', false);

      dispatch('loadThunderEgg');
    },
    async destroyThunderEgg({state, dispatch, commit}) {
      console.log('Destroying egg for:', state.account);

      const {thunderEgg} = state.contracts;

      commit('storeIsLoading', true);

      const tx = await thunderEgg.destroy(
        state.groveId,
        {from: state.account},
      );

      await tx.wait(1);

      await dispatch('loadThunderEgg');
      commit('storeHasThunderEgg', false); // shouldn't have one

      commit('storeIsLoading', false);
    },
    async approveStakingTokens({state, commit}) {
      if (state.contracts && state.account) {
        const {stakingToken, thunderEgg} = state.contracts;

        commit('storeIsLoading', true);

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

        commit('storeIsLoading', false);
      }
    },
  },
  modules: {}
});
