import React from 'react';
import { Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="h-14 bg-surface-bright border-b border-outline flex items-center px-10 shrink-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-1 text-on-surface-variant" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-on-surface">{title}</h1>
      </div>
    </header>
  );
}