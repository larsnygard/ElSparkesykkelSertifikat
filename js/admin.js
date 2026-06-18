/**
 * admin.js – Administrasjon av spørsmålsbanken
 * Legg til, rediger og slett spørsmål. Eksporter/importer JSON.
 */

/* ── Tilstand ─────────────────────────────────────────────────────────── */
let adminQuestions = [];
let editingId      = null;   // null = nytt spørsmål, ellers ID

/* ── Init ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  adminQuestions = getQuestions();
  renderQuestionList();
  updateStats();
  attachEventListeners();
});

/* ── Render liste ──────────────────────────────────────────────────────── */
function renderQuestionList(filter = '') {
  const list = document.getElementById('question-list');
  if (!list) return;

  const lf = filter.toLowerCase();
  const filtered = lf
    ? adminQuestions.filter(q =>
        q.text.toLowerCase().includes(lf) ||
        (CATEGORY_LABELS[q.category] || '').toLowerCase().includes(lf))
    : adminQuestions;

  if (filtered.length === 0) {
    list.innerHTML = `<p class="text-muted text-center" style="padding:2rem;">
      ${lf ? 'Ingen spørsmål matcher søket.' : 'Ingen spørsmål i banken ennå. Legg til det første!'}</p>`;
    return;
  }

  list.innerHTML = filtered.map((q, i) => {
    const catClass = `cat-${q.category || 'default'}`;
    const catLabel = CATEGORY_LABELS[q.category] || q.category || '–';
    const shortText = q.text.length > 90 ? q.text.slice(0, 87) + '…' : q.text;
    return `
      <div class="question-list-item" id="qli-${q.id}">
        <div class="q-number">${filtered.indexOf(filtered.find(x => x.id === q.id)) + 1}</div>
        <div class="q-content">
          <div class="q-text" title="${escHtml(q.text)}">${escHtml(shortText)}</div>
          <div class="q-meta">
            <span class="category-badge ${catClass}">${catLabel}</span>
            <span class="text-muted" style="font-size:0.8rem">ID&nbsp;${q.id}</span>
            ${q.image ? '<span class="text-muted" style="font-size:0.8rem">📷 Har bilde</span>' : ''}
          </div>
        </div>
        <div class="q-actions">
          <button class="btn btn-sm btn-outline" onclick="openEditModal(${q.id})" title="Rediger">✏️</button>
          <button class="btn btn-sm btn-danger"  onclick="confirmDelete(${q.id})" title="Slett">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function updateStats() {
  const total = adminQuestions.length;
  const cats  = {};
  adminQuestions.forEach(q => { cats[q.category] = (cats[q.category] || 0) + 1; });

  const el = document.getElementById('admin-stats');
  if (!el) return;
  el.innerHTML = `
    <span class="stat-chip">Totalt: <strong>${total}</strong></span>
    ${Object.entries(CATEGORY_LABELS).map(([k, v]) =>
      `<span class="stat-chip">${v}: <strong>${cats[k] || 0}</strong></span>`
    ).join('')}`;
}

/* ── Modal opne/lukk ───────────────────────────────────────────────────── */
let _lastFocusedElement = null;

function openAddModal() {
  editingId = null;
  _lastFocusedElement = document.activeElement;
  resetModalForm();
  document.getElementById('modal-title').textContent = '➕ Legg til spørsmål';
  const modal = document.getElementById('question-modal');
  modal.classList.remove('hidden');
  // Move focus inside modal
  const firstFocusable = modal.querySelector('button, textarea, input, select');
  if (firstFocusable) firstFocusable.focus();
}

function openEditModal(id) {
  const q = adminQuestions.find(x => x.id === id);
  if (!q) return;
  editingId = id;
  _lastFocusedElement = document.activeElement;

  document.getElementById('modal-title').textContent = '✏️ Rediger spørsmål';
  document.getElementById('q-form-text').value     = q.text;
  document.getElementById('q-form-category').value = q.category || 'regler';
  document.getElementById('q-form-explanation').value = q.explanation || '';

  q.options.forEach((opt, i) => {
    const inp = document.getElementById(`q-opt-${i}`);
    if (inp) inp.value = opt;
  });

  document.querySelectorAll('input[name="correct-answer"]').forEach((r, i) => {
    r.checked = (i === q.correct);
  });

  // Vis eksisterende bilde
  const imgPrev = document.getElementById('modal-img-preview');
  if (imgPrev) {
    imgPrev.innerHTML = '';
    if (q.image) {
      if (q.image.trim().startsWith('<svg')) {
        imgPrev.innerHTML = q.image;
      } else {
        const img = document.createElement('img');
        img.src = q.image;
        img.alt = 'Bilde';
        imgPrev.appendChild(img);
      }
    }
  }

  const modal = document.getElementById('question-modal');
  modal.classList.remove('hidden');
  // Move focus inside modal
  const firstFocusable = modal.querySelector('button, textarea, input, select');
  if (firstFocusable) firstFocusable.focus();
}

function closeModal() {
  document.getElementById('question-modal').classList.add('hidden');
  resetModalForm();
  editingId = null;
  // Return focus to triggering element
  if (_lastFocusedElement) {
    _lastFocusedElement.focus();
    _lastFocusedElement = null;
  }
}

function resetModalForm() {
  document.getElementById('q-form-text').value = '';
  document.getElementById('q-form-category').value = 'regler';
  document.getElementById('q-form-explanation').value = '';
  for (let i = 0; i < 4; i++) {
    const inp = document.getElementById(`q-opt-${i}`);
    if (inp) inp.value = '';
  }
  // Sett første som korrekt
  const radios = document.querySelectorAll('input[name="correct-answer"]');
  if (radios[0]) radios[0].checked = true;

  const imgPrev = document.getElementById('modal-img-preview');
  if (imgPrev) imgPrev.innerHTML = '';

  const fileInp = document.getElementById('q-form-image');
  if (fileInp) fileInp.value = '';

  // Fjern midlertidig lagret ny bilde-data
  delete document._pendingImage;
}

/* ── Lagre spørsmål ────────────────────────────────────────────────────── */
function saveQuestion() {
  const text = document.getElementById('q-form-text').value.trim();
  const category = document.getElementById('q-form-category').value;
  const explanation = document.getElementById('q-form-explanation').value.trim();

  if (!text) {
    showAdminToast('Spørsmålstekst er påkrevd', 'error');
    return;
  }

  const options = [];
  for (let i = 0; i < 4; i++) {
    const val = document.getElementById(`q-opt-${i}`)?.value.trim() || '';
    options.push(val);
  }

  const nonEmpty = options.filter(o => o.length > 0);
  if (nonEmpty.length < 2) {
    showAdminToast('Du trenger minst 2 svaralternativer', 'error');
    return;
  }

  let correct = 0;
  document.querySelectorAll('input[name="correct-answer"]').forEach((r, i) => {
    if (r.checked) correct = i;
  });

  if (!options[correct]) {
    showAdminToast('Riktig svar er ikke fylt ut', 'error');
    return;
  }

  // Bilde
  let image = null;
  if (editingId !== null) {
    const existing = adminQuestions.find(q => q.id === editingId);
    image = existing ? existing.image : null;
  }
  if (document._pendingImage !== undefined) {
    image = document._pendingImage;
  }

  if (editingId !== null) {
    // Rediger eksisterende
    const idx = adminQuestions.findIndex(q => q.id === editingId);
    if (idx !== -1) {
      adminQuestions[idx] = { ...adminQuestions[idx], text, category, options, correct, explanation, image };
    }
    showAdminToast('Spørsmål oppdatert ✓', 'success');
  } else {
    // Nytt spørsmål
    const newQ = {
      id: nextId(adminQuestions),
      text, category, options, correct, explanation, image
    };
    adminQuestions.push(newQ);
    showAdminToast('Spørsmål lagt til ✓', 'success');
  }

  saveQuestions(adminQuestions);
  closeModal();
  renderQuestionList(document.getElementById('search-input')?.value || '');
  updateStats();
  delete document._pendingImage;
}

/* ── Slett spørsmål ────────────────────────────────────────────────────── */
function confirmDelete(id) {
  const q = adminQuestions.find(x => x.id === id);
  if (!q) return;
  if (confirm(`Er du sikker på at du vil slette:\n"${q.text}"?`)) {
    deleteQuestion(id);
  }
}

function deleteQuestion(id) {
  adminQuestions = adminQuestions.filter(q => q.id !== id);
  saveQuestions(adminQuestions);
  renderQuestionList(document.getElementById('search-input')?.value || '');
  updateStats();
  showAdminToast('Spørsmål slettet', 'success');
}

/* ── Tilbakestill til standardspørsmål ─────────────────────────────────── */
function doResetToDefaults() {
  if (!confirm('Er du sikker? Alle egne endringer vil gå tapt og standardspørsmålene gjenopprettes.')) return;
  adminQuestions = resetToDefaults();
  renderQuestionList();
  updateStats();
  showAdminToast('Spørsmål tilbakestilt til standard ✓', 'success');
}

/* ── Eksporter JSON ────────────────────────────────────────────────────── */
function exportQuestions() {
  const json = JSON.stringify(adminQuestions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `sporsmal_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast('Spørsmål eksportert som JSON', 'success');
}

/* ── Importer JSON ─────────────────────────────────────────────────────── */
function importQuestions() {
  const input = document.createElement('input');
  input.type  = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Ikke en liste');
        // Valider minimumsfelter
        const valid = imported.filter(q =>
          q.text && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correct === 'number'
        );
        if (valid.length === 0) throw new Error('Ingen gyldige spørsmål funnet');

        if (confirm(`Vil du legge til ${valid.length} spørsmål (uten å slette eksisterende)?`)) {
          // Gi nye IDer
          valid.forEach(q => {
            q.id = nextId(adminQuestions);
            adminQuestions.push(q);
          });
          saveQuestions(adminQuestions);
          renderQuestionList();
          updateStats();
          showAdminToast(`${valid.length} spørsmål importert ✓`, 'success');
        }
      } catch (err) {
        showAdminToast(`Feil ved import: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ── Bildeopplasting i modal ────────────────────────────────────────────── */
function setupImageUpload() {
  const fileInp = document.getElementById('q-form-image');
  if (!fileInp) return;
  fileInp.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showAdminToast('Bildet er for stort (maks 2 MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      document._pendingImage = ev.target.result;
      const prev = document.getElementById('modal-img-preview');
      if (prev) {
        prev.innerHTML = '';
        const img = document.createElement('img');
        img.src = ev.target.result;
        img.alt = 'Forhåndsvisning';
        prev.appendChild(img);
      }
    };
    reader.readAsDataURL(file);
  });
}

function removeImage() {
  document._pendingImage = null;
  const prev = document.getElementById('modal-img-preview');
  if (prev) prev.innerHTML = '';
  const fileInp = document.getElementById('q-form-image');
  if (fileInp) fileInp.value = '';
}

/* ── Event-lyttere ──────────────────────────────────────────────────────── */
function attachEventListeners() {
  document.getElementById('btn-add-question')?.addEventListener('click', openAddModal);
  document.getElementById('btn-reset-defaults')?.addEventListener('click', doResetToDefaults);
  document.getElementById('btn-export')?.addEventListener('click', exportQuestions);
  document.getElementById('btn-import')?.addEventListener('click', importQuestions);
  document.getElementById('btn-save-question')?.addEventListener('click', saveQuestion);
  document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-remove-image')?.addEventListener('click', removeImage);

  // Søk
  const searchInp = document.getElementById('search-input');
  if (searchInp) {
    searchInp.addEventListener('input', () => renderQuestionList(searchInp.value));
  }

  // Lukk modal ved klikk på overlay
  document.getElementById('question-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('question-modal')) closeModal();
  });

  // Tastatur: Escape lukker modal + focus trap
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('question-modal');
    const isOpen = modal && !modal.classList.contains('hidden');

    if (e.key === 'Escape' && isOpen) {
      closeModal();
      return;
    }

    // Focus trap: keep Tab within open modal
    if (e.key === 'Tab' && isOpen) {
      const focusable = Array.from(
        modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.closest('.hidden'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Bildeopplasting
  setupImageUpload();

  // Mobil nav + aria-expanded
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navLinks.classList.contains('open');
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }
}

/* ── Toast (enkel) ─────────────────────────────────────────────────────── */
function showAdminToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ── Hjelpefunksjon ────────────────────────────────────────────────────── */
function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
