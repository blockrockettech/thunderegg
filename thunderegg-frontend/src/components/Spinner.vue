<template>
    <div>
        <div class="spinner-square" style="margin: 0 auto; margin-top: 2em; margin-bottom: 2em;">
            <div class="square-1 square"></div>
            <div class="square-2 square"></div>
            <div class="square-3 square"></div>
        </div>
        <div class="has-lead-warning-text">
            {{ message }}
        </div>
    </div>
</template>

<script>
    export default {
        props: ['message'],
        name: 'Spinner',
    };
</script>

<style scoped lang="scss">
    $primary: #2d1464;
    $secondary: #C3AAD4;

    .spinner-square {
        display: flex;
        flex-direction: row;
        width: 90px;
        height: 120px;
    }

    .spinner-square > .square {
        width: 17px;
        height: 80px;
        margin: auto auto;
        border-radius: 4px;
    }

    .square-1 {
        animation: square-anim 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 0s infinite;
    }

    .square-2 {
        animation: square-anim 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 200ms infinite;
    }

    .square-3 {
        animation: square-anim 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 400ms infinite;
    }

    @keyframes square-anim {
        0% {
            height: 80px;
            background-color: $primary;
        }
        20% {
            height: 80px;
        }
        40% {
            height: 120px;
            background-color: $secondary;
        }
        80% {
            height: 80px;
        }
        100% {
            height: 80px;
            background-color: $primary;
        }
    }
</style>
