import request from "@/utils/request";

// 查询事务申请列表
export function listAffairsApply(query) {
  return request({
    url: "/project/affairsApply/list",
    method: "get",
    params: query,
  });
}

// 查询事务申请详细
export function getAffairsApply(id) {
  return request({
    url: "/project/affairsApply/" + id,
    method: "get",
  });
}

// 新增事务申请
export function addAffairsApply(data) {
  return request({
    url: "/project/affairsApply/apply",
    method: "post",
    data: data,
  });
}

// 修改事务申请
export function updateAffairsApply(data) {
  return request({
    url: "/project/affairsApply",
    method: "put",
    data: data,
  });
}

// 查询事务申请详情
export function affairsDetail(id) {
  return request({
    url: "/project/affairsApply/" + id,
    method: "get",
  });
}

// 撤销事务申请
export function delAffairsApply(data) {
  return request({
    url: "/project/affairsApply/revoke",
    method: "put",
    data,
  });
}

// 查询人员列表
export function listPerson(query) {
  return request({
    url: "/project/supervise/selectUserList",
    method: "get",
    params: query,
  });
}

// 上传文件
export function uploadFile(data) {
  console.log("data", data);
  return request({
    url: "/common/upload",
    method: "post",
    data: data,
  });
}

// // 查询事务类型列表
// export function getAffairsTypeList(query) {
//   return request({
//     url: "/project/affairsType/getList",
//     method: "get",
//     params: query,
//   });
// }
