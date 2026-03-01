# AI 协作约束

## 禁止事项

- **禁止在实现代码中硬编码任何数据值**
- **禁止返回固定数据、假数据、示例数据**（mocks/ 目录下的阶段一假数据除外）
- **不要修改任何测试文件**
- **如果无法通过某个测试，说明原因而不是绕过**
- **前端组件不能直接依赖后端实现细节，必须通过 services/ 层调用**

## 架构约束

- 前端：React + Next.js + TypeScript (strict) + Tailwind CSS
- 后端：Rust (axum) + SQLite (rusqlite)
- 前后端通过 HTTP API 通信，接口契约定义在 types/ 中
- 所有 API 调用通过 `frontend/src/services/api.ts` 统一管理

## 代码风格

- 前端：遵循 ESLint strict-type-checked 规则
- 后端：遵循 Rust 标准风格 (cargo fmt / cargo clippy)
- 使用中文注释（面向中国 A 股市场的量化学习平台）
