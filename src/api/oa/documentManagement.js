import request from '@/utils/request';
import conf from '@/conf';

function expandServiceUrl(path) {
  const base = String(conf.server.expandBaseUrl || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

// 查询公文发文列表
export function listDocumentHandle(query) {
    return request({
        url: '/project/document/selectDocumentOutgoingList',
        method: 'get',
        params: query
    });
}

// 公文发布
export function addDocument(data) {
    return request({
        url: '/project/document/addDocument',
        method: 'post',
        data: data
    });
}
// 公文发布时的保存附件文档接口
export function documentImageSave(data) {
    return request({
        url: expandServiceUrl('/project/documentImage/save'),
        method: 'post',
        data: data
    });
}
export function getDocumentImageList(data) {
    return request({
        url: expandServiceUrl(`/project/documentImage/list?document_id=${data.documentId}`),
        method: 'get',
        data: data
    });
}

// 公文重新提交
export function submitDraft(data) {
  return request({
    url: "/project/document/submitDraft",
    method: "put",
    data: data,
  });
}

// 查询公文详细
export function getDetail(id) {
    return request({
        url: '/project/document/' + id,
        method: 'get'
    });
}

// 公文经理审核
// 示例值: { "docId": "公文id", "status": "1通过，2拒绝", "remark": "审核意见" }
export function documentLeaderCheck(data) {
    return request({
        url: '/project/document/documentLeaderCheck',
        method: 'post',
        data: data
    });
}

// 公文综合岗审核
// 示例值: { "docId": "公文id", "status": "1通过，2拒绝", "remark": "审核意见", "directorIds": "主任岗人员ids" }
export function documentComprehensiveCheck(data) {
    return request({
        url: '/project/document/documentComprehensiveCheck',
        method: 'post',
        data: data
    });
}

// 公文主任岗审核
// 示例值: { "docId": "公文id", "status": "1通过，2拒绝", "remark": "审核意见", "returnStatus": "0退回上一步，1退回给发文人" }
export function documentDirectorCheck(data) {
    return request({
        url: '/project/document/documentDirectorCheck',
        method: 'post',
        data: data
    });
}

// 公文综合岗套头
// 示例值: { "docId": "公文id", "word": "模板", "remark": "审核意见" }
export function documentDirectorHair(data) {
    return request({
        url: '/project/document/documentDirectorHair',
        method: 'post',
        data: data
    });
}

// 公文创建人用印申请
// 示例值: { "docId": "公文id" }
export function documentSealApply(data) {
    return request({
        url: '/project/document/documentSealApply',
        method: 'post',
        data: data
    });
}

// 公文用印审批
// 示例值: { "docId": "公文id", "status": 1,//状态1通过2拒绝 "returnStatus": 0,//拒绝状态0退回给综合岗，2退回给发起人 "remark": "审批意见" }
export function documentSealCheck(data) {
    return request({
        url: '/project/document/documentSealCheck',
        method: 'post',
        data: data
    });
}

// 发文部门人员阅读确认
// 示例值: { "docId": "公文id" }
export function readingConfirmation(data) {
    return request({
        url: '/project/document/readingConfirmation',
        method: 'post',
        data: data
    });
}


// 发文的部门经理分发
// 示例值: { "docId": "公文id", "userIds": "人员IDS用逗号拼接", "remark": "审核意见" }
export function departmentalDistribution(data) {
    return request({
        url: '/project/document/departmentalDistribution',
        method: 'post',
        data: data
    });
}


// 发文部门文秘岗办结
// 示例值: { "docId": "公文id" }
export function secretaryOver(data) {
    return request({
        url: '/project/document/secretaryOver',
        method: 'post',
        data: data
    });
}

// 发文的综合岗办结
// 示例值: { "docId": "公文id" }
export function comprehensiveCompletion(data) {
    return request({
        url: '/project/document/comprehensiveCompletion',
        method: 'post',
        data: data
    });
}

// 公文办结
// 示例值: { "docId": "公文id" }
export function officialDocumentHasBeenCompleted(data) {
    return request({
        url: '/project/document/officialDocumentHasBeenCompleted',
        method: 'post',
        data: data
    });
}
