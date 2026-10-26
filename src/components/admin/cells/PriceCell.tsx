import type { DefaultCellComponentProps } from 'payload'

// List cell for prices in bolivianos; empty reads as the site shows it.
export default function PriceCell({ cellData }: DefaultCellComponentProps) {
  if (typeof cellData !== 'number') return <span className="fd-cell-muted">Consultar</span>
  return <span className="fd-cell-num">Bs {new Intl.NumberFormat('es-BO').format(cellData)}</span>
}
