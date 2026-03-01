'use client';

import React, { useState } from 'react';
import { Database, Settings as SettingsIcon, Palette, Save, ChevronDown } from 'lucide-react';

const DEFAULT_API_URL = 'https://api.example.com/v1/market';
const DEFAULT_API_KEY = 'sk-demo-key-12345678';
const DEFAULT_CAPITAL = 100000;
const DEFAULT_FEE_RATE = '0.03%';
const DEFAULT_DARK_MODE = true;

export function SettingsForm() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [defaultCapital, setDefaultCapital] = useState(DEFAULT_CAPITAL);
  const [feeRate, setFeeRate] = useState(DEFAULT_FEE_RATE);
  const [darkMode, setDarkMode] = useState(DEFAULT_DARK_MODE);

  const handleReset = () => {
    setApiUrl(DEFAULT_API_URL);
    setApiKey(DEFAULT_API_KEY);
    setDefaultCapital(DEFAULT_CAPITAL);
    setFeeRate(DEFAULT_FEE_RATE);
    setDarkMode(DEFAULT_DARK_MODE);
  };

  const handleSave = () => {
    console.log('Settings saved:', {
      apiUrl,
      apiKey,
      defaultCapital,
      feeRate,
      darkMode,
    });
  };

  return (
    <div className="w-[640px] flex flex-col gap-[32px]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-white">设置</h1>
        <p className="text-[14px] text-text-tertiary">配置数据源、默认参数和界面主题</p>
      </div>

      {/* Section 1: 数据源配置 */}
      <div className="bg-bg-card rounded-[8px] px-[24px] py-[20px] flex flex-col gap-[16px] w-full">
        <div className="flex items-center gap-[12px]">
          <Database className="w-[18px] h-[18px] text-accent" />
          <h2 className="text-[16px] font-semibold text-white">数据源配置</h2>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-text-secondary">API 地址</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://..."
            className="bg-bg-inset rounded-[8px] px-[14px] py-[10px] w-full font-mono text-[13px] text-white placeholder:text-text-muted outline-none border border-transparent focus:border-accent/30 transition-colors"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-text-secondary">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="bg-bg-inset rounded-[8px] px-[14px] py-[10px] w-full font-mono text-[13px] text-white placeholder:text-text-muted outline-none border border-transparent focus:border-accent/30 transition-colors"
          />
        </div>
      </div>

      {/* Section 2: 回测默认参数 */}
      <div className="bg-bg-card rounded-[8px] px-[24px] py-[20px] flex flex-col gap-[16px] w-full">
        <div className="flex items-center gap-[12px]">
          <SettingsIcon className="w-[18px] h-[18px] text-accent" />
          <h2 className="text-[16px] font-semibold text-white">回测默认参数</h2>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-text-secondary">默认初始资金 (CNY)</label>
          <input
            type="number"
            value={defaultCapital}
            onChange={(e) => setDefaultCapital(Number(e.target.value))}
            className="bg-bg-inset rounded-[8px] px-[14px] py-[10px] w-full font-mono text-[13px] text-white placeholder:text-text-muted outline-none border border-transparent focus:border-accent/30 transition-colors"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-text-secondary">交易手续费率</label>
          <input
            type="text"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="bg-bg-inset rounded-[8px] px-[14px] py-[10px] w-full font-mono text-[13px] text-white placeholder:text-text-muted outline-none border border-transparent focus:border-accent/30 transition-colors"
          />
        </div>
      </div>

      {/* Section 3: 外观设置 */}
      <div className="bg-bg-card rounded-[8px] px-[24px] py-[20px] flex flex-col gap-[16px] w-full">
        <div className="flex items-center gap-[12px]">
          <Palette className="w-[18px] h-[18px] text-accent" />
          <h2 className="text-[16px] font-semibold text-white">外观设置</h2>
        </div>
        
        {/* Row 1: 深色模式 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[14px] text-white">深色模式</span>
            <span className="text-[12px] text-text-tertiary">适合长时间看盘使用</span>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`w-[44px] h-[24px] rounded-[12px] relative transition-colors duration-200 focus:outline-none ${
              darkMode ? 'bg-accent' : 'bg-[#475569]'
            }`}
          >
            <div
              className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 ${
                darkMode ? 'translate-x-[23px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        </div>
        
        {/* Row 2: 界面语言 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[14px] text-white">界面语言</span>
            <span className="text-[12px] text-text-tertiary">选择界面显示语言</span>
          </div>
          <div className="bg-bg-inset rounded-[8px] px-[12px] py-[6px] flex items-center gap-[8px]">
            <span className="text-[13px] text-white">简体中文</span>
            <ChevronDown className="w-[14px] h-[14px] text-text-tertiary" />
          </div>
        </div>
      </div>

      {/* Button Row */}
      <div className="w-full flex flex-row items-center justify-end gap-[12px]">
        <button
          type="button"
          onClick={handleReset}
          className="bg-transparent rounded-[8px] px-[20px] py-[10px] text-[14px] text-text-secondary hover:bg-bg-card/50 transition-colors focus:outline-none"
        >
          重置
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-accent rounded-[8px] px-[24px] py-[10px] flex items-center gap-[8px] hover:opacity-90 transition-opacity focus:outline-none"
        >
          <Save className="w-[16px] h-[16px] text-[#0A0F1C]" />
          <span className="text-[14px] font-semibold text-[#0A0F1C]">保存设置</span>
        </button>
      </div>
    </div>
  );
}
