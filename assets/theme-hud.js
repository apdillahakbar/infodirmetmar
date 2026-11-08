/**
 * Maritime Information Workspace - Theme & HUD Telemetry System
 * Handles instant Dark/Light theme switching and live UTC/WIB operational clock.
 */
(function () {
  'use strict';

  var THEME_KEY = 'miw_theme';

  function getTheme() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to dark theme for high-tech aesthetic, fallback to system
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}

    var isDark = theme === 'dark';
    document.querySelectorAll('.theme-toggle-btn, .gate-theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', isDark ? 'Beralih ke Tema Terang (White Theme)' : 'Beralih ke Tema Gelap (Dark Theme)');
      btn.setAttribute('title', isDark ? 'Beralih ke Tema Terang (White Theme)' : 'Beralih ke Tema Gelap (Dark Theme)');
      var label = btn.querySelector('.theme-label');
      if (label) label.textContent = isDark ? 'DARK' : 'WHITE';
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // Apply immediately to prevent FOUC (flash of unstyled content)
  applyTheme(getTheme());

  // Real-time HUD Clock for Maritime Forecaster On Duty (UTC & WIB)
  function updateHUDClock() {
    var now = new Date();
    var utcEl = document.getElementById('hud-utc');
    var wibEl = document.getElementById('hud-wib');

    if (utcEl) {
      var uH = String(now.getUTCHours()).padStart(2, '0');
      var uM = String(now.getUTCMinutes()).padStart(2, '0');
      var uS = String(now.getUTCSeconds()).padStart(2, '0');
      utcEl.textContent = uH + ':' + uM + ':' + uS + ' UTC';
    }

    if (wibEl) {
      // WIB = UTC + 7 hours
      var wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      var wH = String(wib.getUTCHours()).padStart(2, '0');
      var wM = String(wib.getUTCMinutes()).padStart(2, '0');
      var wS = String(wib.getUTCSeconds()).padStart(2, '0');
      wibEl.textContent = wH + ':' + wM + ':' + wS + ' WIB';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyTheme(getTheme());
      updateHUDClock();
      setInterval(updateHUDClock, 1000);
    });
  } else {
    applyTheme(getTheme());
    updateHUDClock();
    setInterval(updateHUDClock, 1000);
  }

  // Delegation for theme toggle clicks and password visibility toggle
  document.addEventListener('click', function (e) {
    var toggleBtn = e.target.closest('.theme-toggle-btn') || e.target.closest('.gate-theme-toggle');
    if (toggleBtn) {
      e.preventDefault();
      toggleTheme();
      return;
    }

    var passToggle = e.target.closest('.gate-pass-toggle');
    if (passToggle) {
      e.preventDefault();
      var passInput = document.getElementById('gate-pass');
      if (passInput) {
        var isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        passToggle.setAttribute('aria-label', isPass ? 'Sembunyikan password' : 'Lihat password');
      }
    }
  });

  // Listen for storage events across tabs or iframes
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY && e.newValue) {
      applyTheme(e.newValue);
    }
  });

  // Check parent theme on iframe load
  try {
    if (window.parent && window.parent !== window && window.parent.document) {
      var pTheme = window.parent.document.documentElement.getAttribute('data-theme');
      if (pTheme) applyTheme(pTheme);
    }
  } catch (err) {}

  window.MIW_THEME = {
    get: getTheme,
    set: applyTheme,
    toggle: toggleTheme
  };
})();
