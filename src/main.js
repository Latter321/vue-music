// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
// import router from './router'
import fastclik from 'fastclick'
import 'common/stylus/index.styl'

// fastclick的用法，绑定在body上，body中所有元素的click事件都不会再出现300毫秒延迟
fastclik.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
