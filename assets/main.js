// Effetti leggeri: ingresso lettere della scritta grande + copia email.
document.documentElement.classList.add('js');

document.querySelectorAll('.mega[data-split]').forEach((el) => {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c;
    el.appendChild(s);
  });
});

// La scritta grande riempie sempre tutta la larghezza, con qualsiasi font.
function fitMega() {
  document.querySelectorAll('.mega').forEach((el) => {
    el.style.fontSize = '';
    const avail = el.parentElement.clientWidth;
    const used = el.scrollWidth;
    if (!used) return;
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = (size * avail / used * 0.995) + 'px';
  });
}
fitMega();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMega);
let fitTimer;
window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitMega, 100); });

document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.copy;
    const label = btn.querySelector('.label');
    const done = () => { if (label) { label.textContent = 'Copied'; setTimeout(() => (label.textContent = 'Copy'), 1600); } };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).then(done).catch(() => selectText(btn));
    } else {
      selectText(btn);
    }
  });
});

function selectText(btn) {
  const target = btn.querySelector('.value');
  if (!target) return;
  const r = document.createRange();
  r.selectNodeContents(target);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
}
