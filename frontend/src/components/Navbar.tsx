"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "行情看板" },
    { href: "/backtest", label: "策略回测" },
    { href: "/learn", label: "策略学习" },
    { href: "/settings", label: "设置" },
  ];

  return (
    <nav className="w-full h-14 bg-bg-nav flex items-center justify-between px-6 shrink-0 border-b border-white/5">
      <div className="flex items-center gap-12">
        <Link href="/" className="font-mono text-[18px] font-bold text-accent tracking-[1.5px]">
          QuantLearn
        </Link>
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-medium transition-colors ${
                  isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="relative w-[240px] h-9">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-text-muted" />
        </div>
        <input
          type="text"
          placeholder="搜索股票代码或名称..."
          className="w-full h-full bg-bg-card text-text-primary text-[14px] rounded-lg pl-9 pr-4 outline-none border border-transparent focus:border-accent/30 focus:bg-bg-inset transition-colors placeholder:text-text-muted"
        />
      </div>
    </nav>
  );
}
