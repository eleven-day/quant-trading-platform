import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tauri 桌面应用需要静态导出（不支持 Node.js 服务端运行）
  output: 'export',
  images: {
    // 静态导出模式不支持 Next.js 图片优化
    unoptimized: true,
  },
};

export default nextConfig;
