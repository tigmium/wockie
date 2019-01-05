<template>
  <div id="wrapper" class="columns">
    <div id="doc-list" class="column">
      <div class="header columns">
        <div class="column">
          <h2>
            <b-icon pack="fas" icon="book" size="is-small"></b-icon>
            ドキュメント一覧
          </h2>
        </div>
        <div class="column is-3" id="add-doc">
          <a v-on:click="onClickAddDoc">
            <b-icon pack="fas" icon="plus-circle" size="is-big"></b-icon>
          </a>
        </div>
      </div>

      <div class="content">
        <b-collapse class="card" v-for="node in docTree" :key="node.domain" v-bind:open="false">
          <div slot="trigger" slot-scope="props" class="card-header">
            <p class="card-header-title">
              <b-icon pack="far" icon="dot-circle" size="is-small"></b-icon>
              <span class="text">{{node.domain}}</span>
            </p>
            <a class="card-header-icon">
              <b-icon
                :icon="props.open ? 'menu-down' : 'menu-up'">
              </b-icon>
            </a>
          </div>
          <div class="card-content">
            <div class="content">
              <div v-for="doc in node.documents" :key="doc.id" class="doc-item">
                <div><a v-bind:alt="doc.url" v-on:click="e => onClickDocLink(e, doc)">{{doc.title}}</a></div>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>

    <div id="search-area" class="column is-9">
      <b-field id="search-form">
        <b-input placeholder="Search..." type="search" icon="magnify" v-model="word">
        </b-input>
        <p class="control">
          <button class="button is-primary" v-on:click="onClickSearch">Search</button>
        </p>
      </b-field>

      <div id="result-area">
        <div v-for="match in matches" class="result-item">
          <div><a v-bind:alt="match.doc.url" v-on:click="e => onClickDocLink(e, match.doc)">{{match.doc.title}}</a>
          </div>
          <div class="columns match-text-area">
            <div class="column is-12">
              <pre v-html="grep(match.doc.body)"></pre>
            </div>
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

  #wrapper {
    height: 100vh;
  }

  #doc-list {
    overflow: scroll;
    border-right: $border-color solid 1px;

    .header {
      border-bottom: $border-color solid 1px;
      margin-bottom: 0;

      column {
        height: 50px;
      }

      h2 {
        height: 50px;
        line-height: 50px;
        margin-left: 10px;
      }

      #add-doc {
        height: 50px;
        line-height: 50px;
        text-align: right;
        margin-right: 10px;
        cursor: pointer;
      }
    }

    .card-header, .collapse-content {
      border-bottom: $border-color solid 1px;

      .card-header-title {
        margin-bottom: 0;

        i {
          padding-top: 2px;
        }

        .text {
          margin-left: 8px;
        }
      }

      .card-content {
        padding: 10px;

        .doc-item:not(:last-child) {
          border-bottom: $border-color solid 1px;
          padding: 5px 0;
        }

        .doc-item:last-child {
          padding-bottom: 0;
        }

        .doc-item:first-child {
          padding-top: 0;
        }
      }
    }
  }

  #search-area {
    height: 100vh;

    #search-form {
      padding-left: 10px;
      padding-top: 10px;
    }

    #result-area {
      overflow: scroll;
      height: 100%;
      border-top: $border-color solid 1px;

      .result-item {
        padding: 10px;
        border-bottom: $border-color solid 1px;
      }

      .match-text-area {
        margin-top: 8px;
        margin-bottom: 8px;
      }

      pre {
        padding: 10px;
        background-color: $bg-color-2;
        border: $border-color solid 1px;
        color: $text-color-sub;
      }
    }
  }

  #wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
</style>
