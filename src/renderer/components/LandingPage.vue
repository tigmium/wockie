<template>
  <div id="wrapper">
    <div class="columns">
      <div class="column"><a class="button">
        Button
      </a></div>
      <div class="column">2</div>
      <div class="column">3</div>
      <div class="column">4</div>
      <div class="column">5</div>
    </div>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style lang="scss">
  @import "~bulma/sass/utilities/_all.sass";
  @import "~bulma/sass/grid/columns.sass";
  @import "~bulma/sass/elements/button.sass"
</style>
