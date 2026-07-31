import request from '@/utils/request';

// 查询公文发布列表
export function listDocument(query) {
    return request({
        url: '/project/document/selectDocumentList',
        method: 'get',
        params: query
    });
}

// 公文发布
export function addDocument(data) {
    return request({
        url: '/project/document/addDocument',
        method: 'post',
        data
    });
}

// 查询公文管理草稿列表
export function listDraft(query) {
    return request({
        url: '/project/document/selectDraftList',
        method: 'get',
        params: query
    });
}

// 查询公文管理草稿/发布详细
export function getDetail(id) {
    return request({
        url: '/project/document/' + id,
        method: 'get'
    });
}

// 新增公文管理草稿
export function addDraft(data) {
    return request({
        url: '/project/document/addDraft',
        method: 'post',
        data: data
    });
}

// 修改公文管理草稿
export function updateDraft(data) {
    return request({
        url: '/project/document/editDraft',
        method: 'put',
        data: data
    });
}

// 公文草稿提交
export function submitDraft(data) {
    return request({
        url: '/project/document/submitDraft',
        method: 'put',
        data: data
    });
}

export function submitDraftById(data) {
    return request({
        url: '/project/document/submitDraftById',
        method: 'put',
        data: data
    });
}

// 我的公文列表
export function listDocumentHandle(query) {
    return request({
        url: '/project/document/selectDocumentHandleList',
        method: 'get',
        params: query
    });
}

// 普通发文经理审核
export function documentLeaderCheck(data) {
    return request({
        url: '/project/document/documentLeaderCheck',
        method: 'post',
        data: data
    });
}

// 普通发文综合岗审核
export function documentComprehensiveCheck(data) {
    return request({
        url: '/project/document/documentComprehensiveCheck',
        method: 'post',
        data: data
    });
}

// 普通发文主任岗审核
export function documentDirectorCheck(data) {
    return request({
        url: '/project/document/documentDirectorCheck',
        method: 'post',
        data: data
    });
}

// 普通发文的综合岗套头
export function documentDirectorHair(data) {
    return request({
        url: '/project/document/documentDirectorHair',
        method: 'post',
        data: data
    });
}

// 普通发文的用印审批人审核
export function documentSealCheck(data) {
    return request({
        url: '/project/document/documentSealCheck',
        method: 'post',
        data: data
    });
}

// 普通发文的收文人确认
export function documentReceivedConfirm(data) {
    return request({
        url: '/project/document/documentReceivedConfirm',
        method: 'post',
        data: data
    });
}

// 普通发文的公文归档
export function updatePlaceOnFile(data) {
    return request({
        url: '/project/document/updatePlaceOnFile',
        method: 'post',
        data: data
    });
}

// 收文发文的综合岗办理
export function documentReceivingComprehensive(data) {
    return request({
        url: '/project/document/documentReceivingComprehensive',
        method: 'post',
        data: data
    });
}

// 收文发文的主任岗审核
export function documentReceivingDirectorCheck(data) {
    return request({
        url: '/project/document/documentReceivingDirectorCheck',
        method: 'post',
        data: data
    });
}

// 收文发文的办理协办岗办理
export function documentReceivingHandle(data) {
    return request({
        url: '/project/document/documentReceivingHandle',
        method: 'post',
        data: data
    });
}

// 查询公文归档列表
export function listDocumentArchive(query) {
    return request({
        url: '/project/document/selectDocumentArchiveList',
        method: 'get',
        params: query
    });
}

// 公文预览
export function getPreviewRedHeaderDoc(query) {
    return request({
        url: `/project/document/getPreviewRedHeaderDoc/${query}`,
        method: 'get',
        responseType: 'blob'
    });
}

// 公文草稿删除
export function deleteDraft(id) {
    return request({
        url: `/project/document/${id}`,
        method: 'delete'
    });
}

// 公文处理详情
export function selectDocumentProcessListByDocId(query) {
    return request({
        url: `/project/document/selectDocumentProcessListByDocId`,
        method: 'get',
        params: query
    });
}

// 获取众和的部门和公文的部门经理用户树列表
export function getDeptLeaderUserTreeList() {
    return request({
        url: '/project/supervise/selectDeptLeaderUserTreeList',
        method: 'get'
    });
}
