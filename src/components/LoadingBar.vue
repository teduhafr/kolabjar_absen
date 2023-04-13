<template>
    <div class="loading d-flex justify-content-center">
        <div class="spinner-grow text-primary" role="status">
</div>
<div class="spinner-grow text-secondary" role="status">
</div>
<div class="spinner-grow text-success" role="status">
</div>
<div class="spinner-grow text-danger" role="status">
</div>
<div class="spinner-grow text-warning" role="status">
</div>
<div class="spinner-grow text-info" role="status">
</div>
<div class="spinner-grow text-dark" role="status">
</div>
    </div>
</template>

<script lang="js">
    export default {
        name: 'LoadingBar',

    }
</script>
<style scoped>
    .loading {
        position: fixed;
        z-index: 999;
        height: 2em;
        width: 50em;
        overflow: show;
        margin: auto;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }
    #spinner-grow {
        width: 300px;
    }
</style>