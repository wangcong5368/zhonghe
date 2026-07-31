FROM nginx:latest

ARG ppath
RUN echo "public path is ${ppath}"

# ARG ppath
COPY . /usr/share/nginx/html/${ppath}/
# make conf template
COPY ./static/js/conf.*.js /usr/share/nginx/html/conf.template

# 双引号的字符串里面的 ${ppath} 会被替换
RUN sed -i "/index\.htm;/a\        try_files \$uri \$uri/ /${ppath}/index.html;" /etc/nginx/conf.d/default.conf

# ARG ppath
ENV public_path=${ppath}

#解决时区问题
ENV TZ Asia/Shanghai

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/conf.template > `find /usr/share/nginx/html/${public_path}/static/js/conf.*.js` && nginx -g 'daemon off;'"]
# CMD ["nginx", "-g", "daemon off;"]
