---
title: Type Safe System
emoji: 🎓
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# 类型安全的前后端系统（在线教学演示）

前端（React + Vite 静态文件）与后端（Scala 3 + http4s）打包在同一个 Docker 容器里：

- nginx 提供前端页面，并把 `/api/*` 同源转发给容器内的后端（8080）
- 数据库使用外部 PostgreSQL，连接信息通过 Space Secrets 注入
- 后端启动时会自动建表并写入演示数据，无需手动初始化

## 必需的环境变量

在 Space 的 **Settings → Variables and secrets** 中配置：

| 变量 | 说明 |
| --- | --- |
| `DB_HOST` | PostgreSQL 主机，例如 Neon 给的 `ep-xxx.ap-southeast-1.aws.neon.tech` |
| `DB_PORT` | 一般为 `5432` |
| `DB_NAME` | 数据库名 |
| `DB_USER` | 数据库用户 |
| `DB_PASSWORD` | 数据库密码（建议设为 Secret） |
| `DB_SSL` | 托管数据库填 `true` |
| `DB_MAX_POOL_SIZE` | 免费 PG 配额有限，建议 `5` |
| `DB_CONNECTION_TIMEOUT_MS` | 托管库会冷启动，建议 `30000` |

## 免费额度说明

- Hugging Face Spaces 免费档：2 vCPU / 16GB 内存；48 小时无访问会休眠，再次访问自动唤醒（冷启动约 1～2 分钟）
- Neon 免费档：0.5GB 存储，无访问时计算节点会休眠，首次请求有几秒延迟
