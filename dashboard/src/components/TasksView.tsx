import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  History,
  CheckCircle2,
  Loader2,
  ArrowRight,
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(({ tasks: t }) => setTasks(t))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (status: Task['status']) => tasks.filter((t) => t.status === status);

  const handleCardClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setSelectedTask(null);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-on-surface-variant" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row overflow-hidden relative">
      <div className={`flex-1 overflow-y-auto overflow-x-auto bg-surface p-10 ${selectedTask ? 'hidden md:block' : ''}`}>
        <div className="flex flex-row gap-8 h-min pb-4">
          {COLUMNS.map((column) => {
            const items = filtered(column.id);
            return (
              <div key={column.id} className="w-[300px] flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="font-bold text-[11px] uppercase text-on-surface-variant tracking-widest">{column.label}</span>
                  <span className="bg-surface-dim px-2 py-0.5 rounded text-[10px] text-on-surface font-bold">
                    {String(items.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-3">
                  {column.id === 'archive' && items.length === 0 ? (
                    <div className="border border-dashed border-outline rounded-lg flex flex-col items-center justify-center py-8 px-6 bg-surface-bright/50">
                      <History size={24} className="opacity-30 mb-3" />
                      <span className="font-bold text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50 text-center">Archive Storage</span>
                    </div>
                  ) : (
                    items.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleCardClick(task)}
                        className={`bg-surface-bright border rounded-lg p-5 transition-all cursor-pointer ${
                          task.status === 'pending'
                            ? 'border-primary-accent shadow-lg shadow-primary-accent/5'
                            : 'border-outline hover:border-outline-variant hover:shadow-sm'
                        } ${task.status === 'done' ? 'opacity-50 grayscale-[0.5]' : ''} ${
                          selectedTask?.id === task.id ? 'ring-2 ring-primary-accent' : ''
                        }`}
                      >
                        {task.category !== 'backlog' && (
                          <div className="flex justify-between items-start mb-3">
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
                        )}

                        {task.category === 'backlog' && task.status === 'pending' && (
                          <div className="flex justify-end items-start mb-3">
                            <div className="flex items-center gap-1.5 bg-primary-accent/10 border border-primary-accent/20 px-2 py-0.5 rounded">
                              <div className="w-1.5 h-1.5 bg-primary-accent rounded-full animate-pulse" />
                              <span className="text-[9px] font-bold text-primary-accent uppercase tracking-widest">Active</span>
                            </div>
                          </div>
                        )}

                        <h3 className={`text-[14px] font-bold text-on-surface mb-3 leading-snug tracking-tight ${
                          task.status === 'done' ? 'line-through decoration-on-surface-variant' : ''
                        }`}>
                          {task.id}. {task.title}
                        </h3>

                        {task.links && task.links.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {task.links.map((link) => (
                              <span key={link} className="text-[9px] font-bold bg-primary-accent/10 text-primary-accent px-2 py-0.5 rounded">
                                [[{link}]]
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-outline">
                          {task.assignee ? (
                            <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-[9px] font-bold text-white uppercase italic">
                              {task.assignee.slice(0, 2)}
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-2 text-on-surface-variant">
                            {task.dependsOn && task.dependsOn !== '—' && (
                              <div className="flex items-center gap-1">
                                <ArrowRight size={10} className="opacity-50" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">{task.dependsOn}</span>
                              </div>
                            )}
                            {task.date && (
                              <div className="flex items-center gap-1">
                                <Calendar size={11} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">{task.date}</span>
                              </div>
                            )}
                            {task.status === 'done' && (
                              <CheckCircle2 size={12} className="text-primary-accent" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <motion.div
            key="task-editor"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 440, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="h-full flex overflow-hidden shrink-0"
          >
            <SplitEditor
              key={selectedTask.filePath || selectedTask.id}
              title={selectedTask.title}
              content={selectedTask.description || ''}
              filePath={selectedTask.filePath || undefined}
              onClose={handleCloseEditor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}