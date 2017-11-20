<template>
    <div class="recommend">
      <scroll ref="scroll" class="recommend-content" :data="discList">
        <div>
          <div v-if="recommends&&recommends.length" class="slider-wrapper">
            <slider>
              <div v-for="item in recommends">
                <a :href="item.linkUrl">
                  <img class="needsclick" @load="loadImage" :src="item.picUrl" alt="">
                </a>
              </div>
            </slider>
          </div>
          <div class="recommend-list">
            <h1 class="list-title">热门歌单推荐</h1>
            <!--歌单列表 start-->
            <ul>
              <li class="item" v-for="item in discList">
                <div class="icon">
                  <img v-lazy="item.imgurl" alt="" width="60" height="60">
                </div>
                <div class="text">
                  <h2 class="name" v-html="item.creator.name"></h2>
                  <p class="desc" v-html="item.dissname"></p>
                </div>
              </li>
            </ul>
            <!--歌单列表 end-->
          </div>
        </div>
        <div class="loading-container" v-show="!discList.length">
          <loading></loading>
        </div>
      </scroll>
    </div>
</template>

<script type="text/ecmascript-6">
    import Slider from 'base/slider/slider'
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import {getRecommend, getDiscList} from 'api/recommend'
    import {ERR_OK} from 'api/config'
    export default {
      data () {
        return {
          recommends: [],
          discList: []
        }
      },
      created () {
        this._getRecommend()
        setTimeout(this._getDiscList(), 3000) // 更清楚的看出加载效果
      },
      methods: {
        _getRecommend () {
          getRecommend().then((res) => {
            if (res.code === ERR_OK) {
              this.recommends = res.data.slider
            }
          })
        },
        _getDiscList () {
          getDiscList().then((res) => {
            if (res.code === ERR_OK) {
              this.discList = res.data.list
            }
          })
        },
        loadImage () {
          if (!this.checkLoaded) { // 不需要每加载一次图片就重新计算高度，只需要一次即可
            this.$refs.scroll.refresh() // 保证在图片加载后scroll重新计算高度，以免无法滚动到底部
            this.checkLoaded = true
          }
        }
      },
      components: {
        Slider,
        Scroll,
        Loading
      }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
</style>
