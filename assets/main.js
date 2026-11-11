// Sito test YEEZIK: adattamento della scritta grande, menu mobile, copia email.
document.documentElement.classList.add('js');

// Le scritte grandi riempiono sempre la larghezza disponibile, con qualsiasi font.
function fit() {
  document.querySelectorAll('[data-fit]').forEach((el) => {
    el.style.fontSize = '';
    const avail = el.parentElement.clientWidth -
      parseFloat(getComputedStyle(el.parentElement).paddingLeft) -
      parseFloat(getComputedStyle(el.parentElement).paddingRight);
    const used = el.scrollWidth;
    if (!used || !avail) return;
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = (size * avail / used * 0.99) + 'px';
  });
}
fit();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
let t;
window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fit, 100); });

// Menu a schermo intero su telefono.
const sheet = document.getElementById('sheet');
const openBtn = document.querySelector('.menu-btn');
const closeBtn = document.querySelector('.sheet-close');
function setMenu(open) {
  if (!sheet) return;
  sheet.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
  if (open && closeBtn) closeBtn.focus();
  if (!open && openBtn) openBtn.focus();
}
if (openBtn) openBtn.addEventListener('click', () => setMenu(true));
if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet && !sheet.hidden) setMenu(false); });

// Pulsanti per copiare gli indirizzi email.
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const state = btn.querySelector('.state');
    const done = () => { if (state) { state.textContent = 'Copied'; setTimeout(() => (state.textContent = 'Copy'), 1600); } };
    const fallback = () => {
      const v = btn.querySelector('.value');
      if (!v) return;
      const r = document.createRange(); r.selectNodeContents(v);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(done).catch(fallback);
    else fallback();
  });
});
