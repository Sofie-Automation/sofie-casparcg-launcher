import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueChatScroll from 'vue-chat-scroll'
import { ipcRenderer } from 'electron'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import router from './router'
import store from './store'

import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill()

Vue.config.productionTip = false

ipcRenderer.on('process.log', (e, data) => {
  store.dispatch('logLine', JSON.parse(data))
})
ipcRenderer.on('process.status', (e, status) => {
  store.dispatch('setStatus', JSON.parse(status))
})

Vue.use(BootstrapVue)
Vue.use(VueChatScroll)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app')
