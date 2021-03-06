<template>
  <div id="app">
    <div class="app-global-loading" v-if="initializing">
      <p>Initializing....</p>
    </div>
    <router-view @startApp="f_startApp"></router-view>
  </div>
</template>

<script>
import fs from 'fs'
import { remote } from 'electron'
import storage from 'localforage'
import { APP_STATE_PERSIST_KEY } from '../constants/constants'
import { ACT_GET_USER_DATA, MUT_SET_RPC_PORT, ACT_LOGOUT } from '../constants/store'
import { startDaemon } from '../services/daemon'

export default {
  name: 'app',
  data() {
    return {
      initializing: true,
    }
  },
  mounted() {
    // get persisted state from storage
    console.log('getting app state from storage')
    storage
      .getItem(APP_STATE_PERSIST_KEY)
      .then(val => {
        console.log('init app state')
        console.log(val)
        if (val) {
          if (val.dataDir.length > 0 && val.phrase.length > 0) {
            this.$store.replaceState(val)
            return val
          }
        }
        return Promise.reject(new Error('not login'))
      })
      .then(() => this.f_startApp())
      .catch(err => {
        console.log('data init failed.')
        console.log(err)
        this.initializing = false
        this.$store
          .dispatch(ACT_LOGOUT)
          .then(() => {
            remote.getCurrentWindow().setSize(1000, 670, true)
            return this.$router.push({ name: 'account/import' })
          })
          .catch(() => {})
      })
  },
  methods: {
    f_startApp() {
      console.log('starting app at ', this.$store.state.dataDir)
      try {
        fs.readdirSync(this.$store.state.dataDir)
      } catch (err) {
        return Promise.reject(err)
      }
      return startDaemon(this.$store.state.dataDir)
        .then(port => {
          this.$store.commit(MUT_SET_RPC_PORT, port)
          return this.$store.dispatch(ACT_GET_USER_DATA)
        })
        .then(() => {
          console.log('data init finished')
          this.initializing = false
          remote.getCurrentWindow().setSize(1000, 670, true)
          if (this.$store.state.phrase.length > 0) {
            return this.$router.push({ name: 'files' })
          }
          console.log('get user data failed, redirecting to import account page')
          return this.$store
            .dispatch(ACT_LOGOUT)
            .then(() => this.$router.push({ name: 'account/import' }))
        })
    },
  },
}
</script>

<style lang="scss">
@import '../assets/css/_base.scss';

#app {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.app-global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  color: #ccc;
  font-weight: bold;
  font-size: 40px;
}
</style>
