<template>
  <div id="wrapper">
    <div class="columns">
      <div class="column">
        <b-collapse class="card" v-for="node in docTree" :key="node.domain" v-bind:open="false">
          <div slot="trigger" slot-scope="props" class="card-header">
            <p class="card-header-title">
              {{node.domain}}
            </p>
            <a class="card-header-icon">
              <b-icon
                :icon="props.open ? 'menu-down' : 'menu-up'">
              </b-icon>
            </a>
          </div>
          <div class="card-content">
            <div class="content">
              <div v-for="doc in node.documents" :key="doc.id">
                <div><a v-bind:alt="doc.url" v-on:click="e => onClickDocLink(e, doc)">{{doc.title}}</a></div>
              </div>
            </div>
          </div>
        </b-collapse>
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

        <div v-for="match in matches">
          <div><a v-bind:alt="match.doc.url" v-on:click="e => onClickDocLink(e, match.doc)">{{match.doc.title}}</a></div>
          <div>score: {{match.score}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import {ipcRenderer, shell} from 'electron'
  // import console from 'console'

  export default {
    name: 'landing-page',
    components: {SystemInformation},
    mounted() {
      ipcRenderer.on('asynchronous-reply', this.onIpcAsynchronousReply.bind(this));
      ipcRenderer.on('search-end', this.onIpcSearchEnd.bind(this));
      ipcRenderer.on('log', this.onIpcLog.bind(this));
      ipcRenderer.on('update-documents', this.onIpcUpdateDocuments.bind(this));
      ipcRenderer.on('save-documents-end', this.onIpcSaveDocumentsEnd.bind(this));
      ipcRenderer.on('load-documents-end', this.onIpcLoadDocumentsEnd.bind(this));

      ipcRenderer.send('load-documents')
    },
    data: () => {
      return {
        url: 'https://buefy.github.io/documentation/',
        word: 'test',
        docTree: [],
        matches: [],
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
      onClickDocLink(e, doc) {
        shell.openExternal(doc.url);
      },
      onIpcAsynchronousReply(event, arg) {
        console.log(arg) // pong
      },
      onIpcSearchEnd(event, matches) {
        this.$set(this, 'matches', matches);
      },
      onIpcLog(event, msg) {
        console.log(msg) // pong
      },
      onIpcUpdateDocuments(event, docTree) {
        this.$set(this, 'docTree', docTree);
      },
      onIpcSaveDocumentsEnd(event) {

      },
      onIpcLoadDocumentsEnd(event, docTree) {
        this.$set(this, 'docTree', docTree);
      }
    }
  }
</script>

<style lang="scss">
  @import "~bulma/sass/utilities/_all.sass";
  @import "~bulma/sass/grid/columns.sass";
  @import "~bulma/sass/elements/button.sass";
</style>
