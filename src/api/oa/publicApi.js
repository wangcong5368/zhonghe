import request from '@/utils/request';

// 查询部门树结构
export function listDeptTree() {
    return request({
        //url: "/system/user/selectAllDeptList",
        url: '/project/supervise/selectAllDeptList',
        method: 'get'
    });
}

// 获取事项来源字典值
export function getSourceDict() {
    return request({
        url: '/system/dict/data/type/supervise_source',
        method: 'get'
    });
}

// 获取业务分类字典值
export function getTypeDict() {
    return request({
        url: '/system/dict/data/type/supervise_type',
        method: 'get'
    });
}

// 获取紧急程度字典值
export function getUrgencyDict() {
    return request({
        url: '/system/dict/data/type/supervise_urgency',
        method: 'get'
    });
}

// 获取公文套头文件字典值
export function getDocumentDict() {
    return request({
        url: '/system/dict/data/type/document_word',
        method: 'get'
    });
}

// 获取所有用户接口
export function getAllUser() {
    return request({
        url: '/project/supervise/selectAllUserList',
        method: 'get'
    });
}

// 获取除自己以外用户接口
export function selectUserList() {
    return request({
        url: '/system/user/selectUserList',
        method: 'get'
    });
}

// 获取综合岗角色列表
export function getComprehensiveList() {
    return request({
        url: '/project/supervise/selectComprehensiveList',
        method: 'get'
    });
}

// 获取主任岗角色列表
export function getDirectorList() {
    return request({
        url: '/project/supervise/selectDirectorList',
        method: 'get'
    });
}

// 获取办理、协办角色列表
export function getHandleList() {
    return request({
        url: '/project/supervise/selectHandleList',
        method: 'get'
    });
}

// 获取部门和人员的树形列表
export function getDeptUserTree() {
    return request({
        url: '/project/supervise/selectDeptUserTreeList',
        method: 'get'
    });
}
// 根据权限字符获取对应部门用户
export function getQueryDeptOrPermission(permissionStr) {
    return request({
        url: '/system/user/queryDeptOrPermission?permissionStr=' + permissionStr,
        method: 'get'
    });
}

// 根据权限字符获取用户权限（用于获取组长）
export function getUserJurisdiction(permissionStr) {
    return request({
        url: '/system/user/getUserJurisdiction?permissionStr=' + permissionStr,
        method: 'get'
    });
}

// 根据部门id获取对应部门用户
export function getUserListByDeptId(deptId) {
    return request({
        url: '/system/user/listByDeptId',
        method: 'get',
        params: { deptId }
    });
}

// 获取常用语列表
export function getReplyList() {
    return request({
        url: '/project/reply/getList',
        method: 'get'
    });
}

// 添加常用语
export function addReply(data) {
    return request({
        url: '/project/reply/addData',
        method: 'post',
        data
    });
}
// 编辑常用语
export function editReply(data) {
    return request({
        url: '/project/reply/editData',
        method: 'post',
        data
    });
}

export function fileToPdf(url) {
    return request({
        url: '/common/docToPdf' + url,
        method: 'GET',
        responseType: 'blob'
    });
}
