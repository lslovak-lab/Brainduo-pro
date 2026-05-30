# BRAINDUO Mobile — UI Kit

Fully interactive, click-thru prototype of the BRAINDUO mobile app in HTML + CSS + Bootstrap 5 + vanilla JS.

## Run
Open `index.html`. Use the phone frame to navigate through:

1. **Splash** → tap continue
2. **Sign-Up / Log-In** → Apple/Google placeholders, skip available
3. **Goal Selection** → multi-select cognitive goals (Логіка, Пам'ять, Концентрація, Увага)
4. **Placement Quiz** → multiple-choice with AI tutor hint
5. **Quiz Complete** → animated radial result
6. **Home** → greeting, daily quests, categories, leaderboard tile
7. **Streak Calendar** → 138-day streak with month grid
8. **Profile** → progress, friends, level, bonuses, skills
9. **Quest Flow** → true/false, multiple-choice, sentence reconstruction
10. **Quest Result** → success or "майже правильно" mistake review

## Architecture
- `index.html` — phone bezel + every screen as a `.bd-screen[data-screen]` section
- `app.css` — screen styling, layered above `colors_and_type.css`
- `app.js` — vanilla router (`go(screen)`), state, micro-animations
- `components/` — reusable JSX (read-only references — not executed; the kit is pure HTML)

## Notes
- Ukrainian throughout
- All micro-copy lifted from the Figma source
- Lucide Icons via CDN
- No React; the JSX files document component contracts for designers
