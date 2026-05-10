import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Table,
  Monitor,
  X,
  Calendar,
  User,
  Folder,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Database,
  Box,
  Edit3,
  Eye,
  RefreshCw,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFileTree, fetchFile, fetchPages, savePage } from '../api';
import { renderMarkdown } from './MarkdownRenderer';
import type { FileNode, PageData } from '../types';

interface OpenTab {
  id: string;
  name: string;
  path: string;
  icon: string;
}

interface TabContent {
  content: string;
  frontmatter?: Record<string, any>;
  body?: string;
  wikilinks?: string[];
  type?: string;
  size?: number;
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
  const [pages, setPages] = useState<any[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabContents, setTabContents] = useState<Map<string, TabContent>>(new Map());
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

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

  const activeContent = activeTabId ? tabContents.get(activeTabId) : undefined;
  const activeTab = openTabs.find((t) => t.id === activeTabId);

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
    setEditMode(false);

    if (!tabContents.has(tab.id)) {
      setLoading(true);
      try {
        const content = await fetchFile(tab.path);
        setTabContents((prev) => new Map(prev).set(tab.id, content));
      } catch (err) {
        setTabContents((prev) => new Map(prev).set(tab.id, { content: 'Failed to load file content.' }));
      }
      setLoading(false);
    }
  }, [tabContents]);

  const closeTab = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newContents = new Map(tabContents);
    newContents.delete(tabId);
    setTabContents(newContents);

    setOpenTabs((prev) => prev.filter((t) => t.id !== tabId));
    setActiveTabId((prev) => {
      if (prev === tabId) {
        const remaining = openTabs.filter((t) => t.id !== tabId);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return prev;
    });
    setEditMode(false);
  }, [openTabs, tabContents]);

  const handleSave = useCallback(async () => {
    if (!activeTab || !editContent) return;
    setSaving(true);
    try {
      await savePage(activeTab.path, editContent);
      setTabContents((prev) => {
        const next = new Map(prev);
        const existing = next.get(activeTab.id);
        if (existing) {
          next.set(activeTab.id, { ...existing, content: editContent, body: editContent });
        }
        return next;
      });
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setSaving(false);
  }, [activeTab, editContent]);

  const handleWikilink = useCallback((slug: string) => {
    const page = pages.find(
      (p) => p.slug === slug || p.filePath?.includes(slug)
    );
    if (page && page.filePath) {
      selectFile({
        id: page.filePath,
        name: page.filePath.split('/').pop() || slug,
        type: 'file',
      });
    }
  }, [pages, selectFile]);

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setEditMode(false);
  }, []);

  const tree_ = tree;
  const recentFiles = tree_
    ? flattenFiles(tree_).slice(0, 5)
    : [];

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col bg-surface min-w-0 h-full">
        <div className="flex bg-surface-bright border-b border-outline overflow-x-auto custom-scrollbar h-11 items-center shrink-0">
          {openTabs.map((tab) => {
            const TabIcon = getFileIcon(tab.name);
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
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
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!activeTab ? (
            <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant code-canvas h-full">
              <Box size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-semibold text-on-surface">No file selected</p>
              <p className="text-sm mt-1">Select a file from the Explorer to view its contents</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-32">
              <RefreshCw size={24} className="animate-spin text-on-surface-variant" />
            </div>
          ) : activeContent ? (
            <div className="p-8">
              <div className="w-full max-w-4xl mx-auto bg-surface-bright border border-outline shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-lg">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    {activeContent.frontmatter && (
                      <div>
                        <span className="font-bold text-[9px] text-on-surface-variant bg-surface px-2 py-0.5 rounded uppercase tracking-widest border border-outline">
                          {activeContent.frontmatter.type
                            ? `${activeContent.frontmatter.type} Document`
                            : activeContent.type
                              ? `${activeContent.type.toUpperCase()} File`
                              : 'File'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 bg-black text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-primary-accent transition-all disabled:opacity-50"
                          >
                            <Save size={12} />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setEditContent(activeContent.body || activeContent.content || '');
                            }}
                            className="flex items-center gap-1.5 border border-outline px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-black transition-all"
                          >
                            <Eye size={12} />
                            View
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditContent(activeContent.body || activeContent.content || '');
                            setEditMode(true);
                          }}
                          className="flex items-center gap-1.5 border border-outline px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-black transition-all"
                        >
                          <Edit3 size={12} />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {activeContent.frontmatter && (
                    <div className="mb-8 select-text">
                      <h2 className="font-sans text-3xl font-black text-black leading-tight tracking-tight uppercase">
                        {activeContent.frontmatter.title || activeTab?.name}
                      </h2>
                      <div className="flex gap-6 mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pt-4 border-t border-outline">
                        {activeContent.frontmatter.date && (
                          <span className="flex items-center gap-2">
                            <Calendar size={14} className="opacity-50" />
                            {activeContent.frontmatter.date}
                          </span>
                        )}
                        {activeContent.frontmatter.author && (
                          <span className="flex items-center gap-2">
                            <User size={14} className="opacity-50" />
                            {activeContent.frontmatter.author}
                          </span>
                        )}
                        {activeContent.size && (
                          <span className="flex items-center gap-2">
                            <FileText size={14} className="opacity-50" />
                            {formatFileSize(activeContent.size)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {editMode ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 w-full min-h-[600px] bg-transparent border-0 p-0 focus:outline-none focus:ring-0 font-mono text-sm text-on-surface-variant resize-none custom-scrollbar select-text"
                        placeholder="Edit content..."
                      />
                    </div>
                  ) : activeContent.body ? (
                    <section className="font-serif text-[18px] text-on-surface-variant leading-relaxed select-text w-full overflow-hidden break-words">
                      {renderMarkdown(activeContent.body, handleWikilink)}
                    </section>
                  ) : (
                    <div className="font-mono text-sm whitespace-pre-wrap text-on-surface-variant bg-surface p-6 rounded border border-outline overflow-x-auto">
                      {typeof activeContent.content === 'string' ? activeContent.content : JSON.stringify(activeContent.content, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="w-[280px] bg-surface-bright border-l border-outline flex flex-col hidden lg:flex h-full">
        <div className="p-5 flex items-center border-b border-outline shrink-0">
          <span className="font-black text-[10px] uppercase text-black tracking-widest">Explorer</span>
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