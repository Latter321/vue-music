<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
           ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd">
        <!--btn是当前进度的位置-->
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16 // 小球宽度
  const transform = prefixStyle('transform')
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created () {
      this.touch = {} // 用于共享数据
    },
    methods: {
      progressTouchStart (e) {
        this.touch.initiated = true
        this.touch.startX = e.touches[0].pageX // 横向坐标
        this.touch.left = this.$refs.progress.clientWidth// 滚动进度条的宽度
      },
      progressTouchMove (e) {
        if (!this.touch.initiated) return
        const delta = e.touches[0].pageX - this.touch.startX
        const offsetWidth = Math.min(Math.max(0, this.touch.left + delta))
        this._offset(offsetWidth)
      },
      progressTouchEnd (e) {
        this.touch.initiated = false
        this._triggerPercent()
      },
      progressClick (e) {
        const rect = this.$refs.progressBar.getBoundingClientRect() // progressBar到屏幕边上的距离
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        // 点击progressBtn时，e.offsetX获取不对
        // pageX是当前位置到屏幕最左边的横轴距离
        // this._offset(e.offsetX)
        this._triggerPercent()
      },
      _offset (offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3D(${offsetWidth}px,0,0)`
      },
      _triggerPercent () {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent) // 将当前percent派发出去
      }
    },
    watch: {
      percent (newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) { // 拖动时的偏移量权限大于percent给出的偏移量.拖动过程中不能再去修改偏移量
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = newPercent * barWidth // 偏移宽度
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable.styl"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
