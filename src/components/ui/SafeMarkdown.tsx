'use client';

import React from 'react';
import { sanitizeExternalUrl } from '@/lib/utils';

export interface InlineMarkdownClasses {
  bold?: string;
  italic?: string;
  code?: string;
  link?: string;
}

/**
 * Safely renders inline markdown (**bold**, *italic*, `code`, [label](url))
 * as React elements without dangerouslySetInnerHTML, enforcing http:/https: on links.
 */
export function renderInlineMarkdown(
  text: string,
  classes?: InlineMarkdownClasses
): React.ReactNode {
  if (!text) return text;

  const tokenRegex = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([\s\S]+?)\*\*|\*([^*\n]+)\*/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      const label = match[1];
      const safeUrl = sanitizeExternalUrl(match[2]);
      if (safeUrl) {
        nodes.push(
          <a
            key={key++}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              classes?.link ||
              'text-blue-400 hover:text-blue-300 underline underline-offset-2'
            }
          >
            {label}
          </a>
        );
      } else {
        nodes.push(<span key={key++}>{label}</span>);
      }
    } else if (match[3] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className={
            classes?.code ||
            'px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs'
          }
        >
          {match[3]}
        </code>
      );
    } else if (match[4] !== undefined) {
      nodes.push(
        <strong
          key={key++}
          className={classes?.bold || 'text-white font-semibold'}
        >
          {match[4]}
        </strong>
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <em key={key++} className={classes?.italic || 'text-purple-200'}>
          {match[5]}
        </em>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  if (nodes.length === 0) return text;
  if (nodes.length === 1) return nodes[0];
  return nodes;
}
