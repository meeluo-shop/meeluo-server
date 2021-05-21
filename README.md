<h1>谜鹿云店后端接口服务</h1>

## 前言

该项目采用了 Node.js 作为主编程语言研发，主要目的是为了借用 Node.js 处理高并发的性能优势。

而且目前最火的编程语言 JavaScript（TypeScript），将是以后每个开发者必备编程技能，前端、后端只需一个人即可搞定。

主要功能模块包括线上商城、点餐、会员、小游戏等。

完整的项目仓库有 5 个，分别是接口服务（后端）、总管理后台（前端）、代理商后台（前端）、商户管理后台（前端）、移动端（前端）。

## 安装

```bash
$ npm install 或 yarn install
```

## 启动应用

```bash
# development
$ npm run start:dev

# watch mode
$ npm run dev

# production mode
$ sh bin/start.sh prod
```

## 单元测试

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 项目代码文档

```bash
# Generate project documentation
$ npm run compodoc
```

浏览器打开 http://localhost:8080.

## swagger 接口文档

浏览器打开 http://127.0.0.1:3000/docs.

## 授权

当前项目版为商业版本，无阉割。如需要商业授权，或者安装部署、需求定制等，请联系作者 QQ：1002563923

## 项目链接

后端代码：https://github.com/meeluo-shop/meeluo-server

总系统管理后台代码：https://github.com/meeluo-shop/meeluo-vue-admin

代理商管理后台代码：https://github.com/meeluo-shop/meeluo-vue-agent

商家管理后台代码：https://github.com/meeluo-shop/meeluo-vue-merchant

移动端代码：（暂不开放，请联系作者）

## 核心技术

| 技术        | 说明                                           |
| ----------- | ---------------------------------------------- |
| Node.js     | 后端编程语言                                   |
| Mysql       | 后端数据库                                     |
| Redis       | 后端缓存数据库                                 |
| RabbitMQ    | 后端消息队列                                   |
| Nacos       | 配置和管理微服务（可选）                       |
| Swagger-UI  | 文档生产工具                                   |
| Nest.js     | 后端开发框架（nodejs 版的 spring ）            |
| Fastify     | 后端 server 引擎（目前最快的 nodejs 后端框架） |  |
| vue3        | 高性能前端框架                                 |
| Taro3       | 跨平台前端框架                                 |
| element-ui  | 管理后台 UI 组件库                             |
| WebAssembly | 浏览器端高性能解码、加密方案                   |

## 相关截图

### 1. 后台截图

![](https://assets.meeluo.com/3388045433126912/WX20210512-201725@2x.png)

![](https://assets.meeluo.com/3388045433126912/WX20210512-201642@2x.png)

![](https://assets.meeluo.com/3388045433126912/WX20210512-201148@2x.png)

![](https://assets.meeluo.com/3388045433126912/WX20210512-201125@2x.png)

![](https://assets.meeluo.com/3388045433126912/WX20210512-201020@2x.png)

### 2. 移动端截图

<img src="https://assets.meeluo.com/3388045433126912/2531620827169_.pic.jpg"/>
<img src="https://assets.meeluo.com/3388045433126912/2511620826751_.pic.jpg"/>
<img src="https://assets.meeluo.com/3388045433126912/2521620826752_.pic.jpg"/>
<img src="https://assets.meeluo.com/3388045433126912/2501620826750_.pic.jpg"/>

## 提交反馈

- QQ：1002563923
