/* NOVAPROJE: install the site as an app (Android, desktop) or show iPhone/iPad instructions. */
(function () {
  'use strict';
  if (window.__npPwa) return; window.__npPwa = true;
  if ('serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {}); });
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var iosSafari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  var deferred = null;
  var css = '[data-pwa-install][hidden]{display:none!important}' +
    '#np-pwa{position:fixed;left:max(12px,env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:95;max-width:min(360px,calc(100vw - 150px));background:#fff;color:#0b1a13;border-radius:18px;box-shadow:0 18px 50px -12px rgba(6,17,12,.45);padding:14px 40px 14px 14px;display:flex;gap:12px;align-items:flex-start;font:14px/1.45 Inter,system-ui,-apple-system,sans-serif}' +
    '#np-pwa img{width:44px;height:44px;border-radius:11px;flex:none}#np-pwa b{display:block;font-size:15px;margin-bottom:2px}#np-pwa p{margin:0;color:#4c5a52}' +
    '#np-pwa .x{position:absolute;top:6px;right:6px;width:32px;height:32px;border:0;background:transparent;border-radius:50%;font-size:20px;color:#56645b;cursor:pointer}' +
    '#np-pwa svg{width:16px;height:16px;vertical-align:-3px}' +
    '@media (max-width:640px){#np-pwa{max-width:calc(100vw - 130px)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  function buttons() { return document.querySelectorAll('[data-pwa-install]'); }
  function show(on) { buttons().forEach(function (b) { if (on) b.removeAttribute('hidden'); else b.setAttribute('hidden', ''); }); }
  function save(k) { try { localStorage.setItem(k, '1'); } catch (e) {} }
  function seen(k) { try { return localStorage.getItem(k) === '1'; } catch (e) { return false; } }
  function iosSheet() {
    if (document.getElementById('np-pwa')) return;
    var d = document.createElement('div'); d.id = 'np-pwa'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'NOVAPROJE uygulamasını ana ekrana ekleyin');
    var where = /iPad/.test(ua) || (/Macintosh/.test(ua)) ? 'üstteki' : 'alttaki';
    d.innerHTML = '<img src="/icons/icon-192.png" alt=""><div><b>NOVAPROJE\'yi ana ekrana ekleyin</b><p>Safari\'de ' + where + ' Paylaş ' + SHARE + ' düğmesine, sonra <b style="display:inline;font-size:14px">Ana Ekrana Ekle</b>\'ye dokunun.</p></div><button class="x" type="button" aria-label="Kapat">×</button>';
    d.querySelector('.x').addEventListener('click', function () { d.remove(); save('np.pwa.ios'); });
    document.body.appendChild(d);
  }
  function onClick(e) {
    e.preventDefault();
    if (deferred) { var p = deferred; deferred = null; p.prompt(); p.userChoice.then(function () { show(false); }).catch(function () {}); }
    else if (iosSafari) iosSheet();
  }
  function wire() { buttons().forEach(function (b) { if (!b.__np) { b.__np = 1; b.addEventListener('click', onClick); } }); }
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; wire(); show(true); });
  addEventListener('appinstalled', function () { deferred = null; show(false); var d = document.getElementById('np-pwa'); if (d) d.remove(); });
  function boot() {
    wire();
    if (iosSafari) { show(true); if (!seen('np.pwa.ios')) setTimeout(iosSheet, 4000); }
    // the panels change pages without reloading: wire buttons that appear later
    new MutationObserver(function () { wire(); if (deferred || iosSafari) show(true); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
