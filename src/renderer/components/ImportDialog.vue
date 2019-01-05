<template>
  <b-modal :active.sync="active">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          インポート
        </p>
        <a href="#" class="card-header-icon" aria-label="more options">
          <span class="icon">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </a>
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
        </div>
      </div>
      <footer class="card-footer">
        <a href="#" class="card-footer-item" v-on:click="onClickImport">読み込み開始</a>
      </footer>
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

  .modal-content {
    border: 1px solid $border-color;
    background-color: $bg-color-1;
    color: $text-color-sub;
  }
</style>
