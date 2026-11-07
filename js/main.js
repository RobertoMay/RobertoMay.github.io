const LANGS = ['en', 'es'];
const CV_VERSION = 10;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const [i18n, projects] = await Promise.all(
  ['data/i18n.json', 'data/projects.json'].map((u) => fetch(u, { cache: 'no-cache' }).then((r) => r.json()))
);

const urlLang = new URLSearchParams(location.search).get('lang');
let lang = LANGS.includes(urlLang) ? urlLang : 'en';

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function renderProjects(t) {
  const tpl = $('#project-tpl');
  const list = $('#project-list');
  list.replaceChildren(...projects.map((p) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    const title = p.title[lang];
    const media = $('.project-media', card);
    if (p.video) {
      media.append(el('video', {
        src: p.video, poster: p.image || '', muted: true, loop: true, playsInline: true,
        autoplay: !reduceMotion, controls: reduceMotion, preload: 'metadata',
        ariaLabel: title,
      }));
    } else if (p.image) {
      media.append(el('img', { src: p.image, alt: p.alt?.[lang] || title, width: 1280, height: 800, loading: 'lazy', decoding: 'async' }));
    } else {
      card.classList.add('no-media');
      media.remove();
    }
    $('.project-title', card).textContent = title;
    $('.project-summary', card).textContent = p.summary[lang];
    $('.project-role', card).textContent = p.role[lang];
    if (p.result?.[lang]) $('.project-result', card).textContent = p.result[lang];
    else $('.fact-result', card).remove();
    $('.tags', card).append(...p.tags.map((tag) => el('li', { textContent: tag })));
    $('.project-links', card).append(...Object.entries(p.links || {})
      .filter(([, href]) => href)
      .map(([k, href]) => el('a', {
        href, className: k === 'demo' ? 'btn btn-primary' : 'btn',
        textContent: t[`projects.${k}`], target: '_blank', rel: 'noopener',
      })));
    $$('[data-i18n]', card).forEach((n) => { n.textContent = t[n.dataset.i18n]; });
    return card;
  }));
}

function renderRows(t) {
  $('#job-list').replaceChildren(...t['experience.items'].map((j) =>
    el('li', {},
      el('span', { className: 'edu-when', textContent: j.when }),
      el('div', {},
        el('p', { className: 'edu-what', textContent: j.what }),
        el('p', { className: 'edu-where', textContent: j.where }),
        el('ul', {}, ...j.points.map((p) => el('li', { textContent: p })))))));
  $('#skill-list').replaceChildren(...t['skills.groups'].map((g) =>
    el('div', {}, el('dt', { textContent: g.name }), el('dd', { textContent: g.items.join(' · ') }))));
  $('#edu-list').replaceChildren(...t['education.items'].map((e) =>
    el('li', {},
      el('span', { className: 'edu-when', textContent: e.when }),
      el('div', {}, el('p', { className: 'edu-what', textContent: e.what }), el('p', { className: 'edu-where', textContent: e.where })))));
}

function applyLang() {
  const t = i18n[lang];
  document.documentElement.lang = lang;
  document.title = t['meta.title'];
  $('meta[name="description"]').content = t['meta.description'];
  $$('[data-i18n]').forEach((n) => { if (t[n.dataset.i18n]) n.textContent = t[n.dataset.i18n]; });
  $$('[data-i18n-label]').forEach((n) => { n.setAttribute('aria-label', t[n.dataset.i18nLabel]); });
  $('#lang-toggle').textContent = lang === 'en' ? 'ES' : 'EN';
  $$('[data-cv]').forEach((a) => { a.href = `assets/cv/cv-${lang}.pdf?v=${CV_VERSION}`; });
  renderProjects(t);
  renderRows(t);
  observeReveals();

  const url = new URL(location);
  if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);
}

const { links } = i18n;
$$('[data-mail]').forEach((a) => { a.href = `mailto:${links.email}`; });
$('#contact-email').textContent = links.email;
$$('.js-linkedin').forEach((a) => { a.href = links.linkedin; });
$$('.js-github').forEach((a) => { a.href = links.github; });
$('#year').textContent = new Date().getFullYear();

$('#lang-toggle').addEventListener('click', () => {
  lang = lang === 'en' ? 'es' : 'en';
  applyLang();
});

$('#theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});

const notch = $('.notch');
const menuBtn = $('.menu-btn');
const setMenu = (open) => { notch.dataset.open = open; menuBtn.setAttribute('aria-expanded', open); };
menuBtn.addEventListener('click', () => setMenu(notch.dataset.open !== 'true'));
$$('.nav-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

const navLinks = $$('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e) => {
    navLinks.forEach((a) => a.setAttribute('aria-current', a.hash === `#${e.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach((s) => sectionObserver.observe(s));

const revealObserver = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e) => {
    e.target.classList.add('is-in');
    revealObserver.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -10% 0px' });

function observeReveals() {
  const groups = [
    $$('.section > h2, .section-head, .about-body'),
    $$('.project'),
    $$('#skill-list > div'),
    $$('#job-list > li'),
    $$('#edu-list > li'),
    $$('.contact > :not(h2)'),
    $$('.footer-invite > *, .footer-side'),
  ];
  groups.forEach((items) => items.forEach((n, i) => {
    if (n.classList.contains('is-in')) return;
    n.classList.add('reveal');
    n.style.setProperty('--d', `${Math.min(i, 4) * 70}ms`);
    revealObserver.observe(n);
  }));
}

new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('is-in');
  obs.disconnect();
}).observe($('.footer-name'));

if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
  $('#project-list').addEventListener('pointermove', (e) => {
    const m = e.target.closest('.project-media');
    if (!m) return;
    const r = m.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    m.classList.add('is-tilting');
    m.style.setProperty('--ry', `${x * 6}deg`);
    m.style.setProperty('--rx', `${-y * 6}deg`);
  });
  $('#project-list').addEventListener('pointerout', (e) => {
    const m = e.target.closest('.project-media');
    if (!m || m.contains(e.relatedTarget)) return;
    m.classList.remove('is-tilting');
    m.style.setProperty('--ry', '0deg');
    m.style.setProperty('--rx', '0deg');
  });
}

applyLang();
