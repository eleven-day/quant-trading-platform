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
      * [99 现货走势](https://akshare.akfamily.xyz/data/spot/spot.html#id1)
      * [上海黄金交易所](https://akshare.akfamily.xyz/data/spot/spot.html#id2)
        * [历史行情数据](https://akshare.akfamily.xyz/data/spot/spot.html#id3)
        * [实时行情数据](https://akshare.akfamily.xyz/data/spot/spot.html#id4)
        * [上海金基准价](https://akshare.akfamily.xyz/data/spot/spot.html#id5)
        * [上海银基准价](https://akshare.akfamily.xyz/data/spot/spot.html#id6)
      * [生猪大数据](https://akshare.akfamily.xyz/data/spot/spot.html#id7)
        * [各省均价实时排行榜](https://akshare.akfamily.xyz/data/spot/spot.html#id8)
        * [今年以来全国出栏均价走势](https://akshare.akfamily.xyz/data/spot/spot.html#id9)
        * [全国瘦肉型肉猪](https://akshare.akfamily.xyz/data/spot/spot.html#id10)
        * [全国三元仔猪](https://akshare.akfamily.xyz/data/spot/spot.html#id11)
        * [全国后备二元母猪](https://akshare.akfamily.xyz/data/spot/spot.html#id12)
        * [全国玉米价格走势](https://akshare.akfamily.xyz/data/spot/spot.html#id13)
        * [全国豆粕价格走势](https://akshare.akfamily.xyz/data/spot/spot.html#id14)
        * [全国育肥猪合料（含自配料）半月走势](https://akshare.akfamily.xyz/data/spot/spot.html#id15)
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
  * AKShare 现货数据
  * [ 查看页面源码](_sources_data_spot_spot.md.txt.md)

# [AKShare](https://github.com/akfamily/akshare) 现货数据[](https://akshare.akfamily.xyz/data/spot/spot.html#akshare "Link to this heading")
## 99 现货走势[](https://akshare.akfamily.xyz/data/spot/spot.html#id1 "Link to this heading")
接口: spot_price_qh
目标地址: https://www.99qh.com/data/spotTrend
描述: 99 期货-数据-期现-现货走势
限量: 单次返回指定 symbol 的所有历史数据；由于数据源限制，只能获取个别品种
输入参数
名称 | 类型 | 描述  
---|---|---  
symbol | str | symbol="螺纹钢"; 可以通过 ak.spot_price_table_qh() 获取品种表  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
期货收盘价 | float64 | -  
现货价格 | float64 | -  
接口示例
```
importakshareasak
spot_price_qh_df = ak.spot_price_qh(symbol='螺纹钢')
print(spot_price_qh_df)

```

数据示例
```
     日期 期货收盘价 现货价格
0   2012-10-31  3700 3811
1   2012-11-01  3776 3811
2   2012-11-08  3900 3811
3   2012-11-09  3750 3806
4   2012-11-14  3810 3761
...     ...  ...  ...
2466 2024-05-10  3662 3561
2467 2024-05-13  3686 3545
2468 2024-05-14  3630 3552
2469 2024-05-15  3621 3530
2470 2024-05-16  3703 3533
[2471 rows x 3 columns]

```

## 上海黄金交易所[](https://akshare.akfamily.xyz/data/spot/spot.html#id2 "Link to this heading")
### 历史行情数据[](https://akshare.akfamily.xyz/data/spot/spot.html#id3 "Link to this heading")
接口: spot_hist_sge
目标地址: https://www.sge.com.cn/sjzx/mrhq
描述: 上海黄金交易所-数据资讯-行情走势-历史数据
限量: 单次返回指定 symbol 的所有历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
symbol | str | symbol="Au99.99"; 可以通过 ak.spot_symbol_table_sge() 获取品种表  
输出参数
名称 | 类型 | 描述  
---|---|---  
date | object | -  
open | float64 | -  
close | float64 | -  
low | float64 | -  
high | float64 | -  
接口示例
```
importakshareasak
spot_hist_sge_df = ak.spot_hist_sge(symbol='Au99.99')
print(spot_hist_sge_df)

```

数据示例
```
      date  open  close   low  high
0   2016-12-19 262.45 262.76 262.02 263.50
1   2016-12-20 262.88 262.06 261.42 263.70
2   2016-12-21 262.40 260.97 258.60 262.65
3   2016-12-22 261.18 260.00 259.05 261.18
4   2016-12-23 258.95 260.07 258.70 260.37
...     ...   ...   ...   ...   ...
1775 2024-04-15 567.01 558.68 556.00 576.99
1776 2024-04-16 559.00 562.50 552.66 569.00
1777 2024-04-17 562.61 564.46 562.02 569.00
1778 2024-04-18 566.30 563.37 558.80 568.00
1779 2024-04-19 562.80 565.55 561.00 573.96
[1780 rows x 5 columns]

```

### 实时行情数据[](https://akshare.akfamily.xyz/data/spot/spot.html#id4 "Link to this heading")
接口: spot_quotations_sge
目标地址: https://www.sge.com.cn/
描述: 上海黄金交易所-数据资讯-行情走势-实时数据
限量: 单次返回指定 symbol 的所有行情数据
输入参数
名称 | 类型 | 描述  
---|---|---  
symbol | str | symbol="Au99.99"; 可以通过 ak.spot_symbol_table_sge() 获取品种表  
输出参数
名称 | 类型 | 描述  
---|---|---  
品种 | object | -  
时间 | object | -  
现价 | float64 | -  
更新时间 | object | -  
接口示例
```
importakshareasak
spot_quotations_sge_df = ak.spot_quotations_sge(symbol="Au99.99")
print(spot_quotations_sge_df)

```

数据示例
```
   品种    时间   现价         更新时间
0  Au99.99 00:00:00 755.0 2025年04月14日 22:28:55
1  Au99.99 00:01:00 755.0 2025年04月14日 22:28:55
2  Au99.99 00:02:00 755.0 2025年04月14日 22:28:55
3  Au99.99 00:03:00 755.0 2025年04月14日 22:28:55
4  Au99.99 00:04:00 755.0 2025年04月14日 22:28:55
..    ...    ...  ...          ...
686 Au99.99 22:24:00 760.0 2025年04月14日 22:28:55
687 Au99.99 22:25:00 760.0 2025年04月14日 22:28:55
688 Au99.99 22:26:00 760.0 2025年04月14日 22:28:55
689 Au99.99 22:27:00 760.0 2025年04月14日 22:28:55
690 Au99.99 22:28:00 760.0 2025年04月14日 22:28:55
[691 rows x 4 columns]

```

### 上海金基准价[](https://akshare.akfamily.xyz/data/spot/spot.html#id5 "Link to this heading")
接口: spot_golden_benchmark_sge
目标地址: https://www.sge.com.cn/sjzx/jzj
描述: 上海黄金交易所-数据资讯-上海金基准价-历史数据
限量: 单次返回所有历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
交易时间 | object | -  
晚盘价 | float64 | -  
早盘价 | float64 | -  
接口示例
```
importakshareasak
spot_golden_benchmark_sge_df = ak.spot_golden_benchmark_sge()
print(spot_golden_benchmark_sge_df)

```

数据示例
```
   交易时间   晚盘价   早盘价
0   2016-04-18 257.29 256.92
1   2016-04-19 259.97 261.15
2   2016-04-20 261.82 260.39
3   2016-04-21 260.41 261.32
4   2016-04-24 258.80 258.42
     ...   ...   ...
1801 2023-09-10 467.92 468.49
1802 2023-09-11 468.62 468.20
1803 2023-09-12 470.00 469.14
1804 2023-09-13 474.58 474.68
1805 2023-09-14 470.43 479.08
[1806 rows x 3 columns]

```

### 上海银基准价[](https://akshare.akfamily.xyz/data/spot/spot.html#id6 "Link to this heading")
接口: spot_silver_benchmark_sge
目标地址: https://www.sge.com.cn/sjzx/shyjzj
描述: 上海黄金交易所-数据资讯-上海银基准价-历史数据
限量: 单次返回所有历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
交易时间 | object | -  
晚盘价 | float64 | -  
早盘价 | float64 | -  
接口示例
```
importakshareasak
spot_silver_benchmark_sge_df = ak.spot_silver_benchmark_sge()
print(spot_silver_benchmark_sge_df)

```

数据示例
```
   交易时间   晚盘价   早盘价
0  2019-10-13 4286.0 4284.0
1  2019-10-14 4286.0 4301.0
2  2019-10-15 4222.0 4270.0
3  2019-10-16 4261.0 4244.0
4  2019-10-17 4271.0 4271.0
..     ...   ...   ...
953 2023-09-10 5776.0 5773.0
954 2023-09-11 5773.0 5798.0
955 2023-09-12 5783.0 5791.0
956 2023-09-13 5890.0 5881.0
957 2023-09-14 5870.0 5928.0
[958 rows x 3 columns]

```

## 生猪大数据[](https://akshare.akfamily.xyz/data/spot/spot.html#id7 "Link to this heading")
### 各省均价实时排行榜[](https://akshare.akfamily.xyz/data/spot/spot.html#id8 "Link to this heading")
接口: spot_hog_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-各省均价实时排行榜
限量: 单次返回所有实时数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
省份 | object | -  
价格 | float64 | -  
涨跌幅 | float64 | -  
接口示例
```
importakshareasak
spot_hog_soozhu_df = ak.spot_hog_soozhu()
print(spot_hog_soozhu_df)

```

数据示例
```
   省份 价格  涨跌幅
0  河北 19.49 0.12
1  辽宁 19.25 0.28
2  山东 19.68 0.21
3  黑龙江 18.79 0.04
4  河南 19.53 0.41
5  湖南 20.64 0.72
6  吉林 19.28 0.26
7  山西 19.43 0.43
8  安徽 20.00 0.39
9  四川 19.20 0.24
10  江西 21.10 0.65
11  甘肃 19.00 -0.15
12  湖北 19.70 0.14
13  浙江 21.00 0.94
14  江苏 20.15 0.55
15  陕西 20.00 0.70
16  广东 20.80 -0.36
17  新疆 17.80 -0.28
18  北京 19.44 0.14
19  天津 19.34 0.14
20 内蒙古 18.86 0.04
21  福建 20.44 0.10
22  广西 20.33 0.14
23  海南 20.98 0.14
24  宁夏 19.20 0.00
25  重庆 18.76 0.14
26  云南 18.98 0.07
27  贵州 19.18 -0.16

```

### 今年以来全国出栏均价走势[](https://akshare.akfamily.xyz/data/spot/spot.html#id9 "Link to this heading")
接口: spot_hog_year_trend_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-今年以来全国出栏均价走势
限量: 单次返回近一年所有历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_hog_year_trend_soozhu_df = ak.spot_hog_year_trend_soozhu()
print(spot_hog_year_trend_soozhu_df)

```

数据示例
```
     日期   价格
0  2024-01-16 13.81
1  2024-01-17 14.10
2  2024-01-18 14.04
3  2024-01-19 13.79
4  2024-01-20 13.67
..     ...  ...
195 2024-07-29 19.38
196 2024-07-30 19.48
197 2024-07-31 19.66
198 2024-08-01 19.78
199 2024-08-02 19.85
[200 rows x 2 columns]

```

### 全国瘦肉型肉猪[](https://akshare.akfamily.xyz/data/spot/spot.html#id10 "Link to this heading")
接口: spot_hog_lean_price_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-全国瘦肉型肉猪
限量: 单次返回近半个月的历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_hog_lean_price_soozhu_df = ak.spot_hog_lean_price_soozhu()
print(spot_hog_lean_price_soozhu_df)

```

数据示例
```
    日期   价格
0  2024-07-21 19.15
1  2024-07-22 19.21
2  2024-07-23 19.38
3  2024-07-24 19.41
4  2024-07-25 19.38
5  2024-07-26 19.32
6  2024-07-27 19.27
7  2024-07-28 19.30
8  2024-07-29 19.38
9  2024-07-30 19.48
10 2024-07-31 19.66
11 2024-08-01 19.78
12 2024-08-02 19.85
13 2024-08-03 19.85
14 2024-08-04 19.80

```

### 全国三元仔猪[](https://akshare.akfamily.xyz/data/spot/spot.html#id11 "Link to this heading")
接口: spot_hog_three_way_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-全国三元仔猪
限量: 单次返回近半个月的历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_hog_three_way_soozhu_df = ak.spot_hog_three_way_soozhu()
print(spot_hog_three_way_soozhu_df)

```

数据示例
```
     日期   价格
0  2024-07-23 707.29
1  2024-07-24 696.21
2  2024-07-25 674.69
3  2024-07-26 702.08
4  2024-07-27 715.67
5  2024-07-28 722.33
6  2024-07-29 692.26
7  2024-07-30 673.71
8  2024-07-31 684.41
9  2024-08-01 687.30
10 2024-08-02 709.69
11 2024-08-03 679.75
12 2024-08-04 694.00
13 2024-08-05 706.33
14 2024-08-06 718.02

```

### 全国后备二元母猪[](https://akshare.akfamily.xyz/data/spot/spot.html#id12 "Link to this heading")
接口: spot_hog_crossbred_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-全国后备二元母猪
限量: 单次返回近半个月的历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_hog_crossbred_soozhu_df = ak.spot_hog_crossbred_soozhu()
print(spot_hog_crossbred_soozhu_df)

```

数据示例
```
    日期    价格
0  2024-07-26 1945.83
1  2024-07-27 2678.44
2  2024-07-28 2704.33
3  2024-07-29 1852.07
4  2024-07-30 1833.00
5  2024-07-31 1837.78
6  2024-08-01 1966.08
7  2024-08-02 1943.75
8  2024-08-03 2872.67
9  2024-08-04 2695.44
10 2024-08-05 1905.15
11 2024-08-06 1914.64
12 2024-08-07 1830.65
13 2024-08-08 1991.06
14 2024-08-09 1960.00

```

### 全国玉米价格走势[](https://akshare.akfamily.xyz/data/spot/spot.html#id13 "Link to this heading")
接口: spot_corn_price_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-全国玉米价格走势
限量: 单次返回近半个月的历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_corn_price_soozhu_df = ak.spot_corn_price_soozhu()
print(spot_corn_price_soozhu_df)

```

数据示例
```
     日期  价格
0  2024-07-27 2.50
1  2024-07-28 2.47
2  2024-07-29 2.51
3  2024-07-30 2.45
4  2024-07-31 2.43
5  2024-08-01 2.41
6  2024-08-02 2.45
7  2024-08-03 2.52
8  2024-08-04 2.36
9  2024-08-05 2.45
10 2024-08-06 2.45
11 2024-08-07 2.46
12 2024-08-08 2.40
13 2024-08-09 2.45
14 2024-08-10 2.57

```

### 全国豆粕价格走势[](https://akshare.akfamily.xyz/data/spot/spot.html#id14 "Link to this heading")
接口: spot_soybean_price_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-全国豆粕价格走势
限量: 单次返回近半个月的历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_soybean_price_soozhu_df = ak.spot_soybean_price_soozhu()
print(spot_soybean_price_soozhu_df)

```

数据示例
```
     日期  价格
0  2024-07-28 3.53
1  2024-07-29 3.32
2  2024-07-30 3.35
3  2024-07-31 3.36
4  2024-08-01 3.35
5  2024-08-02 3.38
6  2024-08-03 3.55
7  2024-08-04 3.52
8  2024-08-05 3.32
9  2024-08-06 3.40
10 2024-08-07 3.33
11 2024-08-08 3.22
12 2024-08-09 3.25
13 2024-08-10 3.41
14 2024-08-11 3.18

```

### 全国育肥猪合料（含自配料）半月走势[](https://akshare.akfamily.xyz/data/spot/spot.html#id15 "Link to this heading")
接口: spot_mixed_feed_soozhu
目标地址: https://www.soozhu.com/price/data/center/
描述: 搜猪-生猪大数据-全国育肥猪合料（含自配料）半月走势
限量: 单次返回近半个月的历史数据
输入参数
名称 | 类型 | 描述  
---|---|---  
- | - | -  
输出参数
名称 | 类型 | 描述  
---|---|---  
日期 | object | -  
价格 | float64 | -  
接口示例
```
importakshareasak
spot_mixed_feed_soozhu_df = ak.spot_mixed_feed_soozhu()
print(spot_mixed_feed_soozhu_df)

```

数据示例
```
     日期  价格
0  2024-07-29 3.24
1  2024-07-30 3.11
2  2024-07-31 3.24
3  2024-08-01 3.18
4  2024-08-02 3.26
5  2024-08-03 3.35
6  2024-08-04 3.46
7  2024-08-05 3.27
8  2024-08-06 3.19
9  2024-08-07 3.25
10 2024-08-08 3.07
11 2024-08-09 3.30
12 2024-08-10 3.55
13 2024-08-11 3.42
14 2024-08-12 3.22

```

[ 上一页](data_currency_currency.html _AKShare 货币数据_.md) [下一页 ](data_interest_rate_interest_rate.html _AKShare 利率数据_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.