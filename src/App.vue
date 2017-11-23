<template>
  <div id="app">
    <m-header></m-header>
    <!--标签小写-->
    <tab></tab>
    <!--切换路由时，keep-alive会将dom缓存到内存中，可避免数据重复加载-->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
import MHeader from 'components/m-header/m-header'
// import引入的本质上是Class，书写规范就是首字母大写
import Tab from 'components/tab/tab'
import Player from 'components/player/player'
export default {
  name: 'app',
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "common/stylus/variable.styl"
</style>
