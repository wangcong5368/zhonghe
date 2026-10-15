import axios from 'axios';
import conf from '@/conf';
import { getToken } from '@/utils/auth';

/** 拼接 OCR 服务全路径（与 expandServiceUrl 用法一致） */
export function ocrServiceUrl(path) {
    const base = String(conf.server.ocrBaseUrl || '')
        .trim()
        .replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}

function assertOcrBaseUrl() {
    const base = String(conf.server.ocrBaseUrl || '').trim();
    const valid = /^https?:\/\//i.test(base) || base.startsWith('/');
    if (!base || !valid) {
        throw new Error('OCR 服务地址未配置或无效，请检查 conf.server.ocrBaseUrl');
    }
}

/** FormData 上传：不携带 application/json，由浏览器设置 multipart 边界 */
export function ocrFormDataPost(path, formData, timeout = 120000) {
    assertOcrBaseUrl();
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
            }
        ]
    });
}

/** 图片 / PDF OCR 识别上传 */
export function uploadOcr(formData, timeout = 120000) {
    return ocrFormDataPost('/ocr/upload', formData, timeout);
}

/** 智能话术分析 */
export function analyzeTypicalChat(data, timeout = 30000) {
    assertOcrBaseUrl();
    const url = ocrServiceUrl('/typical/analyzeChat');
    const token = getToken();
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    return axios.post(url, data, {
        headers,
        timeout
    });
}
