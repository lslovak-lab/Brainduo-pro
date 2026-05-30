// BRAINDUO · Category Row (documentation reference)
// Horizontal pill-card used on the Home screen — sage / paper / ink variants.

export default function CategoryRow({
  title  = "Челенджі з друзями",
  meta   = "Останній перегляд: 20 годин тому",
  icon   = null,
  variant = "sage",           // sage | alt (paper) | alt2 (ink)
  onClick,
}) {
  const cls = variant === "sage" ? "" : ` ${variant}`;
  return (
    <button className={`bd-cat-row${cls}`} onClick={onClick}>
      <span className="icon-tile">{icon}</span>
      <span className="body">
        <span className="title">{title}</span>
        <span className="meta">{meta}</span>
      </span>
      <span className="arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
    </button>
  );
}
