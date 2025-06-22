[ AKShare ](index.html.md)
Table of contents:
  * [AKShare 项目概览](introduction.html.md)
  * [AKShare 安装指导](installation.html.md)
  * [AKShare 数据字典](data_index.html.md)
  * [AKShare 指标计算](indicator.html.md)
  * [AKShare 数据说明](data_tips.html.md)
    * [专栏介绍](https://akshare.akfamily.xyz/data_tips.html#id1)
    * [股票数据](https://akshare.akfamily.xyz/data_tips.html#id2)
      * [stock_zh_a_hist](https://akshare.akfamily.xyz/data_tips.html#stock-zh-a-hist)
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
  * AKShare 数据说明
  * [ 查看页面源码](_sources_data_tips.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 数据说明[](https://akshare.akfamily.xyz/data_tips.html#akshare "Link to this heading")
## 专栏介绍[](https://akshare.akfamily.xyz/data_tips.html#id1 "Link to this heading")
本专栏主要目的是提示数据使用的风险，包括但不限于股票、期货、期权、债券、基金、外汇等数据。
## 股票数据[](https://akshare.akfamily.xyz/data_tips.html#id2 "Link to this heading")
### stock_zh_a_hist[](https://akshare.akfamily.xyz/data_tips.html#stock-zh-a-hist "Link to this heading")
接口：stock_zh_a_hist
问题描述：股票 `600734` 后复权数据的开高低收字段出现负值
代码复现：
```
importakshareasak
stock_zh_a_hist_df = ak.stock_zh_a_hist(
  symbol="600734",
  period="daily",
  start_date="20050501",
  end_date="20050520",
  adjust="hfq"
)
print(stock_zh_a_hist_df)

```

结果复现：
```
日期开盘收盘最高最低...成交额振幅涨跌幅涨跌额换手率
02005-05-09-0.13-0.530.00-0.53...1571616.0407.69-507.69-0.660.60
12005-05-10-0.53-0.50-0.36-0.79...1150869.0-81.135.660.030.45
22005-05-11-0.50-0.30-0.20-0.69...1651719.0-98.0040.000.200.63
32005-05-12-0.33-0.200.00-0.43...2175707.0-143.3333.330.100.81
42005-05-13-0.33-0.130.07-0.40...1569427.0-235.0035.000.070.58
52005-05-16-0.30-0.100.10-0.40...2324469.0-384.6223.080.030.85
62005-05-17-0.100.040.13-0.23...2682900.0-360.00140.000.140.96
72005-05-180.000.200.27-0.13...2261494.01000.00400.000.160.81
82005-05-190.100.070.17-0.06...1589463.0115.00-65.00-0.130.57
92005-05-200.070.000.13-0.03...1355000.0228.57-100.00-0.070.48
[10rowsx11columns]

```

[ 上一页](indicator.html _AKShare 指标计算_.md) [下一页 ](answer.html _AKShare 答疑专栏_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.