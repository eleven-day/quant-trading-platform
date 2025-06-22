[ AKShare ](index.html.md)
Table of contents:
  * [AKShare 项目概览](introduction.html.md)
  * [AKShare 安装指导](installation.html.md)
  * [AKShare 数据字典](data_index.html.md)
  * [AKShare 指标计算](indicator.html.md)
  * [AKShare 数据说明](data_tips.html.md)
  * [AKShare 答疑专栏](answer.html.md)
  * [AKShare 快速入门](tutorial.html.md)
  * [AKShare 相关文章](articles.html.md)
  * [AKShare 环境配置](anaconda.html.md)
  * [AKShare 量化专题](platform.html.md)
  * [AKShare 策略示例](demo.html.md)
  * [AKShare 版本更新](changelog.html.md)
  * [AKShare 贡献源码](contributing.html.md)
  * [AKShare 依赖说明](dependency.html.md)
  * [AKShare HTTP 部署](deploy_http.html.md)
    * [说明](https://akshare.akfamily.xyz/deploy_http.html#id1)
    * [快速启动](https://akshare.akfamily.xyz/deploy_http.html#id2)
      * [安装库](https://akshare.akfamily.xyz/deploy_http.html#id3)
      * [运行库](https://akshare.akfamily.xyz/deploy_http.html#id4)
    * [版本说明](https://akshare.akfamily.xyz/deploy_http.html#id5)
    * [更多详情](https://akshare.akfamily.xyz/deploy_http.html#id6)
  * [AKShare Docker 部署](akdocker_akdocker.html.md)
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * AKShare HTTP 部署
  * [ 查看页面源码](_sources_deploy_http.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) HTTP 部署[](https://akshare.akfamily.xyz/deploy_http.html#akshare-http "Link to this heading")
## 说明[](https://akshare.akfamily.xyz/deploy_http.html#id1 "Link to this heading")
AKShare HTTP 版本的部署主要依赖 AKTools、AKShare、FastAPI、Uvicorn、Typer 等开源 Python 库，部署的核心程序在 AKTools 中。 非常感谢给 [AKTools 项目](https://github.com/akfamily/aktools) 点 Star，您的支持是我们持续开发最大的动力！
## 快速启动[](https://akshare.akfamily.xyz/deploy_http.html#id2 "Link to this heading")
### 安装库[](https://akshare.akfamily.xyz/deploy_http.html#id3 "Link to this heading")
```
pipinstallaktools

```

### 运行库[](https://akshare.akfamily.xyz/deploy_http.html#id4 "Link to this heading")
```
python-maktools

```

## 版本说明[](https://akshare.akfamily.xyz/deploy_http.html#id5 "Link to this heading")
  1. 仅体验 HTTP API 功能则只需要安装：`pip install aktools==0.0.68` 版本；
  2. 体验完整功能请安装最新版，支持用于认证、权限、可视化页面等更多功能。

## 更多详情[](https://akshare.akfamily.xyz/deploy_http.html#id6 "Link to this heading")
[参见 AKTools 项目文档](https://aktools.akfamily.xyz/)
[ 上一页](dependency.html _AKShare 依赖说明_.md) [下一页 ](akdocker_akdocker.html _AKShare Docker 部署_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.