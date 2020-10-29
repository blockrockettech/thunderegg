<template>
    <div class="card slate is-shadowless" style="transform: scale(0.8); transform-origin: top;">
        <div class="" style="padding-top: 160px; padding-left: 40px; padding-right: 40px;">
            <div class="columns">
                <div class="column has-text-left">
                    <span class="is-uppercase is-size-6">ID</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold"
                          style="text-shadow:0px 1px 0 #FFFFFF;">#{{ eggId }}</span>
                </div>
                <div class="column has-text-centered is-size-1 is-family-secondary has-text-weight-bold"
                     style="text-shadow:0px 1px 0 #FFFFFF;">{{ name }}
                </div>
                <div class="column has-text-right">
                    <span class="is-uppercase is-size-6">AGE</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold"
                          style="text-shadow:0px 1px 0 #FFFFFF;">{{ age }}</span>
                </div>
            </div>
        </div>
        <div class="card-image has-text-centered" style="margin-top: -100px;">
            <slot>🥚</slot>
        </div>
        <div style="padding-left: 40px; padding-right: 40px; margin-top: -100px;">
            <div class="columns" style="margin-top: 25px">
                <div class="column has-text-left">
                    <span class="is-uppercase is-size-6">LAVA</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold"
                          style="text-shadow:0px 1px 0 #FFFFFF;">{{ dp2(lava) }}</span>
                </div>
                <div class="column has-text-right">
                    <span class="is-uppercase is-size-6" style="text-shadow:0px 1px 0 #FFFFFF;">LP STONES</span>
                    <br/>
                    <span class="is-size-3 has-text-weight-bold" style="text-shadow:0px 1px 0 #FFFFFF;">{{ dp0(lpStones) }}</span>
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
      const dp2 = (value) => value && parseFloat(value).toFixed(2);
      return {
        dp0,
        dp2,
      };
    }
  };
</script>

<style lang="scss" scoped>

    .slate {
        background: url('/slate-large.png') no-repeat center center;
        /*background-size: 100%;*/
    }
</style>