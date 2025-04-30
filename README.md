# OUO VPN 自动签到工具

一个用于自动签到 OUO Network VPN 服务的脚本工具，支持青龙面板运行，可获取每日流量奖励并发送通知。

## 功能特点

- 支持多账号签到
- 自动登录 OUO Network 账户
- 执行每日签到获取流量奖励
- 统计签到结果并发送通知
- 与青龙面板无缝集成

## 环境要求

- Node.js 环境
- 依赖包：axios
- 青龙面板（可选，用于管理环境变量和定时任务）

## 配置说明

### 环境变量配置

需要设置以下环境变量：

- `VPN_OUO_EMAIL`: OUO Network 账号邮箱，多账号使用换行分隔
- `VPN_OUO_PWD`: OUO Network 账号密码，多账号使用换行分隔

### 青龙面板使用说明

1. 添加依赖：在青龙面板中添加 `axios` 依赖
2. 添加环境变量：在青龙面板中添加上述必要的环境变量
3. 创建定时任务：设置每日运行 `node checkin.js` 的定时任务

## 使用方法

### 直接运行

```bash
# 安装依赖
npm install

# 设置环境变量
export VPN_OUO_EMAIL='your_email@example.com'
export VPN_OUO_PWD='your_password'

# 运行脚本
node checkin.js
```

### 在青龙面板中运行

1. 将项目文件上传到青龙面板的脚本目录
2. 配置好环境变量
3. 创建定时任务，命令为 `node checkin.js`

## 通知设置

脚本使用 `sendNotify.js` 发送通知，支持多种通知方式，具体配置请参考青龙面板的通知设置。

## 更新日志

### v1.0.0
- 当前版本

