import React from 'react';
import { FileText, Kanban, Share2, Box } from 'lucide-react';
import { View } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ currentView, onViewChange, mobileOpen, onMobileClose }: SidebarProps) {
  const menuItems = [
    { id: 'papers' as View, label: 'Papers', icon: FileText },
    { id: 'tasks' as View, label: 'Tasks', icon: Kanban },
    { id: 'graph' as View, label: 'Graph', icon: Share2 },
    { id: 'artifacts' as View, label: 'Artifacts', icon: Box },
  ];

  const sidebarContent = (
    <nav className="h-screen w-[240px] bg-[#E8EAEF] border-r border-outline flex flex-col py-8">
      <div className="px-8 mb-12 flex items-center gap-3">
        <span className="text-black font-black text-2xl tracking-tighter uppercase leading-none">RESEARCH</span>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-[0.1em] transition-all relative group ${
                isActive
                  ? 'bg-white shadow-sm text-black'
                  : 'text-on-surface-variant hover:text-black hover:bg-white/40'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-black' : 'text-on-surface-variant group-hover:text-black'} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-sidebar"
                  className="absolute right-[-16px] top-3 bottom-3 w-1 bg-black"
                  initial={false}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6 mt-auto">
        <div className="bg-white/40 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-[10px] font-bold text-white italic">RP</div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-black truncate uppercase tracking-widest leading-none mb-1">Researcher Profile</p>
              <p className="text-[9px] text-on-surface-variant truncate uppercase tracking-widest leading-none">Senior Analyst</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="hidden md:block fixed h-screen w-[240px] left-0 top-0 z-50">
        {sidebarContent}
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed h-screen left-0 top-0 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}