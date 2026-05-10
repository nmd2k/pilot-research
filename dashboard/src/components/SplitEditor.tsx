import React, { useState, useEffect, useCallback } from 'react';
import { Save, X, Loader2, Edit3, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchPage, savePage } from '../api';
import { renderMarkdown } from './MarkdownRenderer';

interface SplitEditorMetadata {
  author?: string;
  wordCount?: number;
  date?: string;
  status?: string;
  tags?: string[];
}

export interface SplitEditorProps {
  title?: string;
  content?: string;
  filePath?: string;
  metadata?: SplitEditorMetadata;
  onClose: () => void;
  onWikilinkClick?: (link: string) => void;
  pages?: any[];
  wikilinks?: string[];
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-dim rounded ${className}`} />;
}

function Skeleton() {
  return (
    <div className="h-full bg-surface-bright border-l border-outline flex flex-col">
      <div className="h-14 flex items-center justify-end px-6 border-b border-outline shrink-0">
        <div className="w-6 h-6 rounded bg-surface-dim animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <SkeletonBlock className="h-8 w-3/4 mb-6" />
        <div className="flex flex-wrap gap-4 mb-8 pt-4 border-t border-outline">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-4/5" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/4" />
          <div className="pt-4" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function SplitEditor({ title: initialTitle = '', content: initialContent = '', filePath, metadata: initialMetadata, onClose, onWikilinkClick, pages, wikilinks: propWikilinks }: SplitEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [ready, setReady] = useState(!filePath);

  useEffect(() => {
    if (filePath) {
      setLoading(true);
      setReady(false);
      fetchPage(filePath)
        .then((data) => {
          const page = data.page;
          setTitle(page.title || '');
          setContent(page.body || '');
          setEditContent(page.body || '');
          setMetadata({
            ...initialMetadata,
            date: page.date || initialMetadata?.date,
            status: page.status || initialMetadata?.status,
            tags: page.tags || initialMetadata?.tags,
          });
        })
        .catch(console.error)
        .finally(() => {
          setLoading(false);
          setReady(true);
        });
    } else {
      setReady(true);
    }
  }, [filePath]);

  const handleSave = useCallback(async () => {
    if (!filePath || !editContent) return;
    setSaving(true);
    try {
      await savePage(filePath, editContent);
      setContent(editContent);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setSaving(false);
  }, [filePath, editContent]);

  const handleWikilink = useCallback((slug: string) => {
    if (onWikilinkClick) {
      onWikilinkClick(slug);
      return;
    }
    if (pages) {
      const page = pages.find(
        (p: any) => p.slug === slug || p.filePath?.includes(slug)
      );
      if (page && page.filePath) {
        setTitle(page.title || slug);
        setContent(page.body || '');
        setEditContent(page.body || '');
        setMetadata((prev) => ({
          ...prev,
          date: page.date || prev?.date,
          status: page.status || prev?.status,
          tags: page.tags || prev?.tags || [],
        }));
      }
    }
  }, [onWikilinkClick, pages]);

  const extractWikilinks = (text: string) => {
    const matches = text.matchAll(/\[\[([^\]]+)\]\]/g);
    return [...new Set([...matches].map(m => m[1]))];
  };

  const contentWikilinks = extractWikilinks(content);
  const wikilinks = propWikilinks
    ? [...new Set([...propWikilinks, ...contentWikilinks])]
    : contentWikilinks;

  if (loading || !ready) {
    return <Skeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="h-full bg-surface-bright border-l border-outline flex flex-col"
    >
      <div className="h-14 flex items-center justify-between px-6 border-b border-outline shrink-0">
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-primary-accent transition-all disabled:opacity-50"
              >
                <Save size={12} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditContent(content);
                }}
                className="flex items-center gap-1.5 border border-outline px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-black transition-all"
              >
                <Eye size={12} />
                View
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditContent(content);
                  setEditMode(true);
                }}
                className="flex items-center gap-1.5 border border-outline px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-black transition-all"
              >
                <Edit3 size={12} />
                Edit
              </button>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="mb-8">
          {viewMode === 'rendered' && !editMode && (
            <h1 className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-2xl font-bold text-on-surface leading-tight tracking-tight uppercase">
              {title}
            </h1>
          )}
          {editMode && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-2xl font-bold text-on-surface p-0 placeholder:text-outline-variant leading-tight tracking-tight uppercase mb-4"
              placeholder="Untitled"
            />
          )}
          {metadata && (
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-outline">
              {metadata.author && (
                <span className="font-bold text-[9px] text-on-surface-variant uppercase tracking-widest font-sans">
                  Author: {metadata.author}
                </span>
              )}
              {metadata.wordCount !== undefined && (
                <span className="font-bold text-[9px] text-on-surface-variant uppercase tracking-widest font-sans">
                  Word Count: {metadata.wordCount.toLocaleString()}
                </span>
              )}
              {metadata.date && (
                <span className="font-bold text-[9px] text-on-surface-variant uppercase tracking-widest font-sans">
                  {metadata.date}
                </span>
              )}
              {metadata.status && (
                <span className="font-bold text-[9px] text-on-surface-variant uppercase tracking-widest bg-surface px-2 py-0.5 rounded font-sans">
                  {metadata.status}
                </span>
              )}
              {metadata.tags && metadata.tags.map((tag) => (
                <span key={tag} className="font-bold text-[9px] text-primary-accent bg-primary-accent/10 px-2 py-0.5 rounded uppercase tracking-widest font-sans">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          {editMode ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[600px] bg-transparent border border-outline rounded-lg p-6 focus:outline-none focus:ring-1 focus:ring-primary-accent/30 font-mono text-sm text-on-surface-variant resize-none custom-scrollbar"
              placeholder="Start writing..."
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              {content ? renderMarkdown(content, handleWikilink) : (
                <p className="text-on-surface-variant italic">No content</p>
              )}
            </div>
          )}
        </div>

        {wikilinks.length > 0 && !editMode && (
          <div className="mt-6 pt-4 border-t border-outline">
            <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Backlinks</h4>
            <div className="flex flex-wrap gap-2">
              {wikilinks.map((link) => (
                <button
                  key={link}
                  onClick={() => handleWikilink(link)}
                  className="text-[11px] font-bold text-primary-accent bg-primary-accent/10 px-2 py-0.5 rounded hover:bg-primary-accent/20 transition-colors"
                >
                  [[{link}]]
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}