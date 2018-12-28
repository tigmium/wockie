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

    <div class="columns">
      <div class="column">
        <b-field label="Name">
          <b-input v-model="url"></b-input>
        </b-field>
      </div>
      <div class="column">
        <button class="button is-primary" slot="trigger" v-on:click="onClickWget">wget</button>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <b-field label="Word">
          <b-input v-model="word"></b-input>
        </b-field>
      </div>
      <div class="column">
        <button class="button is-primary" slot="trigger" v-on:click="onClickSearch">search</button>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="field">
          <b-checkbox>Basic</b-checkbox>
        </div>
        <div class="field">
          <b-checkbox v-model="checkbox">
            {{ checkbox }}
          </b-checkbox>
        </div>
        <div class="field">
          <b-checkbox v-model="checkboxCustom"
                      true-value="Yes"
                      false-value="No">
            {{ checkboxCustom }}
          </b-checkbox>
        </div>
        <div class="field">
          <b-checkbox :indeterminate="true">
            Indeterminate
          </b-checkbox>
        </div>
        <div class="field">
          <b-checkbox disabled>Disabled</b-checkbox>
        </div>
      </div>
      <div class="column">
        <b-field label="Select a date">
          <b-datepicker
            placeholder="Click to select..."
            icon="calendar-today">
          </b-datepicker>
        </b-field>
      </div>
    </div>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import {ipcRenderer} from 'electron'
  // import console from 'console'

  export default {
    name: 'landing-page',
    components: {SystemInformation},
    data: () => {
      return {
        url: 'https://buefy.github.io/documentation/',
        word: 'test',
      }
    },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link)
      },

      onClickWget() {
        console.log('on click!!!!!')
        ipcRenderer.send('asynchronous-message', this.url)
      },

      onClickSearch() {
        ipcRenderer.send('search', this.word)
      }
    }
  }

  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // pong
  })

  ipcRenderer.on('search-end', (event, arg) => {
    console.log(arg) // pong
  })

  ipcRenderer.on('log', (event, msg) => {
    console.log(msg)
  })
</script>

<style lang="scss">
  @import "~bulma/sass/utilities/_all.sass";
  @import "~bulma/sass/grid/columns.sass";
  @import "~bulma/sass/elements/button.sass"
</style>
