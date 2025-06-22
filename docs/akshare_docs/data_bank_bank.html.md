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
      * [银保监分局本级行政处罚](https://akshare.akfamily.xyz/data/bank/bank.html#id1)
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
  * AKShare 银行数据
  * [ 查看页面源码](_sources_data_bank_bank.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 银行数据[](https://akshare.akfamily.xyz/data/bank/bank.html#akshare "Link to this heading")
## 银保监分局本级行政处罚[](https://akshare.akfamily.xyz/data/bank/bank.html#id1 "Link to this heading")
接口: bank_fjcf_table_detail
目标地址: https://www.cbirc.gov.cn/cn/view/pages/ItemDetail.html?docId=881574&itemId=4115&generaltype=9
描述: 首页-政务信息-行政处罚-银保监分局本级-XXXX行政处罚信息公开表, 是信息公开表不是处罚决定书书
限量: 单次返回银保监分局本级行政处罚中的指定页数的所有表格数据
输入参数
名称 | 类型 | 描述  
---|---|---  
page | int | page=5; 获取前 5 页数据, 并返回处理好后的数据框  
item | int | item="分局本级"; choice of {"机关", "本级", "分局本级"}  
begin | int | begin=1; 开始页面  
输出参数-分局本级
名称 | 类型 | 描述  
---|---|---  
行政处罚决定书文号 | - | -  
姓名 | - | -  
单位 | - | -  
单位名称 | - | -  
主要负责人姓名 | - | -  
主要违法违规事实（案由） | - | -  
行政处罚依据 | - | -  
行政处罚决定 | - | -  
作出处罚决定的机关名称 | - | -  
作出处罚决定的日期 | - | -  
接口示例
```
importakshareasak
bank_fjcf_table_detail_df = ak.bank_fjcf_table_detail(page=5, item="分局本级")
print(bank_fjcf_table_detail_df)

```

数据示例
```
   行政处罚决定书文号 ...       处罚公布日期
0  楚金罚决字〔2024〕9号 ... 2024-02-08 18:38:00
1  楚金罚决字〔2024〕8号 ... 2024-02-08 18:28:00
2  楚金罚决字〔2024〕7号 ... 2024-02-08 18:18:00
3  遵金罚决字〔2024〕4号 ... 2024-02-08 17:04:00
4  遵金罚决字〔2024〕3号 ... 2024-02-08 17:03:00
..       ... ...         ...
85 吉金监罚决字〔2024〕9号 ... 2024-02-02 12:19:02
86 吉金监罚决字〔2024〕8号 ... 2024-02-02 12:18:30
87 吉金监罚决字〔2024〕7号 ... 2024-02-02 12:17:47
88 吉金监罚决字〔2024〕6号 ... 2024-02-02 12:17:08
89 吉金监罚决字〔2024〕5号 ... 2024-02-02 11:47:50
[90 rows x 12 columns]

```

[ 上一页](data_dc_dc.html _AKShare 加密货币数据_.md) [下一页 ](data_article_article.html _AKShare 波动率数据_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.