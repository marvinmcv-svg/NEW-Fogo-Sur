// Admin login / header branding.
export default function Logo() {
  return (
    <div style={{ textAlign: 'center', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      <div style={{ fontSize: 34, letterSpacing: '0.08em', lineHeight: 1 }}>
        FOGO <span style={{ fontSize: '0.6em', fontStyle: 'italic' }}>de</span> CHÃO
      </div>
      <div style={{ marginTop: 10, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6, fontFamily: 'system-ui, sans-serif' }}>
        Ventura Sur · Panel
      </div>
    </div>
  )
}
