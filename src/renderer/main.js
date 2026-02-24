import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueChatScroll from 'vue-chat-scroll'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import router from './router'
import store from './store'

import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill()

Vue.config.productionTip = false

window.electronAPI.on('process.log', (data) => {
  store.dispatch('logLine', JSON.parse(data))
})
window.electronAPI.on('process.status', (status) => {
  store.dispatch('setStatus', JSON.parse(status))
})

Vue.use(BootstrapVue)
Vue.use(VueChatScroll)

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
