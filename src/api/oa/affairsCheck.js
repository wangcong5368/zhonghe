import request from "@/utils/request";

// 查询事务审核列表
export function listAffairsCheck(query) {
  return request({
    url: "/project/affairsCheck/list",
    method: "get",
    params: query,
  });
}

// 查询事务审核详细
export function getAffairsCheck(id) {
  return request({
    url: "/project/affairsCheck/" + id,
    method: "get",
  });
}

// 新增事务审核
export function addAffairsCheck(data) {
  return request({
    url: "/project/affairsCheck",
    method: "post",
    data: data,
  });
}

// 修改事务审核
export function updateAffairsCheck(data) {
  return request({
    url: "/project/affairsCheck",
    method: "put",
    data: data,
  });
}

// 删除事务审核
export function delAffairsCheck(id) {
  return request({
    url: "/project/affairsCheck/" + id,
    method: "delete",
  });
}

// 审核接口
export function AffairsCheck(data) {
  return request({
    url: "/project/affairsCheck/check",
    method: "put",
    data: data,
  });
}

// 查询全部事务（领导权限）
export function getAllAffairsCheckList(query) {
  return request({
    url: "/project/affairsCheck/AllList",
    method: "get",
    params: query,
  });
}

export function getOAList(query) {
  return request({
    url: "/project/affairsCheck/OAList",
    method: "get",
    params: query,
  });
}