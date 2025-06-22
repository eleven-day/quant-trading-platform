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
      * [工具](data_qhkc_tools.html.md)
      * [资金](data_qhkc_fund.html.md)
        * [每日净流多列表(商品)](https://akshare.akfamily.xyz/data/qhkc/fund.html#id2)
        * [每日净流空列表(商品)](https://akshare.akfamily.xyz/data/qhkc/fund.html#id9)
        * [每日净流多列表(指数)](https://akshare.akfamily.xyz/data/qhkc/fund.html#id16)
        * [每日净流空列表(指数)](https://akshare.akfamily.xyz/data/qhkc/fund.html#id23)
        * [每日商品保证金沉淀变化](https://akshare.akfamily.xyz/data/qhkc/fund.html#id30)
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
  * 资金
  * [ 查看页面源码](_sources_data_qhkc_fund.md.txt.md)

# 资金[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id1 "Link to this heading")
## 每日净流多列表(商品)[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id2 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id3 "Link to this heading")
commodity_flow_long
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id4 "Link to this heading")
每日净流多列表（商品）接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id5 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id6 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
broker | string | 席位  
money | float | 流多资金，单位元  
variety | string | 品种编码  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id7 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
commodity_flow_long_df = pro.commodity_flow_long(date="2018-08-08")
print(commodity_flow_long_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id8 "Link to this heading")
```
 broker    money variety
0  浙商期货 78975156.0    J
1  华泰期货 63497619.0   RB
2  大地期货 55812816.0   RB
3  中国国际 50224588.2   RB
4  海证期货 41670190.8   RB
5  新湖期货 39482177.0   CU
6  国投安信 39439456.2   RB
7  东海期货 34120575.0   RB
8  弘业期货 33741000.0    J
9  中辉期货 33432132.0    J

```

## 每日净流空列表(商品)[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id9 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id10 "Link to this heading")
commodity_flow_short
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id11 "Link to this heading")
每日净流空列表(商品)接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id12 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id13 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
broker | string | 席位  
money | float | 流空资金，单位元  
variety | string | 品种编码  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id14 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
commodity_flow_short_df = pro.commodity_flow_short(date="2018-08-08")
print(commodity_flow_short_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id15 "Link to this heading")
```
 broker    money variety
0  方正中期 -98550360.0   RB
1  国海良时 -59991336.0   RB
2  永安期货 -52131000.0    J
3  南华期货 -47408484.6   RB
4  迈科期货 -42165963.0   CU
5  永安期货 -36507715.2   ZC
6  光大期货 -35340900.0    J
7  申银万国 -32120996.0    I
8  申银万国 -31075680.0    J
9  国海良时 -30726828.0    I

```

## 每日净流多列表(指数)[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id16 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id17 "Link to this heading")
stock_flow_long
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id18 "Link to this heading")
每日净流多列表(指数)接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id19 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id20 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
broker | string | 席位  
money | float | 流多资金，单位元  
variety | string | 品种编码  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id21 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
stock_flow_long_df = pro.stock_flow_long(date="2018-08-08")
print(stock_flow_long_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id22 "Link to this heading")
```
 broker    money variety
0  浙商期货 43487544.0    T
1  华信期货 32456851.2   IC
2  永安期货 28275580.0    T
3  宏源期货 25465190.4   IC
4  华泰期货 24695284.0    T
5  东吴期货 19973982.0   IF
6  国投安信 16403899.2   IC
7  东证期货 16318434.0   IF
8  光大期货 16102408.0    T
9  国泰君安 15661356.0   IF

```

## 每日净流空列表(指数)[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id23 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id24 "Link to this heading")
stock_flow_short
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id25 "Link to this heading")
每日净流空列表(指数)接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id26 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id27 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
broker | string | 席位  
money | float | 流空资金，单位元  
variety | string | 品种编码  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id28 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
stock_flow_short_df = pro.stock_flow_short(date="2018-08-08")
print(stock_flow_short_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id29 "Link to this heading")
```
 broker    money variety
0  兴证期货 -58628808.0   IC
1  银河期货 -25623004.0    T
2  中信建投 -22801228.8   IC
3  中国国际 -22069300.0    T
4  广发期货 -21033230.4   IC
5  海通期货 -19759036.8   IC
6  鲁证期货 -19506972.0    T
7  海通期货 -17856834.0   IF
8  中金期货 -17410272.0   IF
9  南华期货 -13345152.0   IF

```

## 每日商品保证金沉淀变化[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id30 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id31 "Link to this heading")
money_in_out
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id32 "Link to this heading")
每日商品保证金沉淀变化接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id33 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id34 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
symbol | string | 品种编码  
chge | float | 品种沉淀资金变化，单位元  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id35 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
money_in_out_df = pro.money_in_out(date="2018-08-08")
print(money_in_out_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/fund.html#id36 "Link to this heading")
```
      chge symbol
0 -275632312.0   J
1 -243543981.6   ZC
2  -81290136.0   I
3  -45598051.2   JM
4  -31547670.0   P
5  -30567752.5   L
6  -30113737.6   BU
7  -28320467.0   PP
8  -26664664.0   SR
9  -22570900.0   CF
10 -19633982.0   FU
11 -10199960.0   PB
12  -6788380.0   FG
13  -6080775.4   JD
14  -2069555.6   SN
15  -1979271.0   RU
16  -695370.0   CY
17   -87414.0   RI
18   -18258.0   JR
19     0.0   SC
20     0.0   PM
21     0.0   WR
22     0.0   FB
23     0.0   BB
24     0.0   RS
25  2467941.0   AL
26  3289568.0   WH
27  5503300.0   LR
28  8602684.0   OI
29  9535390.0   CS
30  15957968.0   ZN
31  19975040.4   SF
32  21202165.0   AU
33  25174906.8   RM
34  26598818.0   B
35  31817098.0   Y
36  33848526.6   MA
37  34038302.2   SM
38  43679158.6   AP
39  52613008.0   A
40  58577657.6   HC
41  81632070.0   AG
42 105799545.0   V
43 110605243.0   C
44 184962996.0   RB
45 192803778.0   M
46 204487969.0   CU
47 220199220.0   TA
48 293341736.0   NI

```

[ 上一页](data_qhkc_tools.html _工具_.md) [下一页 ](data_tool_tool.html _AKShare 工具箱_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.