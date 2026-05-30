/* ============================================================
   BRAINDUO — interactive prototype controller (vanilla JS)
   ============================================================ */

const SCREEN_GROUPS = [
  { name: "Старт",       items: [
    ['splash',      'Splash'],
    ['signup',      'Sign Up'],
    ['goalpath',    'Шлях'],
    ['goals',       'Цілі'],
    ['quiz',        'Тест рівня'],
    ['quizResult',  'Результат тесту'],
  ]},
  { name: "Головна",     items: [
    ['home',        'Home'],
    ['challenges',  'Челенджі'],
    ['calendar',    'Календар'],
    ['streak',      'Стрік'],
    ['fiveDays',    '5 днів'],
    ['rankUp',      'Рейтинг ↑'],
  ]},
  { name: "Квести",      items: [
    ['tfquest',     'Правда/Хиба'],
    ['mcquest',     'Checkbox'],
    ['typeQuest',   'Введи'],
    ['voiceQuest',  'Голос'],
    ['pollQuest',   'Опитування'],
    ['sentence',    'Речення'],
    ['questResult', 'Підсумок'],
    ['reviewSummary','Огляд'],
    ['mistakes',    'Помилка'],
  ]},
  { name: "Профіль",     items: [
    ['profile',     'Профіль'],
    ['profileStats','Статистика'],
    ['profileBadges','Бейджі'],
    ['badgeDetail', 'Бейдж'],
    ['shareBadge',  'Поділитись'],
    ['insights',    'Інсайти'],
  ]},
  { name: "Лідери",      items: [
    ['leaderboardFull',    'Топ тижня'],
    ['leaderboardAllTime', 'Топ усе'],
  ]},
  { name: "Налаштування",items: [
    ['settings',    'Settings'],
    ['faq',         'FAQ'],
    ['invite',      'Запросити'],
  ]},
];

const SCREENS = SCREEN_GROUPS.flatMap(g => g.items);

function go(name) {
  document.querySelectorAll('.bd-screen').forEach(s => s.classList.remove('active'));
  const el = document.querySelector(`.bd-screen[data-screen="${name}"]`);
  if (el) {
    el.classList.add('active');
    const body = el.querySelector('.bd-screen-body');
    if (body) body.scrollTop = 0;
    const tabbar = el.querySelector('.bd-tabbar');
    if (tabbar) tabbar.classList.remove('is-hidden');
    if (name === 'quizResult') animateRing();
    if (name === 'fiveDays')   spawnConfetti('confetti1');
    if (name === 'rankUp')     spawnConfetti('confetti2');
  }
  document.querySelectorAll('#toolbar button[data-target]').forEach(b => {
    b.classList.toggle('active', b.dataset.target === name);
  });
}

function pulse(btn) {
  btn.classList.remove('pulse');
  void btn.offsetWidth;
  btn.classList.add('pulse');
}

function toggleGoal(el)  {
  el.classList.toggle('selected');
  armCtaIfAny('goals', '.bd-goal.selected');
}
function toggleSel(el)   {
  el.classList.toggle('selected');
  armCtaIfAny('mcquest', '.bd-quiz-answer.selected');
}
function pickPath(el)    {
  document.querySelectorAll('.bd-path-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  armCta('goalpath');
}
function pickAnswer(el)  {
  el.parentElement.querySelectorAll('.bd-quiz-answer').forEach(a => a.classList.remove('selected','correct','wrong'));
  el.classList.add('selected');
  armCta('quiz');
}
function setTab(btn, target) { go(target); }
function setSeg(btn) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function pickPoll(el) {
  el.parentElement.querySelectorAll('.bd-poll-row').forEach(r => r.classList.remove('your'));
  el.classList.add('your');
  armCta('pollQuest');
}
function pickTF(el) {
  // Binary choice — flip the tapped one to active, the other to default
  const siblings = el.parentElement.querySelectorAll('.bd-btn--option');
  siblings.forEach(b => b.classList.remove('is-active'));
  el.classList.add('is-active');
  // Auto-advance after the visual feedback settles
  setTimeout(() => go('mcquest'), 420);
}
function toggleVoiceRec(el) {
  el.classList.toggle('rec');
  armCta('voiceQuest');
}

/* ─── Gated CTA helpers ──────────────────────────────────── */
function armCta(screenName) {
  const screen = document.querySelector(`.bd-screen[data-screen="${screenName}"]`);
  if (!screen) return;
  screen.querySelectorAll('[data-cta]').forEach(b => b.classList.remove('is-pending'));
}
function disarmCta(screenName) {
  const screen = document.querySelector(`.bd-screen[data-screen="${screenName}"]`);
  if (!screen) return;
  screen.querySelectorAll('[data-cta]').forEach(b => b.classList.add('is-pending'));
}
function armCtaIfAny(screenName, selector) {
  const screen = document.querySelector(`.bd-screen[data-screen="${screenName}"]`);
  if (!screen) return;
  const has = !!screen.querySelector(selector);
  screen.querySelectorAll('[data-cta]').forEach(b => b.classList.toggle('is-pending', !has));
}

function moveToken(btn, slotId) {
  const slot = document.getElementById(slotId);
  const clone = btn.cloneNode(true);
  clone.classList.remove('bank');
  clone.classList.add('placed');
  clone.onclick = () => {
    btn.classList.remove('used'); clone.remove();
    armCtaIfAny('sentence', '#answerSlot .bd-token');
  };
  btn.classList.add('used');
  slot.appendChild(clone);
  armCta('sentence');
}

function animateRing() {
  const ring = document.getElementById('ringFill');
  if (!ring) return;
  ring.style.transition = 'none';
  ring.style.strokeDashoffset = '540';
  requestAnimationFrame(() => {
    ring.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)';
    ring.style.strokeDashoffset = '81';
  });
}

/* ─── Confetti generator ─────────────────────────────────── */
const CONFETTI_COLORS = ['#F58A3A', '#EFC84A', '#B7CB84', '#FFB17A', '#F6DD80'];
function spawnConfetti(elId) {
  const host = document.getElementById(elId);
  if (!host || host.dataset.populated) return;
  host.dataset.populated = '1';
  for (let i = 0; i < 32; i++) {
    const p = document.createElement('i');
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    p.style.animationDelay = (Math.random() * 3) + 's';
    p.style.animationDuration = (3 + Math.random() * 2) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    host.appendChild(p);
  }
}

/* ─── Live clock ─────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.querySelectorAll('.bd-statusbar .time').forEach(t => t.textContent = `${hh}:${mm}`);
}
setInterval(updateClock, 1000 * 30);
updateClock();

/* ─── Build grouped debug toolbar ────────────────────────── */
(() => {
  const tb = document.getElementById('toolbar');
  if (!tb) return;
  SCREEN_GROUPS.forEach(g => {
    const lab = document.createElement('span');
    lab.className = 'toolbar-group-label';
    lab.textContent = g.name;
    tb.appendChild(lab);
    g.items.forEach(([key, label]) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.dataset.target = key;
      b.onclick = () => go(key);
      if (key === 'splash') b.classList.add('active');
      tb.appendChild(b);
    });
  });
})();

/* ─── Keyboard nav ───────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  const order = SCREENS.map(s => s[0]);
  const cur = document.querySelector('.bd-screen.active')?.dataset.screen;
  const i = order.indexOf(cur);
  if (e.key === 'ArrowRight' && i < order.length - 1) go(order[i + 1]);
  if (e.key === 'ArrowLeft' && i > 0) go(order[i - 1]);
});

/* ─── Mark screens that contain a floating tab bar ──────── */
document.querySelectorAll('.bd-screen').forEach(s => {
  if (s.querySelector(':scope > .bd-tabbar')) s.classList.add('has-tabbar');
});

/* ─── Hide-on-scroll tab bar ─────────────────────────────── */
(() => {
  const MIN_DELTA     = 4;   // px — ignore micro-movements
  const TOP_THRESHOLD = 20;  // px — always show when near top

  document.querySelectorAll('.bd-screen').forEach(screen => {
    const body   = screen.querySelector('.bd-screen-body');
    const tabbar = screen.querySelector('.bd-tabbar');
    if (!body || !tabbar) return;

    let prevY    = 0;
    let lastDir  = 'up';
    let ticking  = false;

    body.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y  = body.scrollTop;
        const dy = y - prevY;

        if (y < TOP_THRESHOLD) {
          if (lastDir !== 'up') {
            lastDir = 'up';
            tabbar.classList.remove('is-hidden');
          }
        } else if (Math.abs(dy) >= MIN_DELTA) {
          const dir = dy > 0 ? 'down' : 'up';
          if (dir !== lastDir) {
            lastDir = dir;
            tabbar.classList.toggle('is-hidden', dir === 'down');
          }
        }

        prevY   = y;
        ticking = false;
      });
    }, { passive: true });
  });
})();
