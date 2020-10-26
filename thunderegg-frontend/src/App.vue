<template>
    <article class="content" :style="{ 'background-image': 'url(/bg.jpg)'}" style="background-size: cover;">

        <section class="hero has-text-centered">
            <div class="hero-body">
                <div class="container">
                    <img src="./assets/ThunderEGGLOGO.svg" style="max-height: 300px; margin-top: -100px">
                </div>
            </div>
        </section>

        <section class="content container" style="margin-left: 200px; margin-right: 200px;">
            <div class="columns">
                <div class="column is-half is-size-5">
                    <p class="has-lead-text">Visit the
                        <o-tooltip label="Uniswap LAVA <> ETH Pair"
                                   style="text-decoration: underline;">
                            unicorn
                        </o-tooltip>
                        in the fertile lands where ETH font meets the ancient lava to mine magical
                        <o-tooltip label="UniV2 ERC20 tokens"
                                   style="text-decoration: underline;">LP
                            stones.
                        </o-tooltip>
                    </p>

                    <p class="has-intro-text">Journey to the
                        <o-tooltip label="This smart contract & dApp"
                                   style="text-decoration: underline;">
                            sacred grove
                        </o-tooltip>
                        and offer the LP stones up to spawn a mystical ThunderEgg!
                    </p>

                    <p class="has-intro-text">The quest can only be attempted
                        <o-tooltip label="One ETH account only"
                                   style="text-decoration: underline;">once
                        </o-tooltip>
                        so tread carefully.
                    </p>

                    <p class="has-intro-text">Over time if left to mature the ThunderEgg will increase it’s lava energy
                        hour by hour. The older
                        and more lava the brighter and more beautiful they appear…</p>

                    <p class="has-intro-text has-text-weight-bold">Be warned. To reap the power of the ThunderEgg it
                        must be destroyed.</p>
                </div>
                <div class="column is-half">
                    <section v-if="account" class="content has-text-centered has-lead-text">
                        Welcome {{ account.substring(0, 8) + '...' }}
                        <!--                        <br/>-->
                        <!--                        Staking balance: {{ dp2(toEth(stakingTokenBalance)) }}-->
                        <!--                        <br/>-->
                        <!--                        hasStakingTokenAllowance: {{ hasStakingTokenAllowance }}-->
                        <!--                        <br/>-->
                        <!--                        hasStakingTokenBalance: {{ hasStakingTokenBalance }}-->
                    </section>

                    <section class="has-text-centered" style="margin-bottom: 100px">
                        <section v-if="!account">
                            <button
                                    class="button is-primary is-uppercase has-lead-text is-large"
                                    @click="connect"
                            >
                                Connect wallet
                            </button>
                            <p class="has-text-danger">RINKEBY for testing ONLY!</p>
                        </section>
                        <section v-else-if="account && hasThunderEgg" class="has-text-centered">
                            <div class="columns is-centered">
                                <div class="column" v-if="myThunderEggStats">
                                    <thunder-egg-wrapper
                                            :egg-id="myThunderEggStats.eggId"
                                            :lava="myThunderEggStats.lava"
                                            :birth="myThunderEggStats.birth"
                                            :age="myThunderEggStats.age"
                                            :lp-stones="myThunderEggStats.lp"
                                            :name="myThunderEggStats.name"
                                            :owner="myThunderEggStats.owner"
                                    >
                                        <thunder-egg-p5-v2
                                                :egg-id="myThunderEggStats.eggId"
                                                :lava="myThunderEggStats.lava"
                                                :birth="myThunderEggStats.birth"
                                                :age="myThunderEggStats.age"
                                                :lp-stones="myThunderEggStats.lp"
                                                :name="myThunderEggStats.name"
                                                :owner="myThunderEggStats.owner"
                                        >
                                        </thunder-egg-p5-v2>
                                    </thunder-egg-wrapper>
                                </div>
                            </div>
                        </section>
                        <section v-else-if="account && hasStakingTokenBalance && hasStakingTokenAllowance"
                                 class=""
                                 style="margin-top: 100px;">

                            <o-field label="ThunderEgg name" message="max. 16 characters">
                                <o-input v-model="eggName" maxlength="16" size="large"></o-input>
                            </o-field>

                            <button
                                    class="button is-danger has-lead-text is-large is-uppercase"
                                    @click="spawn"
                            >
                                Spawn ThunderEgg!
                            </button>
                        </section>
                        <section v-else-if="account && hasStakingTokenBalance && !hasStakingTokenAllowance"
                                 class="is-size-1 has-text-danger" style="margin-top: 100px;">
                            <button
                                    class="button is-warning is-uppercase has-lead-text is-large"
                                    @click="approve"
                                    v-if="!isLoading"
                            >
                                Approve LP Stones
                            </button>
                            <Spinner v-else/>
                        </section>
                        <section v-else class="has-warning-text has-background-grey-lighter"
                                 style="margin-top: 100px; padding: 30px;  border-radius: 25px;">
                            You need to go on a journey
                            <br/>
                            Discover some LP stones and spawn a ThunderEgg!
                        </section>
                    </section>
                </div>
            </div>

        </section>

        <footer class="footer has-background-grey-lighter" style="margin-top: 300px;">
            <div class="content has-text-centered">
                <p class="has-warning-text">
                    Built by BlockRocket x Sequence x Art on the Blockchain
                </p>
            </div>
        </footer>
    </article>
</template>

<script>
  import {ethers} from 'ethers';
  import {onMounted, computed, ref} from 'vue';
  import store from './store';
  import ThunderEggWrapper from './components/ThunderEggWrapper';
  import ThunderEggP5V2 from './components/ThunderEggP5V2';
  import Spinner from './components/Spinner';

  export default {
    components: {ThunderEggP5V2, ThunderEggWrapper, Spinner},
    setup() {

      const eggName = ref(null);
      const isLoading = computed(() => store.state.isLoading);
      const account = computed(() => store.state.account);
      const hasThunderEgg = computed(() => store.state.hasThunderEgg);
      const myThunderEggStats = computed(() => store.state.myThunderEggStats);
      const stakingTokenBalance = computed(() => store.state.stakingTokenBalance);
      const hasStakingTokenBalance = computed(() => store.state.hasStakingTokenBalance);
      const hasStakingTokenAllowance = computed(() => store.state.hasStakingTokenAllowance);

      const connect = () => store.dispatch('bootstrap');
      const approve = () => store.dispatch('approveStakingTokens');
      const spawn = () => store.dispatch('spawnThunderEgg', eggName.value);

      const dp2 = (value) => value && parseFloat(value).toFixed(2);
      const toEth = (value) => value && ethers.utils.formatEther(value);

      onMounted(async () => {
      });

      return {
        connect,
        approve,
        spawn,
        dp2,
        toEth,
        eggName,
        isLoading,
        account,
        hasThunderEgg,
        myThunderEggStats,
        stakingTokenBalance,
        hasStakingTokenBalance,
        hasStakingTokenAllowance,
      };
    }
  };
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@200;300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Neuton:ital,wght@0,200;0,300;0,400;0,700;0,800;1,400&display=swap');

    $white: #FFF;
    $black: #000;
    $lightgrey: #F0F0F0;
    $gray: #808080;

    $body-bg: #FFFFFF;
    $primary: #2d1464;
    $darkprimary: #130d20;
    $secondary: #171a39;
    $tertiary: #5433a4;
    $light: #F5F5F5;

    $background: #4b4b4b;

    $family-primary: 'Neuton', serif;
    $font-family-base: 'Neuton', serif;

    .has-lead-text {
        font-family: 'Yanone Kaffeesatz', sans-serif;
        font-size: 2rem;
        font-weight: bold;
        color: $primary;
        letter-spacing: 2px;
    }

    .has-intro-text {
        font-size: 1.5rem;
        color: $secondary;
        letter-spacing: 1.5px;
    }

    .has-warning-text {
        font-size: 1.5rem;
        color: $tertiary;
        letter-spacing: 1.5px;
        font-weight: bold;
    }

    @import '~bulma';
</style>
