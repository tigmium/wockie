<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'my-project'
  }
</script>

<style lang="scss">
  @import "style/theme";

  #app {
    background: $background-color;
    color: $text-color-sub;
    height: 100vh;
    /*padding: 60px 80px;*/
    width: 100vw;
  }
</style>
