[ AKShare ](index.html.md)
Table of contents:
  * [AKShare 项目概览](introduction.html.md)
  * [AKShare 安装指导](installation.html.md)
  * [AKShare 数据字典](data_index.html.md)
    * [AKShare 股票数据](data_stock_stock.html.md)
    * [AKShare 期货数据](data_futures_futures.html.md)
    * [AKShare 债券数据](data_bond_bond.html.md)
    * [AKShare 期权数据](data_option_option.html.md)
    * [AKShare 外汇数据](data_fx_fx.html.md)
    * [AKShare 货币数据](data_currency_currency.html.md)
    * [AKShare 现货数据](data_spot_spot.html.md)
    * [AKShare 利率数据](data_interest_rate_interest_rate.html.md)
    * [AKShare 私募基金数据](data_fund_fund_private.html.md)
    * [AKShare 公募基金数据](data_fund_fund_public.html.md)
    * [AKShare 指数数据](data_index_index.html.md)
    * [AKShare 宏观数据](data_macro_macro.html.md)
    * [AKShare 加密货币数据](data_dc_dc.html.md)
    * [AKShare 银行数据](data_bank_bank.html.md)
    * [AKShare 波动率数据](data_article_article.html.md)
    * [AKShare 多因子数据](https://akshare.akfamily.xyz/data/article/article.html#id2)
    * [AKShare 政策不确定性数据](https://akshare.akfamily.xyz/data/article/article.html#id3)
    * [AKShare 能源数据](data_energy_energy.html.md)
    * [AKShare 迁徙数据](data_event_event.html.md)
    * [AKShare 高频数据](data_hf_hf.html.md)
      * [标普 500 指数](https://akshare.akfamily.xyz/data/hf/hf.html#id1)
    * [AKShare 自然语言处理](data_nlp_nlp.html.md)
    * [AKShare QDII 数据](data_qdii_qdii.html.md)
    * [AKShare 另类数据](data_others_others.html.md)
    * [AKShare 奇货可查](data_qhkc_index.html.md)
    * [AKShare 工具箱](data_tool_tool.html.md)
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
  * [AKShare 特别说明](special.html.md)

[AKShare](index.html.md)
  * [](index.html.md)
  * [AKShare 数据字典](data_index.html.md)
  * AKShare 高频数据
  * [ 查看页面源码](_sources_data_hf_hf.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 高频数据[](https://akshare.akfamily.xyz/data/hf/hf.html#akshare "Link to this heading")
## 标普 500 指数[](https://akshare.akfamily.xyz/data/hf/hf.html#id1 "Link to this heading")
接口: hf_sp_500
目标地址: https://github.com/FutureSharks/financial-data
描述: 获取标普 500 指数的分钟数据, 由于数据量比较大, 需要等待, 由于服务器在国外, 建议使用代理访问
输入参数
名称 | 类型 | 描述  
---|---|---  
year | str | year="2017"; 只能获取 **2012-2018** 年的数据  
输出参数
名称 | 类型 | 描述  
---|---|---  
date | object | 日期时间  
open | float64 | 开盘价  
high | float64 | 最高价  
low | float64 | 最低价  
close | float64 | 收盘价  
接口示例
```
importakshareasak
hf_sp_500_df = ak.hf_sp_500(year="2017")
print(hf_sp_500_df)

```

数据示例
```
       date   open   high   low  close price
0    2017-01-02 2241.00 2244.50 2241.00 2243.50   0
1    2017-01-02 2243.75 2243.75 2243.00 2243.00   0
2    2017-01-02 2243.25 2243.25 2243.00 2243.25   0
3    2017-01-02 2243.00 2243.00 2243.00 2243.00   0
4    2017-01-02 2243.25 2243.75 2243.25 2243.75   0
...      ...   ...   ...   ...   ...  ...
222021 2017-12-29 2669.50 2669.75 2669.25 2669.25   0
222022 2017-12-29 2669.00 2669.25 2669.00 2669.00   0
222023 2017-12-29 2668.75 2668.75 2668.00 2668.25   0
222024 2017-12-29 2667.75 2668.50 2667.75 2668.00   0
222025 2017-12-29 2668.25 2668.50 2667.75 2668.50   0

```

[ 上一页](data_event_event.html _AKShare 迁徙数据_.md) [下一页 ](data_nlp_nlp.html _AKShare 自然语言处理_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.