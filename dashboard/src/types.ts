export type View = 'papers' | 'tasks' | 'graph' | 'artifacts';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  date: string;
  link: string;
  category: string;
  abstract: string;
  tags?: string[];
  status?: string;
  wikilinks?: string[];
  filePath?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'todo' | 'pending' | 'done' | 'archive';
  assignee?: string;
  date?: string;
  attachments?: number;
  filePath?: string;
  tags?: string[];
}

export interface GraphNode {
  id: string;
  type: string;
  slug: string;
  title: string;
  filePath: string;
  tags: string[];
  date: string;
  category?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon?: string;
  children?: FileNode[];
}

export interface PageData {
  type: string;
  slug: string;
  title: string;
  filePath: string;
  frontmatter: Record<string, any>;
  body: string;
  wikilinks: string[];
  tags: string[];
  date: string;
  status: string;
}