import { LazyVideo } from '../motion/LazyVideo'
import { SplitText } from '../motion/SplitText'
import { EmberField } from '../motion/EmberField'
import { splitLines } from '../../lib/format'
import { asMedia, isVideo, mediaUrl, posterUrl, type MediaRef } from '../../lib/media'

export function PageHeader({ eyebrow, title, intro, media }: { eyebrow?: string | null; title?: string | null; intro?: string | null; media?: MediaRef }) {
  const m = asMedia(media)
  return (
    <header className={`page-head ${m ? '' : 'page-head--plain'}`}>
      {m ? (
        <div className="page-head__media" data-reveal="slice">
          {isVideo(m) ? (
            <LazyVideo src={mediaUrl(m)!} poster={posterUrl(m)} eager />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(m, 'full')} alt="" />
          )}
        </div>
      ) : (
        <EmberField density={2} />
      )}
      <div className="page-head__inner">
        {eyebrow ? (
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
        ) : null}
        <SplitText as="h1" className="page-head__title" text={title} lines={splitLines(title)} />
        {intro ? (
          <p className="lede" data-reveal="rise">
            {intro}
          </p>
        ) : null}
      </div>
    </header>
  )
}
