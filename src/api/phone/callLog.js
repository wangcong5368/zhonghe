import request from '@/utils/request'

// 查询通话记录列表
export function listCallLog(query) {
  return request({
    url: '/phone/callLog/list',
    method: 'get',
    params: query
  })
}

// 查询通话记录详细
export function getCallLog(callLogId) {
  return request({
    url: '/phone/callLog/' + callLogId,
    method: 'get'
  })
}

// 新增通话记录
export function addCallLog(data) {
  return request({
    url: '/phone/callLog',
    method: 'post',
    data: data
  })
}

// 修改通话记录
export function updateCallLog(data) {
  return request({
    url: '/phone/callLog',
    method: 'put',
    data: data
  })
}

// 删除通话记录
export function delCallLog(callLogId) {
  return request({
    url: '/phone/callLog/' + callLogId,
    method: 'delete'
  })
}
