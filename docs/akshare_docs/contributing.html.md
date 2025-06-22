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
    * [贡献指南](https://akshare.akfamily.xyz/contributing.html#id1)
      * [克隆及提交代码](https://akshare.akfamily.xyz/contributing.html#id2)
      * [代码及接口设计规范](https://akshare.akfamily.xyz/contributing.html#id3)
      * [文档撰写规范](https://akshare.akfamily.xyz/contributing.html#id4)
    * [声明](https://akshare.akfamily.xyz/contributing.html#id5)
  * [AKShare 依赖说明](dependency.html.md)
  * [AKShare HTTP 部署](deploy_http.html.md)
  * [AKShare Docker 部署](akdocker_akdocker.html.md)
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * AKShare 贡献源码
  * [ 查看页面源码](_sources_contributing.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 贡献源码[](https://akshare.akfamily.xyz/contributing.html#akshare "Link to this heading")
## 贡献指南[](https://akshare.akfamily.xyz/contributing.html#id1 "Link to this heading")
### 克隆及提交代码[](https://akshare.akfamily.xyz/contributing.html#id2 "Link to this heading")
  1. 请从 [akshare-dev 分支](https://github.com/akfamily/akshare/tree/dev) 克隆，dev 分支中包含 AKShare 最新的开发代码
  2. 请提交修改后的代码到 [akshare-dev 分支](https://github.com/akfamily/akshare/tree/dev)

### 代码及接口设计规范[](https://akshare.akfamily.xyz/contributing.html#id3 "Link to this heading")
  1. 代码需要符合 **PEP 8** 要求，请使用 [Ruff](https://github.com/astral-sh/ruff) 格式化代码
  2. 请使用 [pre-commit](https://pre-commit.com/) 来规范 git 提交记录，可以参考 [AKShare](https://github.com/akfamily/akshare) 的格式
  3. 函数接口的设计 **stock_zh_a_hist_sina** 结构，其中 **stock** 为金融产品，**zh** 为国家或地区，**a** 为市场或品种，**hist** 为 history 的缩写表示历史数据，**sina** 表示数据源为新浪
  4. 接口函数需要增加注释，注释规则请参考 **stock_zh_a_hist_sina** 接口的源码
  5. 需要在接口函数的注释中增加目标网站的地址（不是具体的数据接口地址，而是网页的地址）
  6. 返回数据格式要求：
    1. 为了兼容 HTTP API 接口，所有返回的数据格式统一为 Pandas 中的 pandas.DataFrame 格式

### 文档撰写规范[](https://akshare.akfamily.xyz/contributing.html#id4 "Link to this heading")
  1. 在新增或者修改接口后，需要修改相对应的接口文档，保持接口与文档的同步更新；
  2. 具体的接口文档路径（以股票接口的文档为例）为：akshare->docs->data->stock->stock.md，其中 stock 表示股票文件夹，stock.md 为具体的 Markdown 文件，需要在 stock.md 中对相应的接口文档进行修改或新增；
  3. 以股票分时数据接口文档为例：
    1. 主要包含以下部分内容：
      1. 接口：填写具体的接口名称
      2. 目标地址：填写具体数据获取网页的地址（不是数据接口地址）
      3. 描述：简单描述数据接口获取的数据
      4. 限量：返回数据的情况
      5. 输入参数：数据接口函数中需要输入的参数
      6. 输出参数：返回数据的字段，这里需要填写返回数据的字段和类型
      7. 接口示例：Python 调用该数据接口的代码
      8. 数据示例：利用 **接口示例** 代码获取的数据的接口，这里只需要复制前 **5** 行和后 **5** 行数据即刻即可。
    2. 示例如下：
```
##### 分时数据
接口:stock_zh_a_minute
目标地址:https://finance.sina.com.cn/realstock/company/sh600519/nc.shtml
描述:新浪财经获取分时数据，目前可以获取1,5,15,30,60分钟的数据频率
限量:单次返回指定公司的指定频率的所有历史分时行情数据
输入参数
\```
|名称|类型|描述|
|--------|----|---|
|symbol|str|symbol='sh000300';同日频率数据接口|
|period|str|period='1';获取1,5,15,30,60分钟的数据频率|
\```
输出参数
\```shell
|名称|类型|描述|
|------------|------|--------|
|day|object|-|
|open|float64|-|
|high|float64|-|
|low|float64|-|
|close|float64|-|
|volume|float64|-|
|ma_price5|float64|-|
|ma_volume5|float64|-|
|ma_price10|float64|-|
|ma_volume10|float64|-|
|ma_price30|float64|-|
|ma_volume30|float64|-|
\```
接口示例
\```python
importakshareasak
stock_zh_a_minute_df=ak.stock_zh_a_minute(symbol='sz000876',period='1',adjust="qfq")
print(stock_zh_a_minute_df)
\```
数据示例
\```
dayopenhighlowclosevolume
02024-04-2213:53:009.309.319.309.3090000
12024-04-2213:54:009.309.319.299.3096100
22024-04-2213:55:009.309.329.309.3289200
32024-04-2213:56:009.329.329.319.3146300
42024-04-2213:57:009.319.329.319.3218000
.....................
19652024-05-0714:54:00NaNNaNNaNNaN129300
19662024-05-0714:55:00NaNNaNNaNNaN116100
19672024-05-0714:56:00NaNNaNNaNNaN111300
19682024-05-0714:57:00NaNNaNNaNNaN74400
19692024-05-0715:00:00NaNNaNNaNNaN305000
[1970rowsx6columns]
\```

```

## 声明[](https://akshare.akfamily.xyz/contributing.html#id5 "Link to this heading")
  1. 所提交的代码如不符合上述规范，则可能会被拒绝合并；
  2. 由于某些原因，您所提交的代码、数据接口和文档会被修改、删除或被第三方使用；
  3. **输出参数** 里面的字段类型必须为 Pandas 最新版本的 int64 类型，float64 类型，object 类型等三种类型之一，整数为 int64 类型，浮点数为 float64 类型，日期及字符串为 object 类型。

[ 上一页](changelog.html _AKShare 版本更新_.md) [下一页 ](dependency.html _AKShare 依赖说明_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.