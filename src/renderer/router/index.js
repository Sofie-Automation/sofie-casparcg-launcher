import Vue from 'vue'
import Router from 'vue-router'
import Settings from '../components/Settings'
import ProcessTab from '../components/ProcessTab'
import Status from '../components/Status'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/settings',
      name: 'settings-page',
      component: Settings,
    },
    {
      path: '/:id',
      name: 'process-page',
      component: ProcessTab,
    },
    {
      path: '/',
      name: 'status-page',
      component: Status,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
