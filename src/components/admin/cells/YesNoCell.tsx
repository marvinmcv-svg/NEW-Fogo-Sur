import type { DefaultCellComponentProps } from 'payload'

// List cell for checkboxes: a quiet status pill instead of "verdadero"/"falso".
export default function YesNoCell({ cellData }: DefaultCellComponentProps) {
  const on = cellData === true
  return <span className={`fd-cell-pill ${on ? 'is-on' : ''}`}>{on ? 'Sí' : 'No'}</span>
}
