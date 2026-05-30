// BRAINDUO · Goal Card (documentation reference)
// Square cognitive-goal tile used in onboarding.
// Selected state: sage gradient + black checkmark badge top-right.

export default function GoalCard({
  title = "Логіка",
  meta  = "Аргументація",
  icon  = null,                  // <svg>…</svg>
  selected = false,
  onClick,
}) {
  return (
    <button
      className={`bd-goal${selected ? " selected" : ""}`}
      onClick={onClick}
    >
      <div className="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="glyph">{icon}</div>
      <div>
        <div className="title">{title}</div>
        <div className="meta">{meta}</div>
      </div>
    </button>
  );
}
