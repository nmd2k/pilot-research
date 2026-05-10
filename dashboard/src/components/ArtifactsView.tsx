import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Table,
  Monitor,
  Plus,
  X,
  Calendar,
  User,
  Folder,
  ChevronDown,
  ChevronRight,
  PlusSquare,
  RefreshCw,
  Image as ImageIcon,
  Database,
  Box,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFileTree, fetchFile, fetchPages } from '../api';
import type { FileNode, PageData } from '../types';

interface OpenTab {
  id: string;
  name: string;
  path: string;
  icon: string;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'md') return FileText;
  if (ext === 'csv' || ext === 'tsv') return Table;
  if (ext === 'pdf') return Monitor;
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'svg') return ImageIcon;
  if (ext === 'db' || ext === 'sqlite') return Database;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderMarkdown(body: string, onWikilink: (slug: string) => void): React.ReactNode[] {
  const lines = body.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${i}`} className="list-disc pl-6 space-y-1 my-4 text-on-surface-variant">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const processInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[\[(.+?)\]\])/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(<strong key={`b-${match.index}`} className="font-bold text-on-surface">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={`i-${match.index}`} className="italic">{match[3]}</em>);
      } else if (match[4]) {
        parts.push(
          <code key={`c-${match.index}`} className="font-mono text-sm bg-surface px-1.5 py-0.5 rounded border border-outline text-on-surface">
            {match[4]}
          </code>
        );
      } else if (match[5]) {
        const slug = match[5];
        parts.push(
          <button
            key={`wl-${match.index}`}
            onClick={(e) => { e.preventDefault(); onWikilink(slug); }}
            className="text-primary-accent hover:underline cursor-pointer bg-primary-accent/5 px-0.5 rounded"
          >
            {slug}
          </button>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      flushList();
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="font-mono text-sm bg-on-surface text-white p-6 rounded-lg my-6 overflow-x-auto">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      flushList();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-black pl-6 my-8 italic text-on-surface">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="mb-2">{processInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-sans font-black text-black mt-10 mb-3 tracking-tight uppercase">
          {processInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-sans font-black text-black mt-14 mb-4 tracking-tight uppercase">
          {processInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-sans font-black text-black mt-14 mb-6 tracking-tight uppercase">
          {processInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (/^[-*] /.test(line)) {
      if (!inList) inList = true;
      listItems.push(
        <li key={`li-${i}`}>{processInline(line.replace(/^[-*] /, ''))}</li>
      );
      i++;
      continue;
    }

    flushList();

    if (line.trim() === '') {
      i++;
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="leading-relaxed my-4">
        {processInline(line)}
      </p>
    );
    i++;
  }

  flushList();

  return elements;
}

function FileTreeNode({
  node,
  selectedPath,
  onSelect,
  expandedFolders,
  onToggleFolder,
  depth,
}: {
  node: FileNode;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  depth: number;
}) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = node.id === selectedPath;
  const Icon = isFolder ? Folder : getFileIcon(node.name);

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-3 rounded transition-all cursor-pointer ${
          isSelected
            ? 'bg-surface text-black font-bold'
            : 'text-on-surface-variant hover:text-black hover:bg-surface/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleFolder(node.id);
          } else {
            onSelect(node);
          }
        }}
      >
        {isFolder && (
          isExpanded
            ? <ChevronDown size={14} className="shrink-0" />
            : <ChevronRight size={14} className="shrink-0" />
        )}
        <Icon size={14} className={isFolder ? '' : 'opacity-60'} />
        <span className={`text-[12px] ${isFolder ? 'font-bold uppercase tracking-wide' : ''} truncate`}>
          {node.name}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {isFolder && isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <FileTreeNode
                key={child.id}
                node={child}
                selectedPath={selectedPath}
                onSelect={onSelect}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArtifactsView() {
  const [tree, setTree] = useState<FileNode | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<{ content: string; frontmatter?: Record<string, any>; body?: string; wikilinks?: string[]; type?: string; size?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchFileTree();
      setTree(data);
      const initialExpanded = new Set<string>();
      if (data && data.children) {
        initialExpanded.add(data.id);
      }
      setExpandedFolders(initialExpanded);
    } catch (err) {
      setError('Failed to load file tree');
    }
  }, []);

  const loadPages = useCallback(async () => {
    try {
      const data = await fetchPages();
      setPages(data.pages);
    } catch {}
  }, []);

  useEffect(() => {
    loadTree();
    loadPages();
  }, [loadTree, loadPages]);

  const selectFile = useCallback(async (node: FileNode) => {
    const tab: OpenTab = {
      id: node.id,
      name: node.name,
      path: node.id,
      icon: node.name.split('.').pop()?.toLowerCase() || '',
    };

    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.id === tab.id);
      if (!exists) return [...prev, tab];
      return prev;
    });
    setActiveTabId(tab.id);

    setLoading(true);
    try {
      const content = await fetchFile(tab.path);
      setFileContent(content);
    } catch (err) {
      setFileContent({ content: 'Failed to load file content.' });
    }
    setLoading(false);
  }, []);

  const closeTab = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      return next;
    });
    setActiveTabId((prev) => {
      if (prev === tabId) {
        const remaining = openTabs.filter((t) => t.id !== tabId);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return prev;
    });
    if (activeTabId === tabId) {
      setFileContent(null);
    }
  }, [activeTabId, openTabs]);

  const handleWikilink = useCallback((slug: string) => {
    const page = pages.find(
      (p) => p.slug === slug || p.filePath?.includes(slug)
    );
    if (page && page.filePath) {
      const nodeId = page.filePath.replace(/\.md$/, '');
      selectFile({
        id: page.filePath,
        name: page.filePath.split('/').pop() || slug,
        type: 'file',
      });
    }
  }, [pages, selectFile]);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const recentFiles = tree
    ? flattenFiles(tree).slice(0, 5)
    : [];

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-surface min-w-0">
        <div className="flex bg-surface-bright border-b border-outline overflow-x-auto custom-scrollbar h-11 items-center shrink-0">
          {openTabs.map((tab) => {
            const TabIcon = getFileIcon(tab.name);
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center px-4 h-full min-w-[160px] max-w-[240px] gap-2 cursor-pointer border-r border-outline transition-colors relative group ${
                  isActive
                    ? 'bg-surface-bright text-on-surface'
                    : 'bg-surface text-on-surface-variant hover:text-black'
                }`}
              >
                <TabIcon size={14} className={isActive ? 'text-primary-accent' : ''} />
                <span className="text-[11px] font-bold tracking-wide uppercase truncate flex-1">
                  {tab.name}
                </span>
                <X
                  size={12}
                  onClick={(e) => closeTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-black cursor-pointer transition-opacity shrink-0"
                />
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-black" />
                )}
              </div>
            );
          })}
          <button className="px-3 flex items-center justify-center text-on-surface-variant hover:text-black transition-colors h-full shrink-0">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 code-canvas custom-scrollbar">
          {!activeTab ? (
            <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant">
              <Box size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-semibold text-on-surface">No file selected</p>
              <p className="text-sm mt-1">Select a file from the Explorer to view its contents</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-32">
              <RefreshCw size={24} className="animate-spin text-on-surface-variant" />
            </div>
          ) : fileContent ? (
            <article className="w-full max-w-4xl mx-auto bg-surface-bright border border-outline shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-lg p-16">
              {fileContent.frontmatter && (
                <div className="mb-12">
                  <span className="font-bold text-[9px] text-on-surface-variant bg-surface px-2 py-0.5 rounded uppercase tracking-widest border border-outline mb-6 inline-block">
                    {fileContent.frontmatter.type
                      ? `${fileContent.frontmatter.type} Document`
                      : fileContent.type
                        ? `${fileContent.type.toUpperCase()} File`
                        : 'File'}
                  </span>
                  <h2 className="font-sans text-3xl font-black mt-4 text-black leading-tight tracking-tight uppercase">
                    {fileContent.frontmatter.title || activeTab.name}
                  </h2>
                  <div className="flex gap-6 mt-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pt-4 border-t border-outline">
                    {fileContent.frontmatter.date && (
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="opacity-50" />
                        {fileContent.frontmatter.date}
                      </span>
                    )}
                    {fileContent.frontmatter.author && (
                      <span className="flex items-center gap-2">
                        <User size={14} className="opacity-50" />
                        {fileContent.frontmatter.author}
                      </span>
                    )}
                    {fileContent.size && (
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="opacity-50" />
                        {formatFileSize(fileContent.size)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {fileContent.body ? (
                <section className="font-serif text-[18px] text-on-surface-variant leading-relaxed">
                  {renderMarkdown(fileContent.body, handleWikilink)}
                </section>
              ) : (
                <div className="font-mono text-sm whitespace-pre-wrap text-on-surface-variant bg-surface p-6 rounded border border-outline overflow-x-auto">
                  {typeof fileContent.content === 'string' ? fileContent.content : JSON.stringify(fileContent.content, null, 2)}
                </div>
              )}
            </article>
          ) : null}
        </div>
      </div>

      <aside className="w-[280px] bg-surface-bright border-l border-outline flex flex-col hidden lg:flex">
        <div className="p-5 flex items-center justify-between border-b border-outline shrink-0">
          <span className="font-black text-[10px] uppercase text-black tracking-widest">Explorer</span>
          <div className="flex gap-1">
            <button className="p-1 px-2 text-on-surface-variant hover:text-black transition-colors rounded">
              <PlusSquare size={14} />
            </button>
            <button
              onClick={loadTree}
              className="p-1 px-2 text-on-surface-variant hover:text-black transition-colors rounded"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {error ? (
            <div className="px-4 py-8 text-center text-on-surface-variant text-sm">
              <p>{error}</p>
              <button onClick={loadTree} className="mt-2 text-primary-accent underline text-xs">
                Retry
              </button>
            </div>
          ) : !tree ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={16} className="animate-spin text-on-surface-variant" />
            </div>
          ) : (
            <div className="px-2">
              {tree.children && tree.children.length > 0 ? (
                tree.children.map((child) => (
                  <FileTreeNode
                    key={child.id}
                    node={child}
                    selectedPath={activeTabId}
                    onSelect={selectFile}
                    expandedFolders={expandedFolders}
                    onToggleFolder={(id) => {
                      setExpandedFolders((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      });
                    }}
                    depth={0}
                  />
                ))
              ) : (
                <p className="text-[11px] text-on-surface-variant px-2">No files found</p>
              )}
            </div>
          )}

          {recentFiles.length > 0 && (
            <div className="px-4 py-8 mt-6 border-t border-outline">
              <span className="font-black text-[10px] text-on-surface-variant uppercase tracking-widest block mb-4">
                Recent Artifacts
              </span>
              <div className="space-y-3">
                {recentFiles.map((file) => {
                  const RIcon = getFileIcon(file.name);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 group cursor-pointer bg-surface p-2 rounded-lg border border-outline hover:bg-surface-dim transition-colors"
                      onClick={() => selectFile(file)}
                    >
                      <div className="w-8 h-8 rounded bg-surface-bright flex items-center justify-center shrink-0 border border-outline">
                        <RIcon size={14} className="text-on-surface-variant" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] truncate text-on-surface font-bold">{file.name}</p>
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">
                          {file.id.split('/').slice(0, -1).join('/') || 'root'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function flattenFiles(node: FileNode): FileNode[] {
  const files: FileNode[] = [];
  if (node.type === 'file') {
    files.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      files.push(...flattenFiles(child));
    }
  }
  return files;
}