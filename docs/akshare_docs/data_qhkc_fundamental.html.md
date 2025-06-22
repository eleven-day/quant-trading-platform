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
      * [商品](data_qhkc_commodity.html.md)
      * [席位](data_qhkc_broker.html.md)
      * [指数](data_qhkc_index_data.html.md)
      * [基本面](data_qhkc_fundamental.html.md)
        * [基差数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id2)
        * [期限结构](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id9)
        * [库存数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id16)
        * [利润数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id31)
        * [现货贸易商报价](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id38)
        * [跨期套利数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id45)
        * [自由价差数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id52)
        * [自由价比数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id59)
        * [仓单数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id66)
        * [仓单汇总数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id73)
        * [虚实盘比数据](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id80)
      * [工具](data_qhkc_tools.html.md)
      * [资金](data_qhkc_fund.html.md)
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
  * [AKShare 奇货可查](data_qhkc_index.html.md)
  * 基本面
  * [ 查看页面源码](_sources_data_qhkc_fundamental.md.txt.md)

# 基本面[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id1 "Link to this heading")
## 基差数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id2 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id3 "Link to this heading")
basis
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id4 "Link to this heading")
基差数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id5 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id6 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
spot | float | 现货价格  
basis | float | 基差，基差 = 现货价格 - 期货价格  
basis_rate | float | 基差率，基差率 = (现货价格 - 期货价格) / 现货价格 x 100%  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id7 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
basis_df = pro.basis(variety="RB", date="2018-08-08")
print(basis_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id8 "Link to this heading")
```
         basis
trans_date 2018-08-08
spot       4429
basis       193
basis_rate   4.35764

```

## 期限结构[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id9 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id10 "Link to this heading")
term_structure
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id11 "Link to this heading")
期限结构接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id12 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id13 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
code | string | 合约代号  
close | float | 收盘价  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id14 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
term_structure_df = pro.term_structure(variety="RB", date="2018-08-08")
print(term_structure_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id15 "Link to this heading")
```
  close  code
0  4200 rb1808
1  4322 rb1809
2  4236 rb1810
3  4191 rb1811
4  4139 rb1812
5  4094 rb1901
6  4017 rb1902
7  3987 rb1903
8  3977 rb1904
9  3918 rb1905
10  3889 rb1906
11  3881 rb1907

```

## 库存数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id16 "Link to this heading")
### 参数类型一[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id17 "Link to this heading")
#### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id18 "Link to this heading")
inventory
#### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id19 "Link to this heading")
库存数据接口-参数类型一
#### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id20 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
date | 查询日期 | 2018-08-08  
#### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id21 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
vol | float | 库存数据量  
#### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id22 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
inventory_df = pro.inventory(variety="RB", date="2018-08-08")
print(inventory_df)

```

#### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id23 "Link to this heading")
```
       inventory
trans_date 2018-08-08
vol       605.76

```

### 参数类型二[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id24 "Link to this heading")
#### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id25 "Link to this heading")
inventory
#### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id26 "Link to this heading")
库存数据接口-参数类型二
#### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id27 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
year | 查询年份 | 2019  
week_number | 该年第几周 | 10  
#### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id28 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
vol | float | 库存数据量  
#### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id29 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
inventory_df = pro.inventory(variety="RB", year="2019", week_number="10")
print(inventory_df)

```

#### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id30 "Link to this heading")
```
       inventory
trans_date 2019-03-07
vol      1326.64

```

## 利润数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id31 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id32 "Link to this heading")
profit
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id33 "Link to this heading")
利润数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id34 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
date | 查询日期 | 2018-12-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id35 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
profit | float | 利润，折盘面价格  
profit_rate | float | 利润率  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id36 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
profit_df = pro.profit(variety="RB", date="2019-12-12")
print(profit_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id37 "Link to this heading")
```
         profit
trans_date  2019-12-12
profit       559
profit_rate    16.58

```

## 现货贸易商报价[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id38 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id39 "Link to this heading")
trader_prices
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id40 "Link to this heading")
现货贸易商报价接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id41 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id42 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
name | string | 品种名称  
price | float | 贸易商报价  
band | string | 品牌  
model | string | 型号、规格  
unit | string | 单位  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id43 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
trader_prices_df = pro.trader_prices(variety="RB", date="2020-03-30")
print(trader_prices_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id44 "Link to this heading")
```
 band           model name price unit
0  永钢 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3500 元/吨
1  永钢 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3440 元/吨
2  永钢 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3440 元/吨
3  中新 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3320 元/吨
4  镔鑫 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3380 元/吨
5  永钢 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3470 元/吨
6  中天 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3490 元/吨
7  长达 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3400 元/吨
8  兴鑫 品种:Ⅲ级螺纹钢;牌号:HRB400;规格:Φ16 螺纹钢  3380 元/吨

```

## 跨期套利数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id45 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id46 "Link to this heading")
intertemporal_arbitrage
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id47 "Link to this heading")
跨期套利数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id48 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
code1 | 合约月份1 | 01  
code2 | 合约月份2 | 05  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id49 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
code1 | string | 合约1  
code2 | string | 合约2  
close1 | float | 合约1价格  
close2 | float | 合约2价格  
spread | float | 价差，合约1价格 - 合约2价格  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id50 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
intertemporal_arbitrage_df = pro.intertemporal_arbitrage(variety="RB", code1="01", code2="05", date="2018-08-08")
print(intertemporal_arbitrage_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id51 "Link to this heading")
```
      intertemporal_arbitrage
trans_date       2018-08-08
code1            rb1901
code2            rb1905
close1            4109
close2            3930
spread             179

```

## 自由价差数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id52 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id53 "Link to this heading")
free_spread
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id54 "Link to this heading")
自由价差数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id55 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety1 | 品种编码1 | RB  
code1 | 合约月份1 | 01  
variety2 | 品种编码2 | HC  
code2 | 合约月份2 | 01  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id56 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | string | 查询日期  
code1 | string | 合约代号1  
code2 | string | 合约代号2  
code1_close | float | 合约1价格  
code2_close | float | 合约2价格  
spread | float | 价差，合约1价格 - 合约2价格  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id57 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
free_spread_df = pro.free_spread(variety1="RB", code1="01", variety2="HC", code2="01", date="2018-08-08")
print(free_spread_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id58 "Link to this heading")
```
      free_spread
trans_date  2018-08-08
code1      rb1901
code2      hc1901
code1_close    4094
code2_close    4100
spread        -6

```

## 自由价比数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id59 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id60 "Link to this heading")
free_ratio
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id61 "Link to this heading")
自由价比数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id62 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety1 | 品种编码1 | RB  
code1 | 合约月份1 | 01  
variety2 | 品种编码2 | HC  
code2 | 合约月份2 | 01  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id63 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | string | 查询日期  
code1 | string | 合约代号1  
code2 | string | 合约代号2  
code1_close | float | 合约1价格  
code2_close | float | 合约2价格  
ratio | float | 价比，合约1价格 / 合约2价格  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id64 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
free_ratio_df = pro.free_ratio(variety1="RB", code1="01", variety2="HC", code2="01", date="2018-08-08")
print(free_ratio_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id65 "Link to this heading")
```
       free_ratio
trans_date  2018-08-08
code1      rb1901
code2      hc1901
code1_close    4094
code2_close    4100
ratio     0.998537

```

## 仓单数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id66 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id67 "Link to this heading")
warehouse_receipt
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id68 "Link to this heading")
仓单数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id69 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id70 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
total_vol | float | 仓单数据  
total_chge | float | 仓单变化量  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id71 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
warehouse_receipt_df = pro.warehouse_receipt(variety="RB", date="2018-08-08")
print(warehouse_receipt_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id72 "Link to this heading")
```
      warehouse_receipt
trans_date    2018-08-08
total_vol        3856
total_chge         0

```

## 仓单汇总数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id73 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id74 "Link to this heading")
warehouse_receipt
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id75 "Link to this heading")
仓单汇总数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id76 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id77 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
symbol | string | 品种编码  
total_vol | float | 仓单数据  
total_chge | float | 仓单变化量  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id78 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
warehouse_receipt_sum_df = pro.warehouse_receipt(date="2018-08-08")
print(warehouse_receipt_sum_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id79 "Link to this heading")
```
  symbol total_chge total_vol
0   RB      0    3856
1    J      0     10
2   HC      0    310
3   CF     39    9905
4   FG      0    1378
5   OI      0    4323
6   RM      0    200
7   SF      0    594
8   SR     402   37828
9   TA    -1009   11795
10   CU    -1658   79843
11   AL    1446   731544
12   ZN    -125    6950
13   PB     -25    7697
14   NI      0   15215
15   SN     29    5823
16   AU      0    1530
17   AG    1292  1394784
18   BU      0   128970
19   RU     720   491780
20   A      0   32586
21   C      0   37968
22   JD     -3     0
23   L      0    284
24   M      0    6543
25   PP      0    765
26   V      0    180
27   Y      0   33215
28   WH      0    414

```

## 虚实盘比数据[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id80 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id81 "Link to this heading")
virtual_real
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id82 "Link to this heading")
虚实盘比数据接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id83 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
variety | 品种编码 | RB  
code | 合约月份 | 10  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id84 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
trans_date | date | 查询日期  
code | string | 合约代号  
virtual | float | 虚盘量  
real | float | 实盘量  
rate | float | 虚实盘比  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id85 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
virtual_real_df = pro.virtual_real(variety="RB", code="10", date="2018-08-08")
print(virtual_real_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fundamental.html#id86 "Link to this heading")
```
      virtual_real
trans_date  2018-08-08
code       rb1810
virtual     1080026
real       385.6
rate       2800.9

```

[ 上一页](data_qhkc_index_data.html _指数_.md) [下一页 ](data_qhkc_tools.html _工具_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.