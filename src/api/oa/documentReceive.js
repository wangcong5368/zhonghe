import request from '@/utils/request';

// 收文发文的综合岗办理
// 示例值: { "docId": "公文id","status": "1通过，2拒绝", "directorIds": "主任岗人员ids", "handleIds": "办理协办岗人员不能为空", "remark": "意见" }
export function documentReceivingComprehensive(data) {
    return request({
        url: '/project/document/documentReceivingComprehensive',
        method: 'post',
        data: data
    });
}

// 收文发文的主任岗审核
// 示例值: { "docId": "公文id", "status": "1通过，2拒绝", "remark": "意见" }
export function documentReceivingDirectorCheck(data) {
    return request({
        url: '/project/document/documentReceivingDirectorCheck',
        method: 'post',
        data: data
    });
}

// 收文发文的部门经理分发
// 示例值: { "docId": "公文id", "userIds": "人员IDS用逗号拼接", "remark": "意见" }
export function documentReceivingLeaderDistribute(data) {
    return request({
        url: '/project/document/documentReceivingLeaderDistribute',
        method: 'post',
        data: data
    });
}
// 文秘岗分发
export function dispatchDepartmentSelect(data) {
    return request({
        url: '/project/document/departmentalDistributionArticle',
        method: 'post',
        data: data
    });
}

// 收文发文的综合岗完结
// 示例值: { "docId": "公文id" }
export function documentReceivingEnd(data) {
    return request({
        url: '/project/document/documentReceivingEnd',
        method: 'post',
        data: data
    });
}

// 文秘岗查询当前收文阅读进度
// 示例值: { "docId": "公文id" }
export function checkTheProgress(data) {
    return request({
        url: '/project/document/checkTheProgress',
        method: 'get',
        params: data
    });
}

// 收文发文的部门人员确认
// 示例值: { "docId": "公文id" }
export function documentReceivingUserConfirm(data) {
    return request({
        url: '/project/document/documentReceivingUserConfirm',
        method: 'post',
        data: data
    });
}

// 收文发文的文秘岗办结
// 示例值: { "docId": "公文ID不能为空" }
export function documentReceivingLeaderCompleted(data) {
    return request({
        url: '/project/document/documentReceivingLeaderCompleted',
        method: 'post',
        data: data
    });
}

// 获取用户权限
export function getUserPermission(data) {
    return request({
        url: '/system/user/getUserPermission?perms=' + data,
        method: 'get'
    });
}

// 删除公文
export function deleteDocument(data) {
    return request({
        url: '/project/document/deleteDocument',
        method: 'post',
        data: {
            id: data
        }
    });
}

// 获取收文的全部信息
export function dispatchAllDetails(data) {
    return request({
        url: '/project/document/dispatchAllDetails',
        method: 'get',
        params: data
    });
}
