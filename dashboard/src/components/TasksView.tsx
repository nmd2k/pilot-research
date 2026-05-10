import React, { useState, useEffect } from 'react';
import {
  MoreVertical,
  Calendar,
  Paperclip,
  History,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchTasks } from '../api';
import type { Task } from '../types';
import SplitEditor from './SplitEditor';

const COLUMNS: { id: Task['status']; label: string }[] = [
  { id: 'todo', label: 'Open' },
  { id: 'pending', label: 'Pending' },
  { id: 'done', label: 'Done' },
  { id: 'archive', label: 'Archive' },
];

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(({ tasks: t }) => setTasks(t))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (status: Task['status']) => tasks.filter((t) => t.status === status);

  const handleCardClick = (task: Task) => {
    if (task.filePath) {
      setSelectedFilePath(task.filePath);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-on-surface-variant text-sm">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row overflow-hidden relative">
      <div className={`${selectedFilePath ? '' : ''} flex-1 overflow-x-auto bg-surface p-10`}>
        <div className="flex flex-row gap-8 h-full min-w-max">
          {COLUMNS.map((column) => {
            const items = filtered(column.id);
            return (
              <div key={column.id} className="w-[280px] flex flex-col gap-6">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="font-bold text-[11px] uppercase text-on-surface-variant tracking-widest">{column.label}</span>
                  <span className="bg-surface-dim px-2 py-0.5 rounded text-[10px] text-on-surface font-bold">
                    {String(items.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1 flex flex-col custom-scrollbar">
                  {column.id === 'archive' && items.length === 0 ? (
                    <div className="h-full border border-dashed border-outline rounded-lg flex items-center justify-center text-on-surface-variant flex-col gap-4 p-8 bg-surface-bright/50">
                      <div className="w-12 h-12 rounded bg-surface flex items-center justify-center">
                        <History size={24} className="opacity-40" />
                      </div>
                      <span className="font-bold text-[10px] uppercase tracking-widest text-center opacity-40">Archive Storage</span>
                    </div>
                  ) : (
                    items.map((task) => (
                      <motion.div
                        key={task.id}
                        layoutId={`task-${task.id}`}
                        onClick={() => handleCardClick(task)}
                        className={`bg-surface-bright border rounded-lg p-5 transition-all cursor-pointer group relative ${
                          task.status === 'pending'
                            ? 'border-primary-accent shadow-lg shadow-primary-accent/5'
                            : 'border-outline hover:border-outline-variant hover:shadow-sm'
                        } ${task.status === 'done' ? 'opacity-50 grayscale-[0.5]' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-bold text-[9px] uppercase px-2 py-0.5 rounded tracking-widest border border-outline bg-surface text-on-surface-variant">
                            {task.category}
                          </span>
                          {task.status === 'pending' && (
                            <div className="flex items-center gap-1.5 bg-primary-accent/10 border border-primary-accent/20 px-2 py-0.5 rounded">
                              <div className="w-1.5 h-1.5 bg-primary-accent rounded-full animate-pulse" />
                              <span className="text-[9px] font-bold text-primary-accent uppercase tracking-widest">Active</span>
                            </div>
                          )}
                        </div>

                        <h3 className={`text-[14px] font-bold text-on-surface mb-2 leading-snug tracking-tight ${
                          task.status === 'done' ? 'line-through decoration-on-surface-variant' : ''
                        }`}>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed mb-4 font-medium italic">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline">
                          {task.assignee ? (
                            <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-[9px] font-bold text-white uppercase italic">
                              {task.assignee}
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-3 text-on-surface-variant">
                            {task.date && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                <span className="font-bold text-[9px] uppercase tracking-wider">{task.date}</span>
                              </div>
                            )}
                            {task.status === 'done' ? (
                              <CheckCircle2 size={12} className="text-primary-accent" />
                            ) : task.attachments ? (
                              <div className="flex items-center gap-1">
                                <Paperclip size={12} className="opacity-40" />
                                <span className="text-[9px]">{task.attachments}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedFilePath && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 440, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="h-full flex overflow-hidden"
          >
            <SplitEditor
              filePath={selectedFilePath}
              onClose={() => setSelectedFilePath(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}