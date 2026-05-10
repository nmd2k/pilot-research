import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, User, Calendar, Link as LinkIcon, Plus, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchPages, fetchPage } from '../api';
import type { Paper } from '../types';
import SplitEditor from './SplitEditor';

interface PapersViewProps {
  onOpenDetail?: (paper: { title: string; content: string; metadata: any; wikilinks?: string[] }) => void;
}

export default function PapersView({ onOpenDetail }: PapersViewProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'NEWEST' | 'CITED' | 'ALPHA'>('NEWEST');
  const [detailPaper, setDetailPaper] = useState<{ title: string; content: string; metadata: any; wikilinks?: string[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchPages('paper')
      .then((data) => setPapers(data.pages))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedPapers = [...papers].sort((a, b) => {
    switch (sortMode) {
      case 'NEWEST':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'ALPHA':
        return a.title.localeCompare(b.title);
      case 'CITED':
      default:
        return 0;
    }
  });

  const handleFullDocument = useCallback(async (paper: Paper) => {
    setLoadingDetail(true);
    try {
      const pagePath = paper.filePath || paper.id;
      const data = await fetchPage(pagePath);
      const page = data.page;
      const paperData = {
        title: page.title || paper.title,
        content: page.body || paper.abstract || '',
        metadata: {
          author: paper.authors,
          date: paper.date || page.date,
          status: page.status,
          tags: [...(page.tags || []), ...(paper.tags || [])],
          wordCount: page.body ? page.body.split(/\s+/).length : 0,
        },
        wikilinks: page.wikilinks || paper.wikilinks,
      };

      if (onOpenDetail) {
        onOpenDetail(paperData);
      } else {
        setDetailPaper(paperData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  }, [onOpenDetail]);

  const handleWikilinkClick = useCallback((link: string) => {
    const matchingPaper = papers.find(p =>
      p.title.toLowerCase().includes(link.toLowerCase()) ||
      (p.wikilinks && p.wikilinks.includes(link))
    );
    if (matchingPaper) {
      handleFullDocument(matchingPaper);
    }
  }, [papers, handleFullDocument]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-on-surface-variant" size={32} />
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-10 custom-scrollbar">
        <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant">
          <FileText size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-semibold text-on-surface">No papers yet</p>
          <p className="text-sm mt-1">Add papers to your repository to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex">
      <div className={`flex-1 overflow-auto custom-scrollbar ${detailPaper ? 'hidden md:block' : ''}`}>
        <div className="max-w-6xl mx-auto py-12 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-1 uppercase">Recent Publications</h2>
              <p className="text-on-surface-variant text-[13px] font-medium tracking-wide">
                Reviewing {papers.length} {papers.length === 1 ? 'artifact' : 'artifacts'} in the Knowledge Repository.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#E8EAEF] p-1 rounded-lg border border-outline">
              {(['NEWEST', 'CITED', 'ALPHA'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSortMode(filter)}
                  className={`px-5 py-1.5 font-bold text-[10px] uppercase tracking-wider rounded-md transition-all ${
                    sortMode === filter
                      ? 'bg-black text-white'
                      : 'text-on-surface-variant hover:text-black hover:bg-white/40'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sortedPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-surface-bright border border-outline rounded-lg hover:border-outline-variant transition-all overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start gap-12">
                    <div className="space-y-4 flex-1">
                      <span className="inline-block font-bold text-[9px] text-primary-accent bg-primary-accent/10 px-2 py-0.5 rounded tracking-widest uppercase">
                        {paper.category}
                      </span>
                      <h3 className="font-sans text-xl font-bold text-on-surface leading-tight tracking-tight">
                        {paper.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pt-2">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-on-surface-variant" />
                          {paper.authors}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-on-surface-variant" />
                          {paper.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LinkIcon size={14} className="text-on-surface-variant" />
                          <a href={paper.link.startsWith('http') ? paper.link : `https://${paper.link}`} target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline transition-all">
                            {paper.link}
                          </a>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === paper.id ? null : paper.id)}
                      className="p-2 hover:bg-surface rounded-md transition-all shrink-0"
                    >
                      <ChevronDown size={20} className={`text-on-surface-variant transition-transform ${expandedId === paper.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedId === paper.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-outline mt-8 pt-8 px-2">
                          <p className="font-serif text-[16px] text-on-surface-variant leading-relaxed max-w-4xl italic">
                            {paper.abstract}
                          </p>
                          <div className="mt-8 flex gap-3">
                            <button
                              onClick={() => handleFullDocument(paper)}
                              disabled={loadingDetail}
                              className="bg-black text-white px-6 py-2 rounded-md font-sans text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              {loadingDetail && <Loader2 size={12} className="animate-spin" />}
                              Full Document
                            </button>
                            <button className="border border-outline text-on-surface px-6 py-2 rounded-md font-sans text-[11px] font-bold uppercase tracking-widest hover:bg-surface transition-all">
                              Quick Export
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {detailPaper && (
          <div className="hidden md:flex md:w-[50%] shrink-0">
            <SplitEditor
              title={detailPaper.title}
              content={detailPaper.content}
              metadata={detailPaper.metadata}
              wikilinks={detailPaper.wikilinks}
              onClose={() => setDetailPaper(null)}
              onWikilinkClick={handleWikilinkClick}
            />
          </div>
        )}
      </AnimatePresence>

      <button
        className="fixed bottom-24 right-8 w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary transition-all z-30"
        title="Add new paper"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}