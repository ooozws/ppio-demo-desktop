import Vue from 'vue'
import Vuex from 'vuex'

import userStore from './user'
import fileListStore from './fileList'
import uploadTaskStore from './tasks/upload'
import downloadTaskStore from './tasks/download'

Vue.config.devtools = true
Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    curPage: '',
  },
  modules: {
    user: userStore,
    file: fileListStore,
    uploadTask: uploadTaskStore,
    downloadTask: downloadTaskStore,
  },
})
