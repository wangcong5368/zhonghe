import request from '@/utils/request';

export const getMessageList = query => {
    return request({
        url: '/project/message/list',
        method: 'get',
        params: query
    });
};

export const readMessageById = data => {
    return request({
        url: '/project/message/readById',
        method: 'put',
        data
    });
};
