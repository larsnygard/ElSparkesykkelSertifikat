/**
 * quiz.js – Logikk for prøven, resultatsiden og sertifikatgenerering
 */

/* ── Tilstand ─────────────────────────────────────────────────────────── */
const state = {
  candidateName: '',
  candidatePhoto: null,   // base64 data URL
  questions: [],          // tilfeldig utvalg
  current: 0,            // gjeldende spørsmålsindeks
  answers: [],           // brukerens svar (indeks eller null)
  startTime: null,
  endTime: null,
};

const PASS_THRESHOLD = 0.80;   // 80 % for bestått
const QUESTIONS_PER_TEST = 15;

/* ── Navigering mellom views ──────────────────────────────────────────── */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ── Hjemmeside ─────────────────────────────────────────────────────── */
function initHome() {
  showView('view-home');
}

/* ── Registrering ───────────────────────────────────────────────────── */
function initRegistration() {
  showView('view-registration');

  const nameInput  = document.getElementById('reg-name');
  const photoInput = document.getElementById('reg-photo');
  const preview    = document.getElementById('photo-preview');
  const uploadArea = document.getElementById('photo-upload-area');
  const startBtn   = document.getElementById('btn-start-quiz');
  const countSel   = document.getElementById('reg-count');

  // Forhåndsvisning av bilde
  photoInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Bildet er for stort (maks 5 MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      state.candidatePhoto = ev.target.result;
      preview.src = ev.target.result;
      preview.style.display = 'block';
      uploadArea.querySelector('.upload-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  // Drag & drop
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      photoInput.files = e.dataTransfer.files;
      photoInput.dispatchEvent(new Event('change'));
    }
  });

  // Start prøven
  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      showToast('Skriv inn navnet ditt', 'error');
      return;
    }
    if (!state.candidatePhoto) {
      showToast('Last opp et bilde av deg selv', 'error');
      return;
    }
    state.candidateName = name;
    const count = parseInt(countSel ? countSel.value : QUESTIONS_PER_TEST, 10) || QUESTIONS_PER_TEST;
    startQuiz(count);
  });
}

/* ── Prøven ──────────────────────────────────────────────────────────── */
function startQuiz(count = QUESTIONS_PER_TEST) {
  const pool = getQuestions();
  state.questions = pickRandomQuestions(pool, Math.min(count, pool.length));
  state.current   = 0;
  state.answers   = new Array(state.questions.length).fill(null);
  state.startTime = new Date();
  showView('view-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q   = state.questions[state.current];
  const idx = state.current;
  const total = state.questions.length;

  // Progresjonslinje
  document.getElementById('q-progress-text').textContent =
    `Spørsmål ${idx + 1} av ${total}`;
  const pct = ((idx + 1) / total) * 100;
  document.getElementById('q-progress-fill').style.width = pct + '%';

  // Badge og kategori
  document.getElementById('q-number-badge').textContent = idx + 1;
  const catBadge = document.getElementById('q-category-tag');
  catBadge.textContent = CATEGORY_LABELS[q.category] || q.category;

  // Spørsmålstekst
  document.getElementById('q-text').textContent = q.text;

  // Bilde
  const imgWrap = document.getElementById('q-image-wrap');
  imgWrap.innerHTML = '';
  if (q.image) {
    if (q.image.trim().startsWith('<svg')) {
      imgWrap.innerHTML = q.image;
    } else {
      const img = document.createElement('img');
      img.src = q.image;
      img.alt = 'Illustrasjon';
      img.className = 'question-image';
      imgWrap.appendChild(img);
    }
    imgWrap.style.display = 'block';
  } else {
    imgWrap.style.display = 'none';
  }

  // Svaralternativer
  const optList = document.getElementById('q-options');
  optList.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectAnswer(i));
    li.appendChild(btn);
    optList.appendChild(li);
  });

  // Skjul forklaring og neste-knapp
  const expBox  = document.getElementById('q-explanation');
  const nextBtn = document.getElementById('btn-next');
  expBox.className = 'explanation-box';
  expBox.textContent = '';
  nextBtn.style.display = 'none';

  // Gjenopprett svar om vi vet det (navigering tilbake)
  if (state.answers[idx] !== null) {
    highlightAnswer(state.answers[idx], q);
  }
}

function selectAnswer(chosen) {
  const q   = state.questions[state.current];
  const idx = state.current;

  if (state.answers[idx] !== null) return;   // allerede svart
  state.answers[idx] = chosen;

  highlightAnswer(chosen, q);
}

function highlightAnswer(chosen, q) {
  const optBtns = document.querySelectorAll('.option-btn');
  optBtns.forEach(btn => { btn.disabled = true; });

  const isCorrect = chosen === q.correct;

  optBtns.forEach(btn => {
    const i = parseInt(btn.dataset.index, 10);
    if (i === q.correct) btn.classList.add('correct');
    if (i === chosen && !isCorrect) btn.classList.add('incorrect');
  });

  // Forklaring
  const expBox = document.getElementById('q-explanation');
  expBox.textContent = (isCorrect ? '✓ Riktig! ' : '✗ Feil. ') + q.explanation;
  expBox.className = `explanation-box show ${isCorrect ? 'correct' : 'incorrect'}`;

  // Neste / fullfør
  const nextBtn = document.getElementById('btn-next');
  const isLast  = state.current === state.questions.length - 1;
  nextBtn.textContent = isLast ? 'Se resultatet →' : 'Neste spørsmål →';
  nextBtn.style.display = 'inline-flex';
  nextBtn.onclick = isLast ? finishQuiz : nextQuestion;
}

function nextQuestion() {
  state.current++;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Resultat ────────────────────────────────────────────────────────── */
function finishQuiz() {
  state.endTime = new Date();
  const total   = state.questions.length;
  const correct = state.answers.filter((a, i) => a === state.questions[i].correct).length;
  const pct     = correct / total;
  const passed  = pct >= PASS_THRESHOLD;

  showView('view-result');
  renderResult(correct, total, passed);
}

function renderResult(correct, total, passed) {
  const badge    = document.getElementById('result-badge');
  const scoreEl  = document.getElementById('result-score');
  const labelEl  = document.getElementById('result-label');
  const msgEl    = document.getElementById('result-message');
  const certSec  = document.getElementById('certificate-section');
  const reviewEl = document.getElementById('result-review');

  badge.className = `result-badge ${passed ? 'pass' : 'fail'}`;
  badge.textContent = passed ? '🏆' : '📚';

  scoreEl.className = `score-display ${passed ? 'pass' : 'fail'}`;
  scoreEl.textContent = `${correct} / ${total}`;
  labelEl.textContent = `${Math.round((correct/total)*100)} % riktige`;

  if (passed) {
    msgEl.innerHTML = `<span class="text-success">🎉 Gratulerer, ${state.candidateName}! Du har bestått!</span>`;
    certSec.style.display = 'block';
    generateCertificate(correct, total);
  } else {
    const need = Math.ceil(total * PASS_THRESHOLD);
    msgEl.innerHTML = `<span class="text-error">Du trenger ${need} riktige for å bestå (${Math.round(PASS_THRESHOLD*100)} %). Les pensum og prøv igjen!</span>`;
    certSec.style.display = 'none';
  }

  // Gjennomgangsliste
  reviewEl.innerHTML = '';
  state.questions.forEach((q, i) => {
    const userAns   = state.answers[i];
    const isCorrect = userAns === q.correct;
    const div = document.createElement('div');
    div.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
    div.innerHTML = `
      <span class="review-icon">${isCorrect ? '✅' : '❌'}</span>
      <div>
        <div class="review-q">${i+1}. ${q.text}</div>
        <div class="review-a">
          Ditt svar: <strong>${userAns !== null ? q.options[userAns] : '–'}</strong>
          ${!isCorrect ? ` &nbsp;|&nbsp; Riktig svar: <strong>${q.options[q.correct]}</strong>` : ''}
        </div>
      </div>`;
    reviewEl.appendChild(div);
  });
}

/* ── Sertifikat ──────────────────────────────────────────────────────── */
function generateCertificate(correct, total) {
  const canvas = document.getElementById('certificate-canvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width  = 1050;
  const H = canvas.height = 742;

  // ── Bakgrunn ──
  ctx.fillStyle = '#FDFAF4';
  ctx.fillRect(0, 0, W, H);

  // ── Ytre ramme (dobbel) ──
  ctx.strokeStyle = '#003087';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, W - 44, H - 44);

  // ── Toppstripe (norsk flagg-inspirert) ──
  ctx.fillStyle = '#003087';
  ctx.fillRect(22, 22, W - 44, 14);
  ctx.fillStyle = '#EF2B2D';
  ctx.fillRect(22, 36, W - 44, 10);
  ctx.fillStyle = '#003087';
  ctx.fillRect(22, 46, W - 44, 14);

  // ── Bunnstripe ──
  ctx.fillStyle = '#003087';
  ctx.fillRect(22, H - 36, W - 44, 14);

  // ── Dekorativ tittelramme ──
  ctx.fillStyle = '#003087';
  const titleBoxY = 75;
  roundRect(ctx, W/2 - 320, titleBoxY, 640, 90, 10, true, false);

  // ── Sertifikat-tittel ──
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SERTIFIKAT', W / 2, titleBoxY + 50);
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('for elsparkesykkel', W / 2, titleBoxY + 76);

  // ── Scooter ikon (stor) ──
  ctx.font = '56px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛴', W / 2, 230);

  // ── Underoverskrift ──
  ctx.fillStyle = '#555';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Norsk Elsparkesykkelprøve', W / 2, 270);

  // ── Horisontal linje ──
  ctx.strokeStyle = '#C0A060';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(100, 285); ctx.lineTo(W - 100, 285);
  ctx.stroke();

  // ── Bekreftelses-tekst ──
  ctx.fillStyle = '#333';
  ctx.font = '20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Herved bekreftes at', W / 2, 325);

  // ── Kandidatens navn ──
  ctx.fillStyle = '#003087';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  // Skygge
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur  = 4;
  ctx.shadowOffsetY = 2;
  ctx.fillText(state.candidateName, W / 2, 382);
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0;

  // ── Understreker navnelinje ──
  ctx.strokeStyle = '#C0A060';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const nameWidth = Math.min(ctx.measureText(state.candidateName).width + 60, W - 200);
  ctx.moveTo(W/2 - nameWidth/2, 392);
  ctx.lineTo(W/2 + nameWidth/2, 392);
  ctx.stroke();

  // ── Bestått-tekst ──
  ctx.fillStyle = '#333';
  ctx.font = '20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('har bestått førerprøven for trygg kjøring av elsparkesykkel', W / 2, 430);

  // ── Resultat ──
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#27ae60';
  ctx.textAlign = 'center';
  const pct = Math.round((correct / total) * 100);
  ctx.fillText(`Resultat: ${correct} av ${total} riktige (${pct} %)`, W / 2, 462);

  // ── Dato ──
  ctx.fillStyle = '#555';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Dato: ${formatDate(new Date())}`, W / 2, 490);

  // ── Horisontal skillelinje ──
  ctx.strokeStyle = '#C0A060';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(100, 510); ctx.lineTo(W - 100, 510);
  ctx.stroke();

  // ── Foto (sirkulær) ──
  const photoX = 140;
  const photoY = 540;
  const photoR = 80;

  if (state.candidatePhoto) {
    const img = new Image();
    img.onload = () => {
      // Tegn sirkulær clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Sentrer bildet
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width  - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, photoX - photoR, photoY - photoR, photoR * 2, photoR * 2);
      ctx.restore();

      // Ramme rundt foto
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoR + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#003087';
      ctx.lineWidth = 4;
      ctx.stroke();

      drawCertificateFooter(ctx, W, H);
      drawBestattStamp(ctx, W - 170, 600);
    };
    img.src = state.candidatePhoto;
  } else {
    // Placeholder sirkel
    ctx.beginPath();
    ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', photoX, photoY);
    ctx.textBaseline = 'alphabetic';
    drawCertificateFooter(ctx, W, H);
    drawBestattStamp(ctx, W - 170, 600);
  }
}

function drawCertificateFooter(ctx, W, H) {
  // ── Signaturlinje ──
  const sigY  = 700;
  const sigX1 = 100;
  const sigX2 = 380;
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sigX1, sigY); ctx.lineTo(sigX2, sigY); ctx.stroke();
  ctx.fillStyle = '#888';
  ctx.font = '13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Norsk Elsparkesykkelprøve', (sigX1+sigX2)/2, sigY + 18);

  // ── Utstedende org ──
  ctx.fillStyle = '#555';
  ctx.font = 'italic 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('www.elsparkesykkelsertifikat.no', W / 2, H - 10);
}

function drawBestattStamp(ctx, cx, cy) {
  const R = 72;

  ctx.save();
  ctx.globalAlpha = 0.82;

  // Ytre ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Indre ring
  ctx.beginPath();
  ctx.arc(cx, cy, R - 10, 0, Math.PI * 2);
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 2;
  ctx.stroke();

  // BESTÅTT-tekst
  ctx.fillStyle = '#27ae60';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BESTÅTT', cx, cy);

  // Checkmark liten
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('✓', cx, cy + 28);

  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

/* ── Last ned sertifikat ──────────────────────────────────────────────── */
function downloadCertificate() {
  const canvas = document.getElementById('certificate-canvas');
  const link   = document.createElement('a');
  const safeName = state.candidateName.replace(/[^a-zA-Z0-9æøåÆØÅ_-]/g, '_');
  link.download = `Sertifikat_${safeName}_${new Date().toISOString().slice(0,10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ── Hjelpefunksjoner ────────────────────────────────────────────────── */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function formatDate(d) {
  const months = ['januar','februar','mars','april','mai','juni',
    'juli','august','september','oktober','november','desember'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── Initialisering ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Navigasjon
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Mobil-navigasjon lukk ved klikk
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks && navLinks.classList.remove('open'));
  });

  // Vis home ved oppstart
  showView('view-home');

  // Knapper
  const btnGoReg  = document.getElementById('btn-go-registration');
  const btnGoHome = document.querySelectorAll('.btn-go-home');
  const btnRetry  = document.getElementById('btn-retry');
  const btnDlCert = document.getElementById('btn-download-cert');

  if (btnGoReg) btnGoReg.addEventListener('click', initRegistration);
  btnGoHome.forEach(b => b.addEventListener('click', initHome));
  if (btnRetry)  btnRetry.addEventListener('click', initRegistration);
  if (btnDlCert) btnDlCert.addEventListener('click', downloadCertificate);

  // Navigasjonslinking
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', () => showView(el.dataset.view));
  });
});
