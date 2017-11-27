// 洗牌函数
export function shuffle (arr) {
  for (let i = 0; i < arr.length; i++) {
    let j = getRandomInt(0, i)
    let temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

// 返回min和max之间的一个随机整数，包含min和max [min, max]
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
