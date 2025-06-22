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
    * [Anaconda 安装说明](https://akshare.akfamily.xyz/anaconda.html#anaconda)
    * [Anaconda 安装演示](https://akshare.akfamily.xyz/anaconda.html#id1)
  * [AKShare 量化专题](platform.html.md)
  * [AKShare 策略示例](demo.html.md)
  * [AKShare 版本更新](changelog.html.md)
  * [AKShare 贡献源码](contributing.html.md)
  * [AKShare 依赖说明](dependency.html.md)
  * [AKShare HTTP 部署](deploy_http.html.md)
  * [AKShare Docker 部署](akdocker_akdocker.html.md)
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * AKShare 环境配置
  * [ 查看页面源码](_sources_anaconda.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 环境配置[](https://akshare.akfamily.xyz/anaconda.html#akshare "Link to this heading")
## Anaconda 安装说明[](https://akshare.akfamily.xyz/anaconda.html#anaconda "Link to this heading")
Anaconda 是集成上千个常用库的 Python 发行版本, 通过安装 Anaconda 能简化环境管理工作, 非常推荐使用. 作者建议根据您计算机的操作系统选择相应版本的安装包, 国内用户可以点击链接访问 [清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/) 来加速下载最新的 64 位安装包. 国外用户可以访问 [Anaconda 官网](https://www.anaconda.com/products/individual) 下载最新的 64 位安装包.
## Anaconda 安装演示[](https://akshare.akfamily.xyz/anaconda.html#id1 "Link to this heading")
**以 64 位 Windows 版本 Anaconda3-2019.07 为例**
下图中红框为 64 位 Windows 选择的版本:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_download.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_download.png)
下载完成后双击如下图标进行安装:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_icon.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_icon.png)
点击 Next:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_1.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_1.png)
点击 I Agree:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_2.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_2.png)
点击 Just me --> Next:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_3.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_3.png)
修改 Destination Folder 为如图所示:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_4.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_4.png)
勾选下图红框选项(以便于把安装的环境加入系统路径) --> Install:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_5.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/anaconda_install_5.png)
安装好后, 找到 Anaconda Prompt 窗口:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt.png)
输入 python, 如果如下图所示, 即已经在系统目录中安装好 anaconda3 的环境.
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_1.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_1.png)
创建虚拟环境命令, 此处指定 Python 版本为 3.8.5, AKShare 支持 Python 3.8 以上的版本:
```
conda create -n ak_test python=3.8.5

```

输入上述命令后出现确认, 输入 y
```
Proceed 输入 y

```

显示出最后一个红框内容则创建虚拟环境成功.
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_2.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_2.png)
在虚拟环境中安装 [AKShare](https://github.com/akfamily/akshare). 输入如下内容, 会在全新的环境中自动安装所需要的依赖包
激活已经创建好的 ak_test 虚拟环境
```
conda activate ak_test

```

在 ak_test 虚拟环境中安装并更新 [AKShare](https://github.com/akfamily/akshare)
```
pip install akshare --upgrade

```

![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_3.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_3.png)
在安装完毕后, 输入 `python` 进入虚拟环境中的 Python
```
python

```

在 ak_test 虚拟环境的 Python 环境里面输入:
```
importakshareasak
print(ak.__doc__)

```

显示出如下图则虚拟环境和 [AKShare](https://github.com/akfamily/akshare) 安装成功:
![https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_4.png](https://jfds-1252952517.cos.ap-chengdu.myqcloud.com/akshare/readme/anaconda/virtual_env/anaconda_prompt_4.png)
还可以在 ak_test 虚拟环境的 Python 环境中输入如下代码可以显示 [AKShare](https://github.com/akfamily/akshare) 的版本信息
```
importakshareasak
print(ak.__version__)

```

[ 上一页](articles.html _AKShare 相关文章_.md) [下一页 ](platform.html _AKShare 量化专题_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.