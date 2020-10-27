<template>

    <div class="card slate is-shadowless" style="padding-left: 75px; padding-right: 75px; height: 700px">
        <div class="" style="padding-top: 75px;">
            <div class="columns">
                <div class="column has-text-left">
                    <span class="is-uppercase is-size-6">ID</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold">#{{ eggId }}</span>
                </div>
                <div class="column has-text-centered is-size-1 is-family-secondary has-text-weight-bold">{{ name }}</div>
                <div class="column has-text-right">
                    <span class="is-uppercase is-size-6">AGE</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold">{{ age }}</span>
                </div>
            </div>
        </div>
        <div class="card-image has-text-centered">
            <slot>🥚</slot>
        </div>
        <div>
            <div class="columns">
                <div class="column has-text-left">
                    <span class="is-uppercase is-size-6">LAVA</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold">{{ dp0(lava) }}</span>
                </div>
                <div class="column has-text-right">
                    <span class="is-uppercase is-size-6">LP STONES</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold">{{ dp0(lpStones) }}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<script>

  export default {
    props: ['eggId', 'owner', 'lava', 'lpStones', 'birth', 'name', 'age'],
    setup: function () {
      const dp0 = (value) => value && parseFloat(value).toFixed(0);
      return {
        dp0,
      };
    }
  };
</script>

<style lang="scss" scoped>

    .slate {
        background: url('/slate-large.png') no-repeat center center;
        -webkit-background-size: cover;
        -moz-background-size: cover;
        -o-background-size: cover;
        background-size: cover;
    }
</style>