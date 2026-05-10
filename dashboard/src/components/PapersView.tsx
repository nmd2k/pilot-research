import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Link as LinkIcon,
  Loader2,
  FileText,
} from "lucide-react";
import { fetchPages } from "../api";
import type { Paper } from "../types";

interface PapersViewProps {
  onOpenDetail?: (paper: Paper) => void;
}

export default function PapersView({ onOpenDetail }: PapersViewProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages("paper")
      .then((data) => setPapers(data.pages))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePaperClick = (paper: Paper) => {
    if (selectedPaperId === paper.id) return;
    setSelectedPaperId(paper.id);
    onOpenDetail?.(paper);
  };

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
          <p className="text-sm mt-1">
            Add papers to your repository to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto custom-scrollbar">
      <div className="max-w-3xl py-16 px-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-on-surface tracking-tight uppercase">
            Recent Publications
          </h2>
          <p className="text-on-surface-variant text-[11px] font-medium tracking-wide mt-1">
            {papers.length} {papers.length === 1 ? "artifact" : "artifacts"} in
            the Knowledge Repository
          </p>
        </div>

        <div className="space-y-2">
          {papers.map((paper) => (
            <div
              key={paper.id}
              onClick={() => handlePaperClick(paper)}
              className={`bg-surface-bright border rounded hover:border-outline-variant hover:shadow-sm transition-all cursor-pointer ${
                selectedPaperId === paper.id
                  ? "border-primary-accent ring-2 ring-primary-accent/20"
                  : "border-outline"
              }`}
            >
              <div className="px-5 py-4">
                <div className="flex items-start gap-4">
                  {/*<span className="inline-block font-bold text-[8px] text-primary-accent bg-primary-accent/10 px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0 mt-1">
                    {paper.category}
                  </span>*/}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-sm font-bold text-on-surface leading-snug tracking-tight">
                      {paper.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1.5">
                      {paper.authors && (
                        <div className="flex items-center gap-1">
                          <User size={10} className="text-on-surface-variant" />
                          {paper.authors}
                        </div>
                      )}
                      {paper.date && (
                        <div className="flex items-center gap-1">
                          <Calendar
                            size={10}
                            className="text-on-surface-variant"
                          />
                          {paper.date}
                        </div>
                      )}
                      {paper.link && (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon
                            size={10}
                            className="text-on-surface-variant"
                          />
                          <a
                            href={
                              paper.link.startsWith("http")
                                ? paper.link
                                : `https://${paper.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-black hover:underline transition-all"
                          >
                            {paper.link.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
