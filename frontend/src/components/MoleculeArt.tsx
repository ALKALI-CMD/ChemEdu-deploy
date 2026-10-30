export default function MoleculeArt() {
  return (
    <div className="molecule-art" aria-hidden="true">
      <span className="molecule-caption">THE BEAUTY OF CHEMISTRY</span>
      <svg viewBox="0 0 480 400" fill="none">
        <circle cx="240" cy="200" r="160" stroke="currentColor" opacity=".12" />
        <circle cx="240" cy="200" r="112" stroke="currentColor" strokeDasharray="3 8" opacity=".2" />
        <path d="M130 145 220 95 310 148 310 252 220 303 130 250Z M220 95V48 M310 148 387 103 M310 252 387 297 M130 250 65 290 M130 145 65 105 M145 159V236 M235 111 294 146 M235 286 294 252" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {[[130,145],[220,95],[310,148],[310,252],[220,303],[130,250]].map(([x,y], i) => <g key={i}><circle cx={x} cy={y} r="15" fill="var(--art-surface)" /><circle cx={x} cy={y} r="6" fill="currentColor" /></g>)}
        <g fill="currentColor" fontSize="21" fontFamily="serif"><text x="35" y="105">HO</text><text x="205" y="40">OH</text><text x="389" y="106">OH</text><text x="390" y="307">OH</text><text x="36" y="308">H</text></g>
        <path d="M40 355H440" stroke="currentColor" opacity=".2" />
        <text x="40" y="380" fill="currentColor" fontSize="11" letterSpacing="3">STRUCTURE · REACTION · DISCOVERY</text>
      </svg>
      <span className="molecule-note">从结构出发，探索化学。</span>
    </div>
  )
}
