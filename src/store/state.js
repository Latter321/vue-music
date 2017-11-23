import {playMode} from 'common/js/config'
const state = {
  singer: {},
  playing: false,
  fullScreen: false, // 展开收起的控制，默认非全屏
  playlist: [],
  sequenceList: [], // 播放顺序
  mode: playMode.sequence,
  currentIndex: -1 // 当前播放的索引
}

export default state
