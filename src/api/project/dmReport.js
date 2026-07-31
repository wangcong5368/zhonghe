import request from '@/utils/request'

// 查询调解报表列表
export function listDmReport(query) {
  return request({
    url: '/project/dmReport/list',
    method: 'get',
    params: query
  })
}

// 查询调解报表详细
export function getDmReport(reportId) {
  return request({
    url: '/project/dmReport/' + reportId,
    method: 'get'
  })
}

// 新增调解报表
export function addDmReport(data) {
  return request({
    url: '/project/dmReport',
    method: 'post',
    data: data
  })
}

// 修改调解报表
export function updateDmReport(data) {
  return request({
    url: '/project/dmReport',
    method: 'put',
    data: data
  })
}

// 删除调解报表
export function delDmReport(reportId) {
  return request({
    url: '/project/dmReport/' + reportId,
    method: 'delete'
  })
}
