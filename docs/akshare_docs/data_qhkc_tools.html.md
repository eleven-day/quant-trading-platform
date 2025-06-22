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
        * [龙虎牛熊多头合约池](https://akshare.akfamily.xyz/data/qhkc/tools.html#id2)
        * [龙虎牛熊空头合约池](https://akshare.akfamily.xyz/data/qhkc/tools.html#id9)
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
  * 工具
  * [ 查看页面源码](_sources_data_qhkc_tools.md.txt.md)

# 工具[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id1 "Link to this heading")
## 龙虎牛熊多头合约池[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id2 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id3 "Link to this heading")
long_pool
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id4 "Link to this heading")
龙虎牛熊多头合约池接口
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id5 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id6 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
symbol | string | 品种编码  
code | string | 合约代号  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id7 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
long_pool_df = pro.long_pool(date="2018-08-08")
print(long_pool_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id8 "Link to this heading")
```
   code symbol
0  rb1810   RB
1  rb1901   RB
2  j1809   J
3  j1901   J
4  ap1810   AP
5  ap1901   AP
6  ap1903   AP
7  ap1905   AP
8  cf1809   CF
9  fg1809   FG
10 ma1809   MA
11 rm1901   RM
12 sf1901   SF
13 sm1901   SM
14 sr1809   SR
15 sr1905   SR
16 ta1808   TA
17 ta1903   TA
18 cu1811   CU
19 cu1905   CU
20 al1808   AL
21 zn1808   ZN
22 ni1809   NI
23 au1812   AU
24  b1901   B
25  c1905   C
26 cs1901   CS
27 jd1809   JD
28 jd1901   JD
29  m1809   M
30 pp1809   PP
31 pp1901   PP
32  v1901   V

```

## 龙虎牛熊空头合约池[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id9 "Link to this heading")
### 接口名称[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id10 "Link to this heading")
short_pool
### 接口描述[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id11 "Link to this heading")
龙虎牛熊空头合约池
### 请求参数[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id12 "Link to this heading")
参数名 | 说明 | 举例  
---|---|---  
date | 查询日期 | 2018-08-08  
### 返回参数[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id13 "Link to this heading")
参数名 | 类型 | 说明  
---|---|---  
symbol | string | 品种编码  
code | string | 合约代号  
### 示例代码[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id14 "Link to this heading")
```
fromakshareimport pro_api
pro = pro_api(token="在此处输入您的 token, 可以联系奇货可查网站管理员获取")
short_pool_df = pro.short_pool(date="2018-08-08")
print(short_pool_df)

```

### 返回示例[](https://akshare.akfamily.xyz/data/qhkc/tools.html#id15 "Link to this heading")
```
   code symbol
0  i1901   I
1  hc1810   HC
2  ap1811   AP
3  cf1901   CF
4  oi1809   OI
5  oi1905   OI
6  rm1905   RM
7  sf1809   SF
8  ta1811   TA
9  zc1809   ZC
10 zc1811   ZC
11 zc1901   ZC
12 cu1809   CU
13 cu1810   CU
14 cu1901   CU
15 al1811   AL
16 al1812   AL
17 zn1810   ZN
18 pb1810   PB
19 sn1809   SN
20 ag1812   AG
21 fu1901   FU
22 ru1809   RU
23 ru1811   RU
24 ru1901   RU
25 ru1905   RU
26  a1901   A
27  c1811   C
28 cs1809   CS
29  l1809   L
30  l1901   L
31  m1811   M
32  m1901   M
33  p1809   P
34  p1905   P
35  v1809   V
36  y1809   Y
37  y1901   Y
38  y1905   Y
39 if1808   IF
40 if1809   IF
41 ih1808   IH

```

[ 上一页](data_qhkc_fundamental.html _基本面_.md) [下一页 ](data_qhkc_fund.html _资金_.md)
© 版权所有 2019–2025, AKShare Developers。
利用 [Sphinx](https://www.sphinx-doc.org/) 构建，使用的 [主题](https://github.com/readthedocs/sphinx_rtd_theme) 由 [Read the Docs](https://readthedocs.org) 开发.