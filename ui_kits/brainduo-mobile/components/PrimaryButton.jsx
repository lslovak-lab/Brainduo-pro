// BRAINDUO · Primary Button (documentation reference — not executed)
// The actual implementation lives in app.css (.bd-btn--primary) + index.html
//
// Variants: primary (black), secondary (charcoal), ghost, sage, warm
// Sizes:    default 56h, compact 48h, micro 36h (pill-shaped, full radius)
// States:   default · hover (lift + warm glow ring) · active (scale .97) · pulse (one-shot tap)
// Motion:   220ms cubic-bezier(0.22, 1, 0.36, 1); pulse 1.2s organic ease.

export default function PrimaryButton({
  children = "Продовжити",
  variant = "primary",       // primary | secondary | ghost | sage | warm
  block = true,
  disabled = false,
  pulseOnClick = true,
  onClick,
}) {
  return (
    <button
      className={`bd-btn bd-btn--${variant}${block ? " bd-btn--block" : ""}`}
      disabled={disabled}
      onClick={(e) => { if (pulseOnClick) e.currentTarget.classList.add("pulse"); onClick?.(e); }}
    >
      {children}
    </button>
  );
}
