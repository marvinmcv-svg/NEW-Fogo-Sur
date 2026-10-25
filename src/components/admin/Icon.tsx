// Small mark in the admin nav: an ember.
export default function Icon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-label="Fogo de Chão">
      <defs>
        <radialGradient id="fogo-ember" cx="50%" cy="65%" r="60%">
          <stop offset="0" stopColor="#FFD08A" />
          <stop offset="0.45" stopColor="#E2571E" />
          <stop offset="1" stopColor="#7A1E0B" />
        </radialGradient>
      </defs>
      <path fill="url(#fogo-ember)" d="M12 2c1 3.2-1.6 4.9-1.6 7.6 0 1.4.9 2.4 2 2.4 1.5 0 2.2-1.6 1.6-3.4 2.6 1.8 4 4.6 4 7.2A6 6 0 0 1 12 22a6 6 0 0 1-6-6.2C6 10.4 11 8 12 2Z" />
    </svg>
  )
}
