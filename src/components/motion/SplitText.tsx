import { Fragment, type ElementType } from 'react'

type Props = {
  text?: string | null
  as?: ElementType
  className?: string
  lines?: string[]
  delay?: number // seconds before the first character
  reveal?: boolean // false = parent controls .is-in
}

// Server-friendly split: renders each character in its own span so CSS can
// stagger them. Screen readers get the plain text via aria-label.
export function SplitText({ text, as: Tag = 'h2', className, lines, delay = 0, reveal = true }: Props) {
  // Content can be empty while an editor is still filling a page in.
  const rows = (lines && lines.length ? lines : [text ?? '']).filter((r): r is string => typeof r === 'string')
  let index = 0
  return (
    <Tag
      className={`split ${className ?? ''}`}
      aria-label={rows.join(' ')}
      data-reveal={reveal ? 'split' : undefined}
      style={{ ['--split-delay' as string]: `${delay}s` }}
    >
      {rows.map((row, r) => (
        <span className="split__line" aria-hidden="true" key={r}>
          {row.split(' ').map((word, w, words) => (
            <Fragment key={w}>
              <span className="split__word">
                {Array.from(word).map((ch, c) => (
                  <span className="split__char" key={c} style={{ ['--i' as string]: index++ }}>
                    {ch}
                  </span>
                ))}
              </span>
              {w < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}
