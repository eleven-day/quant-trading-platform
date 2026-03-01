import type { StrategyLearnDetail } from '@/types';

export const mockLearnStrategies: StrategyLearnDetail[] = [
  {
    id: 'dual-ma',
    name: '双均线交叉策略',
    shortDesc: 'MA5/MA20 金叉死叉',
    level: '入门级',
    status: '已学',
    explanation: '双均线交叉策略利用短期均线(MA5)与长期均线(MA20)的交叉关系来判断买卖时机。当短期均线上穿长期均线时形成「金叉」，产生买入信号；当短期均线下穿长期均线时形成「死叉」，产生卖出信号。该策略能有效捕捉市场的中期趋势，但可能在盘整市中产生较多虚假信号。',
    formulas: [
      { label: '公式', code: 'MA(n) = (C₁ + C₂ + ... + Cₙ) / n', color: '#22D3EE' },
      { label: '买入信号', code: '买入信号: MA5 > MA20 (金叉)', color: '#EF4444' },
      { label: '卖出信号', code: '卖出信号: MA5 < MA20 (死叉)', color: '#22C55E' }
    ]
  },
  {
    id: 'rsi',
    name: 'RSI 超买超卖',
    shortDesc: '相对强弱指标',
    level: '进阶级',
    status: '学习中',
    explanation: 'RSI（相对强弱指标）主要通过比较一段时期内的平均收盘涨数和平均收盘跌数来分析市场买卖盘的意向和实力，从而作出未来市场的走势预期。通常14天的RSI大于70被认为是超买区域，产生卖出信号；低于30被视为超卖区域，产生买入信号。',
    formulas: [
      { label: '公式', code: 'RSI = 100 - [100 / (1 + RS)]\nRS = 平均上涨收盘价 / 平均下跌收盘价', color: '#22D3EE' },
      { label: '买入信号', code: '买入信号: RSI < 30 (超卖区)', color: '#EF4444' },
      { label: '卖出信号', code: '卖出信号: RSI > 70 (超买区)', color: '#22C55E' }
    ]
  },
  {
    id: 'bollinger',
    name: '布林带突破',
    shortDesc: 'Bollinger Bands',
    level: '进阶级',
    status: '未学',
    explanation: '布林带（Bollinger Bands）由三条轨道线组成：中轨是N日的简单移动平均线，上轨是中轨加上两倍的标准差，下轨是中轨减去两倍的标准差。当价格突破上轨时代表强烈的上涨动能，但同时也可能面临超买回调；当价格跌破下轨时暗示强烈的下跌动能，但也可能迎来超卖反弹的均值回归机会。',
    formulas: [
      { label: '中轨(MB)', code: 'MB = MA(C, N)', color: '#22D3EE' },
      { label: '上轨(UP)', code: 'UP = MB + 2 × MD', color: '#EF4444' },
      { label: '下轨(DN)', code: 'DN = MB - 2 × MD', color: '#22C55E' }
    ]
  },
  {
    id: 'macd',
    name: 'MACD 背离',
    shortDesc: '趋势动量指标',
    level: '高级',
    status: '未学',
    explanation: 'MACD（指数平滑异同移动平均线）利用短期和长期指数移动平均线之间的聚合与分离状况，对买进、卖出时机作出研判。MACD背离是其中最为核心的交易技巧：当价格创出新高而MACD没有创出新高（顶背离）时，通常暗示上涨动能减弱；反之（底背离）则暗示下跌动能减弱。',
    formulas: [
      { label: 'DIF线', code: 'DIF = EMA(C, 12) - EMA(C, 26)', color: '#22D3EE' },
      { label: 'DEA线(信号线)', code: 'DEA = EMA(DIF, 9)', color: '#F59E0B' },
      { label: 'MACD柱', code: 'MACD = (DIF - DEA) × 2', color: '#A855F7' }
    ]
  }
];
