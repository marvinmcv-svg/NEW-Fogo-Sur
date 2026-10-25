import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import type { Page } from '../../payload-types'
import { asMedia, isVideo, mediaUrl, posterUrl, type MediaRef } from '../../lib/media'
import { LazyVideo } from '../motion/LazyVideo'
import { PageHeader } from './PageHeader'

type Block = NonNullable<Page['layout']>[number]

const Media = ({ media }: { media: MediaRef }) => {
  const m = asMedia(media)
  if (!m) return null
  return isVideo(m) ? (
    <LazyVideo src={mediaUrl(m)!} poster={posterUrl(m)} label={m.alt} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mediaUrl(m, 'full')} alt={m.alt} loading="lazy" />
  )
}

export function Blocks({ blocks, locale, whatsappHref }: { blocks: Block[]; locale: string; whatsappHref: string }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'hero':
            return <PageHeader key={block.id} eyebrow={block.eyebrow} title={block.title} intro={block.subtitle} media={block.media} />
          case 'richText':
            return block.content ? (
              <section key={block.id} className="block">
                <div className="block-rich" data-reveal="rise">
                  <RichText data={block.content} />
                </div>
              </section>
            ) : null
          case 'imageText':
            return (
              <section key={block.id} className={`block block-image-text ${block.reverse ? 'is-reverse' : ''}`}>
                <div data-reveal="slice">
                  <Media media={block.media} />
                </div>
                <div>
                  {block.title ? (
                    <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }} data-reveal="rise">
                      {block.title}
                    </h2>
                  ) : null}
                  {block.text ? (
                    <p className="lede" data-reveal="rise">
                      {block.text}
                    </p>
                  ) : null}
                </div>
              </section>
            )
          case 'gallery':
            return (
              <section key={block.id} className="block">
                {block.title ? <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}>{block.title}</h2> : null}
                <div className="block-gallery__grid">
                  {(block.items ?? []).map((item, i) => (
                    <figure key={item.id} data-reveal="rise" style={{ ['--i' as string]: i % 4 }}>
                      <Media media={item.media} />
                      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </section>
            )
          case 'cta': {
            const href = block.action === 'link' ? block.href || `/${locale}` : whatsappHref
            const external = /^https?:/.test(href)
            return (
              <section key={block.id} className="block block-cta">
                <h2 className="display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4.6rem)' }} data-reveal="rise">
                  {block.title}
                </h2>
                {block.text ? <p className="lede" style={{ margin: 0 }}>{block.text}</p> : null}
                {block.buttonLabel ? (
                  external ? (
                    <a className="btn btn--yes" href={href} target="_blank" rel="noopener noreferrer">
                      <span className="btn__dot" aria-hidden="true" />
                      {block.buttonLabel}
                    </a>
                  ) : (
                    <Link className="btn btn--yes" href={href.startsWith('/') && !href.startsWith(`/${locale}`) ? `/${locale}${href}` : href}>
                      <span className="btn__dot" aria-hidden="true" />
                      {block.buttonLabel}
                    </Link>
                  )
                ) : null}
              </section>
            )
          }
          case 'quote':
            return (
              <section key={block.id} className="block block-quote" data-reveal="rise">
                <blockquote>“{block.quote}”</blockquote>
                {block.author ? <cite>{block.author}</cite> : null}
              </section>
            )
          default:
            return null
        }
      })}
    </>
  )
}
