<template>
    <div class="card" style="width: 400px;">
        <div class="card-image">
            <slot>🥚</slot>
        </div>
        <div class="card-content has-background-dark has-text-light has-text-centered">
            <div class="content has-text-left">
                <div class="columns is-multiline">
                    <div class="column is-half">ID {{ eggId }}</div>
                    <div class="column is-half">Age {{ age }}</div>
                    <div class="column is-half">🔥 {{ lava }}</div>
                    <div class="column is-half">💎 {{ lpStones }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    props: ['eggId', 'owner', 'lava', 'lpStones', 'age'],
  };
</script>