/**
 * questions.js – Spørsmålsbanken for Elsparkesykkel Sertifikat
 *
 * Hvert spørsmål har:
 *   id        – unik ID (nummer)
 *   category  – "regler" | "ferdsel" | "sikkerhet" | "tegn"
 *   text      – spørsmålstekst (norsk)
 *   image     – SVG-streng eller null
 *   options   – array med 4 svaralternativer
 *   correct   – indeks (0–3) for riktig svar
 *   explanation – forklaring vist etter svar
 */

/* ── SVG-illustrasjoner ────────────────────────────────────────────────── */

const SVG = {

  // Vei med sykkelfelt
  sykkelFelt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
  <rect width="400" height="220" fill="#87CEEB"/>
  <rect y="110" width="400" height="110" fill="#6B8E5A"/>
  <rect y="120" width="400" height="90" fill="#555"/>
  <rect y="120" width="130" height="90" fill="#4CAF50" opacity="0.35"/>
  <line x1="130" y1="120" x2="130" y2="210" stroke="white" stroke-width="3" stroke-dasharray="12,8"/>
  <line x1="260" y1="120" x2="260" y2="210" stroke="white" stroke-width="3" stroke-dasharray="12,8"/>
  <!-- Sykkel-symbol i sykkelfeltet -->
  <text x="65" y="168" text-anchor="middle" font-size="36" font-family="serif">🛴</text>
  <!-- Bil i midtre felt -->
  <text x="195" y="168" text-anchor="middle" font-size="36">🚗</text>
  <!-- Label -->
  <rect x="2" y="125" width="128" height="20" fill="#2E7D32" rx="3"/>
  <text x="66" y="139" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="Arial">SYKKELFELT ✓</text>
  <text x="195" y="113" text-anchor="middle" font-size="11" fill="#333" font-weight="bold" font-family="Arial">KJØREBANE</text>
</svg>`,

  // Fortau – feil å kjøre fort
  fortau: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
  <rect width="400" height="220" fill="#87CEEB"/>
  <rect y="150" width="400" height="70" fill="#888" rx="0"/>
  <!-- Fortau -->
  <rect y="120" width="120" height="30" fill="#bbb"/>
  <rect y="120" width="120" height="4" fill="#e0e0e0"/>
  <!-- Kantstein -->
  <rect y="150" width="120" height="6" fill="#999"/>
  <!-- Sparkesykkel på fortau -->
  <text x="60" y="148" text-anchor="middle" font-size="34">🛴</text>
  <!-- Rød sirkel med kryss -->
  <circle cx="60" cy="148" r="28" fill="none" stroke="#EF2B2D" stroke-width="6"/>
  <line x1="38" y1="126" x2="82" y2="170" stroke="#EF2B2D" stroke-width="6"/>
  <!-- Fotgjenger -->
  <text x="95" y="148" text-anchor="middle" font-size="28">🚶</text>
  <text x="60" y="200" text-anchor="middle" font-size="12" fill="white" font-weight="bold" font-family="Arial">IKKE TILLATT I HØY HASTIGHET</text>
</svg>`,

  // Gangfelt – vikeplikt
  gangFelt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
  <rect width="400" height="220" fill="#87CEEB"/>
  <rect y="120" width="400" height="100" fill="#555"/>
  <!-- Gangfelt (zebra) -->
  <rect x="150" y="120" width="100" height="100" fill="#555"/>
  ${[0,1,2,3,4].map(i=>`<rect x="${150+i*20}" y="120" width="10" height="100" fill="white" opacity="0.9"/>`).join('')}
  <!-- Sparkesykkel (stopper) -->
  <text x="90" y="175" text-anchor="middle" font-size="36">🛴</text>
  <!-- Pil som stopper -->
  <text x="135" y="175" text-anchor="middle" font-size="24">⛔</text>
  <!-- Fotgjenger i gangfelt -->
  <text x="200" y="175" text-anchor="middle" font-size="36">🚶</text>
  <text x="200" y="210" text-anchor="middle" font-size="12" fill="white" font-weight="bold" font-family="Arial">STOPP! Fotgjengere har forkjørsrett i gangfelt</text>
</svg>`,

  // Trafikklys
  trafikkLys: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="300" height="260">
  <rect width="300" height="260" fill="#b0c4b1"/>
  <!-- Stolpe -->
  <rect x="145" y="60" width="10" height="180" fill="#555"/>
  <!-- Lyskasse -->
  <rect x="115" y="20" width="70" height="160" rx="12" fill="#222"/>
  <!-- Rødt lys (av) -->
  <circle cx="150" cy="55" r="22" fill="#600000"/>
  <!-- Gult lys (av) -->
  <circle cx="150" cy="110" r="22" fill="#604000"/>
  <!-- Grønt lys (PÅ) -->
  <circle cx="150" cy="165" r="22" fill="#00e600" filter="url(#glow)"/>
  <defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <text x="150" y="230" text-anchor="middle" font-size="13" fill="#222" font-weight="bold" font-family="Arial">GRØNT LYS – kjør</text>
</svg>`,

  // Rødt lys
  trafikklysRodt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="300" height="260">
  <rect width="300" height="260" fill="#b0c4b1"/>
  <rect x="145" y="60" width="10" height="180" fill="#555"/>
  <rect x="115" y="20" width="70" height="160" rx="12" fill="#222"/>
  <!-- Rødt lys (PÅ) -->
  <circle cx="150" cy="55" r="22" fill="#ff0000" filter="url(#glow2)"/>
  <defs><filter id="glow2"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <!-- Gult og grønt av -->
  <circle cx="150" cy="110" r="22" fill="#604000"/>
  <circle cx="150" cy="165" r="22" fill="#004000"/>
  <!-- Sparkesykkel stopper -->
  <text x="50" y="200" text-anchor="middle" font-size="32">🛴</text>
  <text x="50" y="230" text-anchor="middle" font-size="11" fill="#333" font-weight="bold" font-family="Arial">STOPPER</text>
  <text x="150" y="245" text-anchor="middle" font-size="13" fill="#cc0000" font-weight="bold" font-family="Arial">RØDT LYS – stopp!</text>
</svg>`,

  // Mobil-forbud
  mobilForbud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="260" height="260">
  <rect width="260" height="260" fill="#f5f5f5"/>
  <!-- Mobiltelefon -->
  <rect x="98" y="60" width="64" height="110" rx="8" fill="#222"/>
  <rect x="104" y="72" width="52" height="78" fill="#4a90e2"/>
  <circle cx="130" cy="160" r="6" fill="#444"/>
  <!-- Rød forbudsskilt-ring -->
  <circle cx="130" cy="115" r="85" fill="none" stroke="#EF2B2D" stroke-width="10"/>
  <line x1="70" y1="55" x2="190" y2="175" stroke="#EF2B2D" stroke-width="10"/>
  <text x="130" y="230" text-anchor="middle" font-size="13" fill="#333" font-weight="bold" font-family="Arial">FORBUDT å holde mobiltelefon</text>
</svg>`,

  // Lys – natt
  lysNatt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
  <rect width="400" height="220" fill="#0a0a2e"/>
  <rect y="160" width="400" height="60" fill="#222"/>
  <!-- Stjerner -->
  ${[[30,20],[80,40],[150,15],[220,35],[300,10],[360,30],[100,60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="white" opacity="0.8"/>`).join('')}
  <!-- Halvmåne -->
  <circle cx="340" cy="45" r="22" fill="#fffde7"/>
  <circle cx="354" cy="38" r="18" fill="#0a0a2e"/>
  <!-- Sparkesykkel med lykt -->
  <text x="140" y="160" text-anchor="middle" font-size="40">🛴</text>
  <!-- Frontlys (gul lysstråle) -->
  <polygon points="160,145 220,130 220,150" fill="#FFD700" opacity="0.55"/>
  <!-- Baklys (rød) -->
  <circle cx="120" cy="148" r="8" fill="#EF2B2D" opacity="0.9"/>
  <text x="200" y="200" text-anchor="middle" font-size="12" fill="white" font-weight="bold" font-family="Arial">FRONTLYS + BAKLYS = PÅBUDT i mørket</text>
</svg>`,

  // Vikeplikt-skilt (trekant)
  vikeplikt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <!-- Bakgrunn hvit trekant -->
  <polygon points="100,18 188,172 12,172" fill="white" stroke="#EF2B2D" stroke-width="8"/>
  <!-- Indre rød trekant (opp-ned) -->
  <polygon points="100,70 148,155 52,155" fill="#EF2B2D"/>
  <text x="100" y="195" text-anchor="middle" font-size="12" fill="#333" font-weight="bold" font-family="Arial">VIKEPLIKT</text>
</svg>`,

  // STOPP-skilt
  stopp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220">
  <rect width="200" height="220" fill="#f0f0f0"/>
  <polygon points="62,10 138,10 185,55 185,138 138,185 62,185 15,138 15,55" fill="#EF2B2D"/>
  <polygon points="65,18 135,18 178,60 178,135 135,178 65,178 22,135 22,60" fill="none" stroke="white" stroke-width="4"/>
  <text x="100" y="112" text-anchor="middle" fill="white" font-size="32" font-weight="900" font-family="Arial">STOPP</text>
  <text x="100" y="210" text-anchor="middle" font-size="12" fill="#333" font-weight="bold" font-family="Arial">STOPP-SKILT</text>
</svg>`,

  // Sykkelvei-skilt (blå sirkel med sykkel)
  sykkelVei: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220">
  <rect width="200" height="220" fill="#f0f0f0"/>
  <circle cx="100" cy="100" r="88" fill="#003087"/>
  <!-- Sykkel-symbol (forenklet) -->
  <circle cx="70" cy="115" r="22" fill="none" stroke="white" stroke-width="7"/>
  <circle cx="130" cy="115" r="22" fill="none" stroke="white" stroke-width="7"/>
  <polyline points="70,115 90,80 120,80 130,115" fill="none" stroke="white" stroke-width="7" stroke-linejoin="round"/>
  <line x1="90" y1="80" x2="100" y2="115" stroke="white" stroke-width="7"/>
  <circle cx="90" cy="78" r="8" fill="white"/>
  <text x="100" y="210" text-anchor="middle" font-size="12" fill="#333" font-weight="bold" font-family="Arial">SYKKELVEI</text>
</svg>`,

  // Gangvei-skilt (blå sirkel med fotgjenger)
  gangVei: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220">
  <rect width="200" height="220" fill="#f0f0f0"/>
  <circle cx="100" cy="100" r="88" fill="#003087"/>
  <!-- Fotgjenger-symbol -->
  <circle cx="100" cy="55" r="14" fill="white"/>
  <line x1="100" y1="69" x2="100" y2="115" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="80" x2="75"  y2="100" stroke="white" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="80" x2="125" y2="100" stroke="white" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="115" x2="80" y2="145" stroke="white" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="115" x2="120" y2="145" stroke="white" stroke-width="7" stroke-linecap="round"/>
  <text x="100" y="210" text-anchor="middle" font-size="12" fill="#333" font-weight="bold" font-family="Arial">GANGVEI</text>
</svg>`,

  // Forbudt-skilt (rød ring)
  forbudtSykkel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220">
  <rect width="200" height="220" fill="#f0f0f0"/>
  <circle cx="100" cy="100" r="88" fill="white" stroke="#EF2B2D" stroke-width="10"/>
  <!-- Sykkel (grå) -->
  <circle cx="70" cy="112" r="20" fill="none" stroke="#555" stroke-width="6"/>
  <circle cx="130" cy="112" r="20" fill="none" stroke="#555" stroke-width="6"/>
  <polyline points="70,112 88,80 118,80 130,112" fill="none" stroke="#555" stroke-width="6" stroke-linejoin="round"/>
  <line x1="88" y1="80" x2="100" y2="112" stroke="#555" stroke-width="6"/>
  <!-- Rød strek -->
  <line x1="25" y1="100" x2="175" y2="100" stroke="#EF2B2D" stroke-width="14"/>
  <text x="100" y="210" text-anchor="middle" font-size="12" fill="#333" font-weight="bold" font-family="Arial">SYKLING FORBUDT</text>
</svg>`,

  // Rundkjøring
  rundKjøring: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 300" width="360" height="300">
  <rect width="360" height="300" fill="#87CEEB"/>
  <!-- Veier inn -->
  <rect x="155" y="0"   width="50" height="100" fill="#777"/>
  <rect x="155" y="200" width="50" height="100" fill="#777"/>
  <rect x="0"   y="125" width="100" height="50" fill="#777"/>
  <rect x="260" y="125" width="100" height="50" fill="#777"/>
  <!-- Rund trafikkøy -->
  <circle cx="180" cy="150" r="120" fill="#5a8a5a"/>
  <circle cx="180" cy="150" r="80"  fill="#777"/>
  <circle cx="180" cy="150" r="50"  fill="#5a8a5a"/>
  <!-- Pil i rundkjøring -->
  <path d="M180,80 A70,70 0 1,1 110,150" fill="none" stroke="white" stroke-width="5" stroke-dasharray="14,8" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="white"/>
    </marker>
  </defs>
  <!-- Sparkesykkel -->
  <text x="180" y="240" text-anchor="middle" font-size="28">🛴</text>
  <text x="180" y="285" text-anchor="middle" font-size="11" fill="#333" font-weight="bold" font-family="Arial">Kjøring i rundkjøringen har forkjørsrett</text>
</svg>`,

  // Parkering riktig
  parkering: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 220" width="380" height="220">
  <rect width="380" height="220" fill="#e8f5e9"/>
  <!-- Fortau -->
  <rect x="0" y="100" width="380" height="30" fill="#ccc"/>
  <!-- Bygning -->
  <rect x="0" y="0"  width="380" height="100" fill="#b0bec5"/>
  <!-- Vindu -->
  ${[40,120,200,280].map(x=>`<rect x="${x}" y="20" width="50" height="50" rx="4" fill="#80d8ff" stroke="#666" stroke-width="1"/>`).join('')}
  <!-- Gangvei klar (grønn stripe) -->
  <rect x="0" y="130" width="380" height="90" fill="#8BC34A" opacity="0.3"/>
  <!-- Sparkesykkel parkert ved siden av bygning (kant av fortau) -->
  <text x="330" y="128" text-anchor="middle" font-size="32">🛴</text>
  <text x="330" y="155" text-anchor="middle" font-size="11" fill="#2E7D32" font-weight="bold" font-family="Arial">RIKTIG ✓</text>
  <!-- Rød X over midt på fortau -->
  <text x="160" y="128" text-anchor="middle" font-size="32">🛴</text>
  <circle cx="160" cy="116" r="26" fill="none" stroke="#EF2B2D" stroke-width="5"/>
  <line x1="140" y1="96" x2="180" y2="136" stroke="#EF2B2D" stroke-width="5"/>
  <text x="160" y="155" text-anchor="middle" font-size="11" fill="#c62828" font-weight="bold" font-family="Arial">FEIL – blokkerer ✗</text>
  <!-- Fotgjenger -->
  <text x="80" y="190" text-anchor="middle" font-size="28">🚶</text>
  <text x="80" y="210" text-anchor="middle" font-size="10" fill="#333" font-family="Arial">Gangtrafikk</text>
</svg>`,

  // Alkohol/promille
  alkohol: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="300" height="260">
  <rect width="300" height="260" fill="#f5f5f5"/>
  <!-- Glass vin / øl -->
  <path d="M100,60 L80,160 L120,160 Z" fill="#FFC107" stroke="#aaa" stroke-width="2"/>
  <ellipse cx="100" cy="160" rx="20" ry="6" fill="#FFC107" stroke="#aaa" stroke-width="2"/>
  <rect x="95" y="160" width="10" height="30" fill="#888"/>
  <ellipse cx="100" cy="190" rx="22" ry="8" fill="#888"/>
  <!-- Sparkesykkel -->
  <text x="210" y="130" text-anchor="middle" font-size="48">🛴</text>
  <!-- Rød strek over kombinasjonen -->
  <circle cx="155" cy="125" r="90" fill="none" stroke="#EF2B2D" stroke-width="8"/>
  <line x1="91"  y1="61"  x2="219" y2="189" stroke="#EF2B2D" stroke-width="8"/>
  <text x="150" y="235" text-anchor="middle" font-size="14" fill="#c62828" font-weight="bold" font-family="Arial">PROMILLEGRENSE: 0,2 ‰</text>
  <text x="150" y="254" text-anchor="middle" font-size="11" fill="#555" font-family="Arial">Samme regler som for bil</text>
</svg>`,

  // Jernbaneovergang
  jernbane: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <rect width="400" height="240" fill="#87CEEB"/>
  <rect y="140" width="400" height="100" fill="#6B8E5A"/>
  <!-- Vei -->
  <rect x="160" y="80" width="80" height="160" fill="#777"/>
  <!-- Jernbaneskinner -->
  <rect y="120" width="400" height="12" fill="#888"/>
  <rect y="148" width="400" height="12" fill="#888"/>
  <!-- Sviller -->
  ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<rect x="${i*36}" y="118" width="16" height="36" fill="#5D4037"/>`).join('')}
  <!-- Bom (ned = stengt) -->
  <rect x="158" y="60" width="8" height="80" fill="#555"/>
  <rect x="80"  y="110" width="78" height="10" rx="5" fill="#EF2B2D"/>
  <!-- Varsellys -->
  <circle cx="158" cy="65" r="10" fill="#ff0000"/>
  <!-- Sparkesykkel stopper -->
  <text x="60" y="140" text-anchor="middle" font-size="28">🛴</text>
  <text x="200" y="220" text-anchor="middle" font-size="11" fill="#333" font-weight="bold" font-family="Arial">Stopp alltid ved jernbaneovergang!</text>
</svg>`,

  // Gang- og sykkelvei (delt)
  gangSykkelVei: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
  <rect width="400" height="220" fill="#87CEEB"/>
  <rect y="110" width="400" height="110" fill="#5a8a5a"/>
  <!-- Delt sti -->
  <rect y="118" width="400" height="70" fill="#c8b89a"/>
  <!-- Midtlinje -->
  <line x1="0" y1="153" x2="400" y2="153" stroke="white" stroke-width="2" stroke-dasharray="15,10"/>
  <!-- Sykkel-side label -->
  <text x="80" y="148" text-anchor="middle" font-size="10" fill="#333" font-weight="600" font-family="Arial">SYKKEL</text>
  <!-- Gang-side label -->
  <text x="80" y="178" text-anchor="middle" font-size="10" fill="#333" font-weight="600" font-family="Arial">GANGE</text>
  <!-- Sparkesykkel (korrekt side) -->
  <text x="200" y="148" text-anchor="middle" font-size="28">🛴</text>
  <!-- Fotgjenger (korrekt side) -->
  <text x="290" y="178" text-anchor="middle" font-size="28">🚶</text>
  <text x="200" y="210" text-anchor="middle" font-size="11" fill="#333" font-weight="bold" font-family="Arial">Fotgjengere har alltid forkjørsrett her</text>
</svg>`,

  // Ulykke – hva gjøre
  ulykke: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <rect width="400" height="240" fill="#fff3cd"/>
  <!-- Varseltrekant -->
  <polygon points="200,20 380,200 20,200" fill="none" stroke="#f39c12" stroke-width="8"/>
  <text x="200" y="180" text-anchor="middle" font-size="90" font-family="serif">!</text>
  <!-- Trinn -->
  <text x="60"  y="228" text-anchor="middle" font-size="11" fill="#333" font-family="Arial" font-weight="bold">1. STOPP</text>
  <text x="148" y="228" text-anchor="middle" font-size="11" fill="#333" font-family="Arial" font-weight="bold">2. SIKRE</text>
  <text x="236" y="228" text-anchor="middle" font-size="11" fill="#333" font-family="Arial" font-weight="bold">3. HJELP</text>
  <text x="324" y="228" text-anchor="middle" font-size="11" fill="#333" font-family="Arial" font-weight="bold">4. VARSLE 113</text>
</svg>`,

};

/* ── Spørsmålsbank (30 spørsmål) ──────────────────────────────────────── */

const DEFAULT_QUESTIONS = [

  /* ─ REGLER ──────────────────────────────── */
  {
    id: 1,
    category: "regler",
    text: "Hva er aldersgrensen for å kjøre elsparkesykkel på offentlig vei i Norge?",
    image: null,
    options: ["10 år", "12 år", "15 år", "16 år"],
    correct: 1,
    explanation: "Aldersgrensen for å kjøre elsparkesykkel på offentlig vei i Norge er 12 år. Yngre barn kan kjøre på privat grunn under tilsyn av voksne."
  },
  {
    id: 2,
    category: "regler",
    text: "Hva er den høyeste tillatte hastigheten for en elsparkesykkel som brukes på vei?",
    image: null,
    options: ["15 km/t", "20 km/t", "25 km/t", "30 km/t"],
    correct: 1,
    explanation: "Elsparkesykler som er lovlige på norsk vei kan ikke ha høyere topphastighet enn 20 km/t. Kjøretøy som er raskere klassifiseres som moped og krever eget vognkort."
  },
  {
    id: 3,
    category: "regler",
    text: "Hva er den øverste tillatte motoreffekten (watt) for en lovlig elsparkesykkel i Norge?",
    image: null,
    options: ["125 W", "250 W", "500 W", "750 W"],
    correct: 1,
    explanation: "En lovlig elsparkesykkel (MPT) i Norge kan ha maks motoreffekt på 250 W. Sterkere motorer klassifiseres som moped."
  },
  {
    id: 4,
    category: "regler",
    text: "Hva er promillegrensen for å kjøre elsparkesykkel?",
    image: SVG.alkohol,
    options: ["0,0 ‰", "0,2 ‰", "0,5 ‰", "0,8 ‰"],
    correct: 1,
    explanation: "For elsparkesykkel gjelder den samme promillegrensen som for bil: 0,2 ‰. Promillekjøring med elsparkesykkel kan gi bøter, fengsel og miste retten til å kjøre bil."
  },
  {
    id: 5,
    category: "regler",
    text: "Er det tillatt å ha passasjer på elsparkesykkel?",
    image: null,
    options: [
      "Ja, alltid – hvis begge er over 12 år",
      "Ja, men bare på kortere strekninger",
      "Nei, passasjer er ikke tillatt",
      "Ja, men kun for barn under 6 år"
    ],
    correct: 2,
    explanation: "Det er ikke tillatt å ha passasjer på elsparkesykkel. Elsparkesykler er kun beregnet for én person, og det er ulovlig å kjøre med noen på styret eller stående bak deg."
  },
  {
    id: 6,
    category: "regler",
    text: "Er det lovpålagt å bruke hjelm når du kjører elsparkesykkel?",
    image: null,
    options: [
      "Ja, hjelm er alltid lovpålagt",
      "Nei, men hjelm anbefales sterkt",
      "Kun for de under 15 år",
      "Kun på veier med fartsgrense over 50 km/t"
    ],
    correct: 1,
    explanation: "Per i dag er hjelm ikke lovpålagt for elsparkesykkel i Norge, men det anbefales på det sterkeste! Hode er det mest sårbare ved fall – hjelm kan redde livet ditt."
  },
  {
    id: 7,
    category: "regler",
    text: "Er det tillatt å holde mobiltelefon i hånden mens du kjører elsparkesykkel?",
    image: SVG.mobilForbud,
    options: [
      "Ja, det er alltid tillatt",
      "Ja, men bare for å se på kartet",
      "Nei, det er ikke tillatt å holde telefonen i hånden",
      "Ja, men kun for samtale"
    ],
    correct: 2,
    explanation: "Det er forbudt å holde mobiltelefon i hånden under kjøring med elsparkesykkel. Du mister konsentrasjonen og kontrollen over sykkelen. Bruk holderen eller stopp."
  },
  {
    id: 8,
    category: "regler",
    text: "Kan du kjøre elsparkesykkel på motorvei?",
    image: null,
    options: [
      "Ja, i ytterkanten",
      "Nei, det er strengt forbudt",
      "Kun i nødsituasjoner",
      "Ja, men bare i 20 km/t"
    ],
    correct: 1,
    explanation: "Det er strengt forbudt å kjøre elsparkesykkel på motorvei. Motorveier er forbeholdt motorvogner med tillatt topphastighet over 40 km/t – elsparkesykkelen tilfredsstiller ikke dette."
  },

  /* ─ FERDSEL ─────────────────────────────── */
  {
    id: 9,
    category: "ferdsel",
    text: "Hvor skal du primært kjøre med elsparkesykkel dersom det finnes sykkelfelt?",
    image: SVG.sykkelFelt,
    options: [
      "På fortauet, da det er tryggere",
      "I sykkelfelt – det er primær kjørevei",
      "Midt i kjørebanen",
      "Det spiller ingen rolle"
    ],
    correct: 1,
    explanation: "Elsparkesykkel skal primært benytte sykkelfelt der dette finnes. Sykkelfelt er den sikreste og riktige plassen. Bruk av fortau til høy hastighet er forbudt."
  },
  {
    id: 10,
    category: "ferdsel",
    text: "Det finnes verken sykkelvei eller sykkelfelt. Hvor kjører du da med elsparkesykkel?",
    image: null,
    options: [
      "Midt i kjørebanen",
      "Til venstre i kjørebanen",
      "Til høyre i kjørebanen",
      "På fortauet i gangfart"
    ],
    correct: 2,
    explanation: "Dersom det ikke finnes sykkelvei eller sykkelfelt, skal du kjøre lengst til høyre i kjørebanen. Hold deg nær kanten og vær synlig for bilister."
  },
  {
    id: 11,
    category: "ferdsel",
    text: "Du nærmer deg et gangfelt. En fotgjenger er i ferd med å krysse. Hva gjør du?",
    image: SVG.gangFelt,
    options: [
      "Fortsett med vanlig hastighet – du har forkjørsrett",
      "Kjør rundt fotgjengeren",
      "Bremse ned og gi fotgjengeren vikeplikt",
      "Bruk horn for å varsle"
    ],
    correct: 2,
    explanation: "Fotgjengere har alltid forkjørsrett i gangfelt. Du plikter å bremse og gi dem fri passasje. Dette gjelder selv om fotgjengeren ikke har begynt å krysse."
  },
  {
    id: 12,
    category: "ferdsel",
    text: "Er det tillatt å kjøre på fortau med elsparkesykkel?",
    image: SVG.fortau,
    options: [
      "Ja, det er alltid tillatt",
      "Ja, men kun i gangfart og uten å hindre fotgjengere",
      "Nei, elsparkesykkel er forbudt på fortau",
      "Kun om natten"
    ],
    correct: 1,
    explanation: "På fortau og gangvei er det kun tillatt å kjøre i gangfart (maks ca. 7 km/t) og uten å hindre fotgjengere. Du bør foretrekke sykkelvei/sykkelfelt fremfor fortau."
  },
  {
    id: 13,
    category: "ferdsel",
    text: "Hva gjør du ved rødt trafikklys?",
    image: SVG.trafikklysRodt,
    options: [
      "Kjøre forsiktig gjennom hvis ingen biler er i nærheten",
      "Stoppe og vente til lyset er grønt",
      "Bruke fortauet for å omgå krysset",
      "Rødt lys gjelder ikke elsparkesykkel"
    ],
    correct: 1,
    explanation: "Du plikter å stanse for rødt lys, akkurat som en bilist. Elsparkesykkel er et kjøretøy og må følge alle trafikklys. Kjøring mot rødt er lovbrudd og farlig."
  },
  {
    id: 14,
    category: "ferdsel",
    text: "Du kjører på en gang- og sykkelvei. Hvem har forkjørsrett her?",
    image: SVG.gangSykkelVei,
    options: [
      "Den som kjører raskest",
      "Elsparkesykkelen – den er et kjøretøy",
      "Fotgjengere har alltid forkjørsrett",
      "Det er ingen vikepliktregler her"
    ],
    correct: 2,
    explanation: "På felles gang- og sykkelvei skal fotgjengere alltid respekteres og gis forkjørsrett. Kjør forsiktig, varsle i god tid og senk farten nær fotgjengere."
  },
  {
    id: 15,
    category: "ferdsel",
    text: "Hva er riktig fremgangsmåte i en rundkjøring?",
    image: SVG.rundKjøring,
    options: [
      "Kjøre mot trafikken i rundkjøringen",
      "Kjøre riktig retning og gi kjøretøy inne i rundkjøringen vikeplikt",
      "Stoppe alltid midt i rundkjøringen",
      "Kjøre i midtfeltet av rundkjøringen"
    ],
    correct: 1,
    explanation: "I en rundkjøring kjøres mot klokken. Du har vikeplikt for kjøretøy som allerede er i rundkjøringen. Bruk sykkelfelt om det finnes, ellers hold deg til høyre."
  },
  {
    id: 16,
    category: "ferdsel",
    text: "Du nærmer deg en jernbaneovergang uten bom. Hva gjør du?",
    image: SVG.jernbane,
    options: [
      "Kjøre over i høy hastighet for å komme seg over raskest mulig",
      "Stoppe, se og lytte begge veier, og kjøre over kun når det er trygt",
      "Det er ikke lov å krysse jernbane uten bom",
      "Kjøre over om det ikke er synlige tog"
    ],
    correct: 1,
    explanation: "Stopp alltid ved jernbaneovergang, se og lytt begge veier. Tog kommer fort og er lydsvake. Du er ansvarlig for å forsikre deg om at det er trygt å krysse."
  },
  {
    id: 17,
    category: "ferdsel",
    text: "Hva er korrekt atferd i dårlig vær (regn, snø, glatt)?",
    image: null,
    options: [
      "Øke hastigheten for å komme raskest mulig hjem",
      "Redusere hastigheten og øke avstand til andre trafikanter",
      "Kjøre midt i veibanen for bedre balanse",
      "Ingenting endrer seg"
    ],
    correct: 1,
    explanation: "I dårlig vær er bremselengden lenger og risikoen for å skli større. Senk farten, øk avstand til andre, og vær ekstra observant. Det er bedre å komme frem trygt enn fort."
  },
  {
    id: 18,
    category: "ferdsel",
    text: "Kan du kjøre to elsparkesykler side om side på en sykkelsti?",
    image: null,
    options: [
      "Ja, alltid",
      "Ja, men kun på brede sykkelstier",
      "Nei, du skal kjøre enkeltvis og ikke hindre andre",
      "Ja, men bare i 10 km/t"
    ],
    correct: 2,
    explanation: "Elsparkesykler og syklister skal kjøre enkeltvis og ikke blokkere stien for andre. Unngå å kjøre side om side slik at det hindrer møtende trafikk."
  },

  /* ─ SIKKERHET ────────────────────────────── */
  {
    id: 19,
    category: "sikkerhet",
    text: "Når er du pliktig til å ha lys på elsparkesykkel?",
    image: SVG.lysNatt,
    options: [
      "Kun om natten",
      "Alltid – også om dagen",
      "I mørket og ved dårlig sikt",
      "Lys er anbefalt, men ikke lovpålagt"
    ],
    correct: 2,
    explanation: "Lys (frontlys og baklys/reflektor) er påbudt i mørket og ved dårlig sikt, for eksempel i tåke eller kraftig regn. Frontlys skal lyse hvitt fremover og baklys/reflektor skal synes rødt bakover."
  },
  {
    id: 20,
    category: "sikkerhet",
    text: "Hva bør du sjekke FØR du setter deg på elsparkesykkel?",
    image: null,
    options: [
      "Fargen på scooteren og om den er ren",
      "Batterinivå, bremser og dekk",
      "Vindretningen og temperaturen",
      "Antall følgere på Instagram"
    ],
    correct: 1,
    explanation: "Sjekk alltid batterinivå, at bremsene fungerer, at dekkene er i god stand, og at lys fungerer. En grundig sjekk før avreise kan hindre ulykker underveis."
  },
  {
    id: 21,
    category: "sikkerhet",
    text: "Hva er det farligste med å kjøre for fort på elsparkesykkel?",
    image: null,
    options: [
      "Batteriet brukes opp mye raskere",
      "Det er ikke noe farlig ved høy hastighet",
      "Styring og bremselengde er vanskeligere å kontrollere, økt risiko for ulykke",
      "Hjulene slites fortere"
    ],
    correct: 2,
    explanation: "Ved høy fart øker bremselengden kraftig og det er vanskeligere å svinge unna hindringer. Et fall i 20 km/t kan forårsake alvorlige hodeskader. Tilpass alltid farten til forholdene."
  },
  {
    id: 22,
    category: "sikkerhet",
    text: "Hvor bør du parkere elsparkesykkel når du er ferdig med turen?",
    image: SVG.parkering,
    options: [
      "Midt på fortauet der den synes godt",
      "Slik at den ikke blokkerer gangtrafikk, inngangspartier eller rullestolramper",
      "I sykkelfelt langs veien",
      "Akkurat der du avsluttet turen, uansett"
    ],
    correct: 1,
    explanation: "Parker elsparkesykkel slik at den ikke sperrer for fotgjengere, rullestolbrukere eller synshemmede. La alltid minst 150 cm bredde fri for passasje på fortau. Dårlig parkering kan medføre bøter."
  },
  {
    id: 23,
    category: "sikkerhet",
    text: "Hva gjør du hvis bremsene på elsparkesykkel ikke fungerer som de skal?",
    image: null,
    options: [
      "Kjøre litt saktere og prøve igjen",
      "Bruke beina mot asfalten som brems",
      "Ikke bruke elsparkesykkel og få bremsene reparert",
      "Kun kjøre på steder uten trafikk"
    ],
    correct: 2,
    explanation: "Du skal aldri bruke et kjøretøy med defekte bremser. Stopp og få det reparert eller returner leiekjøretøyet. Bremsesvikt kan forårsake alvorlige ulykker."
  },
  {
    id: 24,
    category: "sikkerhet",
    text: "Du er involvert i en trafikkulykke med elsparkesykkel. Hva skal du ALLTID gjøre?",
    image: SVG.ulykke,
    options: [
      "Forlate stedet raskt for å unngå problemer",
      "Stanse, sikre stedet, hjelpe skadede og varsle politiet/ambulanse om nødvendig",
      "Ringe foreldrene dine og vente",
      "Fortsette og varsle via app"
    ],
    correct: 1,
    explanation: "Plikten til å stanse og hjelpe gjelder alle trafikanter. Stans, sørg for sikkerhet, hjelp de skadede og ring 113 (ambulanse) og/eller 112 (politi) ved behov. Å forlate et ulykkessted er straffbart."
  },
  {
    id: 25,
    category: "sikkerhet",
    text: "Hvem har ansvaret for at elsparkesykkelen er i god, trafikksikker stand?",
    image: null,
    options: [
      "Produsenten",
      "Kommunen",
      "Brukeren – du er ansvarlig for kjøretøyet du bruker",
      "Utleiefirmaet for alle typer elsparkesykkel"
    ],
    correct: 2,
    explanation: "Du som bruker er ansvarlig for at kjøretøyet du kjører er i trafikksikker stand. Bruker du et leiekjøretøy med feil, skal du melde fra til utleiefirmaet og ikke bruke det."
  },

  /* ─ TRAFIKKTEGN ──────────────────────────── */
  {
    id: 26,
    category: "tegn",
    text: "Hva betyr dette skiltet?",
    image: SVG.vikeplikt,
    options: [
      "Du har forkjørsrett",
      "Stopp og gi alle andre vikeplikt",
      "Du har vikeplikt for trafikk fra høyre",
      "Forbudt å svinge"
    ],
    correct: 2,
    explanation: "Det hvite, opp-ned trekantede skiltet med rød kant er vikepliktsskiltet. Det betyr at du har vikeplikt for all trafikk i det krysset du nærmer deg."
  },
  {
    id: 27,
    category: "tegn",
    text: "Hva betyr STOPP-skiltet?",
    image: SVG.stopp,
    options: [
      "Senk farten litt",
      "Stoppe helt og gi all annen trafikk vikeplikt",
      "Kun stoppe for biler",
      "Snu og kjør tilbake"
    ],
    correct: 1,
    explanation: "STOPP-skiltet (rød åttekant) krever at du stopper HELT (ikke bare sakte ned) og gir absolutt vikeplikt for all annen trafikk. Dette er strengere enn vikepliktsskiltet."
  },
  {
    id: 28,
    category: "tegn",
    text: "Hva betyr dette skiltet?",
    image: SVG.sykkelVei,
    options: [
      "Sykling er forbudt her",
      "Anbefalt sykkelvei – frivillig for sykler",
      "Sykkelvei – påbudt å bruke for sykler og elsparkesykkel",
      "Privatvei for sykler"
    ],
    correct: 2,
    explanation: "Det blå runde skiltet med hvit sykkel markerer en sykkelvei. Sykler og elsparkesykler plikter å benytte sykkelvei der den finnes, fremfor kjørebanen."
  },
  {
    id: 29,
    category: "tegn",
    text: "Hva betyr dette skiltet?",
    image: SVG.gangVei,
    options: [
      "Gangvei – kun for fotgjengere, elsparkesykkel er forbudt",
      "Gang- og sykkelvei",
      "Lekeplass",
      "Gangfelt – fotgjengere har forkjørsrett"
    ],
    correct: 0,
    explanation: "Det blå runde skiltet med hvit fotgjenger markerer en gangvei som kun er for fotgjengere. Elsparkesykkler er normalt ikke tillatt her – de skal bruke sykkelvei."
  },
  {
    id: 30,
    category: "tegn",
    text: "Hva betyr dette skiltet?",
    image: SVG.forbudtSykkel,
    options: [
      "Sykling anbefales ikke her",
      "Forbudt for sykler og elsparkesykkel",
      "Kun sakte sykling tillatt",
      "Sykkelparkering"
    ],
    correct: 1,
    explanation: "Den hvite sirkelen med rød kant og rød strek gjennom sykkel-symbolet betyr at sykling (og kjøring med elsparkesykkel) er forbudt. Finn en alternativ rute."
  },

  /* ─ EKSTRA spørsmål ──────────────────────── */
  {
    id: 31,
    category: "regler",
    text: "Hva er konsekvensen av å kjøre elsparkesykkel i ruspåvirket tilstand?",
    image: null,
    options: [
      "Ingen konsekvens – dette reguleres ikke for elsparkesykkel",
      "Kun en advarsel fra politiet",
      "Bøter, eventuelt fengsel og tap av førerett for bil",
      "Kun inndragning av elsparkesykkelen"
    ],
    correct: 2,
    explanation: "Ruspåvirket kjøring med elsparkesykkel er et alvorlig lovbrudd som kan gi bøter, betinget eller ubetinget fengsel og tap av førerkortet for bil – selv om du ikke har brukt bil."
  },
  {
    id: 32,
    category: "ferdsel",
    text: "Har du lov til å kjøre elsparkesykkel i et gangfelt?",
    image: null,
    options: [
      "Ja, elsparkesykkel behandles som gang",
      "Ja, men du skal senke farten til gangfart og ha vikeplikt for fotgjengere",
      "Nei, elsparkesykkel er forbudt i gangfelt",
      "Ja, men bare om natten"
    ],
    correct: 1,
    explanation: "Du kan kjøre elsparkesykkel over i gangfelt, men du plikter å senke farten og gi fotgjengere forkjørsrett. Alternativt kan du stige av og trille over – det er alltid tryggest."
  },
  {
    id: 33,
    category: "sikkerhet",
    text: "Hva er det beste du kan gjøre for å bli sett av bilister, spesielt om kvelden?",
    image: null,
    options: [
      "Kjøre midt i veien slik at bilister ser deg",
      "Bruke refleksvest, hjelm med lys og ha fungerende lykter på scooteren",
      "Trykke på klokken kontinuerlig",
      "Ingenting ekstra trengs – lykter på scooteren er nok"
    ],
    correct: 1,
    explanation: "Refleksvest og hjelm med integrert lys gjør deg langt mer synlig. Kombinert med lykter på scooteren øker dette synligheten dramatisk og reduserer risikoen for at biler ikke ser deg."
  },
  {
    id: 34,
    category: "regler",
    text: "Hva er definisjonen på en elsparkesykkel (MPT) i norsk lov?",
    image: null,
    options: [
      "Et leketøy som ikke regnes som trafikant",
      "En motorisert personlig transportenhet med maks 250 W og maks 20 km/t",
      "Et elektrisk kjøretøy som alltid krever vognkort",
      "En sykkel med elektrisk hjelpemotor"
    ],
    correct: 1,
    explanation: "En elsparkesykkel er definert som en motorisert personlig transportenhet (MPT) med maks motoreffekt 250 W og konstruktiv toppfart på maks 20 km/t. Den regnes som kjøretøy i trafikkloven."
  },
  {
    id: 35,
    category: "ferdsel",
    text: "Hva gjør du dersom en syklist ønsker å kjøre forbi deg på en sykkelsti?",
    image: null,
    options: [
      "Sperrer stien slik at de ikke kan kjøre forbi",
      "Øker hastigheten",
      "Holder til høyre og lar dem passere",
      "Stopper og ber dem vente"
    ],
    correct: 2,
    explanation: "Hold alltid til høyre og la raskere trafikanter passere på venstre side. Dette er grunnleggende høyrekjøring som gjelder på alle sykkelstier og veier."
  }

];

/* ─ Hjelpefunksjoner ───────────────────────────────────────────────────── */

/** Hent spørsmål fra localStorage, eller bruk standardliste */
function getQuestions() {
  try {
    const stored = localStorage.getItem('esp_questions');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_QUESTIONS;
}

/** Lagre spørsmål til localStorage */
function saveQuestions(questions) {
  localStorage.setItem('esp_questions', JSON.stringify(questions));
}

/** Tilbakestill til standardspørsmål */
function resetToDefaults() {
  localStorage.removeItem('esp_questions');
  return DEFAULT_QUESTIONS;
}

/** Genererer neste ledige ID */
function nextId(questions) {
  if (!questions.length) return 1;
  return Math.max(...questions.map(q => q.id)) + 1;
}

/** Trekk tilfeldig utvalg av spørsmål fra forskjellige kategorier */
function pickRandomQuestions(questions, count = 15) {
  // Sørg for at vi dekker alle kategorier om mulig
  const categories = ['regler', 'ferdsel', 'sikkerhet', 'tegn'];
  const byCategory = {};
  categories.forEach(c => { byCategory[c] = questions.filter(q => q.category === c); });

  const picked = [];
  const used = new Set();

  // Ta minst 1 fra hver kategori
  categories.forEach(c => {
    if (byCategory[c].length > 0) {
      const q = byCategory[c][Math.floor(Math.random() * byCategory[c].length)];
      if (!used.has(q.id)) { picked.push(q); used.add(q.id); }
    }
  });

  // Fyll resten tilfeldig
  const remaining = questions.filter(q => !used.has(q.id));
  const shuffled = remaining.sort(() => Math.random() - 0.5);
  for (const q of shuffled) {
    if (picked.length >= count) break;
    picked.push(q);
  }

  // Bland den endelige listen
  return picked.sort(() => Math.random() - 0.5).slice(0, count);
}

const CATEGORY_LABELS = {
  regler:    'Regler',
  ferdsel:   'Ferdsel',
  sikkerhet: 'Sikkerhet',
  tegn:      'Trafikktegn'
};
