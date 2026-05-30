// BRAINDUO · Tab Bar (documentation reference)
// Glassmorphic bottom navigation. Active tab gets an orange indicator pill.

export default function TabBar({ active = "home", onChange }) {
  const tabs = [
    { id: "home",    label: "Головна" },
    { id: "tfquest", label: "Квести"  },
    { id: "streak",  label: "Стрік"   },
    { id: "profile", label: "Профіль" },
  ];
  return (
    <nav className="bd-tabbar">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`bd-tab${active === t.id ? " active" : ""}`}
          onClick={() => onChange?.(t.id)}
        >
          {/* icon */}
          {t.label}
          <span className="dot" />
        </button>
      ))}
    </nav>
  );
}
