import request from '@/utils/request';
import axios from 'axios';
import conf from '@/conf';
import { getToken } from '@/utils/auth';

function expandServiceUrl(path) {
  const base = String(conf.server.expandBaseUrl || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function ocrServiceUrl(path) {
  const base = String(conf.server.ocrBaseUrl || '')
    .trim()
    .replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function assertExpandBaseUrl() {
  const base = String(conf.server.expandBaseUrl || '').trim();
  if (!base || !/^https?:\/\//i.test(base)) {
    throw new Error('扩展服务地址未配置或无效，请检查 conf.server.expandBaseUrl');
  }
}
function assertOcrServiceUrl() {
  const base = String(conf.server.ocrBaseUrl || '').trim();
  if (!base || !/^https?:\/\//i.test(base)) {
    throw new Error('扩展服务地址未配置或无效，请检查 conf.server.expandBaseUrl');
  }
}

/** ASR 服务根路径（语音识别 stream / parse，与 SSEGetFromData 一致） */

// 测试使用ip
const ASR_SERVICE_BASE_URL = 'http://192.168.50.18:8080/api/v1/';
// const ASR_SERVICE_BASE_URL = '';

/** 构建 ASR 实时转写 SSE 地址 */
export function getAsrStreamUrl(code) {
  const base = ASR_SERVICE_BASE_URL.replace(/\/$/, '');
  const seatCode = encodeURIComponent(String(code ?? '').trim());
  // return `${base}/asr/stream/?code=${seatCode}`;
  return `${base}/asr/stream/?code=139`;
}

/** FormData 上传至 expand 服务（multipart，不使用全局 application/json） */
export function expandFormDataPost(path, formData, timeout = 120000) {
  assertExpandBaseUrl();
  const url = expandServiceUrl(path);
  const token = getToken();
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  return axios.post(url, formData, {
    headers,
    timeout,
    transformRequest: [
      (data, headerConfig) => {
        delete headerConfig['Content-Type'];
        return data;
      },
    ],
  });
}
export function ocrFormDataPost(path, formData, timeout = 120000) {
  assertOcrServiceUrl();
  const url = ocrServiceUrl(path);
  const token = getToken();
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  return axios.post(url, formData, {
    headers,
    timeout,
    transformRequest: [
      (data, headerConfig) => {
        delete headerConfig['Content-Type'];
        return data;
      },
    ],
  });
}

/** Excel 表格信息识别 */
export function getExcelAnalysisInfo(formData, timeout = 120000) {
  return expandFormDataPost('/project/excelAnalysis/getExcelAnalysisInfo', formData, timeout);
}
// 法院端识别Excel表格信息
export function getExcelOrcInfo(formData, timeout = 120000) {
  return ocrFormDataPost('/ocr/excel', formData, timeout);
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
    responseType: 'blob',
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

// 新增通话质检工单（通话开始时调用，expand 服务）
export function saveCallQualityWorkOrder(data) {
  return request({
    url: expandServiceUrl('/project/callQualityWorkOrder/saveCallQualityWorkOrder'),
    method: 'post',
    data: data,
  });
}

// 修改通话质检工单（通话结束时调用，expand 服务）
export function updateCallQualityWorkOrder(data) {
  return request({
    url: expandServiceUrl('/project/callQualityWorkOrder/updateCallQualityWorkOrder'),
    method: 'post',
    data: data,
  });
}

// 保存通话转写详情（expand 服务）
export function saveCallTranscriptDetail(data) {
  return request({
    url: expandServiceUrl('/project/callTranscriptDetail/saveCallTranscriptDetail'),
    method: 'post',
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
    baseURL: ASR_SERVICE_BASE_URL,
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
/** 获取省份列表 */
export function getProvinces() {
  return request({
    url: expandServiceUrl('/project/area/getProvinces'),
    method: 'post',
    data: {}
  });
}

/** 获取城市列表 */
export function getCities(code) {
  return request({
    url: expandServiceUrl('/project/area/getCities'),
    method: 'post',
    data: { code } // {code: code} 的简写
  });
}
// 调解记录新增接口
export function saveOrUpdateMediationRecordExpand(data) {
  return request({
    url: expandServiceUrl('/project/mediationRecordExpand/saveOrUpdateMediationRecordExpand'),
    method: 'post',
    data: data
  });
}
// 调解记录获取信息
export function getMediationRecordExpandInfo(workOrderId) {
  return request({
    url: expandServiceUrl(`/project/mediationRecordExpand/getMediationRecordExpandInfo/${workOrderId}`),
    method: "get",
  });
}
// 回访记录新增接口
export function saveOrUpdateReturnVisitExpand(data) {
  return request({
    url: expandServiceUrl('/project/returnVisitExpand/saveOrUpdateReturnVisitExpand'),
    method: 'post',
    data: data
  });
}
// 回访记录获取信息
export function getReturnVisitExpandInfo(workOrderId) {
  return request({
    url: expandServiceUrl(`/project/returnVisitExpand/getReturnVisitExpandInfo/${workOrderId}`),
    method: "get",
  });
}
// 履约登记新增接口
export function saveOrUpdateFulfillmentExpand(data) {
  return request({
    url: expandServiceUrl('/project/fulfillmentExpand/saveOrUpdateFulfillmentExpand'),
    method: 'post',
    data: data
  });
}
// 履约登记获取信息
export function getFulfillmentExpandListByWorkOrderId(workOrderId) {
  return request({
    url: expandServiceUrl(`/project/fulfillmentExpand/getFulfillmentExpandListByWorkOrderId/${workOrderId}`),
    method: "get",
  });
}
export function getByDeptId(deptId) {
  return request({
    url: expandServiceUrl(`/project/bankDepart/getByDeptId/${deptId}`),
    method: "get",
  });
}

export function getCompare(deptId) {
  return request({
    url: ocrServiceUrl(`/evidence/compare?work_order_id=${deptId}`),
    method: "get",
  });
}
export function getProvinceCityTree() {
  return request({
    url: expandServiceUrl(`/project/area/getProvinceCityTree`),
    method: "post",
  });
}
