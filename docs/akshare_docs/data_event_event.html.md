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
      * [迁徙数据-百度](https://akshare.akfamily.xyz/data/event/event.html#id1)
        * [迁入与迁出地详情](https://akshare.akfamily.xyz/data/event/event.html#id2)
        * [迁徙规模](https://akshare.akfamily.xyz/data/event/event.html#id3)
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
  * AKShare 迁徙数据
  * [ 查看页面源码](_sources_data_event_event.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 迁徙数据[](https://akshare.akfamily.xyz/data/event/event.html#akshare "Link to this heading")
## 迁徙数据-百度[](https://akshare.akfamily.xyz/data/event/event.html#id1 "Link to this heading")
### 迁入与迁出地详情[](https://akshare.akfamily.xyz/data/event/event.html#id2 "Link to this heading")
接口: migration_area_baidu
目标地址: https://qianxi.baidu.com/?from=shoubai#city=0
描述: 百度-百度地图慧眼-百度迁徙-迁入/迁出地数据接口
限量: 单次返回前 100 个城市的数据
输入参数
名称 | 类型 | 描述  
---|---|---  
area | str | area="乌鲁木齐市", 输入需要查询的省份或者城市, 都需要用全称, 比如: "浙江省", "乌鲁木齐市"  
indicator | str | indicator="move_in", 返回迁入地详情, indicator="move_out", 返回迁出地详情  
date | str | date="20230922", 需要滞后一天  
输出参数
名称 | 类型 | 描述  
---|---|---  
city_name | object | 城市名称  
province_name | object | 所属省份  
value | float64 | 迁徙规模, 比例  
接口示例
```
importakshareasak
migration_area_baidu_df = ak.migration_area_baidu(area="重庆市", indicator="move_in", date="20230922")
print(migration_area_baidu_df)

```

数据示例
```
   city_name province_name value
0     苏州市      江苏省 24.43
1     嘉兴市      浙江省  6.46
2     杭州市      浙江省  5.09
3     南通市      江苏省  4.94
4     无锡市      江苏省  3.90
..     ...      ...  ...
95     淄博市      山东省  0.10
96 恩施土家族苗族自治州      湖北省  0.10
97     惠州市      广东省  0.10
98     汕头市      广东省  0.10
99   大理白族自治州      云南省  0.10
[100 rows x 3 columns]

```

### 迁徙规模[](https://akshare.akfamily.xyz/data/event/event.html#id3 "Link to this heading")
接口: migration_scale_baidu
目标地址: https://qianxi.baidu.com/?from=shoubai#city=0
描述: 百度-百度地图慧眼-百度迁徙-迁徙规模
  * 迁徙规模指数：反映迁入或迁出人口规模，城市间可横向对比
  * 城市迁徙边界采用该城市行政区划，包含该城市管辖的区、县、乡、村

限量: 单次返回所有迁徙规模数据
输入参数
名称 | 类型 | 描述  
---|---|---  
area | str | area="广州市", 输入需要查询的省份或者城市, 都需要用全称, 比如: "浙江省", "乌鲁木齐市"  
indicator | str | indicator="move_in", 返回迁入地详情, indicator="move_out", 返回迁出地详情  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
迁徙规模指数 | float64 | 定义参见百度  
接口示例
```
importakshareasak
migration_scale_baidu_df = ak.migration_scale_baidu(area="广州市", indicator="move_in")
print(migration_scale_baidu_df)

```

数据示例
```
     日期   迁徙规模指数
0   2019-01-12  8.413535
1   2019-01-13  7.877218
2   2019-01-14  8.920660
3   2019-01-15  7.426858
4   2019-01-16  7.339183
     ...    ...
1100 2023-09-18 13.620539
1101 2023-09-19  9.761666
1102 2023-09-20  9.755867
1103 2023-09-21 10.397938
1104 2023-09-22 10.492319
[1105 rows x 2 columns]

```

[ 上一页](data_energy_energy.html _AKShare 能源数据_.md) [下一页 ](data_hf_hf.html _AKShare 高频数据_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.