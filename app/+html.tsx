import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const FRAME_CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background: radial-gradient(ellipse at 50% 40%, #1a1f2e 0%, #0d0f18 60%, #080a12 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
  }

  #root {
    position: relative !important;
    width: 430px !important;
    height: 932px !important;
    min-height: 932px !important;
    max-height: 932px !important;
    border-radius: 54px !important;
    overflow: hidden !important;
    flex-shrink: 0 !important;

    /* Metal bezel: inner highlight → mid silver → deep edge → outer shadow */
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.18),
      0 0 0 1.5px #4a4a52,
      0 0 0 3px #2e2e36,
      0 0 0 4px #1a1a22,
      0 0 40px 6px rgba(0,0,0,0.9),
      0 60px 120px -20px rgba(0,0,0,0.7) !important;
  }

  /* Dynamic Island */
  #di {
    position: fixed;
    z-index: 999999;
    width: 126px;
    height: 37px;
    background: #000;
    border-radius: 20px;
    pointer-events: none;
    /* positioned by JS */
    display: none;
  }

  /* Side buttons */
  .phone-btn {
    position: fixed;
    z-index: 999999;
    background: #2e2e36;
    border-radius: 3px;
    pointer-events: none;
    display: none;
    box-shadow:
      inset 1px 0 0 rgba(255,255,255,0.12),
      inset -1px 0 0 rgba(0,0,0,0.4);
  }

  #btn-power {
    width: 3.5px;
    height: 82px;
  }

  #btn-vol-up {
    width: 3.5px;
    height: 46px;
  }

  #btn-vol-down {
    width: 3.5px;
    height: 46px;
  }

  #btn-silent {
    width: 3.5px;
    height: 32px;
  }
`;

const POSITION_SCRIPT = `
(function() {
  function positionOverlays() {
    var root = document.getElementById('root');
    var di   = document.getElementById('di');
    var pow  = document.getElementById('btn-power');
    var volu = document.getElementById('btn-vol-up');
    var vold = document.getElementById('btn-vol-down');
    var sil  = document.getElementById('btn-silent');

    if (!root) return;

    var r = root.getBoundingClientRect();
    var rx = r.left, ry = r.top, rw = r.width;

    /* Dynamic Island: centred horizontally, 12px from top inside the phone */
    if (di) {
      var diW = 126, diH = 37;
      di.style.left   = (rx + rw / 2 - diW / 2) + 'px';
      di.style.top    = (ry + 12) + 'px';
      di.style.display = 'block';
    }

    /* Power button — right side, ~220px from top */
    if (pow) {
      pow.style.left    = (rx + rw + 0.5) + 'px';
      pow.style.top     = (ry + 220) + 'px';
      pow.style.display = 'block';
    }

    /* Silent switch — left side, ~160px from top */
    if (sil) {
      sil.style.left    = (rx - 4) + 'px';
      sil.style.top     = (ry + 160) + 'px';
      sil.style.display = 'block';
    }

    /* Vol up — left side, ~210px from top */
    if (volu) {
      volu.style.left    = (rx - 4) + 'px';
      volu.style.top     = (ry + 210) + 'px';
      volu.style.display = 'block';
    }

    /* Vol down — left side, ~268px from top */
    if (vold) {
      vold.style.left    = (rx - 4) + 'px';
      vold.style.top     = (ry + 268) + 'px';
      vold.style.display = 'block';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', positionOverlays);
  } else {
    positionOverlays();
  }
  window.addEventListener('resize', positionOverlays);
})();
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>Brainduo</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: FRAME_CSS }} />
      </head>
      <body>
        {children}
        <div id="di" aria-hidden="true" />
        <div id="btn-power"    className="phone-btn" aria-hidden="true" />
        <div id="btn-vol-up"   className="phone-btn" aria-hidden="true" />
        <div id="btn-vol-down" className="phone-btn" aria-hidden="true" />
        <div id="btn-silent"   className="phone-btn" aria-hidden="true" />
        <script dangerouslySetInnerHTML={{ __html: POSITION_SCRIPT }} />
      </body>
    </html>
  );
}
