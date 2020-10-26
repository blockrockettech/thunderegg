<template>
    <article class="content">

        <section class="hero is-info has-text-centered" style="margin-bottom: 100px">
            <div class="hero-body">
                <div class="container">
                    <h1 class="is-size-1 has-text-primary-light has-text-centered has-brand-text">ThunderEgg</h1>
                </div>
            </div>
        </section>

        <section class="content container">
            <div class="columns">
                <div class="column is-half has-brand-text is-size-5">
                    <p>Visit the
                        <o-tooltip label="Uniswap LAVA <> ETH Pair"
                                   style="text-decoration: underline; text-decoration-style: wavy;" variant="info">
                            unicorn
                        </o-tooltip>
                        in the fertile lands where ETH font meets the ancient lava to mine magical
                        <o-tooltip label="UniV2 ERC20 tokens"
                                   style="text-decoration: underline; text-decoration-style: wavy;" variant="info">LP
                            stones.
                        </o-tooltip>
                    </p>

                    <p>Journey to the
                        <o-tooltip label="This smart contract & dApp"
                                   style="text-decoration: underline; text-decoration-style: wavy;" variant="info">
                            sacred grove
                        </o-tooltip>
                        and offer the LP stones up to spawn a mystical ThunderEgg!
                    </p>

                    <p>The quest can only be attempted
                        <o-tooltip label="One ETH account only"
                                   style="text-decoration: underline; text-decoration-style: wavy;" variant="info">once
                        </o-tooltip>
                        so tread carefully.
                    </p>

                    <p>Over time if left to mature the ThunderEgg will increase it’s lava energy hour by hour. The older
                        and more lava the brighter and more beautiful they appear…</p>

                    <p>Be warned. To reap the power of the ThunderEgg it must be destroyed.</p>
                </div>
                <div class="column is-half">
                    <section v-if="account" class="content has-text-centered">
                        Welcome {{ account.substring(0, 8) + '...' }}
                        <br/>
                        Staking balance: {{ dp2(toEth(stakingTokenBalance)) }}
                        <br/>
                        hasStakingTokenAllowance: {{ hasStakingTokenAllowance }}
                        <br/>
                        hasStakingTokenBalance: {{ hasStakingTokenBalance }}
                    </section>

                    <section class="has-text-centered" style="margin-bottom: 100px">
                        <section v-if="!account">
                            <button
                                    class="button is-warning is-uppercase has-brand-text"
                                    @click="connect"
                            >
                                Connect wallet 🦊
                            </button>
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
                                 class="is-size-1"
                                 style="margin-top: 100px;">

                            <o-field label="ThunderEgg name" message="max. 16 characters">
                                <o-input v-model="eggName" maxlength="16"></o-input>
                            </o-field>

                            <button
                                    class="button is-primary is-uppercase has-brand-text"
                                    @click="spawn"
                            >
                                Spawn ThunderEgg!
                            </button>
                        </section>
                        <section v-else-if="account && hasStakingTokenBalance && !hasStakingTokenAllowance"
                                 class="is-size-1 has-text-danger" style="margin-top: 100px;">
                            <button
                                    class="button is-info is-uppercase has-brand-text"
                                    @click="approve"
                            >
                                Approve LP Stones
                            </button>
                        </section>
                        <section v-else class="is-size-1 has-text-dark" style="margin-top: 100px;">
                            You need to go on a journey...find some LP stones and get your ass back here...
                        </section>
                    </section>
                </div>
            </div>

        </section>

        <footer class="footer has-background-info has-text-light">
            <div class="content has-text-centered">
                <p>
                    ThunderEgg built with love by BlockRocket x Sequence x KnownOrigin.io x Art on the Blockchain x
                    CryptoKaiju 🔥
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

  export default {
    components: {ThunderEggP5V2, ThunderEggWrapper},
    setup() {

      const eggName = ref(null);
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

      onMounted(async () => {});

      return {
        connect,
        approve,
        spawn,
        dp2,
        toEth,
        eggName,
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
    @import url('https://fonts.googleapis.com/css2?family=Fontdiner+Swanky&display=swap');

    .has-brand-text {
        font-family: 'Fontdiner Swanky', cursive;
        letter-spacing: 3px;
    }

    $black: #020203;
    $white: #fff;
    $gray: #D6D7DC;

    $background: $gray;

    @import '~bulma';
</style>
