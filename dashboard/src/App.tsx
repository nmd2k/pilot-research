import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PapersView from './components/PapersView';
import TasksView from './components/TasksView';
import GraphView from './components/GraphView';
import ArtifactsView from './components/ArtifactsView';
import SplitEditor from './components/SplitEditor';
import { View } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('papers');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);

  const renderView = () => {
    switch (currentView) {
      case 'papers': return <PapersView onOpenDetail={setSelectedPaper} />;
      case 'tasks': return <TasksView />;
      case 'graph': return <GraphView />;
      case 'artifacts': return <ArtifactsView />;
      default: return <PapersView onOpenDetail={setSelectedPaper} />;
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
        onViewChange={(v) => { setCurrentView(v); setSelectedPaper(null); setSidebarOpen(false); }}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="ml-0 md:ml-[240px] flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopBar title={getTitle()} onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-hidden flex">
          <div className={`flex-1 min-w-0 flex flex-col overflow-hidden ${selectedPaper ? 'hidden md:flex' : ''}`}>
            {renderView()}
          </div>
          <AnimatePresence>
            {selectedPaper && (
              <motion.div
                key="paper-editor"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="h-full shrink-0 overflow-hidden"
              >
                <SplitEditor
                  key={selectedPaper.filePath || selectedPaper.id}
                  title={selectedPaper.title}
                  content=""
                  filePath={selectedPaper.filePath || selectedPaper.id}
                  metadata={{
                    author: selectedPaper.authors,
                    date: selectedPaper.date,
                    status: selectedPaper.status,
                    tags: selectedPaper.tags,
                  }}
                  wikilinks={selectedPaper.wikilinks}
                  onClose={() => setSelectedPaper(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}