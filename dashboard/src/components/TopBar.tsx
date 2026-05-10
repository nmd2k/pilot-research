import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 bg-surface-bright border-b border-outline flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-1 text-on-surface-variant" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Search size={18} className="text-on-surface-variant" />
          <h1 className="text-lg font-bold tracking-tight text-on-surface">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative hidden lg:block">
          <input
            type="text"
            placeholder="Search project artifacts..."
            className="pl-4 pr-10 py-1.5 bg-surface border border-outline rounded-md text-[13px] w-64 focus:outline-none focus:ring-1 focus:ring-primary-accent/30 transition-all font-medium"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={14} />
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 text-on-surface-variant hover:text-on-surface cursor-pointer">
            <Bell size={20} />
          </div>
          <div className="w-8 h-8 rounded-md bg-[#D1D5DB] flex items-center justify-center font-bold text-[11px] text-on-surface italic cursor-pointer border border-white/50">
            RP
          </div>
        </div>
      </div>
    </header>
  );
}