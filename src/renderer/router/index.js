import Vue from 'vue'
import Router from 'vue-router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Router)
Vue.use(Buefy)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/test',
      name: 'test-page',
      component: require('@/components/TestPage').default
    },
    {
      path: '/info',
      name: 'info',
      component: require('@/components/LandingPage/SystemInformation').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
