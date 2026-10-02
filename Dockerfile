# ---- 阶段 1：前端构建（产物为纯静态文件） ----
FROM node:24-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# 部署时前后端同源，由 nginx 反代 /api，因此 API 基地址用相对根路径
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- 阶段 2：后端构建（打出 fat jar，运行期不再需要 sbt） ----
FROM sbtscala/scala-sbt:eclipse-temurin-21.0.7_6_1.10.11_3.3.6 AS backend-build
WORKDIR /app
COPY backend/build.sbt ./
COPY backend/project ./project
COPY backend/src ./src
RUN sbt --batch assembly

# ---- 阶段 3：运行期（nginx 服务前端并同源反代 /api，JVM 只跑 fat jar） ----
FROM eclipse-temurin:25-jre-alpine
RUN apk add --no-cache nginx
WORKDIR /app
COPY --from=backend-build /app/target/scala-3.3.3/backend.jar /app/backend.jar
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV HTTP_HOST=127.0.0.1 \
    HTTP_PORT=8080 \
    JAVA_OPTS="-Xms64m -Xmx512m"
EXPOSE 7860
CMD ["/app/start.sh"]
