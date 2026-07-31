import request from "@/utils/request";

// 查询调解室列表
export function listMediationRoom(query) {
  return request({
    url: "/project/mediationRoom/list",
    method: "get",
    params: query,
  });
}

// 查询调解室详细
export function getMediationRoom(mediationRoomId) {
  return request({
    url: "/project/mediationRoom/" + mediationRoomId,
    method: "get",
  });
}

// 新增调解室
export function addMediationRoom(data) {
  return request({
    url: "/project/mediationRoom",
    method: "post",
    data: data,
  });
}

// 修改调解室
export function updateMediationRoom(data) {
  return request({
    url: "/project/mediationRoom",
    method: "put",
    data: data,
  });
}

// 删除调解室
export function delMediationRoom(mediationRoomId) {
  return request({
    url: "/project/mediationRoom/" + mediationRoomId,
    method: "delete",
  });
}

// 查询调解室预约记录列表
export function listMediationRoomReservation(query) {
  return request({
    url: "/project/mediationRoom/reservationList",
    method: "get",
    params: query,
  });
}

// 获取日历
export function getCalendar(query) {
  return request({
    url: "/project/mediationRoom/getCalendar",
    method: "get",
    params: query,
  });
}

// 调解室预约
export function addReservation(data) {
  return request({
    url: "/project/mediationRoom/addReservation",
    method: "post",
    data: data,
  });
}

// 取消预约
export function cancelReservation(data) {
  return request({
    url: "/project/mediationRoom/cancelReservation",
    method: "put",
    data: data,
  });
}
