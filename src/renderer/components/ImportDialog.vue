<template>
  <b-modal :active.sync="active">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          インポート
        </p>
      </header>
      <div class="card-content">
        <div class="content">
          <b-field label="URL">
            <b-input type="url" v-model="url" @change.native="onChangeURL"></b-input>
          </b-field>
          <b-field label="Max depth">
            <b-input placeholder="Number" type="number" min="0" v-model="depth">
            </b-input>
          </b-field>
          <b-checkbox v-model="filterEnabled">URL filterを変更する</b-checkbox>
          <b-field>
            <b-input type="url" v-model="filter" v-bind:disabled="!filterEnabled"></b-input>
          </b-field>
          <a class="" v-on:click="onClickImport">
            <button class="button is-primary is-fullwidth">
              <b-icon pack="fas" icon="play" size="is-small" style="margin-right: 5px"></b-icon>
              読み込み開始
            </button>
          </a>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import {ipcRenderer} from 'electron'

  export default {
    name: 'import-dialog',
    components: {SystemInformation},
    props: ['importProgressDialog'],
    mounted() {
      // ipcRenderer.on('asynchronous-reply', this.onIpcAsynchronousReply.bind(this));

      // ipcRenderer.send('load-documents')
    },
    data: () => {
      return {
        active: false,
        url: 'https://buefy.github.io/documentation/',
        depth: 1,
        filter: 'https://buefy.github.io/documentation/',
        filterEnabled: false,
      }
    },
    methods: {
      open() {
        this.$set(this, 'active', true);
      },
      onClickImport() {
        const filter = this.filterEnabled ? this.filter : this.url;
        ipcRenderer.send('asynchronous-message', this.url, this.depth, filter);
        this.$set(this, 'active', false);
        this.importProgressDialog.open();
      },
      onChangeURL(e) {
        const url = e.target.value;
        console.log(url);
        this.$set(this, 'filter', url);
      },
    }
  }
</script>

<style lang="scss">
  @import "../style/theme";
  @import "~bulma/sass/components/modal.sass";
  @import "~bulma/sass/elements/form.sass";

  .card-header {
    border-bottom: $border-color solid 1px;
  }

  .modal-content {
    border: 1px solid $border-color;
    background-color: $bg-color-1;
    color: $text-color-sub;
  }
</style>
