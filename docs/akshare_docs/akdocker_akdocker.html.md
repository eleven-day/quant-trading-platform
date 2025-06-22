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
  * [AKShare Docker 部署](akdocker_akdocker.html.md)
    * [安装 Docker](https://akshare.akfamily.xyz/akdocker/akdocker.html#docker)
      * [官方安装指导](https://akshare.akfamily.xyz/akdocker/akdocker.html#id1)
      * [第三方安装指导](https://akshare.akfamily.xyz/akdocker/akdocker.html#id2)
      * [配置国内镜像](https://akshare.akfamily.xyz/akdocker/akdocker.html#id3)
    * [AKDocker 镜像使用](https://akshare.akfamily.xyz/akdocker/akdocker.html#akdocker)
      * [拉取 AKDocker 镜像](https://akshare.akfamily.xyz/akdocker/akdocker.html#id4)
      * [运行 AKDocker 容器](https://akshare.akfamily.xyz/akdocker/akdocker.html#id5)
      * [测试 AKDocker 容器](https://akshare.akfamily.xyz/akdocker/akdocker.html#id6)
    * [使用案例](https://akshare.akfamily.xyz/akdocker/akdocker.html#id7)
      * [背景说明](https://akshare.akfamily.xyz/akdocker/akdocker.html#id8)
      * [命令行](https://akshare.akfamily.xyz/akdocker/akdocker.html#id9)
      * [注意事项](https://akshare.akfamily.xyz/akdocker/akdocker.html#id10)
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * AKShare Docker 部署
  * [ 查看页面源码](_sources_akdocker_akdocker.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) Docker 部署[](https://akshare.akfamily.xyz/akdocker/akdocker.html#akshare-docker "Link to this heading")
目前 [AKShare](https://github.com/akfamily/akshare) 数据接口是基于 Python 开发的，鉴于部分小伙伴难以在短时间部署 [AKShare](https://github.com/akfamily/akshare) 的 Python 使用环境，特此提供基于 Docker 容器技术的使用教程。
## 安装 Docker[](https://akshare.akfamily.xyz/akdocker/akdocker.html#docker "Link to this heading")
### 官方安装指导[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id1 "Link to this heading")
  1. Windows 11: [安装教程](https://hub.docker.com/editions/community/docker-ce-desktop-windows)
  2. Mac: [安装教程](https://docs.docker.com/docker-for-mac/install)
  3. Ubuntu: [安装教程](https://docs.docker.com/engine/install/ubuntu)
  4. CentOS: [安装教程](https://docs.docker.com/engine/install/centos)

### 第三方安装指导[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id2 "Link to this heading")
  1. [Docker 安装教程](https://www.runoob.com/docker/docker-tutorial.html)
  2. 建议 Windows 7 和 8 的用户升级到 Windows 10/11 系统进行安装
  3. [Windows 镜像下载地址](https://msdn.itellyou.cn/)

### 配置国内镜像[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id3 "Link to this heading")
  1. [Docker 国内镜像加速教程](https://www.runoob.com/docker/docker-mirror-acceleration.html)
  2. 请在国内使用的用户务必进行该项配置, 从而加速获取镜像的速度.

## AKDocker 镜像使用[](https://akshare.akfamily.xyz/akdocker/akdocker.html#akdocker "Link to this heading")
### 拉取 AKDocker 镜像[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id4 "Link to this heading")
此镜像会在每次 AKShare 更新版本时自动更新
```
docker pull registry.cn-shanghai.aliyuncs.com/akfamily/aktools:jupyter

```

### 运行 AKDocker 容器[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id5 "Link to this heading")
```
docker run -it registry.cn-shanghai.aliyuncs.com/akfamily/aktools:jupyter

```

### 测试 AKDocker 容器[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id6 "Link to this heading")
```
importakshareasak
print(ak.__version__)

```

## 使用案例[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id7 "Link to this heading")
### 背景说明[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id8 "Link to this heading")
本案例是基于 AKDocker 容器中已经安装的 JupyterLab 来演示的. 主要是利用 JupyterLab 的 Python 交互式的开发环境, 使用户可以在 Web 输入 AKShare 的 Python 示例代码, 仅需要修改一些简单的参数, 就可以获取需要的数据. 为了能把 JupyterLab 中下载的数据从容器映射到本地, 请在 容器的 `/home` 目录下编辑 `.ipynb` 文件, 如果需要下载相关的文件也请保存到该目录.
### 命令行[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id9 "Link to this heading")
```
docker run -it -p 8888:8888 --name akdocker -v /c/home:/home registry.cn-shanghai.aliyuncs.com/akfamily/aktools:jupyter jupyter-lab --allow-root --no-browser --ip=0.0.0.0

```

### 注意事项[](https://akshare.akfamily.xyz/akdocker/akdocker.html#id10 "Link to this heading")
  1. 其中 Windows 系统的路径如: `C:\home` 需要改写为: `/c/home` 的形式;
  2. 在 Terminal 中运行上述指令后，会在 Terminal 中显示如下信息: ![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/akdocker/akdocker_terminal.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/akdocker/akdocker_terminal.png)
  3. 打开本地游览器输入地址: `http://127.0.0.1:8888/lab?token=bbe7c8633c098b67df913dce522b82e00828b311a6fc954d`;
  4. 在本地游览器中的 JupyterLab 界面进入 `home` 文件夹, 该目录内容会与本地的 `C:\home` 保持同步, 可以在此编辑 notebook 文件和导入数据到该文件夹从而在本地的 `C:\home` 文件夹下获取数据;
  5. 如果在 JupyterLab 中的 AKShare 版本不是最新版，有以下两种方法：
    1. 在 JupyterLab 中运行 `!pip install akshare --upgrade` 命令来升级 AKShare 到最新版
    2. 在容器中进行升级 AKShare 并保存为新的镜像文件后使用，参考：https://aktools.akfamily.xyz/aktools/ 中【升级镜像】部分

[ 上一页](deploy_http.html _AKShare HTTP 部署_.md) [下一页 ](special.html _AKShare 特别说明_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.