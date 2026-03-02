import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueChatScroll from 'vue-chat-scroll'
/* eslint-disable-next-line n/no-extraneous-import */
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import router from './router/index.js'
import store from './store/index.js'

import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill()

Vue.config.productionTip = false

/* eslint-disable-next-line no-undef */
window.electronAPI.on('process.log', (data) => {
	store.dispatch('logLine', JSON.parse(data))
})

/* eslint-disable-next-line no-undef */
window.electronAPI.on('process.status', (status) => {
	store.dispatch('setStatus', JSON.parse(status))
})

Vue.use(BootstrapVue)
Vue.use(VueChatScroll)

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount('#app')
