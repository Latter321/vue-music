<template>
      <div class="player" v-show="playlist.length>0">
        <transition name="normal"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @leave="leave"
                    @after-leave="afterLeave">
          <div class="normal-player" v-show="fullScreen">
            <div class="background">
              <img :src="currentSong.image" alt="" width="100%" height="100%">
            </div>
            <div class="top">
              <div class="back" @click="back">
                <i class="icon-back"></i>
              </div>
              <h1 class="title" v-html="currentSong.name"></h1>
              <h2 class="subtitle" v-html="currentSong.singer"></h2>
            </div>
            <div class="middle"
                 @touchstart.prevent="middleTouchStart"
                 @touchmove.prevent="middleTouchMove"
                 @touchend="middleTouchEnd">
              <div class="middle-l" ref="middleL">
                <div class="cd-wrapper" ref="cdWrapper">
                  <div class="cd" :class="cdCls">
                    <img :src="currentSong.image" alt="" class="image">
                  </div>
                </div>
                <div class="playing-lyric-wrapper">
                  <div class="playing-lyric">
                    {{playingLyric}}
                  </div>
                </div>
              </div>
              <!--右侧歌词 start-->
              <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                <div class="lyric-wrapper">
                  <div v-if="currentLyric">
                    <p ref="lyricLine"
                       class="text"
                       :class="{'current': currentLineNum ===index}"
                       v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
                  </div>
                  <!--<div class="pure-music" v-show="isPureMusic">-->
                    <!--<p>{{pureMusicLyric}}</p>-->
                  <!--</div>-->
                </div>
              </scroll>
              <!--右侧歌词 end-->
            </div>
            <div class="bottom">
              <div class="dot-wrapper">
                <span class="dot" :class="{active:currentShow==='cd'}"></span>
                <span class="dot" :class="{active:currentShow==='lyric'}"></span>
              </div>
              <div class="progress-wrapper">
                <span class="time time-l">{{format(currentTime)}}</span>
                <div class="progress-bar-wrapper">
                  <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                </div>
                <span class="time time-r">{{format(currentSong.duration)}}</span>
              </div>
              <div class="operators">
                <div class="icon i-left">
                  <i :class="iconMode" @click="changeMode"></i>
                </div>
                <div class="icon i-left" :class="disableCls">
                  <i class="icon-prev" @click="prev"></i>
                </div>
                <div class="icon i-center" :class="disableCls">
                  <i :class="playIcon" @click="togglePlaying"></i>
                </div>
                <div class="icon i-right" :class="disableCls">
                  <i class="icon-next" @click="next"></i>
                </div>
                <div class="icon i-right">
                  <i class="icon icon-not-favorite"></i>
                </div>
              </div>
            </div>
          </div>
        </transition>
        <transition name="mini">
          <div class="mini-player" v-show="!fullScreen" @click="open">
            <div class="icon">
              <img :src="currentSong.image" alt="" width="40" height="40" :class="cdCls">
            </div>
            <div class="text">
              <h2 class="name" v-html="currentSong.name"></h2>
              <p class="desc" v-html="currentSong.singer"></p>
            </div>
            <div class="control">
              <progress-circle :radius="radius" :percent="percent">
                <i class="icon-mini" :class="miniIcon" @click.stop="togglePlaying"></i>
              </progress-circle>
            </div>
            <div class="control">
              <i class="icon-playlist"></i>
            </div>
          </div>
        </transition>
        <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
      </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters, mapMutations} from 'vuex'
    import {prefixStyle} from 'common/js/dom'
    import animations from 'create-keyframe-animation'
    import ProgressBar from 'base/progress-bar/progress-bar'
    import ProgressCircle from 'base/progress-circle/progress-circle'
    import {playMode} from 'common/js/config'
    import {shuffle} from 'common/js/util'
    import Lyric from 'lyric-parser'
    import Scroll from 'base/scroll/scroll'

    const transform = prefixStyle('transform')
    const transition = prefixStyle('transition')
    export default {
      data () {
        return {
          songReady: false,
          currentTime: 0,
          radius: 32,
          currentLyric: null,
          currentLineNum: 0,
          currentShow: 'cd',
          playingLyric: ''
        }
      },
      computed: {
        playIcon () {
          return this.playing ? 'icon-pause' : 'icon-play'
        },
        miniIcon () {
          return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
        },
        cdCls () {
          return this.playing ? 'play' : 'play pause'
        },
        disableCls () {
          return this.songReady ? '' : 'disable'
        },
        percent () {
          return this.currentTime / this.currentSong.duration
        },
        iconMode () {
          return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
          'fullScreen',
          'playlist',
          'currentSong',
          'playing',
          'currentIndex',
          'mode',
          'sequenceList'
        ])
      },
      created () {
        this.touch = {} // 不要添加getter和setter的对象定义在created
      },
      methods: {
        back () {
          this.setFullScreen(false)
        },
        open () {
          this.setFullScreen(true)
        },
        enter (el, done) { // done执行的时候会跳到下一个钩子函数afterEnter
          const {x, y, scale} = this._getPosAndScale()
          let animation = {
            0: {
              transform: `translate3D(${x}px,${y}px,0) scale(${scale})`
            },
            60: {
              transform: `translate3D(0,0,0) scale(1.1)`
            },
            100: {
              transform: `translate3D(0,0,0) scale(1)`
            }
          }
          animations.registerAnimation({
            name: 'move',
            animation,
            presets: {
              duration: 400,
              easing: 'linear'
            }
          })
          animations.runAnimation(this.$refs.cdWrapper, 'move', done)
        },
        afterEnter () {
          animations.unregisterAnimation('move')
          this.$refs.cdWrapper.style.animatin = ''
        },
        leave (el, done) {
          this.$refs.cdWrapper.style.transition = 'all .4s'
          const {x, y, scale} = this._getPosAndScale()
          this.$refs.cdWrapper.style[transform] = `translate3D(${x}px,${y}px,0) scale(${scale})`
          this.$refs.cdWrapper.addEventListener('transitionend', done)
        },
        afterLeave () {
          this.$refs.cdWrapper.style.transition = ''
          this.$refs.cdWrapper.style[transform] = ''
        },
        togglePlaying () {
          if (!this.songReady) return
          this.setPlayingState(!this.playing)
          if (this.currentLyric) {
            this.currentLyric.togglePlay()
          }
        },
        prev () {
          if (!this.songReady) return // 设置在歌曲未准备好加载完时禁止切歌
          if (this.playlist.length === 1) {
            this.loop()
          } else {
            let index = this.currentIndex - 1
            if (index === -1) {
              index = this.playlist.length - 1
            }
            this.setCurrentIndex(index)
            if (!this.playing) {
              this.togglePlaying()
            }
            this.songReady = false
          }
        },
        next () {
          if (!this.songReady) return // 避免快速切歌时，dom未加载完而导致异常
          if (this.playlist.length === 1) {
            this.loop()
          } else {
            let index = this.currentIndex + 1
            if (index === this.playlist.length) {
              index = 0
            }
            this.setCurrentIndex(index)
            if (!this.playing) {
              this.togglePlaying()
            }
            this.songReady = false
          }
        },
        ready () {
          this.songReady = true
        },
        error () {},
        updateTime (e) {
          this.currentTime = e.target.currentTime // audio当前播放的时间
        },
        format (interval) { // 时间戳转换为时分秒格式
          interval = interval | 0 // 向下取整
          const minute = interval / 60 | 0
          const second = this._pad(interval % 60)
          return `${minute}:${second}`
        },
        onProgressBarChange (percent) { // 实现来回拖动，音频进度相应更改
          const currentTime = this.currentSong.duration * percent
          this.$refs.audio.currentTime = currentTime
          if (!this.playing) { // 如果拖动时，当前为暂停状态
            this.togglePlaying()
          }
          if (this.currentLyric) {
            this.currentLyric.seek(currentTime * 1000)
          }
        },
        changeMode () {
          const mode = (this.mode + 1) % 3
          this.setPlayMode(mode)
          let list = null
          if (mode === playMode.random) {
            list = shuffle(this.sequenceList)
          } else {
            list = this.sequenceList
          }
          this.resetCurrentIndex(list)
          this.setPlaylist(list)
        },
        resetCurrentIndex (list) {
          let index = list.findIndex((item) => { // findIndex是es6的一个语法
            return item.id === this.currentSong.id
          })
          this.setCurrentIndex(index)
        },
        end () { // 歌曲播放完毕
          if (this.mode === playMode.loop) { // 如果是单曲循环模式，则播放完后更改播放时间到起点
            this.loop()
          } else {
            this.next()
          }
        },
        loop () {
          this.$refs.audio.currentTime = 0
          this.$refs.audio.play()
          if (this.currentLyric) {
            this.currentLyric.seek(0) // 偏移到歌曲的一开始
          }
        },
        getLyric () {
          this.currentSong.getLyric().then((lyric) => {
            this.currentLyric = new Lyric(lyric, this.handleLyric)
            if (this.playing) {
              this.currentLyric.play()
            }
          }).catch(() => { // 获取不到歌词时
            this.currentLyric = null
            this.playingLyric = ''
            this.currentLineNum = 0
          })
        },
        handleLyric ({lineNum, txt}) {
          if (!this.$refs.lyricLine) {
            return
          }
          this.currentLineNum = lineNum
          if (lineNum > 5) { // 超过5行时，显示滚动居中显示
            let lineEl = this.$refs.lyricLine[lineNum - 5] // 需要滚动到的元素
            this.$refs.lyricList.scrollToElement(lineEl, 1000)
          } else {
            this.$refs.lyricList.scrollTo(0, 0, 1000)
          }
          this.playingLyric = txt
        },
        middleTouchStart (e) {
          this.touch.initiated = true // 是否已经初始化的标志位
          const touch = e.touches[0]
          this.touch.startX = touch.pageX
          this.touch.startY = touch.pageY
        },
        middleTouchMove (e) {
          if (!this.touch.initiated) {
            return
          }
          const touch = e.touches[0]
          const deltaX = touch.pageX - this.touch.startX
          const deltaY = touch.pageY - this.touch.startY // 因为歌词模块有上下滚动，所以还需要考虑纵轴的偏移量
          if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return // 如果为纵向滚动，则说明都不做
          }
          const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
          const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
          this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
          this.$refs.lyricList.$el.style[transform] = `translate3D(${offsetWidth}px,0,0)`
          this.$refs.lyricList.$el.style[transition] = 0
          this.$refs.middleL.style.opacity = 1 - this.touch.percent
          this.$refs.middleL.style[transition] = 0
        },
        middleTouchEnd () {
          let offsetWidth
          let opacity
          if (this.currentShow === 'cd') {
            if (this.touch.percent > 0.1) {
              offsetWidth = -window.innerWidth // 最终停的位置
              opacity = 0
              this.currentShow = 'lyric'
            } else {
              offsetWidth = 0
              opacity = 1
            }
          } else { // 从左向右滑
            if (this.touch.percent < 0.9) {
              offsetWidth = 0
              opacity = 1
              this.currentShow = 'cd'
            } else {
              opacity = 0
              offsetWidth = -window.innerWidth
            }
          }
          const time = 300
          this.$refs.lyricList.$el.style[transform] = `translate3D(${offsetWidth}px,0,0)`
          this.$refs.lyricList.$el.style[transition] = `${time}ms`
          this.$refs.middleL.style.opacity = opacity
          this.$refs.middleL.style[transition] = `${time}ms`
        },
        _pad (num, n = 2) { // 第二个参数默认2.代表需要补的字符串的长度
          let len = num.toString().length
          while (len < n) {
            num = '0' + num // 前面补0
            len++
          }
          return num
        },
        _getPosAndScale () { // 获取位置信息和缩放信息
          const targetWidth = 40 // 小图的宽度
          const paddingLeft = 40
          const paddingBottom = 30
          const paddingTop = 80 // cd到顶部的padding
          const width = window.innerWidth * 0.8 // cd的宽度是80%
          const scale = targetWidth / width // 初始缩放比例
          const x = -(window.innerWidth / 2 - paddingLeft)
          const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // width/2就是height/2
          return {
            x,
            y,
            scale
          }
        },
        ...mapMutations({ // mutation的映射
          setFullScreen: 'SET_FULL_SCREEN',
          setPlayingState: 'SET_PLAYING_STATE',
          setCurrentIndex: 'SET_CURRENT_INDEX',
          setPlayMode: 'SET_PLAY_MODE',
          setPlaylist: 'SET_PLAYLIST'
        })
      },
      watch: {
        currentSong (newSong, oldSong) {
          if (newSong.id === oldSong.id) return
          if (this.currentLyric) {
            this.currentLyric.stop()
          }
          setTimeout(() => { // 不加延时就会报错。Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.
            this.$refs.audio.play()
            this.getLyric()
          }, 1000)
        },
        playing (newPlaying) {
          const audio = this.$refs.audio
          this.$nextTick(() => {
            newPlaying ? audio.play() : audio.pause()
          })
        }
      },
      components: {
        ProgressBar,
        ProgressCircle,
        Scroll
      }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite // cd 无限旋转
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
