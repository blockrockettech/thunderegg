<template>

    <div class="card slate is-shadowless" style="padding-left: 75px; padding-right: 75px; height: 700px">
        <div class="has-text-weight-bold" style="padding-top: 75px;">
            <div class="columns">
                <div class="column has-text-centered is-size-2 ">{{ name }}</div>
            </div>
        </div>
        <div class="card-image">
            <slot>🥚</slot>
        </div>
        <div class="is-size-4 has-text-weight-bold">
            <div class="columns">
                <div class="column has-text-centered">$LAVA {{ lava }}</div>
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
        background: url('/slate.png') no-repeat center center;
        -webkit-background-size: cover;
        -moz-background-size: cover;
        -o-background-size: cover;
        background-size: cover;
    }
</style>