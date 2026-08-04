'use client'

import type { ReactNode } from 'react'

type Block =
  | { type: 'p'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'h'; level: 2 | 3; text: string }

function parseLineBlocks(lines: string[]): Block[] {
  const blocks: Block[] = []
  let i = 0

  const pushParagraph = (chunk: string[]) => {
    if (chunk.length > 0) blocks.push({ type: 'p', lines: chunk })
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    const h3 = trimmed.match(/^###\s+(.+)$/)
    if (h3) {
      blocks.push({ type: 'h', level: 3, text: h3[1].trim() })
      i++
      continue
    }
    const h2 = trimmed.match(/^##\s+(.+)$/)
    if (h2) {
      blocks.push({ type: 'h', level: 2, text: h2[1].trim() })
      i++
      continue
    }

    const bullet = trimmed.match(/^[-*•]\s+(.+)$/)
    if (bullet) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i].trim().match(/^[-*•]\s+(.+)$/)
        if (!m) break
        items.push(m[1].trim())
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (numbered) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i].trim().match(/^\d+[.)]\s+(.+)$/)
        if (!m) break
        items.push(m[1].trim())
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const para: string[] = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (/^[-*•]\s+/.test(t) || /^\d+[.)]\s+/.test(t) || /^##?\s+/.test(t)) break
      para.push(lines[i])
      i++
    }
    pushParagraph(para)
  }

  return blocks
}

function parseBlocks(content: string): Block[] {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const sections = normalized.split(/\n\n+/)
  return sections.flatMap((section) => {
    const lines = section.split('\n').filter((l) => l.trim().length > 0)
    return parseLineBlocks(lines)
  })
}

function renderInline(text: string, inverted = false): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={inverted ? 'font-semibold text-white' : 'font-semibold text-navaro-forest'}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className={inverted ? 'italic text-white/95' : 'italic text-navaro-forest/85'}>
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className={
            inverted
              ? 'rounded bg-white/15 px-1 py-0.5 font-mono text-[0.85em] text-white'
              : 'rounded bg-navaro-accent-soft/80 px-1 py-0.5 font-mono text-[0.85em] text-navaro-forest'
          }
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function InlineText({ text, inverted = false }: { text: string; inverted?: boolean }) {
  const segments = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {segments.map((segment, i) => {
        const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              className={
                inverted
                  ? 'font-medium text-navaro-accent underline underline-offset-2'
                  : 'font-medium text-navaro-teal underline underline-offset-2 hover:text-navaro-forest'
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkMatch[1]}
            </a>
          )
        }
        return <span key={i}>{renderInline(segment, inverted)}</span>
      })}
    </>
  )
}

const proseClass =
  'chat-md space-y-2.5 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-4'

export default function ChatMessageContent({
  content,
  variant = 'assistant',
}: {
  content: string
  variant?: 'user' | 'assistant'
}) {
  const inverted = variant === 'user'

  if (variant === 'user') {
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
  }

  const blocks = parseBlocks(content)
  if (blocks.length === 0) {
    return <p className="leading-relaxed">{content}</p>
  }

  return (
    <div className={proseClass}>
      {blocks.map((block, i) => {
        if (block.type === 'h') {
          const Tag = block.level === 2 ? 'h3' : 'h4'
          return (
            <Tag
              key={i}
              className={
                block.level === 2
                  ? 'text-sm font-bold text-navaro-forest'
                  : 'text-sm font-semibold text-navaro-forest/90'
              }
            >
              <InlineText text={block.text} />
            </Tag>
          )
        }
        if (block.type === 'ul') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={i}>
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineText text={item} />
                </li>
              ))}
            </ol>
          )
        }
        return (
          <div key={i} className="space-y-1.5">
            {block.lines.map((line, j) => (
              <p key={j}>
                <InlineText text={line.trim()} inverted={inverted} />
              </p>
            ))}
          </div>
        )
      })}
    </div>
  )
}
