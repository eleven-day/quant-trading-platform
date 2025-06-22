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
    * [AKShare 自然语言处理](data_nlp_nlp.html.md)
    * [AKShare QDII 数据](data_qdii_qdii.html.md)
    * [AKShare 另类数据](data_others_others.html.md)
    * [AKShare 奇货可查](data_qhkc_index.html.md)
    * [AKShare 工具箱](data_tool_tool.html.md)
      * [交易日历](https://akshare.akfamily.xyz/data/tool/tool.html#id1)
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
  * AKShare 工具箱
  * [ 查看页面源码](_sources_data_tool_tool.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 工具箱[](https://akshare.akfamily.xyz/data/tool/tool.html#akshare "Link to this heading")
## 交易日历[](https://akshare.akfamily.xyz/data/tool/tool.html#id1 "Link to this heading")
接口: tool_trade_date_hist_sina
目标地址: https://finance.sina.com.cn
描述: 新浪财经-股票交易日历数据
限量: 单次返回从 1990-12-19 到 2024-12-31 之间的股票交易日历数据, 这里补充 1992-05-04 进入交易日
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
trade_date | object | 从 1990-12-19 至 2024-12-31 的股票交易日数据; 这里补充 1992-05-04 进入交易日  
接口示例
```
importakshareasak
tool_trade_date_hist_sina_df = ak.tool_trade_date_hist_sina()
print(tool_trade_date_hist_sina_df)

```

数据示例
```
   trade_date
0   1990-12-19
1   1990-12-20
2   1990-12-21
3   1990-12-24
4   1990-12-25
...     ...
8550 2025-12-25
8551 2025-12-26
8552 2025-12-29
8553 2025-12-30
8554 2025-12-31
[8555 rows x 1 columns]

```

[ 上一页](data_qhkc_fund.html _资金_.md) [下一页 ](indicator.html _AKShare 指标计算_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.