<template>
  <div id="wrapper">
    <div class="columns">
      <div class="column">
        <div v-for="doc in documents">{{doc.title}}</div>
      </div>

      <div class="column">
        <b-field>
          <b-input placeholder="Search..." type="search" icon="magnify" v-model="url">
          </b-input>
          <p class="control">
            <button class="button is-primary" v-on:click="onClickWget">Get Page</button>
          </p>
        </b-field>

        <b-field>
          <b-input placeholder="Search..." type="search" icon="magnify" v-model="word">
          </b-input>
          <p class="control">
            <button class="button is-primary" v-on:click="onClickSearch">Search</button>
          </p>
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
    mounted() {
      ipcRenderer.on('asynchronous-reply', this.onIpcAsynchronousReply.bind(this));
      ipcRenderer.on('search-end', this.onIpcSearchEnd.bind(this));
      ipcRenderer.on('log', this.onIpcLog.bind(this));
      ipcRenderer.on('update-documents', this.onIpcUpdateDocuments.bind(this));
    },
    data: () => {
      return {
        url: 'https://buefy.github.io/documentation/',
        word: 'test',
        documents: [],
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
      },
      onIpcAsynchronousReply(event, arg) {
        console.log(arg) // pong
      },
      onIpcSearchEnd(event, arg) {
        console.log(arg) // pong
      },
      onIpcLog(event, msg) {
        console.log(msg) // pong
      },
      onIpcUpdateDocuments(event, documents) {
        this.$set(this, 'documents', documents);
      }
    }
  }
</script>

<style lang="scss">
  @import "~bulma/sass/utilities/_all.sass";
  @import "~bulma/sass/grid/columns.sass";
  @import "~bulma/sass/elements/button.sass";
</style>
