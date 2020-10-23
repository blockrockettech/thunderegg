<template>
    <article class="content has-background-primary" style="margin-bottom: 200px">
        <section class="hero is-primary has-text-centered">
            <div class="hero-body">
                <div class="container">
                    <h1 class="is-size-1 has-text-primary-light has-text-centered pt-3 has-brand-text">ThunderEgg</h1>
                </div>
            </div>
        </section>

        <div class="has-text-centered">


            <button class="button is-warning has-text-primary is-uppercase has-brand-text" @click="connect"
                    v-if="!account">
                Connect wallet 🦊
            </button>
            <section v-else class="has-brand-text">
                Welcome {{ account.substring(0, 8) + '...' }}
            </section>

        </div>

        <section class="container" style="margin-top: 200px;">
            <h2>Gallery</h2>
            <div class="columns is-multiline has-text-centered">
                <div class="column is-one-third">
                    <thunder-egg-wrapper egg-id="1" lava="23423" age="11123" lp-stones="44.33">
                        <thunder-egg-p5 egg-id="1" owner="0x818Ff73A5d881C27A945bE944973156C01141232"></thunder-egg-p5>
                    </thunder-egg-wrapper>
                </div>
                <div class="column is-one-third">
                    <thunder-egg-p5 egg-id="2" owner="0x4D20F13e70320e9C11328277F2Cc0dC235A74F27"></thunder-egg-p5>
                </div>
                <div class="column is-one-third">
                    <thunder-egg-p5 egg-id="3" owner="0x84FF65C60Ff63a6eedCDDD82ad139e28da82FCDc"></thunder-egg-p5>
                </div>
            </div>
        </section>

        <o-button size="medium" variant="primary" class="has-text-primary is-uppercase has-brand-text"
                  @click="isImageModalActive = true">
            Open modal
        </o-button>

        <o-modal v-model:active="isImageModalActive">
            <p style="text-align: center">
                <img src="https://avatars2.githubusercontent.com/u/66300512?s=200&v=4"/>
            </p>
        </o-modal>
    </article>
</template>

<script>
  import {onMounted, computed, ref} from 'vue';
  import store from './store';
  import ThunderEggP5 from './components/ThunderEggP5';
  import ThunderEggWrapper from './components/ThunderEggWrapper';

  export default {
    components: {ThunderEggWrapper, ThunderEggP5},
    setup() {

      const isImageModalActive = ref(false);
      const account = computed(() => store.state.account);

      const connect = () => store.dispatch('bootstrap');

      onMounted(async () => {
      });

      return {
        connect,
        account,
        isImageModalActive,
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

    $primary: #b9936c;
    $secondary: lime;

    $scheme-main: $black;
    $scheme-invert: $white;

    $text: $white;

    $dark: #14171A;
    $light: #e6e2d3;

    @import '~bulma';
</style>
