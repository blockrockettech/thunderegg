import { createStore } from 'vuex';
import {ethers} from 'ethers';

import {getContractAddressFromConf} from "@/utils";
import ThunderEggContract from '../contracts/ThunderEgg.json';

export default createStore({
  state: {
    account: null,
    contracts: null,
    chain: null,
    signer: null,
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
    }
  },
  actions: {
    async bootstrap({commit}) {
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

        commit('storeContracts', {
          thunderEgg
        });

        console.log('Bootstrapped with account', accounts[0]);
      } else {
        console.error('Unable to bootstrap as window.ethereum is undefined');
        alert('Unable to bootstrap as window.ethereum is undefined');
      }
    }
  },
  modules: {}
})
