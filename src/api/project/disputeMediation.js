import request from '@/utils/request';
import conf from '@/conf';

function expandServiceUrl(path) {
  const base = String(conf.server.expandBaseUrl || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

// 查询纠纷业务工单列表
export function listDisputeMediation(query) {
    return request({
        url: '/project/disputeMediation/list',
        method: 'get',
        params: query
    });
}

// 纠纷业务查询预约记录
export function reservationList(query) {
    return request({
        url: '/project/disputeMediation/reservationList/' + query.workOrderId,
        method: 'get',
        params: query
    });
}

// 纠纷业务查询调解室录像记录
export function mediationRoomVideoList(query) {
  return request({
    url: '/project/disputeMediation/mediationRoomVideoList/' + query.workOrderId,
    method: 'get',
    params: query
  });
}

// 查询纠纷业务工单详细
export function getDisputeMediation(workOrderId) {
    return request({
        url: '/project/disputeMediation/' + workOrderId,
        method: 'get'
    });
}

// 新增纠纷业务工单
export function addDisputeMediation(data) {
    return request({
        url: '/project/disputeMediation',
        method: 'post',
        data: data
    });
}

// 纠纷业务预约调解室
export function addReservation(data) {
    return request({
        url: '/project/disputeMediation/addReservation',
        method: 'post',
        data: data
    });
}

// 修改纠纷业务工单
export function updateDisputeMediation(data) {
    return request({
        url: '/project/disputeMediation',
        method: 'put',
        data: data
    });
}

// 修改纠纷业务工单附件
export function updateDisputeMediationAttachment(data) {
  return request({
    url: '/project/disputeMediation/updateAttachment',
    method: 'put',
    data: data
  });
}

// 纠纷业务--取消预约
export function dmCancelReservation(data) {
    return request({
        url: '/project/disputeMediation/cancelReservation',
        method: 'put',
        data: data
    });
}

// 删除纠纷业务工单
export function delDisputeMediation(workOrderId) {
    return request({
        url: '/project/disputeMediation/' + workOrderId,
        method: 'delete'
    });
}

// 新增调查记录
export function addInvestigationRecord(data) {
  return request({
    url: '/project/disputeMediation/addInvestigationRecord',
    method: 'put',
    data: data
  });
}

// 修改调查记录
export function updateInvestigationRecord(data) {
  return request({
    url: '/project/disputeMediation/updateInvestigationRecord',
    method: 'put',
    data: data
  });
}

// 删除调查记录
export function deleteInvestigationRecord(data) {
  return request({
    url: '/project/disputeMediation/deleteInvestigationRecord ',
    method: 'put',
    data: data
  });
}

// 新增调解记录
export function addMediationRecord(data) {
  return request({
    url: '/project/disputeMediation/addMediationRecord',
    method: 'put',
    data: data
  });
}

// 修改调解记录
export function updateMediationRecord(data) {
  return request({
    url: '/project/disputeMediation/updateMediationRecord',
    method: 'put',
    data: data
  });
}

// 删除调解记录
export function deleteMediationRecord(data) {
  return request({
    url: '/project/disputeMediation/deleteMediationRecord ',
    method: 'put',
    data: data
  });
}

// 开始录像
export function startVideo(data) {
  return request({
    url: '/project/disputeMediation/startVideo',
    method: 'post',
    data: data
  });
}

// 结束录像
export function endVideo(data) {
  return request({
    url: '/project/disputeMediation/endVideo',
    method: 'post',
    data: data
  });
}

// 新增回访记录
export function addReturnVisit(data) {
  return request({
    url: '/project/disputeMediation/addReturnVisit',
    method: 'put',
    data: data
  });
}

// 修改回访记录
export function updateReturnVisit(data) {
  return request({
    url: '/project/disputeMediation/updateReturnVisit',
    method: 'put',
    data: data
  });
}

// 删除回访记录
export function deleteReturnVisit(data) {
  return request({
    url: '/project/disputeMediation/deleteReturnVisit',
    method: 'put',
    data: data
  });
}

// 新增履约记录
export function addFulfillment(data) {
  return request({
    url: '/project/disputeMediation/addFulfillment',
    method: 'put',
    data: data
  });
}

// 修改履约记录
export function updateFulfillment(data) {
  return request({
    url: '/project/disputeMediation/updateFulfillment',
    method: 'put',
    data: data
  });
}

// 删除履约记录
export function deleteFulfillment(data) {
  return request({
    url: '/project/disputeMediation/deleteFulfillment',
    method: 'put',
    data: data
  });
}

// 工单办结
export function finish(data) {
  return request({
    url: '/project/disputeMediation/finish',
    method: 'put',
    data: data
  });
}

// 提交归档
export function archiveApply(data) {
  return request({
    url: '/project/disputeMediation/archiveApply',
    method: 'put',
    data: data
  });
}

// 归档驳回
export function archiveReject(data) {
  return request({
    url: '/project/disputeMediation/archiveReject',
    method: 'put',
    data: data
  });
}

// 工单归档
export function archive(data) {
  return request({
    url: '/project/disputeMediation/archive',
    method: 'put',
    data: data
  });
}

// 下载预览协议书（work格式）workOrderId
export function getAgreement(data) {
  return request({
    url: "/project/disputeMediation/getAgreement",
    method: "post",
    responseType:'blob',
    params: data,
  });
}

// 审核协议书(一审)
export function auditAgreement1(data) {
  return request({
    url: "project/disputeMediation/auditAgreement1",
    method: "put",
    data: data,
  });
}

// 审核协议书(二审)
export function auditAgreement2(data) {
  return request({
    url: "project/disputeMediation/auditAgreement2",
    method: "put",
    data: data,
  });
}


// 审核协议书(三审)
export function auditAgreement3(data) {
  return request({
    url: "project/disputeMediation/auditAgreement3",
    method: "put",
    data: data,
  });
}


// 审核协议书(四审)
export function auditAgreement4(data) {
  return request({
    url: "project/disputeMediation/auditAgreement4",
    method: "put",
    data: data,
  });
}

// 审核用印(一审)
export function auditStamp1(data) {
  return request({
    url: "project/disputeMediation/auditStamp1",
    method: "put",
    data: data,
  });
}

// 审核用印(二审)
export function auditStamp2(data) {
  return request({
    url: "project/disputeMediation/auditStamp2",
    method: "put",
    data: data,
  });
}


// 审核用印(三审)
export function auditStamp3(data) {
  return request({
    url: "project/disputeMediation/auditStamp3",
    method: "put",
    data: data,
  });
}


// 审核用印(四审)
export function auditStamp4(data) {
  return request({
    url: "project/disputeMediation/auditStamp4",
    method: "put",
    data: data,
  });
}

// 用印申请
export function applyStamp(data) {
  return request({
    url: "project/disputeMediation/applyStamp",
    method: "put",
    data: data,
  });
}

// 编辑协议书
export function editAgreement(data) {
  return request({
    url: "project/disputeMediation/editAgreement",
    method: "put",
    data: data,
  });
}

// 暂存协议书
export function temporarySaveAgreement(data) {
  return request({
    url: "project/disputeMediation/temporarySaveAgreement",
    method: "put",
    data: data,
  });
}

// 加载已暂存的协议书
export function temporaryLoadAgreement(data) {
  return request({
    url: "project/disputeMediation/temporaryLoadAgreement",
    method: "put",
    data: data,
  });
}

// 暂存反馈单
export function temporarySaveFeedback(data) {
  return request({
    url: "project/disputeMediation/temporarySaveFeedback",
    method: "put",
    data: data,
  });
}

// 加载已暂存的反馈单
export function temporaryLoadFeedback(data) {
  return request({
    url: "project/disputeMediation/temporaryLoadFeedback",
    method: "put",
    data: data,
  });
}

// 线上签约
export function onlineSigning(data) {
  return request({
    url: "project/disputeMediation/onlineSigning",
    method: "put",
    data: data,
  });
}

// 刷新在线签章状态
export function refreshSign(data) {
  return request({
    url: "project/disputeMediation/refreshSign",
    method: "put",
    data: data,
  });
}

// 获取E签宝下载地址
export function getDownloadUrl(data) {
  return request({
    url: "project/disputeMediation/getDownloadUrl",
    method: "get",
    params: data,
  });
}

// 线下签约
export function offlineSigning(data) {
  return request({
    url: "project/disputeMediation/offlineSigning",
    method: "put",
    data: data,
  });
}

// 前台处理
export function handle(data) {
  return request({
    url: "/project/disputeMediation/handle",
    method: "put",
    data: data,
  });
}

// 前台处理退回
export function handleReject(data) {
  return request({
    url: "/project/disputeMediation/handleReject",
    method: "put",
    data: data,
  });
}

// 调解员发送反馈单
export function sendFeedback(data) {
  return request({
    url: "/project/disputeMediation/sendFeedback",
    method: "put",
    data: data,
  });
}

// 机构填写、修改反馈单
export function feedback(data) {
  return request({
    url: "/project/disputeMediation/feedback",
    method: "put",
    data: data,
  });
}

// 反馈
export function feedback1(data) {
  return request({
    url: "/project/disputeMediation/feedback1",
    method: "put",
    data: data,
  });
}

// 机构补充/修改反馈单
export function feedback2(data) {
  return request({
    url: "/project/disputeMediation/feedback2",
    method: "put",
    data: data,
  });
}

// 获取调解员列表
export function mediatorList(type) {
  return request({
    url: "/project/disputeMediation/mediatorList?type=" + type,
    method: "get",
  });
}

// 修改调解员
export function mediatorChange(data) {
  return request({
    url: "/project/disputeMediation/mediatorChange",
    method: "put",
    data: data,
  });
}

// 修改助理调解员
export function assistantChange(data) {
  return request({
    url: "/project/disputeMediation/assistantChange",
    method: "put",
    data: data,
  });
}

// 派单审核
export function mediatorAudit(data) {
  return request({
    url: "/project/disputeMediation/mediatorAudit",
    method: "put",
    data: data,
  });
}

// 派单审核记录
export function mediatorAuditList(query) {
  return request({
    url: '/project/disputeMediation/mediatorAuditList',
    method: 'get',
    params: query
  });
}

// 更改机构
export function deptChange(data) {
  return request({
    url: "/project/disputeMediation/deptChange",
    method: "put",
    data: data,
  });
}

// 查询自动分配表
export function autoAssign() {
  return request({
    url: "/project/disputeMediation/autoAssign",
    method: "get",
  });
}

// 工单异常办结
export function terminate(data) {
  return request({
    url: "/project/disputeMediation/terminate",
    method: "put",
    data: data,
  });
}

// 关联记录
export function addRecordRelation(data) {
  return request({
    url: "/project/disputeMediation/addRecordRelation",
    method: "put",
    data: data,
  });
}

// 取消关联记录
export function deleteRecordRelation(data) {
  return request({
    url: "/project/disputeMediation/deleteRecordRelation",
    method: "put",
    data: data,
  });
}

// 自动关联记录
export function autoRelate(data) {
  return request({
    url: "/project/disputeMediation/autoRelate",
    method: "put",
    data: data,
  });
}

// 申请录像查看
export function applyViewVideo(data) {
  return request({
    url: "/project/disputeMediation/applyViewVideo",
    method: "put",
    data: data,
  });
}

// 审核录像
export function auditVideo(data) {
  return request({
    url: "/project/disputeMediation/auditVideo",
    method: "put",
    data: data,
  });
}

// 取消调解员提醒
export function cancelMediatorReminder(data) {
  return request({
    url: "/project/disputeMediation/cancelMediatorReminder",
    method: "put",
    data: data,
  });
}

// SSE 表单解析
export function SSEGetFromData(data) {
  return request({
    url: "/asr/parse/",
    method: "post",
    data: data,
    timeout: 180000,
    baseURL: ''
  });
}

// 状态回退
export function rollbackStatus(data) {
  return request({
    url: "/project/disputeMediation/rollbackStatus",
    method: "put",
    data: data,
  });
}

// 纠纷扩展服务：工单扩展信息（案件类型、满意度等），使用 expandBaseUrl 全路径
export function getDisputeMediationExpandInfo(workOrderId) {
  return request({
    url: expandServiceUrl(`/project/disputeMediationExpand/getWorkOrderInfo/${workOrderId}`),
    method: "get",
  });
}

export function saveOrUpdateDisputeMediationExpand(data) {
  return request({
    url: expandServiceUrl("/project/disputeMediationExpand/saveOrUpdate"),
    method: "post",
    data,
  });
}
