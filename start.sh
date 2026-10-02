#!/bin/sh
set -eu

# Render/Koyeb 会注入 PORT 环境变量；Hugging Face Spaces 固定使用 EXPOSE 的端口（默认 7860）
listen_port="${PORT:-7860}"
sed -i "s/__NGINX_PORT__/${listen_port}/g" /etc/nginx/http.d/default.conf

java ${JAVA_OPTS:-} -jar /app/backend.jar &
backend_pid=$!

# 后端进程退出时让容器一起退出，便于平台自动重启
(
  while kill -0 "$backend_pid" 2>/dev/null; do
    sleep 2
  done
  kill -s TERM 1 2>/dev/null || true
) &

term_handler() {
  kill "$backend_pid" 2>/dev/null || true
}
trap term_handler INT TERM

nginx -g 'daemon off;'
