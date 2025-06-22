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
      * [知识图谱](https://akshare.akfamily.xyz/data/nlp/nlp.html#id1)
      * [智能问答](https://akshare.akfamily.xyz/data/nlp/nlp.html#id2)
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
  * AKShare 自然语言处理
  * [ 查看页面源码](_sources_data_nlp_nlp.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 自然语言处理[](https://akshare.akfamily.xyz/data/nlp/nlp.html#akshare "Link to this heading")
## 知识图谱[](https://akshare.akfamily.xyz/data/nlp/nlp.html#id1 "Link to this heading")
接口: nlp_ownthink
目标地址: https://ownthink.com/
描述: 思知-知识图谱的接口, 以此来查询知识图谱数据
限量: 单次返回查询的数据结果
输入参数
名称 | 类型 | 描述  
---|---|---  
word | str | word="人工智能"  
indicator | str | indicator="entity"; Please refer **Indicator Info** table  
Indicator Info
fields | type | description  
---|---|---  
entity | str | 实体名  
desc | str | 实体简介  
tag | list | 实体标签  
avg | pandas.DataFrame | 实体属性值，第一列为实体的属性，第二列为实体属性所对应的值  
输出参数-entity
名称 | 类型 | 描述  
---|---|---  
- | str | 结果  
接口示例-entity
```
importakshareasak
nlp_ownthink_df = ak.nlp_ownthink(word="人工智能", indicator="entity")
print(nlp_ownthink_df)

```

数据示例-entity
```
人工智能[计算机科学的一个分支]

```

输出参数-desc
名称 | 类型 | 描述  
---|---|---  
- | str | 结果  
接口示例-desc
```
importakshareasak
nlp_ownthink_df = ak.nlp_ownthink(word="人工智能", indicator="desc")
print(nlp_ownthink_df)

```

数据示例-desc
```
人工智能（Artificial Intelligence），英文缩写为AI。

```

输出参数-avg
名称 | 类型 | 描述  
---|---|---  
- | str | 结果  
接口示例-avg
```
importakshareasak
nlp_ownthink_df = ak.nlp_ownthink(word="人工智能", indicator="avg")
print(nlp_ownthink_df)

```

数据示例-avg
```
   字段            值
0  中文名          人工智能
1  外文名 ARTIFICIALINTELLIGENCE
2  简称           AI
3 提出时间          1956年
4 提出地点       DARTMOUTH学会
5 名称来源       雨果·德·加里斯的著作

```

输出参数-tag
名称 | 类型 | 描述  
---|---|---  
- | list | 结果  
接口示例-tag
```
importakshareasak
nlp_ownthink_df = ak.nlp_ownthink(word="人工智能", indicator="tag")
print(nlp_ownthink_df)

```

数据示例-tag
```
['中国通信学会', '学科']

```

## 智能问答[](https://akshare.akfamily.xyz/data/nlp/nlp.html#id2 "Link to this heading")
接口: nlp_answer
目标地址: https://ownthink.com/robot.html
描述: 思知-对话机器人的接口, 以此来进行智能问答
限量: 单次返回查询的数据结果
输入参数
名称 | 类型 | 描述  
---|---|---  
question | str | question="姚明的身高"  
输出参数
名称 | 类型 | 描述  
---|---|---  
- | str | 答案  
接口示例
```
importakshareasak
nlp_answer_df = ak.nlp_answer(question="姚明的身高")
print(nlp_answer_df)

```

数据示例
```
姚明的身高是226厘米

```

[ 上一页](data_hf_hf.html _AKShare 高频数据_.md) [下一页 ](data_qdii_qdii.html _AKShare QDII 数据_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.