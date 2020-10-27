<template>

    <div class="card slate is-shadowless" style="padding-left: 75px; padding-right: 75px; height: 700px">
        <div class="has-text-weight-bold" style="padding-top: 75px;">
            <div class="columns">
                <div class="column has-text-left is-size-2">#{{ eggId }}</div>
                <div class="column has-text-centered is-size-1 is-family-secondary">{{ name }}</div>
                <div class="column has-text-right is-size-2">
                    {{age}}
                    <span class="is-size-6">blocks</span>
                </div>
            </div>
        </div>
        <div class="card-image has-text-centered">
            <slot>🥚</slot>
        </div>
        <div class="is-size-4 has-text-weight-bold">
            <div class="columns">
                <div class="column has-text-left">$LAVA {{ lava }}</div>
                <div class="column has-text-centered"></div>
                <div class="column has-text-right">LP {{ lpStones }}</div>
            </div>
        </div>
    </div>

</template>

<script>


  export default {
    props: ['eggId', 'owner', 'lava', 'lpStones', 'birth', 'name', 'age'],
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