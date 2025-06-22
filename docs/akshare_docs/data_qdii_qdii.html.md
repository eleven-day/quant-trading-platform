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
      * [T+0 QDII 欧美市场](https://akshare.akfamily.xyz/data/qdii/qdii.html#t-0-qdii)
        * [欧美指数](https://akshare.akfamily.xyz/data/qdii/qdii.html#id1)
        * [欧美商品](https://akshare.akfamily.xyz/data/qdii/qdii.html#id2)
      * [T+0 QDII 亚洲市场](https://akshare.akfamily.xyz/data/qdii/qdii.html#id3)
        * [亚洲指数](https://akshare.akfamily.xyz/data/qdii/qdii.html#id4)
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
  * AKShare QDII 数据
  * [ 查看页面源码](_sources_data_qdii_qdii.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) QDII 数据[](https://akshare.akfamily.xyz/data/qdii/qdii.html#akshare-qdii "Link to this heading")
## T+0 QDII 欧美市场[](https://akshare.akfamily.xyz/data/qdii/qdii.html#t-0-qdii "Link to this heading")
### 欧美指数[](https://akshare.akfamily.xyz/data/qdii/qdii.html#id1 "Link to this heading")
接口: qdii_e_index_jsl
目标地址: https://www.jisilu.cn/data/qdii/#qdiia
描述: 集思录-T+0 QDII-欧美市场-欧美指数
限量: 单次返回所有数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
代码 | object |   
名称 | object |   
现价 | float64 |   
涨幅 | object |   
成交 | float64 | 注意单位: 万元  
场内份额 | int64 | 注意单位: 万份  
场内新增 | int64 | 注意单位: 万份  
T-2净值 | float64 |   
净值日期 | object |   
T-1估值 | float64 |   
估值日期 | object |   
T-1溢价率 | object |   
相关标的 | object |   
T-1指数涨幅 | object |   
申购费 | object |   
赎回费 | object |   
托管费 | float64 |   
基金公司 | object |   
接口示例
```
importakshareasak
qdii_e_index_jsl_df = ak.qdii_e_index_jsl()
print(qdii_e_index_jsl_df)

```

数据示例
```
   代码      名称   现价   涨幅 ...  申购费  赎回费 托管费 基金公司
0  513220    中概互联ETF 1.235  9.97% ...   -   - 0.65  招商基金
1  513360     教育ETF 0.537 10.04% ... 0.50% 0.50% 0.65  博时基金
2  159605    中概互联ETF 1.020  7.94% ...   -   - 0.60  广发基金
3  159607   中概互联网ETF 1.009  7.80% ... 0.00% 0.00% 0.60  嘉实基金
4  513050   中概互联网ETF 1.306  7.22% ... 0.50% 0.50% 0.85  易方达
5  164906   中概互联网LOF 1.180  8.76% ... 1.20% 1.50% 1.45 交银施罗德
6  159822    新经济ETF 0.682  7.06% ...   -   - 0.35  银华基金
7  159509    纳指科技ETF 1.454 -1.69% ...   -   - 1.05  景顺长城
8  161128   标普信息科技LOF 4.609 -1.77% ... 1.20% 1.50% 1.05  易方达
9  159518    标普油气ETF 0.910  2.59% ... 0.50%  0.5% 0.60  嘉实基金
10 513300    纳斯达克ETF 1.770 -1.17% ... 0.50% 0.50% 0.80  华夏基金
11 513350    标普油气ETF 0.947  2.71% ...  0.5%  0.5% 0.60  富国基金
12 513500   标普500ETF 1.908 -0.57% ... 0.50% 0.50% 0.85  博时基金
13 159502   标普生物科技ETF 1.036  0.88% ... 0.50%  0.5% 0.60  嘉实基金
14 513290   纳指生物科技ETF 1.217  1.25% ...   -   - 0.65  汇添富
15 159655     标普ETF 1.461 -0.14% ... 0.50% 0.50% 0.75  华夏基金
16 159612   标普500ETF 1.497 -0.86% ... 0.50%  0.5% 0.75  国泰基金
17 513730   东南亚科技ETF 1.238  0.65% ...   -   - 0.50  华泰柏瑞
18 159529    标普消费ETF 1.151  1.41% ...   -   - 0.70  景顺长城
19 161126   标普医疗保健LOF 1.955  0.26% ... 1.20% 1.50% 1.05  易方达
20 513850    美国50ETF 1.266  0.00% ...   -   - 0.60  易方达
21 513650  标普500ETF基金 1.447  0.35% ...   -   - 0.75  南方基金
22 159632    纳斯达克ETF 1.607  0.25% ...   -   - 0.80  华安基金
23 159941     纳指ETF 1.064 -0.47% ...   -   - 1.05  广发基金
24 159659  纳斯达克100ETF 1.505 -0.13% ...   -   - 0.65  招商基金
25 159696   纳指ETF易方达 1.300 -0.38% ...   -   - 0.60  易方达
26 513030     德国ETF 1.449  1.54% ...   -   - 1.00  华安基金
27 513100     纳指ETF 1.409 -0.35% ... 0.50% 0.50% 0.80  国泰基金
28 513400    道琼斯ETF 1.060  1.05% ...   -   - 0.65  鹏华基金
29 159561     德国ETF 1.059  1.05% ...   -   - 0.60  嘉实基金
30 513080  法国CAC40ETF 1.594  1.40% ...   -   - 0.65  华安基金
31 513390   纳指100ETF 1.568 -0.32% ...   -   - 0.65  博时基金
32 159501   纳斯达克指数ETF 1.315 -0.38% ... 0.50%  0.5% 0.60  嘉实基金
33 159577    美国50ETF 1.135 -0.26% ...   -   - 0.65  汇添富
34 513110  纳斯达克100ETF 1.615 -0.19% ... 0.50% 0.50% 1.00  华泰柏瑞
35 159660   纳指100ETF 1.529 -0.39% ...   -   - 0.65  汇添富
36 513870    纳指ETF富国 1.329  0.00% ...   -   - 0.60  富国基金
37 159513 纳斯达克100指数ETF 1.182 -0.08% ...   -   - 1.05  大成基金
38 161127   标普生物科技LOF 1.399  0.21% ... 1.20% 1.50% 1.05  易方达
39 501300    美元债LOF 0.936 -0.32% ... 0.80% 1.50% 0.80  海富通
40 161125   标普500LOF 2.449  0.00% ... 1.20% 1.50% 1.05  易方达
41 162415    美国消费LOF 2.553  0.20% ... 1.20% 1.50% 1.25  华宝基金
42 161130  纳斯达克100LOF 3.159 -0.63% ... 1.20% 1.50% 0.60  易方达
43 160140  美国REIT精选LOF 1.307  0.08% ... 1.20% 1.50% 1.05  南方基金
44 501312    海外科技LOF 1.368  0.74% ... 1.20% 1.50% 1.20  华宝基金
45 164824    印度基金LOF 1.596 -1.54% ... 1.20% 1.50% 1.80  工银瑞信
46 501225    全球芯片LOF 1.353  3.28% ... 1.50% 1.50% 1.45  景顺长城
47 160644   港美互联网LOF 1.265  1.04% ... 1.50% 1.50% 1.80  鹏华基金
48 159329     沙特ETF 1.008 -0.88% ...   -   - 0.60  南方基金
49 159687    亚太精选ETF 1.285 -0.16% ...   -   - 0.25  南方基金
50 520830     沙特ETF 1.002 -0.40% ...   -   - 0.60  华泰柏瑞
[51 rows x 18 columns]

```

### 欧美商品[](https://akshare.akfamily.xyz/data/qdii/qdii.html#id2 "Link to this heading")
接口: qdii_e_comm_jsl
目标地址: https://www.jisilu.cn/data/qdii/#qdiia
描述: 集思录-T+0 QDII-欧美市场-欧美商品
限量: 单次返回所有数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
代码 | object |   
名称 | object |   
现价 | float64 |   
涨幅 | object |   
成交 | float64 | 注意单位: 万元  
场内份额 | int64 | 注意单位: 万份  
场内新增 | int64 | 注意单位: 万份  
T-2净值 | float64 |   
净值日期 | object |   
T-1估值 | float64 |   
估值日期 | object |   
T-1溢价率 | object |   
相关标的 | object |   
T-1指数涨幅 | object |   
申购费 | object |   
赎回费 | object |   
托管费 | float64 |   
基金公司 | object |   
接口示例
```
importakshareasak
qdii_e_comm_jsl_df = ak.qdii_e_comm_jsl()
print(qdii_e_comm_jsl_df)

```

数据示例
```
  代码     名称   现价   涨幅 ...  申购费 赎回费 托管费 基金公司
0  161129  原油LOF易方达 1.341  2.60% ... 1.20% 1.50% 1.25  易方达
1  161116  黄金主题LOF 1.082 -0.46% ...   0 1.50% 1.40  易方达
2  501018  南方原油LOF 1.194  2.58% ... 1.20% 1.50% 1.28 南方基金
3  160723  嘉实原油LOF 1.387  2.06% ... 1.20% 1.50% 1.28 嘉实基金
4  161815   抗通胀LOF 0.753  0.40% ... 1.60% 1.50% 2.15 银华基金
5  164701   黄金LOF 1.111 -0.45% ... 0.80% 1.50% 1.26  汇添富
6  160216  国泰商品LOF 0.513  0.20% ... 1.50% 1.50% 1.85 国泰基金
7  160416  石油基金LOF 1.615  0.56% ... 0.00% 1.50% 1.28 华安基金
8  163208 全球油气能源LOF 0.983  2.93% ... 1.50% 1.50% 1.85 诺安基金
9  165513 中信保诚商品LOF 0.704 -0.14% ... 1.60% 1.50% 2.05 信诚基金
10 162719   石油LOF 2.222  2.44% ... 1.20% 1.50% 1.30 广发基金
11 160719  嘉实黄金LOF 1.285 -0.16% ... 0.80% 1.50% 1.26 嘉实基金
12 162411  华宝油气LOF 0.719  3.01% ... 1.50% 1.50% 1.28 华宝基金
[13 rows x 18 columns]

```

## T+0 QDII 亚洲市场[](https://akshare.akfamily.xyz/data/qdii/qdii.html#id3 "Link to this heading")
### 亚洲指数[](https://akshare.akfamily.xyz/data/qdii/qdii.html#id4 "Link to this heading")
接口: qdii_a_index_jsl
目标地址: https://www.jisilu.cn/data/qdii/#qdiia
描述: 集思录-T+0 QDII-亚洲市场-亚洲指数
限量: 单次返回所有数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
代码 | object |   
名称 | object |   
现价 | float64 |   
涨幅 | object |   
成交 | float64 | 注意单位: 万元  
场内份额 | int64 | 注意单位: 万份  
场内新增 | int64 | 注意单位: 万份  
净值 | float64 |   
净值日期 | object |   
估值 | float64 |   
溢价率 | object |   
相关标的 | object |   
指数涨幅 | object |   
申购费 | object |   
赎回费 | object |   
托管费 | float64 |   
基金公司 | object |   
接口示例
```
importakshareasak
qdii_a_index_jsl_df = ak.qdii_a_index_jsl()
print(qdii_a_index_jsl_df)

```

数据示例
```
   代码     名称  现价  涨幅 ...  申购费  赎回费  托管费 基金公司
0  164705    恒生LOF 1.089 10.00% ... 1.20% 1.50% 1.05  汇添富
1  513230   港股消费ETF 0.970  9.98% ...  0.5%  0.5% 0.60 华夏基金
2  513990   港股通ETF 1.001 10.00% ...   -   - 0.25 招商基金
3  159850   恒生国企ETF 0.791 10.01% ... 0.50% 0.50% 0.65 华夏基金
4  159567  港股创新药ETF 1.111 10.00% ...   -   - 0.60 银华基金
..   ...     ...  ...   ... ...  ...  ...  ...  ...
104 520890 港股通红利低波ETF 1.128  5.32% ... 0.50% 0.50% 0.60 华泰柏瑞
105 501307  银河高股息LOF 1.059  5.37% ... 1.00% 1.50% 0.68 银河基金
106 501310   价值基金LOF 1.118  4.39% ... 1.20% 1.50% 0.90 华宝基金
107 513090   香港证券ETF 1.279  9.97% ... 0.50% 0.50% 0.20  易方达
108 513800  日本东证指数ETF 1.387 -0.07% ...   -   - 0.25 南方基金
[109 rows x 17 columns]

```

[ 上一页](data_nlp_nlp.html _AKShare 自然语言处理_.md) [下一页 ](data_others_others.html _AKShare 另类数据_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.