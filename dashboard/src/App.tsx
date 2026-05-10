import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PapersView from './components/PapersView';
import TasksView from './components/TasksView';
import GraphView from './components/GraphView';
import ArtifactsView from './components/ArtifactsView';
import SplitEditor from './components/SplitEditor';
import { View } from './types';

interface SelectedItem {
  title: string;
  content: string;
  metadata?: {
    author?: string;
    wordCount?: number;
    date?: string;
    status?: string;
    tags?: string[];
  };
  wikilinks?: string[];
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('papers');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'papers': return <PapersView onOpenDetail={setSelectedItem} />;
      case 'tasks': return <TasksView />;
      case 'graph': return <GraphView />;
      case 'artifacts': return <ArtifactsView />;
      default: return <PapersView onOpenDetail={setSelectedItem} />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'papers': return 'Dashboard';
      case 'tasks': return 'Tasks';
      case 'graph': return 'Knowledge Graph';
      case 'artifacts': return 'Artifact Finder';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden selection:bg-primary-accent/20 select-none">
      <Sidebar
        currentView={currentView}
        onViewChange={(v) => { setCurrentView(v); setSelectedItem(null); setSidebarOpen(false); }}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="ml-0 md:ml-[240px] flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopBar title={getTitle()} onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-hidden flex">
          <div className={`flex-1 min-w-0 ${selectedItem ? 'hidden md:block' : ''}`}>
            {renderView()}
          </div>
          {selectedItem && (
            <div className="hidden md:flex md:w-[50%] shrink-0">
              <SplitEditor
                title={selectedItem.title}
                content={selectedItem.content}
                metadata={selectedItem.metadata}
                wikilinks={selectedItem.wikilinks}
                onClose={() => setSelectedItem(null)}
              />
            </div>
          )}
        </div>

        <footer className="flex justify-between items-center px-10 py-3 bg-surface-bright border-t border-outline-variant z-40 shrink-0">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Workbench OS v2.4</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] text-on-surface-variant hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="text-[11px] text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <span className="text-on-surface-variant opacity-30 text-xs">•</span>
            <span className="text-[11px] text-on-surface-variant">© 2024 Academic Research Workbench.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}