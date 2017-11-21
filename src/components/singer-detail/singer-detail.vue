<template>
  <!--从右向左滑入-->
  <transition name="slide">
    <div class="singer-detail">

    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
    import {mapGetters} from 'vuex'
    import {getSingerDetail} from 'api/singer'
    import {ERR_OK} from 'api/config'
    export default {
      data () {
        return {

        }
      },
      computed: {
        ...mapGetters([
          'singer'
        ])
      },
      created () {
        this._getDetail()
        console.log(this.singer)
      },
      methods: {
        _getDetail() {
          if (!this.singer.id) {
            this.$router.push('/singer') // 若用户在操作过程中，不小心刷新了，则直接回退回歌手页面
            return
          }
          getSingerDetail(this.singer.id).then((res) => {
            if (res.code === ERR_OK) {
              console.log(res)
            }
          })
        }
      }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"
  .singer-detail
    position: fixed
    top: 0
    bottom: 0
    left: 0
    right: 0
    z-index: 200
    background-color: $color-background
  .slide-enter-active,.slide-leave-active
    transition: all .3s
  .slide-enter,.slide-leave-to
    transform: translate3D(100%,0,0)
</style>
