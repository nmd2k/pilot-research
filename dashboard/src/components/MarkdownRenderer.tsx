import React from 'react';

export function renderMarkdown(body: string, onWikilink?: (slug: string) => void): React.ReactNode[] {
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
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\)|\[\[(.+?)\]\])/g;
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
      } else if (match[5] && match[6]) {
        parts.push(
          <a key={`a-${match.index}`} href={match[6]} target="_blank" rel="noopener noreferrer" className="text-primary-accent hover:underline">
            {match[5]}
          </a>
        );
      } else if (match[7]) {
        const slug = match[7];
        if (onWikilink) {
          parts.push(
            <button
              key={`wl-${match.index}`}
              onClick={(e) => { e.preventDefault(); onWikilink(slug); }}
              className="text-primary-accent hover:underline cursor-pointer bg-primary-accent/5 px-0.5 rounded"
            >
              {slug}
            </button>
          );
        } else {
          parts.push(slug);
        }
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };

  const processLine = (line: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let processed = line;
    let match;
    const replacements: { index: number; len: number; text: string; key: string }[] = [];
    while ((match = boldRegex.exec(line)) !== null) {
      replacements.push({ index: match.index, len: match[0].length, text: match[1], key: `tb-${match.index}` });
    }
    return processInline(line);
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

    if (line.startsWith('---') || line.startsWith('***') || line.startsWith('___')) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="border-t border-outline my-8" />);
      i++;
      continue;
    }

    const tableRowMatch = line.match(/^\|(.+)\|$/);
    if (tableRowMatch) {
      flushList();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].match(/^\|(.+)\|$/)) {
        tableLines.push(lines[i]);
        i++;
      }
      const isSeparator = (l: string) => /^\|[\s\-:]+\|/.test(l);
      const rows = tableLines.filter(l => !isSeparator(l));
      if (rows.length > 0) {
        const headers = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
        const bodyRows = rows.slice(1).map(r =>
          r.split('|').filter(c => c.trim() !== '').map(c => c.trim())
        );
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-on-surface">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left py-2 px-3 font-bold text-on-surface text-[12px] uppercase tracking-wider">
                      {processInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-outline">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3 text-on-surface-variant text-[13px]">
                        {processInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
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

    if (/^\d+\.\s/.test(line)) {
      flushList();
      const olItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        olItems.push(
          <li key={`oli-${i}`}>{processInline(lines[i].replace(/^\d+\.\s/, ''))}</li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-6 space-y-1 my-4 text-on-surface-variant">
          {olItems}
        </ol>
      );
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