<template>
  <TransferTable
      class="download-task-manager"
      tableName="download"
      :tableData="taskList">
    <template slot="operations" slot-scope="operationProps">
      <span class="task-operate-btn open-btn" v-if="operationProps.task.status.succeeded" @click="f_open(operationProps.index)"><i class="app-icon icon-open"></i></span>
      <span class="task-operate-btn delete-btn" v-if="operationProps.task.status.finished" @click="f_delete(operationProps.index)"><i class="el-icon el-icon-delete"></i></span>
      <!--<span class="task-operate-btn cancel-btn" v-if="operationProps.task.status.transferringData" @click="f_cancel(operationProps.index)"><i class="el-icon el-icon-close"></i></span>-->
    </template>
  </TransferTable>
</template>
<script>
import fs from 'fs'
import { remote } from 'electron'
import { DL_TASK } from '../constants/store'
import TransferTable from '@/components/TransferTable'

export default {
  name: 'download-list',
  data: () => ({
    getStatusTimer: null,
  }),
  computed: {
    taskList() {
      // concat uploading queue and finished queue
      return this.$store.state.downloadTask.taskQueue.concat(
        this.$store.state.downloadTask.finishedQueue,
      )
    },
  },
  components: {
    TransferTable,
  },
  activated() {
    console.log('activated')
    // TODO: start getting all task status on app start
    this.f_updateStatus()
  },
  deactivated() {
    console.log('deactivated')
    if (this.getStatusTimer) {
      clearTimeout(this.getStatusTimer)
    }
  },
  methods: {
    f_cancel(index) {
      const toCancel = window.confirm('Are you sure to cancel the uploading?')
      if (toCancel) {
        this.$store.dispatch(DL_TASK.ACT_CANCEL_TASK, index)
      }
    },
    f_delete(index) {
      const toDelete = window.confirm('Are you sure to delete the task?')
      if (toDelete) {
        const cancelIdx = index - this.$store.state.downloadTask.taskQueue.length
        this.$store.commit(DL_TASK.MUT_REMOVE_TASK, cancelIdx)
      }
    },
    f_open(index) {
      console.log('opening file ', index)
      const filePath = this.taskList[index].exportPath
      console.log(filePath)
      try {
        fs.readdirSync(filePath)
        remote.shell.showItemInFolder(this.taskList[index].exportPath)
      } catch (err) {
        this.$message.error('File does not exist!')
      }
    },
    f_updateStatus() {
      this.$store.dispatch(DL_TASK.ACT_GET_STATUS).catch(err => {
        console.error(err)
      })
      if (this.taskList.length > 0) {
        this.getStatusTimer = setTimeout(() => {
          this.f_updateStatus()
        }, 2000)
      }
    },
  },
}
</script>

<style lang="scss">
.download-task-manager {
  .task-operate-btn {
    cursor: pointer;
  }

  .app-icon {
    vertical-align: middle;
  }
}
</style>
