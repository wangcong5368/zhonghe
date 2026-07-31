import request from "@/utils/request";

// 查询督办事项信息列表
export function listSupervise(query) {
  return request({
    url: "/project/supervise/supervisePageList",
    method: "get",
    params: query,
  });
}

// 查询督办事项信息详细
export function getSupervise(id) {
  return request({
    url: "/project/supervise/" + id,
    method: "get",
  });
}

// 新增督办事项信息
export function addSupervise(data) {
  return request({
    url: "/project/supervise/addSupervise",
    method: "post",
    data: data,
  });
}

// 修改督办事项信息
export function updateSupervise(data) {
  return request({
    url: "/project/supervise",
    method: "put",
    data: data,
  });
}

// 删除督办事项信息
export function delSupervise(id) {
  return request({
    url: "/project/supervise/" + id,
    method: "delete",
  });
}

// 获取办理列表信息
export function getProcessList(query) {
  return request({
    url: "/project/supervise/superviseProcessPageList",
    method: "get",
    params: query,
  });
}

// 进度更新
export function addProcess(data) {
  console.log("进度更新", data);

  return request({
    url: "/project/supervise/addProcess",
    method: "post",
    data: data,
  });
}

// 事项转发
export function addOrganizer(data) {
  return request({
    url: "/project/supervise/addOrganizer",
    method: "post",
    data: data,
  });
}

// 事项办结
export function addProcessCompleted(data) {
  return request({
    url: "/project/supervise/addProcessCompleted",
    method: "post",
    data: data,
  });
}

// 查看进度
export function getProgressList(superviseId) {
  return request({
    url: "/project/supervise/progressListBySuperviseId",
    method: "get",
    params: { superviseId },
  });
}

// 查看审核列表
export function getCheckList(query) {
  return request({
    url: "/project/supervise/superviseCheckPageList",
    method: "get",
    params: query,
  });
}

// 提交审核接口
export function postCheck(data) {
  return request({
    url: "/project/supervise/check",
    method: "post",
    data: data,
  });
}


// 事项重新提交
export function resubmitSupervise(data) {
  return request({
    url: "/project/supervise/resubmit",
    method: "post",
    data: data,
  });
}

// 事项撤回修改
export function withdrawSupervise(data) {
  return request({
    url: "/project/supervise/withdraw",
    method: "post",
    data: data,
  });
}

// 事项废止
export function abolishSupervise(data) {
  return request({
    url: "/project/supervise/abolish",
    method: "post",
    data: data,
  });
}
