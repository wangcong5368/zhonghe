import Vue from 'vue';

/**
 * 环境参数工具函数。开发模式或环境参数未设置时返回缺省值，发布模式且环境参数设置时，返回环境参数值
 * @param name         {String} 环境变量名称。发布模式时，此名称被替换成环境变量值
 * @param defaultValue {String|Number} 缺省值。
 * @returns {String|Number} 开发模式或环境参数未设置时返回缺省值，发布模式且环境参数设置时，返回环境参数值
 */
const _env = (name, defaultValue) => (process.env.NODE_ENV === 'development' || name === '' ? defaultValue : typeof defaultValue === 'number' ? Number(name) : name);
const _envS = (name, def) => String(_env(name, def));
const _envN = (name, def) => Number(_env(name, def));

/**
 * 环境参数工具函数。开发模式或环境参数未设置时返回缺省值，发布模式且环境参数设置时，返回环境参数值
 * @param name         {String} 环境变量名称。发布模式时，此名称被替换成环境变量值
 * @param defaultValue {String|Number} 缺省值。
 * @returns {String|Number} 开发模式或环境参数未设置时返回缺省值，发布模式且环境参数设置时，返回环境参数值
 */
export function env(name, defaultValue) {
    // in prod mode, name be replaced by envsubst
    return Vue.config.devtools || name === '' ? defaultValue : typeof defaultValue === 'number' ? Number(name) : name;
}

export default {
    server: {
        baseUrl: _envS('$baseUrl', 'http://localhost:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://172.16.5.59:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://172.16.5.20:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://172.16.5.70:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://172.16.5.13:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://172.16.5.171:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://172.16.5.199:8080/tj-mediation-server'),
        // baseUrl: _envS('$baseUrl', 'http://192.168.10.50:33186/tj-mediation-server'),

        /** 纠纷扩展服务（案件类型、满意度等），需全路径对接时可单独配置 */
        expandBaseUrl: _envS('$expandBaseUrl', 'http://192.168.50.18:6582/tj-mediation-server-expand'),

        /** 图片 OCR 识别上传（新服务，须全路径调用） */
        ocrUploadUrl: _envS('$ocrUploadUrl', 'http://192.168.50.18:35000/api/ocr/upload'),

        // baseUrl: _envS('$baseUrl', 'http://data.zhi-shan.cn/tj-mediation-server'),
        publicPath: _envS('$publicPath', 'tj-mediation-manage'),
        serverIp: _envS('$serverIp', '192.168.50.30'),
        serverPort: _envS('$serverPort', '29003'),
        password: _envS('$password', 'Admin@12'),
        env: _envS('$env', 'dev'),
    }
};
