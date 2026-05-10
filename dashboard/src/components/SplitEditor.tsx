import React, { useState, useEffect } from 'react';
import { Bold, Italic, List, Link as LinkIcon, Image, Code, Save, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchPage } from '../api';

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
  onSave?: (content: string) => void;
  onClose: () => void;
  onWikilinkClick?: (link: string) => void;
  pages?: any[];
  wikilinks?: string[];
}

export default function SplitEditor({ title: initialTitle = '', content: initialContent = '', filePath, metadata: initialMetadata, onSave, onClose, onWikilinkClick, wikilinks: propWikilinks }: SplitEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filePath && !initialContent) {
      setLoading(true);
      fetchPage(filePath)
        .then((data) => {
          const page = data.page;
          setTitle(page.title || '');
          setContent(page.body || '');
          setMetadata({
            ...initialMetadata,
            date: page.date || initialMetadata?.date,
            status: page.status || initialMetadata?.status,
            tags: page.tags || initialMetadata?.tags,
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [filePath]);

  const toolbarButtons = [
    { icon: Bold, label: 'Bold' },
    { icon: Italic, label: 'Italic' },
    { icon: List, label: 'List' },
    { icon: LinkIcon, label: 'Link' },
    { icon: Image, label: 'Image' },
    { icon: Code, label: 'Code' },
  ];

  const extractWikilinks = (text: string) => {
    const matches = text.matchAll(/\[\[([^\]]+)\]\]/g);
    return [...new Set([...matches].map(m => m[1]))];
  };

  const contentWikilinks = extractWikilinks(content);
  const wikilinks = propWikilinks
    ? [...new Set([...propWikilinks, ...contentWikilinks])]
    : contentWikilinks;

  if (loading) {
    return (
      <div className="h-full bg-surface-bright border-l border-outline flex items-center justify-center">
        <Loader2 className="animate-spin text-on-surface-variant" size={24} />
      </div>
    );
  }

  return (
    <div className="h-full bg-surface-bright border-l border-outline flex flex-col">
      <div className="h-16 flex items-center justify-between px-8 border-b border-outline shrink-0">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 bg-surface p-1 rounded">
            {toolbarButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                title={label}
                className="p-1.5 text-on-surface-variant hover:text-black hover:bg-white rounded transition-all"
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={() => onSave(content)}
              className="bg-black text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-1.5"
            >
              <Save size={12} />
              Save
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-2xl font-bold text-on-surface p-0 placeholder:text-outline-variant leading-tight tracking-tight uppercase"
            placeholder="Untitled"
          />
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
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-transparent border-none focus:ring-0 focus:outline-none font-serif text-[17px] text-on-surface-variant p-0 resize-none leading-relaxed custom-scrollbar italic placeholder:text-outline-variant"
            placeholder="Start writing..."
          />
        </div>

        {wikilinks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-outline">
            <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Backlinks</h4>
            <div className="flex flex-wrap gap-2">
              {wikilinks.map((link) => (
                <button
                  key={link}
                  onClick={() => onWikilinkClick?.(link)}
                  className="text-[11px] font-bold text-primary-accent bg-primary-accent/10 px-2 py-0.5 rounded hover:bg-primary-accent/20 transition-colors"
                >
                  [[{link}]]
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}