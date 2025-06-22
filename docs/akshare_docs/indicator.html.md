[ AKShare ](index.html.md)
Table of contents:
  * [AKShare 项目概览](introduction.html.md)
  * [AKShare 安装指导](installation.html.md)
  * [AKShare 数据字典](data_index.html.md)
  * [AKShare 指标计算](indicator.html.md)
    * [已实现波动率指标](https://akshare.akfamily.xyz/indicator.html#id1)
      * [YZ 已实现波动率](https://akshare.akfamily.xyz/indicator.html#yz)
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
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * AKShare 指标计算
  * [ 查看页面源码](_sources_indicator.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 指标计算[](https://akshare.akfamily.xyz/indicator.html#akshare "Link to this heading")
## 已实现波动率指标[](https://akshare.akfamily.xyz/indicator.html#id1 "Link to this heading")
### YZ 已实现波动率[](https://akshare.akfamily.xyz/indicator.html#yz "Link to this heading")
接口: volatility_yz_rv
目标地址: https://github.com/hugogobato/Yang-Zhang-s-Realized-Volatility-Automated-Estimation-in-Python
描述: 波动率-已实现波动率-Yang-Zhang已实现波动率
限量: 单次返回日频率的已实现波动率数据
输入参数
名称 | 类型 | 描述  
---|---|---  
data | pandas.DataFrame | 包含日期和 OHLC(开高低收) 价格的 pandas.DataFrame  
输出参数
名称 | 类型 | 描述  
---|---|---  
date | object | -  
rv | float64 | -  
接口示例
```
importakshareasak
stock_df = ak.rv_from_stock_zh_a_hist_min_em(
  symbol="000001",
  start_date="2021-10-20 09:30:00",
  end_date="2024-11-01 15:00:00",
  period="5",
  adjust=""
)
volatility_yz_rv_df = ak.volatility_yz_rv(data=stock_df)
print(volatility_yz_rv_df)

```

数据示例
```
     date    rv
0  2024-09-10 0.001955
1  2024-09-11 0.002207
2  2024-09-12 0.002113
3  2024-09-13 0.002216
4  2024-09-18 0.002039
5  2024-09-19 0.002631
6  2024-09-20 0.002043
7  2024-09-23 0.002116
8  2024-09-24 0.002374
9  2024-09-25 0.003624
10 2024-09-26 0.003392
11 2024-09-27 0.005944
12 2024-09-30 0.008488
13 2024-10-08 0.011529
14 2024-10-09 0.008031
15 2024-10-10 0.006964
16 2024-10-11 0.004970
17 2024-10-14 0.004435
18 2024-10-15 0.003706
19 2024-10-16 0.004293
20 2024-10-17 0.003534
21 2024-10-18 0.004322
22 2024-10-21 0.004417
23 2024-10-22 0.002922
24 2024-10-23 0.002124
25 2024-10-24 0.001814
26 2024-10-25 0.001605
27 2024-10-28 0.002125
28 2024-10-29 0.002045
29 2024-10-30 0.002428
30 2024-10-31 0.002718
31 2024-11-01 0.002932

```

[ 上一页](data_tool_tool.html _AKShare 工具箱_.md) [下一页 ](data_tips.html _AKShare 数据说明_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.