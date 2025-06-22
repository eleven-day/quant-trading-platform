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
    * [Python 依赖](https://akshare.akfamily.xyz/dependency.html#python)
      * [mini-racer](https://akshare.akfamily.xyz/dependency.html#mini-racer)
      * [pandas](https://akshare.akfamily.xyz/dependency.html#pandas)
  * [AKShare HTTP 部署](deploy_http.html.md)
  * [AKShare Docker 部署](akdocker_akdocker.html.md)
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * AKShare 依赖说明
  * [ 查看页面源码](_sources_dependency.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 依赖说明[](https://akshare.akfamily.xyz/dependency.html#akshare "Link to this heading")
## Python 依赖[](https://akshare.akfamily.xyz/dependency.html#python "Link to this heading")
  1. [AKShare](https://github.com/akfamily/akshare) 文档的依赖说明部分主要是为了对 [AKShare](https://github.com/akfamily/akshare) 库的所有依赖库做一个描述， 方便小伙伴在对 [AKShare](https://github.com/akfamily/akshare) 进行二次封装进行参考；
  2. 提供选择该库函数的部分原因说明；
  3. 所有的依赖名称都跟 PyPI 提供的库名称统一；
  4. 打包的时候注意 mini-racer 库如报错，请重新编译。

### mini-racer[](https://akshare.akfamily.xyz/dependency.html#mini-racer "Link to this heading")
  1. 版本 >=0.12.4
  2. 推荐使用最新版
  3. [PyPI 地址](https://pypi.org/project/mini-racer/)
  4. [GitHub 地址](https://github.com/bpcreech/PyMiniRacer)
  5. [文档地址](https://blog.sqreen.com/embedding-javascript-into-python/)
  6. 选用原因如下
    1. 由于 [PyExecJS](https://pypi.org/project/PyExecJS/) 在 20180118 推出最后一个版本后， 主要的开发者不再对该库进行升级维护，导致部分问题无法通过升级该库来修复， 该库的 [GitHub 地址](https://github.com/doloopwhile/PyExecJS) 可以访问如下地址，所以没有使用该库;
    2. [Js2Py](https://pypi.org/project/Js2Py/) 是目前比较使用量较大和维护较好的库，其 [GitHub 地址](https://github.com/PiotrDabkowski/Js2Py) 但是考虑到在测试中， 对部分 Javascript 代码的运行不稳定，所以没有使用该库。

### pandas[](https://akshare.akfamily.xyz/dependency.html#pandas "Link to this heading")
  1. 版本 >=0.25.0
  2. 推荐使用最新版
  3. [PYPI 地址](https://pypi.org/project/pandas/)
  4. [GitHub 地址](https://github.com/pandas-dev/pandas/)
  5. [文档地址](https://pandas.pydata.org/)
  6. 选用原因如下
    1. 该库主要用于采集后的数据清洗，此处建议升级到最新版，[AKShare](https://github.com/akfamily/akshare/) 会优先支持最新的版本；
    2. 默认会安装 [NumPy](https://numpy.org/) 依赖。

[ 上一页](contributing.html _AKShare 贡献源码_.md) [下一页 ](deploy_http.html _AKShare HTTP 部署_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.