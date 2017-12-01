<template>
  <!--从右向左滑入-->
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
    import {mapGetters} from 'vuex'
    import {getSingerDetail} from 'api/singer'
    import {ERR_OK} from 'api/config'
    import {createSong} from 'common/js/song'
    import MusicList from 'components/music-list/music-list'
    export default {
      data () {
        return {
          songs: []
        }
      },
      computed: {
        ...mapGetters([
          'singer'
        ]),
        title () {
          return this.singer.name
        },
        bgImage () {
          return this.singer.avatar
        }
      },
      created () {
        this._getDetail()
      },
      methods: {
        _getDetail() {
          if (!this.singer.id) {
            this.$router.push('/singer') // 若用户在操作过程中，不小心刷新了，则直接回退回歌手页面
            return
          }
          getSingerDetail(this.singer.id).then((res) => {
            if (res.code === ERR_OK) {
              this.songs = this._normallizeSongs(res.data.list)
            }
          })
        },
        _normallizeSongs (list) {
          let ret = []
          list.forEach((item) => {
            let {musicData} = item
            if (musicData.songid && musicData.albummid) {
              ret.push(createSong(musicData))
            }
          })
          return ret
        }
      },
      components: {
        MusicList
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
