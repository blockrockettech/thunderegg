<template>
    <article class="has-background-success" :style="{ 'background-image': 'url(/bg.jpg)'}"
             style="background-position: center top; background-repeat: no-repeat;background-attachment: fixed;">

        <section class="hero has-text-centered">
            <div class="hero-body">
                <div class="container">
                    <img src="./assets/ThunderEGGLOGO.svg" style="max-height: 300px; margin-top: -100px">
                </div>
            </div>
        </section>

        <article class="is-hidden-mobile">
            <section class="content container" style="margin-left: 250px; margin-right: 250px; margin-bottom: 50px;">
                <div class="columns">
                    <div class="column is-half">
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
                        <section v-if="account" class="content has-text-centered has-intro-text"
                                 style="border: 5px solid #6844b8; padding: 5px">
                            Welcome {{ account.substring(0, 6) + '...' }}
                            <!--                        <br/>-->
                            <!--                        Staking balance: {{ dp2(toEth(stakingTokenBalance)) }}-->
                        </section>

                        <section class="has-text-centered" style="margin-bottom: 100px">
                            <section v-if="!account">
                                <button
                                        class="button is-primary is-uppercase has-lead-text is-large"
                                        @click="connect"
                                >
                                    Connect wallet
                                </button>
                                <p class="has-text-danger has-text-weight-bold">Connect to RINKEBY</p>
                            </section>
                            <section v-else-if="account && hasThunderEgg" class="has-text-centered">
                                <div class="columns is-centered">
                                    <div class="column" v-if="myThunderEggStats">
                                        <div v-if="!isLoading">
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
                                                        prefix="my"
                                                >
                                                </thunder-egg-p5-v2>
                                            </thunder-egg-wrapper>
                                            <button
                                                    class="button is-danger is-outlined is-uppercase has-lead-text is-large"
                                                    @click="destroy"
                                                    style="margin-top: 50px"
                                            >
                                                Destroy ThunderEgg & Release LAVA!
                                            </button>
                                        </div>
                                        <spinner v-else
                                                 message="LAVA flows slowly. May take a few strikes of Thor's hammer"/>
                                    </div>
                                </div>
                            </section>
                            <section v-else-if="account && hasStakingTokenBalance && hasStakingTokenAllowance"
                                     class=""
                                     style="margin-top: 100px;">

                                <div v-if="!isLoading">
                                    <o-field label="Name your creation..." message="max. 16 characters">
                                        <o-input v-model="eggName" maxlength="16" size="large"></o-input>
                                    </o-field>

                                    <button
                                            class="button is-danger has-lead-text is-large is-uppercase"
                                            @click="spawn"
                                    >
                                        Spawn ThunderEgg!
                                    </button>
                                </div>
                                <spinner v-else message="Message sent to the Gods. Be patient it might be lunchtime..."/>
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
                                <spinner v-else
                                         message="Approval asked of the Gods. Be warned they are grumpy and slow..."/>
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

            <section class="level has-text-primary container"
                     style="border: 5px solid #6844b8; padding: 5px; margin-bottom: 100px" v-if="coreStats">
                <div class="level-item has-text-centered">
                    <div>
                        <p class="is-size-5 is-uppercase is-marginless">ThunderEggs</p>
                        <p class="is-size-2">{{coreStats.totalSupply}}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="is-size-5 is-uppercase is-marginless">Spawned</p>
                        <p class="is-size-2">{{coreStats.totalSpawned}}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="is-size-5 is-uppercase is-marginless">Destroyed</p>
                        <p class="is-size-2">{{coreStats.totalDestroyed}}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="is-size-5 is-uppercase is-marginless">LAVA</p>
                        <p class="is-size-2">{{dp0(coreStats.lavaTotalSupply)}}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="is-size-5 is-uppercase is-marginless">LAVA per Block</p>
                        <p class="is-size-2">{{dp0(coreStats.lavaPerBlock)}}</p>
                    </div>
                </div>
            </section>

            <section class="container" v-if="spawnings && spawnings.length > 0">
                <h2 class="has-lead-text">Spawnings</h2>
                <div class="columns is-multiline">
                    <div class="column is-half" v-for="spawn in spawnings" :key="spawn.eggId">
                        <thunder-egg-light-wrapper :egg-id="spawn.eggId"
                                                   :lava="spawn.lava"
                                                   :birth="spawn.birth"
                                                   :age="spawn.age"
                                                   :lp-stones="spawn.lp"
                                                   :name="spawn.name"
                                                   :owner="spawn.owner"
                        >
                            <thunder-egg-p5-v2
                                    :egg-id="spawn.eggId"
                                    :lava="spawn.lava"
                                    :birth="spawn.birth"
                                    :age="spawn.age"
                                    :lp-stones="spawn.lp"
                                    :name="spawn.name"
                                    :owner="spawn.owner"
                                    prefix="spawnings"
                            >
                            </thunder-egg-p5-v2>
                        </thunder-egg-light-wrapper>
                    </div>
                </div>
            </section>
        </article>
        <article class="is-mobile is-hidden-tablet has-lead-text has-text-centered">
            Please check out ThunderEgg on a Desktop machine!
        </article>

        <footer class="footer has-background-grey-lighter" style="margin-top: 100px;">
            <div class="content has-text-centered">
                <p class="has-warning-text">
                    Built by BlockRocket x Sequence x Art on the Blockchain
                </p>
            </div>
        </footer>
    </article>
</template>

<script>
  import {onMounted, computed, ref} from 'vue';
  import store from './store';
  import ThunderEggWrapper from './components/ThunderEggWrapper';
  import ThunderEggP5V2 from './components/ThunderEggP5V2';
  import Spinner from './components/Spinner';
  import ThunderEggLightWrapper from './components/ThunderEggLightWrapper';

  export default {
    components: {ThunderEggLightWrapper, ThunderEggP5V2, ThunderEggWrapper, Spinner},
    setup: function () {

      const eggName = ref(null);
      const isLoading = computed(() => store.state.isLoading);
      const account = computed(() => store.state.account);
      const hasThunderEgg = computed(() => store.state.hasThunderEgg);
      const myThunderEggStats = computed(() => store.state.myThunderEggStats);
      const stakingTokenBalance = computed(() => store.state.stakingTokenBalance);
      const hasStakingTokenBalance = computed(() => store.state.hasStakingTokenBalance);
      const hasStakingTokenAllowance = computed(() => store.state.hasStakingTokenAllowance);
      const spawnings = computed(() => store.state.spawnings);
      const coreStats = computed(() => store.state.coreStats);

      const connect = () => store.dispatch('bootstrap');
      const approve = () => store.dispatch('approveStakingTokens');
      const spawn = () => store.dispatch('spawnThunderEgg', eggName.value);
      const destroy = () => store.dispatch('destroyThunderEgg');

      const dp2 = (value) => value && parseFloat(value).toFixed(2);
      const dp0 = (value) => value && parseFloat(value).toFixed(0);

      onMounted(async () => {
        setInterval(() => store.dispatch('heartbeat'), 3000);
      });

      return {
        connect,
        approve,
        spawn,
        destroy,
        dp2,
        dp0,
        eggName,
        isLoading,
        account,
        hasThunderEgg,
        myThunderEggStats,
        stakingTokenBalance,
        hasStakingTokenBalance,
        hasStakingTokenAllowance,
        spawnings,
        coreStats,
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
    $info: #8E9B12;
    $success: #C3AAD4;

    $background: #4b4b4b;

    $family-primary: 'Neuton', serif;
    $family-secondary: 'Yanone Kaffeesatz', sans-serif;
    $font-family-base: 'Neuton', serif;

    .has-lead-text {
        font-family: 'Yanone Kaffeesatz', sans-serif;
        font-size: 2rem;
        font-weight: bold;
        color: $primary;
    }

    .has-lead-warning-text {
        font-family: 'Yanone Kaffeesatz', sans-serif;
        font-size: 2rem;
        font-weight: bold;
        color: $darkprimary;
    }

    .has-intro-text {
        font-size: 1.5rem;
        color: $secondary;
    }

    .has-warning-text {
        font-size: 1.5rem;
        color: $tertiary;
        letter-spacing: 1.5px;
        font-weight: bold;
    }

    .o-field .o-field-label {
        font-size: 1.5rem !important;
        font-family: 'Yanone Kaffeesatz', sans-serif;
    }

    @import '~bulma';
</style>
