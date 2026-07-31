import request from '@/utils/request';

/**
 * 导入考勤记录
 * @param {FormData} data 考勤数据
 * @returns {Promise}
 */
export function importAttendanceData(data) {
    return request({
        url: '/oa/attendanceImport/importData',
        method: 'post',
        data
    });
}

/**
 * 获取考勤列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function getAttendanceList(query) {
    return request({
        url: '/oa/attendanceImport/list',
        method: 'get',
        params: query
    });
}

/**
 * 获取打卡数据列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function getAttendanceReportList(query) {
    return request({
        url: '/oa/attendanceReport/list',
        method: 'get',
        params: query
    });
}

/**
 * 下载考勤导入模板
 * @returns {Promise}
 */
export function downloadAttendanceTemplate() {
    return request({
        url: '/oa/attendanceImport/importTemplate',
        method: 'get',
        responseType: 'blob'
    });
}
