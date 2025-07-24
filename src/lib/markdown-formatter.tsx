import React from 'react';

export interface MarkdownFormatterProps {
  text: string;
  className?: string;
}

/**
 * Formats text with basic markdown patterns commonly used by ChatGPT
 * Supports: **bold**, ### headers, - bullet points, numbered lists
 */
export function formatChatGPTText(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Empty line - add spacing
    if (!trimmedLine) {
      elements.push(<br key={key++} />);
      continue;
    }

    // Headers (### text)
    if (trimmedLine.startsWith('###')) {
      const headerText = trimmedLine.replace(/^###\s*/, '');
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          {formatInlineText(headerText)}
        </h3>
      );
      continue;
    }

    // Secondary headers (## text)
    if (trimmedLine.startsWith('##')) {
      const headerText = trimmedLine.replace(/^##\s*/, '');
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {formatInlineText(headerText)}
        </h2>
      );
      continue;
    }

    // Bullet points (- text or * text)
    if (trimmedLine.match(/^[-*]\s+/)) {
      const bulletText = trimmedLine.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={key++} className="flex items-start gap-2 ml-4 mb-1">
          <span className="text-gray-600 mt-1">•</span>
          <span>{formatInlineText(bulletText)}</span>
        </div>
      );
      continue;
    }

    // Numbered lists (1. text, 2. text, etc.)
    if (trimmedLine.match(/^\d+\.\s+/)) {
      const match = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (match) {
        const [, number, listText] = match;
        elements.push(
          <div key={key++} className="flex items-start gap-2 ml-4 mb-1">
            <span className="text-gray-600 font-medium min-w-6">{number}.</span>
            <span>{formatInlineText(listText)}</span>
          </div>
        );
        continue;
      }
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="mb-2 leading-relaxed">
        {formatInlineText(trimmedLine)}
      </p>
    );
  }

  return elements;
}

/**
 * Formats inline text with bold (**text**) and other inline formatting
 */
function formatInlineText(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let key = 0;
  let currentIndex = 0;

  // Handle **bold** text
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > currentIndex) {
      const beforeText = text.slice(currentIndex, match.index);
      parts.push(beforeText);
    }

    // Add the bold text
    parts.push(
      <strong key={key++} className="font-semibold text-gray-900">
        {match[1]}
      </strong>
    );

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * React component that renders formatted ChatGPT text
 */
export function FormattedChatGPTText({ text, className = "" }: MarkdownFormatterProps) {
  const formattedElements = formatChatGPTText(text);

  return (
    <div className={`text-sm text-gray-800 leading-relaxed ${className}`}>
      {formattedElements}
    </div>
  );
}
