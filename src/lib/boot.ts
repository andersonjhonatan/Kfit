/** Scripts que rodam antes de pintar a página (tema e abertura). */
export const INTRO_KEY = 'kfit-intro-v1';
export const THEME_KEY = 'kfit-theme';

export const INTRO_BOOT = `(function(){try{var d=document.documentElement;var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-intro',(!r&&!sessionStorage.getItem('${INTRO_KEY}'))?'pending':'done')}catch(e){document.documentElement.setAttribute('data-intro','done')}})();`;

export const THEME_BOOT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;
