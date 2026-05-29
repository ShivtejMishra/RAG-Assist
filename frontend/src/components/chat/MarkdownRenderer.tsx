import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse inline elements (bold, italic, inline code)
  const parseInline = (text: string): React.ReactNode[] => {
    const tokens: { type: 'text' | 'bold' | 'italic' | 'code'; content: string }[] = [];
    let currentIdx = 0;
    
    // Regex matches:
    // 1 & 2: Bold (**text** or __text__)
    // 3 & 4: Italic (*text* or _text_)
    // 5 & 6: Inline code (`code`)
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      // Append text before match
      if (matchIndex > currentIdx) {
        tokens.push({ type: 'text', content: text.substring(currentIdx, matchIndex) });
      }
      
      if (match[1]) {
        // Bold
        tokens.push({ type: 'bold', content: match[2] });
      } else if (match[3]) {
        // Italic
        tokens.push({ type: 'italic', content: match[4] });
      } else if (match[5]) {
        // Inline code
        tokens.push({ type: 'code', content: match[6] });
      }
      
      currentIdx = regex.lastIndex;
    }
    
    if (currentIdx < text.length) {
      tokens.push({ type: 'text', content: text.substring(currentIdx) });
    }
    
    return tokens.map((token, idx) => {
      switch (token.type) {
        case 'bold':
          return (
            <strong key={idx} className="font-extrabold text-slate-950 dark:text-white">
              {token.content}
            </strong>
          );
        case 'italic':
          return (
            <em key={idx} className="italic text-slate-700 dark:text-slate-300">
              {token.content}
            </em>
          );
        case 'code':
          return (
            <code key={idx} className="bg-slate-100 dark:bg-slate-950/80 text-brand-600 dark:text-brand-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200 dark:border-slate-800/80">
              {token.content}
            </code>
          );
        case 'text':
        default:
          return token.content;
      }
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentListItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  const flushList = (key: number) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 mb-4 mt-2 space-y-1.5 text-slate-700 dark:text-slate-300">
          {currentListItems.map((item, itemIdx) => (
            <li key={itemIdx} className="leading-relaxed text-sm">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code block check
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-slate-100 dark:bg-slate-950/95 text-slate-800 dark:text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-200 dark:border-slate-800/80 mb-4 overflow-x-auto shadow-inner">
            <code className={codeBlockLang ? `language-${codeBlockLang}` : ''}>
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList(i);
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // List item check (matches: * item, - item, + item, or 1. item)
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
    if (listMatch) {
      const content = listMatch[3];
      currentListItems.push(content);
      continue;
    } else if (line.trim() === '') {
      flushList(i);
      continue;
    } else {
      flushList(i);
    }

    // Header check (matches: # H1, ## H2, ### H3, etc.)
    if (line.startsWith('#')) {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const depth = headerMatch[1].length;
        const text = headerMatch[2];
        const inlineElements = parseInline(text);
        
        switch (depth) {
          case 1:
            elements.push(
              <h1 key={i} className="text-lg font-bold text-slate-900 dark:text-white mb-3 mt-4 border-b border-slate-200 dark:border-slate-800/80 pb-1">
                {inlineElements}
              </h1>
            );
            break;
          case 2:
            elements.push(
              <h2 key={i} className="text-base font-bold text-slate-900 dark:text-white mb-2.5 mt-3">
                {inlineElements}
              </h2>
            );
            break;
          case 3:
            elements.push(
              <h3 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 mt-2.5">
                {inlineElements}
              </h3>
            );
            break;
          default:
            elements.push(
              <h4 key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 mt-2">
                {inlineElements}
              </h4>
            );
            break;
        }
        continue;
      }
    }

    // Paragraph
    if (line.trim() !== '') {
      elements.push(
        <p key={i} className="mb-3.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium last:mb-0">
          {parseInline(line)}
        </p>
      );
    }
  }

  // Flush any final list items
  flushList(lines.length);

  return <div className="markdown-body space-y-1">{elements}</div>;
};
