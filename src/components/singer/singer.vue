<template>
    <div class="singer">
      <list-view @select="selectSinger" :data="singers"></list-view>
      <!--用来挂载子路由，singer-detail-->
      <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import Singer from 'common/js/singer'
    import ListView from 'base/listview/listview'
    import {getSingerList} from 'api/singer'
    import {ERR_OK} from 'api/config'
    import {mapMutations} from 'vuex'

    const HOT_NAME = '热门'
    const HOT_SINGER_LEN = 10

    export default {
      data () {
        return {
          singers: []
        }
      },
      created () {
        this._getSingerList()
      },
      methods: {
        selectSinger (item) {
          this.$router.push({ // this.$router 编程式跳转接口
            path: `singer/${item.id}`
          })
          this.setSinger(item)
        },
        _getSingerList () {
          getSingerList().then((res) => {
            if (res.code === ERR_OK) {
              this.singers = this._normallizeSinger(res.data.list)
            }
          })
        },
        _normallizeSinger (list) {
          let map = {
            hot: {
              title: HOT_NAME,
              items: []
            }
          }

          list.forEach((item, index) => {
            if (index < HOT_SINGER_LEN) {
              map.hot.items.push(new Singer({
                id: item.Fsinger_mid,
                name: item.Fsinger_name
              }))
            }
            const key = item.Findex
            if (!map[key]) {
              map[key] = {
                title: key,
                items: []
              }
            }
            map[key].items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          })
          // 转为有序列表，处理map
          let hot = []
          let ret = []
          for (let key in map) {
            let val = map[key]
            if (val.title.match(/[a-zA-Z]/)) {
              ret.push(val)
            } else if (val.title === HOT_NAME) {
              hot.push(val)
            }
          }
          // A到Z的升序
          ret.sort((a, b) => {
            return a.title.charCodeAt(0) - b.title.charCodeAt(0)
          })
          return hot.concat(ret)
        },
        ...mapMutations({
          setSinger: 'SET_SINGER'
        })
      },
      components: {
        ListView
      }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
