// BRAINDUO · Quiz Answer (documentation reference)
// Multi/single-select answer tile. States: default · selected · correct · wrong.

export default function QuizAnswer({
  letter = "А",
  label  = "Тільки лютий",
  state  = "default",      // default | selected | correct | wrong
  onClick,
}) {
  const stateCls = state !== "default" ? ` ${state}` : "";
  return (
    <button className={`bd-quiz-answer${stateCls}`} onClick={onClick}>
      <span className="letter">{letter}</span>
      {label}
    </button>
  );
}
