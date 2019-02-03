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
        <b-collapse class="card" v-for="(node, rootIndex) in docTree" :key="node.domain" v-bind:open="false">
          <div slot="trigger" slot-scope="props" class="card-header">
            <p class="card-header-title">
              <b-icon pack="far" icon="dot-circle" size="is-small"></b-icon>
              <span class="text documents-root" :data-root-index="rootIndex">{{node.domain}}</span>
            </p>
            <a class="card-header-icon">
              <b-icon
                :icon="props.open ? 'menu-down' : 'menu-up'">
              </b-icon>
            </a>
          </div>
          <div class="card-content">
            <div class="content">
              <div v-for="(doc, docIndex) in node.documents" :key="doc.id" class="doc-item">
                <div class="document" :data-root-index="rootIndex" :data-document-index="docIndex"><a
                  v-bind:alt="doc.url" v-on:click="e => onClickDocLink(e, doc)">{{doc.title}}</a></div>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>

    <div id="search-area" class="column is-9">
      <div id="search-form">
        <b-field>
          <b-input placeholder="Search..." type="search" icon="magnify" v-model="word">
          </b-input>
          <p class="control">
            <button class="button is-primary" v-on:click="onClickSearch">Search</button>
          </p>

          <div class="condition-bool">
            <b-radio v-model="bool"
                     native-value="AND">
              AND
            </b-radio>
            <b-radio v-model="bool"
                     native-value="OR">
              OR
            </b-radio>
          </div>
        </b-field>
      </div>

      <div id="result-area">
        <div v-for="match in matches" class="result-item">
          <div><a v-bind:alt="match.doc.url" v-on:click="e => onClickDocLink(e, match.doc)">{{match.doc.title}}</a>
          </div>
          <div class="columns match-text-area">
            <div class="column is-12">
              <pre v-html="match.highlight"></pre>
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
  import contextMenu from 'electron-context-menu';

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

      ipcRenderer.send('load-documents');

      contextMenu({
        prepend: ({x, y}, browserWindow) => {
          const getElemByPos = (x, y, clazz) => {
            const elems = document.elementsFromPoint(x, y).filter((n) => n.classList.contains(clazz));
            if (elems.length > 0) {
              return elems[0];
            } else {
              return null;
            }
          };

          const rootElem = getElemByPos(x, y, 'documents-root');
          const docElem = getElemByPos(x, y, 'document');

          return [{
            label: 'Delete Document',
            visible: docElem !== null,
            click: (menuItem, browserWindow, event) => {
              const docIndex = docElem.getAttribute('data-document-index');
              const rootIndex = docElem.getAttribute('data-root-index');
              const doc = this.docTree[rootIndex].documents[docIndex];
              ipcRenderer.send('delete-document', doc);
            },
          }, {
            label: 'Delete Documents Root',
            visible: rootElem !== null,
            click: (menuItem, browserWindow, event) => {
              const index = rootElem.getAttribute('data-root-index');
              const docs = this.docTree[index].documents;
              ipcRenderer.send('delete-documents', docs);
            },
          }]
        }
      });
    },
    data: () => {
      return {
        word: 'test',
        docTree: [],
        matches: [],
        bool: 'AND',
      }
    },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link)
      },
      onClickSearch() {
        ipcRenderer.send('search', this.word, this.bool)
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
    }
  }
</script>

<style lang="scss">
  @import "../style/theme";
  @import "~bulma/sass/grid/columns.sass";
  @import "~bulma/sass/elements/button.sass";
  @import "~bulma/sass/elements/form.sass";
  @import "~bulma/sass/components/card.sass";
  @import "~bulma";
  @import "~buefy/src/scss/buefy";

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
    position: relative;
    height: 100vh;

    #search-form {
      position: absolute;
      z-index: 2;
      padding-left: 10px;
      padding-top: 10px;
      width: 100%;
      height: 58px;
      border-bottom: $border-color solid 1px;
      background-color: $bg-color-1;

      .condition-bool {
        padding-top: 4px;
        padding-left: 15px;
      }
    }

    #result-area {
      position: absolute;
      z-index: 1;
      padding-top: 58px;
      overflow: scroll;
      height: 100vh;

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
