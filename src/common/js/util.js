// 洗牌函数(用于随机播放打乱顺序）
export function shuffle (arr) {
  let _arr = arr.slice() // 为了不对原来的数组产生副作用，做一个副本
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let temp = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = temp
  }
  return _arr
}

// 返回min和max之间的一个随机整数，包含min和max [min, max]
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
