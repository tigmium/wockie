<template>
  <b-modal id="import-progress-dialog" :active.sync="active" v-bind:canCancel="false">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span v-if="!finished">
            <b-icon pack="fas" icon="spinner" size="is-small" class="fa-spin" style="margin-right: 5px"></b-icon>
            インポート中
          </span>
          <span v-if="finished">
            <b-icon pack="fas" icon="check-square" size="is-small" type="is-success" style="margin-right: 5px"></b-icon>
            インポート完了
          </span>
        </p>
      </header>
      <div class="card-content">
        <b-table id="import-progress" :columns="columns" :data="progress"></b-table>
        <div id="footer-button">
          <a class="button is-loading is-medium is-fullwidth" v-if="!finished" disabled>インポート中</a>
          <a class="button is-success is-medium is-fullwidth" v-if="finished" v-on:click="onClickFinish">完了</a>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import {ipcRenderer} from 'electron'

  export default {
    name: 'import-progress-dialog',
    components: {SystemInformation},
    mounted() {
      ipcRenderer.on('update-import-progress', this.onIpcUpdateImportProgress.bind(this));
      ipcRenderer.on('finish-import-progress', this.onIpcFinishImportProgress.bind(this));
    },
    data: () => {
      return {
        active: false,
        finished: false,
        progress: [],
        columns: [
          {
            field: 'url',
            label: 'URL',
            width: '40',
          },
          {
            field: 'state',
            label: 'State',
            width: '40',
          },
        ]
      }
    },
    methods: {
      open() {
        this.$set(this, 'active', true);
      },
      onClickFinish() {
        this.$set(this, 'active', false);
        this.$set(this, 'progress', []);
        this.$set(this, 'finished', false);
      },
      onIpcUpdateImportProgress(event, progress) {
        this.$set(this, 'progress', progress);
      },
      onIpcFinishImportProgress(event) {
        this.$set(this, 'finished', true);
      }
    }
  }
</script>

<style lang="scss">
  @import "../style/theme";
  @import "~bulma/sass/components/modal.sass";
  @import "~bulma/sass/components/card.sass";
  @import "~bulma/sass/elements/table";

  #import-progress-dialog {
    .modal-content {
      border: 1px solid $border-color;
      background-color: $bg-color-1;
      color: $text-color-sub;

      .card-content {
        padding: 0 !important;
      }
    }

    #import-progress {
      overflow: scroll;
      height: 300px;
      border-bottom: $border-color solid 1px;

      .table {
        border: none;
      }
    }

    #footer-button {
      margin: 10px;
    }
  }
</style>
