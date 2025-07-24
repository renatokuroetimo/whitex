import React from "react";

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

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks (```)
    if (trimmedLine.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre
            key={key++}
            className="bg-gray-900 text-gray-100 rounded-lg p-4 mt-3 mb-3 text-sm font-mono overflow-x-auto border border-gray-700"
          >
            <code className="block">{codeBlockContent.join("\n")}</code>
          </pre>,
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    // If we're inside a code block, collect the content
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Empty line - add spacing
    if (!trimmedLine) {
      elements.push(<br key={key++} />);
      continue;
    }

    // Headers (### text)
    if (trimmedLine.startsWith("###")) {
      const headerText = trimmedLine.replace(/^###\s*/, "");
      elements.push(
        <h3
          key={key++}
          className="text-lg font-semibold text-gray-900 mt-4 mb-2"
        >
          {formatInlineText(headerText)}
        </h3>,
      );
      continue;
    }

    // Secondary headers (## text)
    if (trimmedLine.startsWith("##")) {
      const headerText = trimmedLine.replace(/^##\s*/, "");
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {formatInlineText(headerText)}
        </h2>,
      );
      continue;
    }

    // Primary headers (# text)
    if (trimmedLine.startsWith("#") && !trimmedLine.startsWith("##")) {
      const headerText = trimmedLine.replace(/^#\s*/, "");
      elements.push(
        <h1 key={key++} className="text-2xl font-bold text-gray-900 mt-6 mb-3">
          {formatInlineText(headerText)}
        </h1>,
      );
      continue;
    }

    // Bullet points (- text or * text)
    if (trimmedLine.match(/^[-*]\s+/)) {
      const bulletText = trimmedLine.replace(/^[-*]\s+/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2 ml-4 mb-1">
          <span className="text-gray-600 mt-1 text-sm">•</span>
          <span className="flex-1">{formatInlineText(bulletText)}</span>
        </div>,
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
            <span className="text-gray-600 font-medium min-w-6 text-sm">
              {number}.
            </span>
            <span className="flex-1">{formatInlineText(listText)}</span>
          </div>,
        );
        continue;
      }
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="mb-2 leading-relaxed">
        {formatInlineText(trimmedLine)}
      </p>,
    );
  }

  // If there's an unclosed code block, add it
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre
        key={key++}
        className="bg-gray-900 text-gray-100 rounded-lg p-4 mt-3 mb-3 text-sm font-mono overflow-x-auto border border-gray-700"
      >
        <code className="block">{codeBlockContent.join("\n")}</code>
      </pre>,
    );
  }

  return elements;
}

/**
 * Formats inline text with bold (**text**), italic (*text*), and inline code (`text`)
 */
function formatInlineText(text: string): React.ReactNode[] {
  if (!text) return [];

  let currentText = text;
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Process all inline formatting patterns
  const patterns = [
    // Bold text **text**
    {
      regex: /\*\*(.*?)\*\*/g,
      component: (content: string) => (
        <strong key={key++} className="font-semibold text-gray-900">
          {content}
        </strong>
      ),
    },
    // Italic text *text* (but not when part of **text**)
    {
      regex: /(?<!\*)\*([^*\n]+?)\*(?!\*)/g,
      component: (content: string) => (
        <em key={key++} className="italic text-gray-800">
          {content}
        </em>
      ),
    },
    // Inline code `text`
    {
      regex: /`([^`\n]+?)`/g,
      component: (content: string) => (
        <code
          key={key++}
          className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono"
        >
          {content}
        </code>
      ),
    },
  ];

  // Split text into segments and process each formatting pattern
  const segments = [{ text: currentText, isFormatted: false }];

  for (const pattern of patterns) {
    const newSegments: Array<{
      text: string;
      isFormatted: boolean;
      component?: React.ReactNode;
    }> = [];

    for (const segment of segments) {
      if (segment.isFormatted) {
        newSegments.push(segment);
        continue;
      }

      let lastIndex = 0;
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

      while ((match = regex.exec(segment.text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          newSegments.push({
            text: segment.text.slice(lastIndex, match.index),
            isFormatted: false,
          });
        }

        // Add the formatted component
        newSegments.push({
          text: match[0],
          isFormatted: true,
          component: pattern.component(match[1]),
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < segment.text.length) {
        newSegments.push({
          text: segment.text.slice(lastIndex),
          isFormatted: false,
        });
      }
    }

    segments.splice(0, segments.length, ...newSegments);
  }

  // Build final parts array
  return segments
    .map((segment) => segment.component || segment.text)
    .filter((part) => (typeof part === "string" ? part.length > 0 : true));
}

/**
 * React component that renders formatted ChatGPT text
 */
export function FormattedChatGPTText({
  text,
  className = "",
}: MarkdownFormatterProps) {
  const formattedElements = formatChatGPTText(text);

  return (
    <div className={`text-sm text-gray-800 leading-relaxed ${className}`}>
      {formattedElements}
    </div>
  );
}
