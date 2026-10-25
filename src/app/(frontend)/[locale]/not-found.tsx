import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">404</p>
      <h1 className="display">Este corte no está en el espeto.</h1>
      <Link className="btn btn--ghost" href="/">
        Fogo de Chão
      </Link>
    </section>
  )
}
