import {commonParams} from './config'
import axios from 'axios'

export function getNotKey() {
  const url = '/api/getNotKey'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    notice: 0,
    needNewCode: 1,
    format: 'json',
    g_tk: 5381
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
