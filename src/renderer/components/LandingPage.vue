<template>
  <div id="wrapper">
    <div id="doc-list">
      <div class="header columns">
        <div class="column">ドキュメント一覧</div>
        <div class="column is-3">
          <button class="button is-info" v-on:click="onClickAddDoc">＋</button>
        </div>
      </div>
      <div class="content">
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
    </div>

    <div id="search-area">
      <b-field>
        <b-input placeholder="Search..." type="search" icon="magnify" v-model="word">
        </b-input>
        <p class="control">
          <button class="button is-info" v-on:click="onClickSearch">Search</button>
        </p>
      </b-field>

      <div id="result">
        <div v-for="match in matches">
          <div><a v-bind:alt="match.doc.url" v-on:click="e => onClickDocLink(e, match.doc)">{{match.doc.title}}</a>
          </div>
          <div>
            <pre v-html="grep(match.doc.body)"></pre>
          </div>
          <div>score: {{match.score}}</div>
        </div>
      </div>
    </div>

    <import-dialog ref="importDialog" v-bind:import-progress-dialog="$refs.importProgressDialog"></import-dialog>
    <import-progress-dialog ref="importProgressDialog"></import-progress-dialog>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import {ipcRenderer, shell} from 'electron'
  import ImportDialog from "./ImportDialog";
  import ImportProgressDialog from "./ImportProgressDialog";
  import esr from "escape-string-regexp";

  export default {
    name: 'landing-page',
    components: {ImportProgressDialog, ImportDialog, SystemInformation},
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
        word: 'test',
        docTree: [],
        matches: [],
      }
    },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link)
      },
      onClickSearch() {
        ipcRenderer.send('search', this.word)
      },
      onClickDocLink(e, doc) {
        shell.openExternal(doc.url);
      },
      onClickAddDoc() {
        this.$refs.importDialog.open();
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
      },
      grep(body) {
        const reg = new RegExp("(" + esr(this.word) + ")", "i");
        const highlight = '<span style="background-color: yellow">$1</span>';
        const match = reg.exec(body);
        if (match) {
          const start = this.getMatchStart(body, match.index);
          const end = this.getMatchEnd(body, match.index);
          const length = end - start;
          let output = body.substr(start, length);
          output = this.escapeHtml(output);
          output = this.lf2br(output);
          output = output.replace(reg, highlight);
          return output;
        } else {
          return null;
        }
      },
      getMatchStart(body, index) {
        let lfCnt = 0;
        for (let i = index; i > 0; i--) {
          if (body[i] === '\n') lfCnt++;

          if (lfCnt == 2) {
            return i + 1;
          }
        }
        return 0;
      },
      getMatchEnd(body, index) {
        let lfCnt = 0;
        const max = body.length;
        for (let i = index; i < max; i++) {
          if (body[i] === '\n') lfCnt++;

          if (lfCnt == 2) {
            return i - 1;
          }
        }
        return max;
      },
      escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      },
      lf2br(txt) {
        return txt.replace(/\n/g, '<br>')
      }
    }
  }
</script>

<style lang="scss">
  @import "../style/theme";
  @import "~bulma/sass/grid/columns.sass";
  @import "~bulma/sass/elements/button.sass";
  @import "~bulma/sass/elements/form.sass";
  @import "~bulma/sass/components/card.sass";

  #doc-list {
    width: 300px;
    height: 100%;
    overflow: scroll;
    border-right: $border-color solid 1px;

    .header {
      border-bottom: $border-color solid 1px;
    }

    .card-header, .collapse-content {
      border-bottom: $border-color solid 1px;
    }
  }

  #search-area {
    height: 100vh;

    #result {
      overflow: scroll;
      height: 100%;

      pre {
        width: 400px;
      }
    }
  }

  #wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
</style>
