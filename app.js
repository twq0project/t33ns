'use strict';

// ════════════════════════════════════════════
// NEBULA / STARS CANVAS
// ════════════════════════════════════════════
(function () {
  const c = document.getElementById('nebula');
  const ctx = c.getContext('2d');

  function resize() { c.width = innerWidth; c.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 260 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.4 + 0.2,
    a: Math.random(), da: (Math.random() - 0.5) * 0.003,
    hue: Math.random() < 0.2 ? 200 + Math.random() * 40 : 220
  }));

  // Nebula blobs
  const blobs = [
    { x: 0.15, y: 0.3, r: 0.3, c: '74,100,200' },
    { x: 0.8,  y: 0.7, r: 0.25, c: '100,50,160' },
    { x: 0.5,  y: 0.1, r: 0.2, c: '30,80,140' },
  ];

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light' &&
           !window.matchMedia('(prefers-color-scheme: light)').matches ||
           document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    if (!isDark()) { requestAnimationFrame(draw); return; }

    // Nebula blobs
    blobs.forEach(b => {
      const g = ctx.createRadialGradient(
        b.x * c.width, b.y * c.height, 0,
        b.x * c.width, b.y * c.height, b.r * Math.min(c.width, c.height)
      );
      g.addColorStop(0, `rgba(${b.c},.04)`);
      g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
    });

    // Stars
    stars.forEach(s => {
      s.a += s.da;
      if (s.a < 0 || s.a > 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x * c.width, s.y * c.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},60%,90%,${s.a * 0.75})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════
const themeBtn = document.getElementById('themeBtn');
function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') !== 'light';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const ar = typeof currentLang !== 'undefined' && currentLang === 'ar';
  themeBtn.textContent = isDark ? (ar ? AR.nav.themeLight : '☀ Light') : (ar ? AR.nav.themeDark : '☽ Dark');
}
themeBtn.addEventListener('click', toggleTheme);

// ════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════
const navLinks = document.querySelectorAll('.navlink');
const panels   = document.querySelectorAll('.panel');

function showPanel(id) {
  panels.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const p = document.getElementById('panel-' + id);
  if (p) { p.classList.add('active'); onPanelShow(id); }
  const l = document.querySelector(`.navlink[data-panel="${id}"]`);
  if (l) l.classList.add('active');
  // sync mobile nav
  document.querySelectorAll('.mobile-nav .navlink').forEach(ml => {
    ml.classList.toggle('active', ml.dataset.panel === id);
  });
  document.getElementById('mobileNav').classList.remove('open');
}

navLinks.forEach(l => l.addEventListener('click', () => showPanel(l.dataset.panel)));

// Mobile hamburger + nav clone
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
navLinks.forEach(l => {
  const clone = l.cloneNode(true);
  clone.addEventListener('click', () => showPanel(clone.dataset.panel));
  mobileNav.appendChild(clone);
});
hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));

function onPanelShow(id) {
  if (id === 'charts') drawAllCharts();
  if (id === 'timeline') { updateTimeline(1); }
  if (id === 'gagarin') buildGagarin();
  if (id === 'sensation') showSensation('launch');
  if (id === 'compare') buildCompare();
  if (id === 'vostok') initVostok();
}

// ════════════════════════════════════════════
// BODY EXPLORER DATA
// ════════════════════════════════════════════
const SYSTEMS = {
  brain: {
    title: 'Brain & Senses',
    category: 'Neurological',
    icon: '🧠', color: '#4a9eff',
    desc: `In microgravity, the brain receives a flood of conflicting signals. The inner ear — the vestibular system — evolved specifically to detect the pull of gravity and transmit "which way is down" to the brain. Remove gravity and it sends confused, contradictory data while the eyes report something completely different. The brain cannot reconcile these signals and responds with intense disorientation, nausea, and spatial confusion. Over 2–4 days, the brain performs a remarkable recalibration: it effectively discounts vestibular input and relies more heavily on vision for spatial orientation. After this adaptation, most astronauts describe a profound sense of mental clarity and calm — even euphoria.`,
    bars: [
      { name: 'Spatial disorientation (days 1-3)', val: 90, color: '#4a9eff', label: 'Severe' },
      { name: 'Vestibular conflict', val: 85, color: '#4a9eff', label: 'High' },
      { name: 'Brain re-calibration speed', val: 70, color: '#4ecb8d', label: '2–4 days' },
      { name: 'Long-term cognitive impact', val: 15, color: '#4ecb8d', label: 'Mild' },
    ],
    pills: [
      { color: '#4a9eff', text: 'Inner ear loses gravity reference' },
      { color: '#ff6b6b', text: '~70% experience space motion sickness' },
      { color: '#4ecb8d', text: 'Brain re-maps sensory input in 72 hrs' },
      { color: '#f0a030', text: 'Euphoria follows successful adaptation' },
      { color: '#9f7aff', text: 'Visual cortex becomes dominant' },
    ]
  },
  eyes: {
    title: 'Eyes & Vision',
    category: 'Ophthalmic',
    icon: '👁️', color: '#c06ee8',
    desc: `One of the most alarming discoveries of long-duration spaceflight is that it can permanently change the shape of an astronaut's eyes. The mechanism starts with the cephalic fluid shift: when gravity no longer holds blood and cerebrospinal fluid in the lower body, they migrate toward the head. This raises intracranial pressure — the pressure inside the skull — which presses against the optic nerves and physically flattens the back of each eyeball (a condition called globe flattening). The resulting change in eye geometry shifts focal length, causing progressive near-vision impairment. About 40% of ISS long-duration astronauts return home needing glasses or an updated prescription. This is now considered one of the top medical risks for a Mars mission.`,
    bars: [
      { name: 'Intracranial pressure elevation', val: 65, color: '#c06ee8', label: 'Moderate' },
      { name: 'Optic nerve swelling risk', val: 50, color: '#ff9f6b', label: 'Elevated' },
      { name: 'Near-vision impairment rate', val: 40, color: '#ff6b6b', label: '40% of crew' },
      { name: 'Post-mission recovery (vision)', val: 60, color: '#4ecb8d', label: 'Usually yes' },
    ],
    pills: [
      { color: '#c06ee8', text: 'Eyeball physically flattens (globe flattening)' },
      { color: '#ff6b6b', text: 'Optic disc oedema observed on MRI' },
      { color: '#f0a030', text: 'Progressive over a 6-month mission' },
      { color: '#4ecb8d', text: 'Vision usually improves post-mission' },
      { color: '#4a9eff', text: 'Major concern for deep space missions' },
    ]
  },
  heart: {
    title: 'Heart & Cardiovascular',
    category: 'Cardiovascular',
    icon: '🫀', color: '#ff6b6b',
    desc: `The heart is one of the most dramatic responders to microgravity. On Earth, the heart works constantly against gravity — pumping blood up to the brain against a downward pull. In space, that fight vanishes. Initially, blood floods into the upper body and the heart receives more blood than usual (higher preload). Over weeks, the heart compensates by reducing its size — the left ventricle can shrink by up to 25%. Its shape also changes, becoming more spherical. Blood volume itself decreases by 10–15% as the kidneys excrete what the body reads as excess fluid. The cardiovascular system becomes dramatically deconditioned. Returning astronauts frequently experience orthostatic intolerance — dizziness or even fainting when standing upright — because the cardiovascular system has "forgotten" how to fight gravity.`,
    bars: [
      { name: 'Heart mass reduction (6 months)', val: 25, color: '#ff6b6b', label: 'Up to 25%' },
      { name: 'Blood volume decrease', val: 15, color: '#f0a030', label: '~15%' },
      { name: 'Orthostatic intolerance on return', val: 80, color: '#ff6b6b', label: 'Very common' },
      { name: 'Recovery with exercise', val: 70, color: '#4ecb8d', label: 'Good' },
    ],
    pills: [
      { color: '#ff6b6b', text: 'Heart becomes more spherical' },
      { color: '#f0a030', text: 'Blood volume drops ~15%' },
      { color: '#4a9eff', text: 'Arteries lose pressure responsiveness' },
      { color: '#4ecb8d', text: '2hrs daily exercise is the main countermeasure' },
      { color: '#9f7aff', text: 'Risk of fainting on return to Earth' },
    ]
  },
  spine: {
    title: 'Spine & Height',
    category: 'Musculoskeletal',
    icon: '🦴', color: '#f0a030',
    desc: `The spine is one of the most fascinating stories in space physiology. Every vertebra in your spine is separated by a cartilaginous disc filled with a gel-like substance. On Earth, these discs are constantly compressed by the weight of everything above them — over the course of a day, you are measurably shorter in the evening than in the morning for exactly this reason. In space, that compression disappears. The discs expand, the spine's natural S-curve straightens, and astronauts can grow 3–5 cm taller within the first 48 hours. But the muscles that stabilize the spine — which have been doing postural work every waking hour on Earth — now have nothing to do. They atrophy. Spinal support muscle mass can drop nearly 20%. When astronauts return to Earth, their compressed spine meets weakened support muscles, creating a window of significantly elevated injury risk.`,
    bars: [
      { name: 'Height increase in orbit', val: 100, color: '#f0a030', label: 'Up to +5 cm' },
      { name: 'Spinal support muscle loss', val: 19, color: '#ff6b6b', label: '~19%' },
      { name: 'Disc herniation risk (post-mission)', val: 100, color: '#ff6b6b', label: '4× higher' },
      { name: 'Back pain in mission', val: 52, color: '#f0a030', label: 'Common' },
    ],
    pills: [
      { color: '#f0a030', text: 'Most height gained in first 24 hours' },
      { color: '#4a9eff', text: 'Height lost within 10 days of return' },
      { color: '#ff6b6b', text: '4× disc herniation risk post-mission' },
      { color: '#4ecb8d', text: 'Same mechanism as morning height' },
      { color: '#9f7aff', text: 'Rehabilitation targets spinal muscles first' },
    ]
  },
  fluids: {
    title: 'Body Fluids',
    category: 'Circulatory',
    icon: '💧', color: '#ff9f6b',
    desc: `Gravity is the reason your body holds about 70% of its blood and fluid in its lower half. The moment that gravity disappears, fluid redistributes freely and evenly throughout the body — and a significant amount of it ends up in the chest, neck and head. The effect is immediate and noticeable: the face puffs up like a mild allergic reaction, the sinuses fill with congestion (chronic stuffiness is one of the most universal complaints on the ISS), and the neck and chest feel uncomfortably full. The legs, meanwhile, become noticeably thinner — earning the nickname "bird legs" from astronauts. The body eventually responds by interpreting the extra fluid in the upper body as excess and commanding the kidneys to excrete more, reducing overall blood volume by ~15%. This fluid chemistry has cascading effects on intracranial pressure, kidney function, and even taste.`,
    bars: [
      { name: 'Cephalic fluid redistribution', val: 75, color: '#ff9f6b', label: 'Significant' },
      { name: 'Total blood volume decrease', val: 15, color: '#f0a030', label: '~15%' },
      { name: 'Facial puffiness (weeks 1-2)', val: 85, color: '#ff9f6b', label: 'Very high' },
      { name: 'Intracranial pressure increase', val: 55, color: '#ff6b6b', label: 'Moderate-high' },
    ],
    pills: [
      { color: '#ff9f6b', text: 'Face puffs within hours of launch' },
      { color: '#ff6b6b', text: 'Chronic nasal congestion throughout mission' },
      { color: '#4a9eff', text: 'Body sheds excess fluid via kidneys' },
      { color: '#4ecb8d', text: 'Smell and taste perception changes' },
      { color: '#9f7aff', text: 'LBNP devices being tested as countermeasure' },
    ]
  },
  bones: {
    title: 'Bone Density',
    category: 'Skeletal',
    icon: '🦷', color: '#a0c4ff',
    desc: `Bone is not the static scaffold it appears to be. It is living tissue in a constant state of remodeling — specialized cells called osteoblasts build new bone matrix while osteoclasts dissolve old bone. The trigger that keeps osteoblasts active is mechanical stress: the compression and tension forces that travel through bones when you walk, stand, or carry weight. Remove those forces in microgravity and the signal for bone building fades. Osteoclast activity continues while osteoblast activity slows, and the result is a net loss of bone mineral density of roughly 1–2% per month in weight-bearing bones. A 6-month ISS mission can leave hips with bone density comparable to a decade of normal aging. The released calcium enters the bloodstream and must be excreted, raising kidney stone risk. Bone recovery after return to Earth takes 2–3 years of rehabilitation.`,
    bars: [
      { name: 'Bone loss per month (hip)', val: 20, color: '#ff6b6b', label: '1–2%/month' },
      { name: 'Total loss after 6 months', val: 80, color: '#ff6b6b', label: 'Up to 10%' },
      { name: 'Kidney stone risk increase', val: 45, color: '#f0a030', label: 'Elevated' },
      { name: 'Recovery timeline', val: 60, color: '#4ecb8d', label: '2–3 years' },
    ],
    pills: [
      { color: '#ff6b6b', text: 'Hip and spine lose most density' },
      { color: '#f0a030', text: 'Calcium releases into bloodstream' },
      { color: '#4a9eff', text: 'Fracture risk elevated post-mission' },
      { color: '#4ecb8d', text: 'Resistive exercise is the best countermeasure' },
      { color: '#9f7aff', text: 'Equivalent to ~10 yrs aging in 6 months' },
    ]
  },
  muscles: {
    title: 'Muscles',
    category: 'Musculoskeletal',
    icon: '💪', color: '#4ecb8d',
    desc: `The human muscular system is brutally use-dependent. Muscles that aren't regularly loaded begin to shrink within days. In space, the postural muscles — those that spend every waking hour holding the skeleton upright and counteracting gravity — suddenly have no function. They begin atrophying almost immediately. Leg muscles are affected most severely because on Earth they carry the entire body weight with every step. Without intervention, an astronaut can lose 20% of calf muscle mass within a month. But even with the ISS's intensive exercise protocol (two hours of mandatory daily exercise), mission crews still return with measurable muscle loss, altered fiber composition (fast-twitch fibers convert to slow-twitch), and significantly reduced maximum strength. Recovery takes 3–6 months of post-mission rehabilitation.`,
    bars: [
      { name: 'Calf muscle mass loss (6 months)', val: 20, color: '#ff6b6b', label: 'Up to 20%' },
      { name: 'Thigh muscle strength reduction', val: 30, color: '#ff6b6b', label: 'Up to 30%' },
      { name: 'With daily ISS exercise', val: 40, color: '#f0a030', label: 'Still ~10%' },
      { name: 'Recovery time', val: 50, color: '#4ecb8d', label: '3–6 months' },
    ],
    pills: [
      { color: '#ff6b6b', text: 'Legs and lower back worst affected' },
      { color: '#f0a030', text: '2+ hours of daily resistive exercise required' },
      { color: '#4a9eff', text: 'Muscle fiber type shifts: fast → slow twitch' },
      { color: '#4ecb8d', text: 'Countermeasure: ARED resistance machine on ISS' },
      { color: '#9f7aff', text: 'Walking after 6-month missions is difficult' },
    ]
  },
  immune: {
    title: 'Immune System',
    category: 'Immunological',
    icon: '🛡️', color: '#d4c010',
    desc: `The immune system in space faces a multi-front assault. Microgravity itself alters the behavior of immune cells: T-lymphocytes show reduced activity, natural killer cells are less effective, and inflammatory cytokine signaling becomes dysregulated. Simultaneously, the extreme stress of spaceflight, sleep disruption, confinement, circadian rhythm disruption, and isolation all chronically elevate cortisol — and cortisol suppresses immune function. The compound result is that viruses the immune system normally keeps dormant can reactivate. Research has shown that about 47% of astronauts on long-duration missions experience reactivation of latent herpes-family viruses — including the varicella-zoster virus responsible for chickenpox and shingles. Cosmic radiation beyond Earth's magnetosphere also directly damages DNA in immune cells.`,
    bars: [
      { name: 'Latent virus reactivation rate', val: 47, color: '#ff6b6b', label: '~47%' },
      { name: 'T-cell function reduction', val: 60, color: '#d4c010', label: 'Moderate' },
      { name: 'Inflammatory dysregulation', val: 55, color: '#f0a030', label: 'Elevated' },
      { name: 'DNA damage from radiation', val: 40, color: '#ff6b6b', label: 'Significant' },
    ],
    pills: [
      { color: '#d4c010', text: 'T-cell activity significantly reduced' },
      { color: '#ff6b6b', text: '47% herpes-family virus reactivation' },
      { color: '#f0a030', text: 'Cortisol elevation chronically suppresses immunity' },
      { color: '#4a9eff', text: 'Radiation damages immune cell DNA directly' },
      { color: '#9f7aff', text: 'Vaccine effectiveness may be reduced in space' },
    ]
  },
  sleep: {
    title: 'Sleep & Circadian Rhythm',
    category: 'Chronobiological',
    icon: '😴', color: '#9f7aff',
    desc: `Aboard the ISS, the Sun rises and sets every 90 minutes — 16 times per day. This batters the circadian clock, the 24-hour internal rhythm that governs sleep, hormone release, body temperature, and dozens of metabolic processes. The clock is calibrated by light-dark cycles, and 16 sunrises per day gives it nothing to latch onto. Astronauts sleep in windowless sleeping pods and take melatonin, but surveys show they consistently sleep about 6 hours per night against a recommended 8.5 hours. The resulting chronic sleep deprivation compounds nearly every other physiological challenge: it elevates cortisol (worsening immune function), impairs cognitive performance, reduces exercise tolerance, and disrupts hormone cycles critical to bone and muscle repair. Sleep deprivation is, paradoxically, one of the most dangerous yet least-discussed hazards of spaceflight.`,
    bars: [
      { name: 'Average sleep duration (vs 8.5 hrs)', val: 70, color: '#9f7aff', label: '~6 hrs/night' },
      { name: 'Circadian rhythm disruption', val: 80, color: '#ff6b6b', label: 'Severe' },
      { name: 'Cognitive performance reduction', val: 20, color: '#f0a030', label: 'Moderate' },
      { name: 'Sleeping pill use rate', val: 75, color: '#9f7aff', label: '~75% of crew' },
    ],
    pills: [
      { color: '#9f7aff', text: '16 sunrises per day on the ISS' },
      { color: '#ff6b6b', text: 'Chronic 2+ hour sleep deficit each night' },
      { color: '#f0a030', text: '~75% of ISS astronauts use sleep medication' },
      { color: '#4a9eff', text: 'Melatonin and light therapy used as fixes' },
      { color: '#4ecb8d', text: 'Sleep quality improves after first weeks' },
    ]
  }
};

// ── Render selected system ──────────────────
function renderSystem(id) {
  const data = SYSTEMS[id];
  if (!data) return;

  const content = document.getElementById('sys-content');
  const empty   = document.getElementById('sys-empty');
  empty.style.display = 'none';
  content.style.display = 'block';

  content.innerHTML = `
    <div class="sc-hero">
      <div class="sc-top">
        <div class="sc-icon-wrap" style="background:${data.color}20">${data.icon}</div>
        <div class="sc-title-area">
          <div class="sc-title">${data.title}</div>
          <span class="sc-badge" style="background:${data.color}1a;color:${data.color}">${data.category}</span>
        </div>
      </div>
      <p class="sc-desc">${data.desc}</p>
    </div>
    <div class="sc-body">
      <div class="sc-bars">
        ${data.bars.map(b => `
          <div class="sb-item">
            <div class="sb-row">
              <span class="sb-name">${b.name}</span>
              <span class="sb-val">${b.label}</span>
            </div>
            <div class="sb-row">
              <div class="sb-track"><div class="sb-fill" data-width="${b.val}" style="background:${b.color}"></div></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="sc-pills">
        ${data.pills.map(p => `
          <div class="sc-pill">
            <div class="dot" style="background:${p.color}"></div>
            ${p.text}
          </div>`).join('')}
      </div>
    </div>`;

  // Animate bars
  requestAnimationFrame(() => {
    content.querySelectorAll('.sb-fill').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  });
}

// Wire hotspots
document.querySelectorAll('.hs').forEach(hs => {
  hs.addEventListener('click', () => {
    document.querySelectorAll('.hs').forEach(h => h.classList.remove('active'));
    hs.classList.add('active');
    renderSystem(hs.dataset.id);
    // Pulse the figure
    document.getElementById('env-badge').classList.add('space');
    document.getElementById('env-badge').textContent = '🚀 In Space';
  });
  hs.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hs.click(); }
  });
});

// ════════════════════════════════════════════
// MISSION CLOCK
// ════════════════════════════════════════════
const METRICS = [
  {
    id: 'height', icon: '📏', name: 'Height Change', unit: 'cm gained',
    calc: d => Math.min(5, d <= 3 ? d * 1.5 : 4.5 + (d - 3) * 0.004),
    severity: v => v < 1 ? 'ok' : v < 3 ? 'warn' : 'warn',
    statusLabel: v => v < 1 ? 'Minimal' : v < 3 ? 'Growing' : 'Max stretch',
    bar: v => v / 5 * 100, barColor: '#f0a030', decimals: 1
  },
  {
    id: 'bones', icon: '🦴', name: 'Bone Density', unit: '% lost',
    calc: d => Math.min(11, d * 0.058),
    severity: v => v < 2 ? 'ok' : v < 5 ? 'warn' : 'danger',
    statusLabel: v => v < 2 ? 'Normal' : v < 5 ? 'Losing' : 'Critical',
    bar: v => v / 11 * 100, barColor: '#a0c4ff', decimals: 1
  },
  {
    id: 'muscle', icon: '💪', name: 'Muscle Mass', unit: '% lost (legs)',
    calc: d => Math.min(20, d * 0.105),
    severity: v => v < 3 ? 'ok' : v < 10 ? 'warn' : 'danger',
    statusLabel: v => v < 3 ? 'Normal' : v < 10 ? 'Atrophying' : 'Severe',
    bar: v => v / 20 * 100, barColor: '#4ecb8d', decimals: 1
  },
  {
    id: 'fluids', icon: '💧', name: 'Head Fluid', unit: 'relative shift',
    calc: d => d <= 5 ? d * 18 : Math.max(38, 90 - d * 0.29),
    severity: v => v < 20 ? 'ok' : v < 55 ? 'warn' : 'danger',
    statusLabel: v => v < 20 ? 'Normal' : v < 55 ? 'Shifted' : 'Puffy face',
    bar: v => Math.min(v, 100), barColor: '#ff9f6b', decimals: 0
  },
  {
    id: 'cardio', icon: '🫀', name: 'Heart Fitness', unit: '% of baseline VO2',
    calc: d => Math.max(75, 100 - d * 0.13),
    severity: v => v > 92 ? 'ok' : v > 83 ? 'warn' : 'danger',
    statusLabel: v => v > 92 ? 'Normal' : v > 83 ? 'Declining' : 'Reduced',
    bar: v => (v - 75) / 25 * 100, barColor: '#ff6b6b', decimals: 0
  },
  {
    id: 'immune', icon: '🛡️', name: 'Immune Function', unit: '% disruption',
    calc: d => Math.min(55, d * 0.29),
    severity: v => v < 10 ? 'ok' : v < 28 ? 'warn' : 'danger',
    statusLabel: v => v < 10 ? 'Normal' : v < 28 ? 'Stressed' : 'Dysregulated',
    bar: v => v / 55 * 100, barColor: '#d4c010', decimals: 0
  },
];

const PHASES = [
  { from: 1,   to: 2,   name: 'Launch day', text: `The rocket fires and G-forces crush you into the seat. Then: cutoff, silence, and every unsecured object floats. The body has entered a completely alien environment. Fluid is already beginning to migrate toward the head. The stomach protests loudly.` },
  { from: 3,   to: 7,   name: 'Early adaptation', text: `Space motion sickness peaks around day 2-3 and begins to ease. The brain is re-mapping its spatial model, discarding vestibular cues in favor of visual ones. Most astronauts feel noticeably better by day 4. Height gain is nearly at maximum — the spine has fully decompressed. The face is visibly puffy.` },
  { from: 8,   to: 20,  name: 'First two weeks', text: `The body has largely adapted to the weightless environment. The nausea is gone and astronauts describe feeling light, fast, and capable. Bone loss and muscle atrophy are underway but not yet severe. Daily exercise begins in earnest. Sleep is poor — the 16-sunrise cycle disrupts the circadian clock constantly.` },
  { from: 21,  to: 59,  name: 'First month', text: `Bone density is measurably declining. Leg muscles are noticeably weaker despite two hours of daily exercise. Blood volume has stabilized at its new, lower level. The cardiovascular system has deconditioned significantly. Astronauts are performing complex science experiments and spacewalks — the body has adapted, but at a physiological cost that is accumulating.` },
  { from: 60,  to: 89,  name: 'Month two', text: `Bone density continues to decline. Vision may be subtly changing as intracranial pressure sustains itself at an elevated level. Immune function is disrupted; latent viruses are stirring. The body is running a kind of physiological debt that will need to be repaid through months of post-mission rehabilitation.` },
  { from: 90,  to: 149, name: 'Months three–five', text: `The mission's midpoint and beyond. The body is in a stable but compromised state. Bone and muscle losses are significant. The spinal muscles that supported the elongated spine have atrophied considerably — creating the scenario where return to gravity will be genuinely risky. Astronauts adapt psychologically to confinement and isolation; mental resilience becomes a key asset.` },
  { from: 150, to: 180, name: 'Month six — return approach', text: `As return to Earth approaches, pre-return exercise intensifies. Astronauts are counseled about what to expect: the crushing, unfamiliar sensation of gravity. Standing up will feel impossibly heavy. Walking will be uncertain and exhausting. Every physiological change accumulated over 180 days will suddenly have to contend with 9.8 m/s² again — all at once.` },
];

function getPhase(day) {
  return PHASES.find(p => day >= p.from && day <= p.to) || PHASES[PHASES.length - 1];
}

function buildMetricGrid(day, lang) {
  if (lang === undefined) lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  const grid = document.getElementById('metric-grid');
  const ar = lang === 'ar';
  const arStatus = ar ? AR.metricStatus : null;
  // Always rebuild so names/units reflect current language
  grid.innerHTML = METRICS.map(m => {
    const name = ar && arStatus[m.id] ? arStatus[m.id].name : m.name;
    const unit = ar && arStatus[m.id] ? arStatus[m.id].unit : m.unit;
    return `
      <div class="metric-card" id="mc-${m.id}">
        <div class="mc-top">
          <span class="mc-icon">${m.icon}</span>
          <span class="mc-name">${name}</span>
          <span class="mc-status" id="mcs-${m.id}"></span>
        </div>
        <div class="mc-val" id="mcv-${m.id}">—</div>
        <div class="mc-unit">${unit}</div>
        <div class="mc-bar"><div class="mc-bar-fill" id="mcb-${m.id}"></div></div>
      </div>`;
  }).join('');
  grid._built = true;
  METRICS.forEach(m => {
    const val = m.calc(day);
    const sev = m.severity(val);
    document.getElementById('mc-' + m.id).className = 'metric-card ' + sev;
    // Arabic status label lookup
    let statusTxt = m.statusLabel(val);
    if (ar && arStatus.metricStat && arStatus.metricStat[m.id]) {
      statusTxt = arStatus.metricStat[m.id][sev] || statusTxt;
    }
    document.getElementById('mcs-' + m.id).textContent = statusTxt;
    document.getElementById('mcv-' + m.id).textContent =
      m.decimals > 0 ? val.toFixed(m.decimals) : Math.round(val);
    const fill = document.getElementById('mcb-' + m.id);
    fill.style.width = Math.min(m.bar(val), 100).toFixed(1) + '%';
    fill.style.background = sev === 'danger' ? '#ff6b6b' : sev === 'warn' ? m.barColor : '#4ecb8d';
  });
}

function updateTimeline(val) {
  const d = parseInt(val);
  document.getElementById('clock-day').textContent = 'Day ' + d;
  const phase = getPhase(d);
  document.getElementById('clock-phase').textContent = phase.name;
  document.getElementById('clock-narrative').textContent = phase.text;
  buildMetricGrid(d);
}

document.getElementById('mission-slider').addEventListener('input', function () {
  updateTimeline(this.value);
});

window.jumpDay = function (d) {
  const sl = document.getElementById('mission-slider');
  sl.value = d;
  updateTimeline(d);
};

// ════════════════════════════════════════════
// GAGARIN STORY
// ════════════════════════════════════════════
const STEPS = [
  {
    time: 'Pre-launch · 5:00 AM',
    title: 'Final preparations',
    text: `Gagarin wakes at 5 AM. Engineers help him into the SK-1 pressure suit — bright orange, so he can be found quickly if the landing is off-target. At the launch pad, he rides an elevator to the top of the R-7 rocket. Before climbing in, he stops and urinates on the bus tire — a tradition that Russian cosmonauts still observe before every launch. He is 27 years old. He climbs into the spherical 2.3-meter Vostok capsule and the hatch is sealed.`
  },
  {
    time: '09:07 Moscow time — Launch',
    title: 'Ignition',
    text: `The R-7 rocket\'s engines ignite with a shudder the entire structure absorbs. Gagarin broadcasts into his radio: <em>"Poyekhali!"</em> — "Let\'s go!" The rocket lifts off. G-forces build rapidly as the vehicle accelerates through the lower atmosphere. His pulse climbs. The noise is enormous. He keeps his breathing and voice steady, reporting to ground control every 60 seconds.`
  },
  {
    time: '+9 min 7 sec — Orbit',
    title: 'The first human in space',
    text: `The third stage separates. The engines cut off. Everything that was vibrating and pressing and roaring goes completely, impossibly silent. Gagarin\'s body lifts off the seat. His notebook, pencil, and anything not secured floats in front of his face. He experiences the sensation no human has ever felt: genuine weightlessness, sustained, in orbit around Earth. His first description: <em>"The feeling of weightlessness was somewhat unfamiliar... you feel as if you are suspended."</em>`
  },
  {
    time: '+46 min — Over the Pacific',
    title: 'Seeing Earth for the first time',
    text: `Through the small Vzor porthole, Gagarin watches the curve of Earth scrolling beneath him. The atmosphere appears as a thin blue film clinging to the surface. He can see the terminator line between day and night. He makes his famous transmission: <em>"The Earth is blue. How wonderful. It is amazing."</em> He can see weather systems, the blue of the oceans, and the faint haze at the horizon where the planet meets space.`
  },
  {
    time: '+60 min — Re-entry sequence',
    title: 'The retrorocket fires',
    text: `The retrorocket fires on schedule, slowing the capsule enough to drop out of orbit. But a malfunction means the service module fails to separate cleanly from the descent capsule — it remains attached by cables, causing the vehicle to spin wildly for 10 terrifying minutes as it enters the upper atmosphere. Gagarin does not report this aloud. The cables eventually burn through and separation occurs.`
  },
  {
    time: '+98 min — Re-entry fireball',
    title: '"I\'m burning. Goodbye, comrades."',
    text: `As the capsule dips into the atmosphere, friction heats the ablative shield to over 5,000°C. A plasma sheath forms around the capsule, cutting radio contact entirely. Through the porthole, Gagarin sees flames. He does not know this is normal atmospheric re-entry. He genuinely believes he is burning to death. He transmits: <em>"I\'m burning. Goodbye, comrades."</em> Ground control hears nothing but static. He is, in fact, fine.`
  },
  {
    time: '+108 min — Landing',
    title: 'Back on Earth',
    text: `At 7,000 meters, the hatch blows and Gagarin ejects, parachuting separately from the capsule as designed. He lands in a field near the Volga River in the Saratov region of Russia. A woman named Anna Takhtarova and her six-year-old granddaughter are the first humans he sees. He asks if they have a phone — he needs to call Moscow. Within hours, he is the most famous human being alive. The first spaceflight has lasted exactly 108 minutes.`
  }
];

function buildGagarin() {
  const container = document.getElementById('gg-story');
  if (container._built) return;
  container._built = true;

  container.innerHTML = STEPS.map((s, i) => `
    <div class="gg-step ${i === 0 ? 'active' : ''}" onclick="activateStep(this)">
      <div class="ggs-marker">
        <div class="ggs-dot"></div>
        ${i < STEPS.length - 1 ? '<div class="ggs-line"></div>' : ''}
      </div>
      <div class="ggs-body">
        <div class="ggs-time">${s.time}</div>
        <div class="ggs-title">${s.title}</div>
        <div class="ggs-text">${s.text}</div>
      </div>
    </div>`).join('');
}

window.activateStep = function (el) {
  document.querySelectorAll('.gg-step').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
};

// ════════════════════════════════════════════
// CHARTS
// ════════════════════════════════════════════
let chartsDrawn = false;

function drawChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.clientWidth || 500;
  const H = canvas.clientHeight || 200;
  canvas.width = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const PAD = { top: 20, right: 20, bottom: 35, left: 44 };
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top - PAD.bottom;

  const fg     = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#e8eaf2';
  const mid    = getComputedStyle(document.documentElement).getPropertyValue('--mid').trim() || '#8890a8';
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#111827';
  const amber  = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || '#f0a030';

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = surface;
  ctx.lineWidth = 1;
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const y = PAD.top + (h / yTicks) * i;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + w, y); ctx.stroke();
    const val = data.yMax - (data.yMax - data.yMin) / yTicks * i;
    ctx.fillStyle = mid;
    ctx.font = `${10 * devicePixelRatio / devicePixelRatio}px Inter, system-ui`;
    ctx.textAlign = 'right';
    ctx.fillText(data.formatY ? data.formatY(val) : val.toFixed(data.yDec || 0), PAD.left - 6, y + 4);
  }

  // X axis labels
  ctx.fillStyle = mid;
  ctx.textAlign = 'center';
  const xLabels = [0, 30, 60, 90, 120, 150, 180];
  xLabels.forEach(day => {
    const x = PAD.left + (day / 180) * w;
    ctx.fillText('D' + day, x, H - PAD.bottom + 16);
  });

  // Lines
  data.series.forEach(series => {
    const pts = series.points;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = PAD.left + (p.x / 180) * w;
      const y = PAD.top + h - ((p.y - data.yMin) / (data.yMax - data.yMin)) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = series.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Gradient fill
    const last = pts[pts.length - 1];
    const firstPt = pts[0];
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + h);
    grad.addColorStop(0, series.color + '30');
    grad.addColorStop(1, series.color + '00');
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = PAD.left + (p.x / 180) * w;
      const y = PAD.top + h - ((p.y - data.yMin) / (data.yMax - data.yMin)) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(PAD.left + (last.x / 180) * w, PAD.top + h);
    ctx.lineTo(PAD.left + (firstPt.x / 180) * w, PAD.top + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // End dot
    const endX = PAD.left + (last.x / 180) * w;
    const endY = PAD.top + h - ((last.y - data.yMin) / (data.yMax - data.yMin)) * h;
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fillStyle = series.color;
    ctx.fill();
  });

  // Legend
  if (data.series.length > 1) {
    let lx = PAD.left + 8;
    data.series.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, PAD.top + 4, 12, 3);
      ctx.fillStyle = mid;
      ctx.textAlign = 'left';
      ctx.fillText(s.label || '', lx + 16, PAD.top + 10);
      lx += ctx.measureText(s.label || '').width + 40;
    });
  }
}

function makePts(fn, steps = 181) {
  return Array.from({ length: steps }, (_, i) => ({ x: i, y: fn(i) }));
}

function drawAllCharts() {
  if (chartsDrawn) return;
  chartsDrawn = true;

  // Bone density loss
  drawChart('chart-bone', {
    yMin: 0, yMax: 12, yDec: 1,
    series: [
      { color: '#a0c4ff', label: 'Hip bone', points: makePts(d => Math.min(11, d * 0.058)) },
      { color: '#ff9f6b', label: 'Spine', points: makePts(d => Math.min(9, d * 0.044)) },
    ]
  });

  // Muscle mass remaining
  drawChart('chart-muscle', {
    yMin: 75, yMax: 101, yDec: 0,
    series: [
      { color: '#4ecb8d', label: 'With exercise', points: makePts(d => Math.max(88, 100 - d * 0.06)) },
      { color: '#ff6b6b', label: 'Without exercise', points: makePts(d => Math.max(78, 100 - d * 0.115)) },
    ]
  });

  // Height change
  drawChart('chart-height', {
    yMin: 0, yMax: 6, yDec: 1,
    series: [
      { color: '#f0a030', label: 'Height gain (cm)', points: makePts(d => Math.min(5, d <= 3 ? d * 1.5 : 4.5 + (d - 3) * 0.004)) },
    ]
  });

  // Radiation
  drawChart('chart-radiation', {
    yMin: 0, yMax: 100, yDec: 0,
    series: [
      { color: '#9f7aff', label: 'Cumulative dose (mSv)', points: makePts(d => d * 0.5) },
    ]
  });

  // VO2 max
  drawChart('chart-cardio', {
    yMin: 74, yMax: 101, yDec: 0,
    series: [
      { color: '#ff6b6b', label: 'With ISS exercise', points: makePts(d => Math.max(83, 100 - d * 0.09)) },
      { color: '#f0a030', label: 'No exercise', points: makePts(d => Math.max(70, 100 - d * 0.165)) },
    ]
  });

  // ICP
  drawChart('chart-icp', {
    yMin: 0.9, yMax: 1.5, yDec: 2,
    series: [
      { color: '#c06ee8', label: 'Intracranial pressure (relative)', points: makePts(d => d === 0 ? 1.0 : Math.min(1.38, 1 + d * 0.0021)) },
    ]
  });
}

function drawAllChartsAr() {
  if (chartsDrawn) return;
  chartsDrawn = true;
  drawChart('chart-bone', {
    yMin: 0, yMax: 12, yDec: 1,
    series: [
      { color: '#a0c4ff', label: 'عظمة الورك', points: makePts(d => Math.min(11, d * 0.058)) },
      { color: '#ff9f6b', label: 'العمود الفقري', points: makePts(d => Math.min(9, d * 0.044)) },
    ]
  });
  drawChart('chart-muscle', {
    yMin: 75, yMax: 101, yDec: 0,
    series: [
      { color: '#4ecb8d', label: 'مع التمرين', points: makePts(d => Math.max(88, 100 - d * 0.06)) },
      { color: '#ff6b6b', label: 'بدون تمرين', points: makePts(d => Math.max(78, 100 - d * 0.115)) },
    ]
  });
  drawChart('chart-height', {
    yMin: 0, yMax: 6, yDec: 1,
    series: [
      { color: '#f0a030', label: 'الزيادة في الطول (سم)', points: makePts(d => Math.min(5, d <= 3 ? d * 1.5 : 4.5 + (d - 3) * 0.004)) },
    ]
  });
  drawChart('chart-radiation', {
    yMin: 0, yMax: 100, yDec: 0,
    series: [
      { color: '#9f7aff', label: 'الجرعة التراكمية (ميلي سيفرت)', points: makePts(d => d * 0.5) },
    ]
  });
  drawChart('chart-cardio', {
    yMin: 74, yMax: 101, yDec: 0,
    series: [
      { color: '#ff6b6b', label: 'مع تمرين المحطة', points: makePts(d => Math.max(83, 100 - d * 0.09)) },
      { color: '#f0a030', label: 'بدون تمرين', points: makePts(d => Math.max(70, 100 - d * 0.165)) },
    ]
  });
  drawChart('chart-icp', {
    yMin: 0.9, yMax: 1.5, yDec: 2,
    series: [
      { color: '#c06ee8', label: 'الضغط داخل الجمجمة (نسبي)', points: makePts(d => d === 0 ? 1.0 : Math.min(1.38, 1 + d * 0.0021)) },
    ]
  });
}

// ════════════════════════════════════════════
// SENSATION DATA
// ════════════════════════════════════════════
const SENSATIONS = {
  launch: {
    label: 'The Launch',
    title: 'Fire and Thunder',
    lead: `The ground disappears in a way you have never felt anything disappear before.`,
    body: [
      `The first sensation is the vibration. It begins in the seat, travels through the floor, through the structure of the rocket, through your body. Everything is shaking simultaneously. The noise is physical — not heard but felt in the sternum, the teeth, the skull.`,
      `Then the G-forces build. At maximum dynamic pressure, about 90 seconds into flight, you are pinned to your seat by 4–5 times your own weight. Breathing is labored. Your face sags. Every kilogram of you feels like five. This is the hardest the launch profile will push, and it lasts only a few minutes before staging occurs and the force drops.`,
      `Then: the engines cut off. Everything stops. Every vibration, every sound, every force vanishes simultaneously, and in its place — nothing. The notebooks and pens float. Your arms float. You are in space.`
    ],
    quotes: [
      { text: `Let's go! It vibrated, then got quiet, then I felt an enormous force pressing down on me. But I could breathe normally.`, cite: 'Yuri Gagarin, 1961' },
      { text: `When the main engines cut off, it felt like the vehicle stopped. You go from this incredible cacophony to pure silence in an instant.`, cite: 'Astronaut description of orbital insertion' },
    ]
  },
  orbit: {
    label: 'Entering Orbit',
    title: 'The Silence of Space',
    lead: `There is no boundary. No line you cross. One moment you are flying very fast inside an atmosphere; the next, you are outside of it.`,
    body: [
      `Orbital insertion is not a dramatic event. There is no gate, no sign, no gradual transition. The atmosphere simply thins below a detectable level while the vehicle achieves the precise forward velocity — about 7.7 km/s — at which the curvature of the Earth curves away at the same rate gravity pulls you toward it. You are falling at exactly the rate the ground falls away.`,
      `The first thing most astronauts do is look out the window. Not at the instruments, not at their checklists — at Earth. The visual impact is described consistently across cultures, ages, and nationalities: the sense that the planet looks impossibly beautiful, impossibly fragile, and disturbingly small.`,
      `A thin blue line separates the world from the black of space. That line is the entire atmosphere — all the air that every living thing has ever breathed, all the weather, all the blue sky you have ever seen — compressed into a film that looks, from orbit, like the glaze on a glass sphere.`
    ],
    quotes: [
      { text: `The thing that surprised me most was how thin the atmosphere looks. It's just a sliver. It looks incredibly fragile.`, cite: 'ISS astronaut' },
      { text: `You go into orbit and you look at the Earth and realize the thin blue line is all there is between life and the void.`, cite: 'Astronaut post-mission interview' },
    ]
  },
  weightless: {
    label: 'Weightlessness',
    title: 'Floating Forever',
    lead: `Every human being who has ever lived has felt gravity every second of their existence. In space, that stops.`,
    body: [
      `Weightlessness does not feel like falling. At least, not like the stomach-dropping sensation of a roller coaster or an elevator. It feels, most astronauts report, like nothing. Like a neutral state. Like the default of existence has changed. There is no sense of being pulled. No sensation of weight in the body. Your arms don't hang — they float in whatever position you leave them.`,
      `Within hours, the body begins to notice what this means physiologically. The sinuses fill. The face puffs. There is a persistent feeling of fullness behind the eyes, a mild headache that fades over days. The lower back aches as the spine elongates — sometimes quite painfully in the first 24 hours as discs that have been compressed for a lifetime suddenly expand.`,
      `One of the strangest effects: you cannot feel your own legs as belonging to your body in the usual way. Without weight, proprioception — the sense of where your limbs are — changes. Astronauts report having to look at their legs to confirm their position, especially when sleeping.`
    ],
    quotes: [
      { text: `It feels like you're perfectly suspended in the middle of the air. You can float in any direction and it takes no effort at all to maintain any position.`, cite: 'ISS expedition member' },
      { text: `When I close my eyes, I can't tell which way is up. There is no up. My body is completely confused.`, cite: 'First-time astronaut, mission day 1' },
    ]
  },
  sick: {
    label: 'Space Sickness',
    title: 'When the Body Revolts',
    lead: `About 70% of astronauts experience some form of space motion sickness. For many, it is severe.`,
    body: [
      `Space sickness — formally called Space Adaptation Syndrome — is caused by the conflict between what the eyes see and what the vestibular system reports. On Earth, the inner ear constantly confirms gravity's direction. In space, it sends meaningless signals while the eyes say "I see a floor, I see a ceiling" — but those are arbitrary designations in an environment where there is no physical up or down.`,
      `The brain, receiving conflicting data it cannot reconcile, interprets the situation as poisoning — the same response it has to neurotoxins that distort sensory reality. It responds accordingly: vomiting, nausea, sweating, disorientation. For some astronauts this is mild and passes in hours. For others, it is incapacitating for two or three days.`,
      `The practical challenge: nausea and vomiting inside a spacesuit during a spacewalk — which may be scheduled within the first days of a mission — is genuinely dangerous. Vomit can block the airway or visibility inside a closed helmet. Every astronaut is given anti-nausea medication as standard issue, and spacewalks are scheduled only after the body has had time to adapt.`
    ],
    quotes: [
      { text: `I was sick for two and a half days. It was exactly like the worst motion sickness you've ever had, but constant, with no relief from lying down, because lying down doesn't do anything.`, cite: 'ISS astronaut, post-mission debrief' },
      { text: `I kept thinking — if I have to do an EVA right now, I cannot. I physically cannot. And that was frightening.`, cite: 'Astronaut describing mission day 2' },
    ]
  },
  adapt: {
    label: 'Adaptation',
    title: 'The Brain Rewires Itself',
    lead: `After 3–5 days, something shifts. The disorientation lifts. The body has learned to live in space.`,
    body: [
      `The brain's adaptation to microgravity is one of the more remarkable demonstrations of neuroplasticity. The vestibular system continues to send confused signals, but the brain learns to discount and filter them. Visual input becomes dominant for spatial orientation. The brain constructs a new model of where things are in space — one built from sight, touch, and proprioception rather than gravity.`,
      `The resulting state is described consistently as calm, lightness, and — frequently — euphoria. The physical ease of moving in zero gravity is a genuine pleasure once the adaptation is complete. Pushing off a wall and floating across a module, turning somersaults with no effort, drinking floating globes of water, sleeping in any orientation — astronauts describe these experiences with unmistakable joy.`,
      `Sleep, however, remains challenging throughout. The circadian rhythm — the 24-hour internal clock — has no anchor in an environment where the sun rises and sets every 90 minutes. Melatonin supplements and carefully timed bright-light exposure help, but most ISS crew members sleep about 6 hours per night against a recommended 8.5.`
    ],
    quotes: [
      { text: `After about four days, I woke up and it was just... comfortable. My body had decided this was normal. It was like the best morning of my life. I felt completely at ease.`, cite: 'ISS long-duration crew member' },
      { text: `You stop fighting it. You stop trying to maintain an orientation. You just let yourself exist in three dimensions equally.`, cite: 'Astronaut on adaptation to weightlessness' },
    ]
  },
  view: {
    label: 'Seeing Earth',
    title: 'The Overview Effect',
    lead: `There is a documented psychological phenomenon that occurs to most astronauts when they see Earth from space for the first time. Scientists call it the Overview Effect.`,
    body: [
      `The Overview Effect is not mystical. It is cognitive. When you see Earth from 400 kilometers, the absence of national borders, the thinness of the atmosphere, the smallness of the entire world in the vastness of space — these facts, which humans have always known intellectually, become viscerally, undeniably real in a way they have never been before.`,
      `The most common descriptions: a profound sense of the fragility of the planet; an inability to maintain concern about the divisions between nations or groups; a feeling of connection to all human life simultaneously; and an overwhelming desire to protect the thin blue line of atmosphere that sustains all of it.`,
      `Astronauts from dozens of countries, political systems, and religions have described the same core experience. Soviet cosmonauts and American astronauts during the Cold War described it. Military officers and scientists describe it. The Overview Effect appears to be a universal human response to seeing the Earth whole, from the outside, for the first time.`
    ],
    quotes: [
      { text: `You develop an instant global consciousness, a people orientation, an intense dissatisfaction with the state of the world, and a compulsion to do something about it.`, cite: 'Edgar Mitchell, Apollo 14 astronaut' },
      { text: `You want to grab a politician by the scruff of the neck and drag them a quarter of a million miles and say, "Look at that. What's so worth fighting about?"`, cite: 'Ron Garan, ISS astronaut' },
    ]
  },
  return: {
    label: 'Coming Home',
    title: 'Gravity Returns',
    lead: `After months of weightlessness, landing on Earth is not a homecoming. It is a second adaptation — and it can be brutal.`,
    body: [
      `The re-entry capsule impacts the ground and everything that weighs nothing suddenly weighs everything. For astronauts returning from a six-month ISS mission, the physical sensation of gravity returning is described as crushing, strange, and overwhelming. The body has adapted to weightlessness so thoroughly that 1G feels like a foreign force.`,
      `The immediate challenges: standing is difficult and may be impossible without assistance. Walking is unsteady — the vestibular system, which had discounted gravity, now receives it again and must re-recalibrate. The head, which had been held by fluid pressure, now hangs heavily on the neck. The cardiovascular system, deconditioned by months of easy pumping, struggles to maintain blood pressure while standing.`,
      `Over the weeks and months of rehabilitation, the body re-adapts. Bone density recovers over 2–3 years. Muscle mass and strength return with targeted exercise over 3–6 months. Vision usually improves. But the spinal discs re-compress and the weakened spinal muscles must carry the spine's weight again — this window carries a fourfold elevated risk of disc herniation and remains one of the most dangerous periods in an astronaut's career.`
    ],
    quotes: [
      { text: `Everything was too heavy. My arms were too heavy to lift easily. My head was too heavy. After six months of nothing weighing anything, one G felt like a punishment.`, cite: 'ISS six-month crew member, post-landing' },
      { text: `I tried to stand up and I couldn't. Not really. I had to be lifted. And when I did stand, I could feel every kilogram of my own body individually.`, cite: 'Astronaut on post-mission adaptation' },
    ]
  }
};

function showSensation(id) {
  document.querySelectorAll('.sn-btn').forEach(b => b.classList.toggle('active', b.dataset.sense === id));
  const data = SENSATIONS[id];
  const content = document.getElementById('sensation-content');
  content.innerHTML = `
    <div class="sense-card">
      <div class="sense-hero">
        <div class="sense-label">${data.label}</div>
        <div class="sense-title">${data.title}</div>
        <p class="sense-lead">${data.lead}</p>
      </div>
      <div class="sense-body">
        ${data.body.map(p => `<p>${p}</p>`).join('')}
      </div>
      <div class="sense-quotes">
        ${data.quotes.map(q => `
          <div class="sense-q">${q.text}<cite>— ${q.cite}</cite></div>`).join('')}
      </div>
    </div>`;
}

document.querySelectorAll('.sn-btn').forEach(b => {
  b.addEventListener('click', () => showSensation(b.dataset.sense));
});

// ════════════════════════════════════════════
// COMPARE
// ════════════════════════════════════════════
const COMPARE_DATA = [
  { icon: '📏', label: 'Height', earth: 'Normal baseline', space: '+3–5 cm (spine fully decompresses in microgravity)', tag: 'better', tagText: 'Temporarily taller' },
  { icon: '🦴', label: 'Bone Density', earth: 'Stable with normal daily activity', space: '−1 to 2% per month in hip and spine — up to 10% total loss in 6 months', tag: 'worse', tagText: 'Significant ongoing loss' },
  { icon: '💪', label: 'Muscle Mass', earth: 'Maintained by walking, standing, daily movement', space: 'Up to −20% in leg muscles without intensive daily exercise', tag: 'worse', tagText: 'Rapid atrophy' },
  { icon: '🫀', label: 'Heart', earth: 'Slightly elliptical, pumping upward against gravity', space: 'Becomes more spherical; shrinks up to 25%; blood volume drops 15%', tag: 'worse', tagText: 'Structural changes' },
  { icon: '💧', label: 'Fluid Distribution', earth: '70% of body fluids in lower half, held by gravity', space: 'Fluid redistributes to upper body and head: puffy face, stuffed nose, thinner legs', tag: 'worse', tagText: 'Constant fluid shift' },
  { icon: '👁️', label: 'Vision (near)', earth: 'Normal, stable throughout adult life', space: 'Worsens in ~40% of long-duration astronauts due to elevated intracranial pressure', tag: 'worse', tagText: 'ICP-driven impairment' },
  { icon: '🧠', label: 'Spatial Orientation', earth: 'Clear and constant — gravity always defines "down"', space: 'Confused for 2–4 days; brain re-maps and discounts vestibular cues', tag: 'neutral', tagText: 'Adapts over time' },
  { icon: '😴', label: 'Sleep', earth: 'Regulated by one 24-hour light/dark cycle', space: '16 sunrises per day; chronic ~6 hr sleep vs 8.5 hr recommendation', tag: 'worse', tagText: 'Circadian disruption' },
  { icon: '☢️', label: 'Radiation', earth: '~3 mSv per year (surface level)', space: '~80–180 mSv per year on ISS; far higher on deep space missions', tag: 'worse', tagText: '27–60× higher dose' },
  { icon: '🛡️', label: 'Immune System', earth: 'Functioning normally; latent viruses kept dormant', space: '~47% virus reactivation rate; T-cell activity reduced; DNA damage from radiation', tag: 'worse', tagText: 'Immune dysregulation' },
  { icon: '🦷', label: 'Back Pain Risk', earth: 'Baseline population risk', space: '4× increased herniation risk during post-mission re-adaptation to gravity', tag: 'worse', tagText: 'Post-mission danger window' },
  { icon: '🌡️', label: 'Mood', earth: 'Baseline, subject to Earth stressors', space: 'Nausea and disorientation → then calm and euphoria after adaptation', tag: 'neutral', tagText: 'Improves after day 4' },
  { icon: '🏃', label: 'Exercise capacity', earth: 'Baseline aerobic fitness', space: '~15% VO2 max reduction even with 2 hrs daily exercise; fatigue after return', tag: 'worse', tagText: 'Deconditioning ongoing' },
  { icon: '👃', label: 'Taste & Smell', earth: 'Normal acuity', space: 'Dulled — fluid fills sinuses, reducing smell-driven flavor perception', tag: 'worse', tagText: 'Congestion-driven' },
];

function buildCompare() {
  const grid = document.getElementById('compare-grid');
  if (grid._built) return;
  grid._built = true;

  grid.innerHTML = `
    <div class="cmp-header-row">
      <div style="color:var(--mid)">System</div>
      <div>🌍 On Earth</div>
      <div>🚀 In Space (6 months)</div>
    </div>` +
    COMPARE_DATA.map(r => `
      <div class="cmp-row">
        <div class="cmp-label"><span class="clabel-icon">${r.icon}</span>${r.label}</div>
        <div class="cmp-earth">${r.earth}</div>
        <div class="cmp-space">
          ${r.space}
          <br><span class="cmp-tag tag-${r.tag}">${r.tagText}</span>
        </div>
      </div>`).join('');
}

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
showPanel('systems');
// Pre-init timeline data
buildMetricGrid(1);
updateTimeline(1);

// ════════════════════════════════════════════
// ARABIC TRANSLATIONS
// ════════════════════════════════════════════
const AR = {
  // Nav
  nav: {
    logo: 'علم الفضاء الحيوي',
    systems: 'أجهزة الجسم',
    timeline: 'ساعة المهمة',
    gagarin: 'أول إنسان',
    charts: 'البيانات والرسوم',
    sensation: 'الإحساس',
    compare: 'الأرض مقابل الفضاء',
    vostok: 'فوستوك 1',
    themeLight: '☀ فاتح',
    themeDark: '☽ داكن',
    langSwitch: '🌐 English',
  },

  // Panel headers
  panels: {
    systems: { eyebrow: 'مستكشف تفاعلي', title: 'جسم <em>الإنسان</em> في الفضاء', sub: 'انقر على أي نقطة متوهجة على الجسم لاستكشاف ما يفعله انعدام الجاذبية في ذلك الجهاز — بالتفصيل.' },
    timeline: { eyebrow: 'الجدول الزمني التفاعلي', title: 'ساعة <em>المهمة</em>', sub: 'اسحب شريط التمرير للتنقل عبر مهمة مدتها 6 أشهر. شاهد كيف يتدهور كل جهاز من أجهزة الجسم — وما هي التداعيات اليومية.' },
    gagarin: { eyebrow: '12 أبريل 1961', title: 'أول <em>إنسان</em> في الفضاء', sub: 'رواية دقيقة بدقيقة لرحلة يوري غاغارين التي استمرت 108 دقائق — أعظم رحلة في تاريخ البشرية.' },
    charts: { eyebrow: 'بيانات بحثية', title: '<em>الرسوم</em> والبيانات', sub: 'بيانات مرئية من مهام طويلة الأمد على محطة الفضاء الدولية تُظهر كيف يتغير كل جهاز من أجهزة الجسم مع مرور الوقت.',
      cards: {
        bone:      { title: 'فقدان كثافة العظام',       sub: 'الورك والعمود الفقري، % المفقود مقابل يوم المهمة',     insight: 'يتسارع فقدان العظام — تخسر عظام الورك ~1% من كثافتها شهريًا. بدون تدابير مضادة، تعادل مهمة مدتها 6 أشهر ما يفقده الإنسان عادةً في عقد كامل من الشيخوخة.' },
        muscle:    { title: 'فقدان كتلة العضلات',       sub: 'عضلات الساق، % المتبقي مقابل يوم المهمة',             insight: 'تبدأ عضلات الساق بالضمور في غضون أيام من الإطلاق. بدون ساعتين يوميًا من التمارين المقاومة، قد يفقد رائد الفضاء 20% من عضلات الجزء السفلي بحلول الشهر الثالث.' },
        height:    { title: 'التغير في الطول',           sub: 'استطالة العمود الفقري بالسنتيمتر مقابل يوم المهمة',   insight: 'يبلغ الطول الزائد ذروته في الأسبوعين الأولين مع تمدد الأقراص الفقرية. تختفي الزيادة البالغة 5 سم في غضون 10 أيام من العودة إلى الأرض، لكن ضعف عضلات العمود الفقري يستمر لأشهر.' },
        radiation: { title: 'التعرض للإشعاع',           sub: 'الجرعة التراكمية بالميلي سيفرت (مدار محطة الفضاء)',   insight: 'يمتص رواد الفضاء في محطة الفضاء الدولية ~0.5 ميلي سيفرت يوميًا — أي نحو 27 ضعف معدل سطح الأرض. رحلة إلى المريخ ستعرضهم لجرعات أعلى بـ3–5 مرات، مما يرفع خطر الإصابة بالسرطان.' },
        cardio:    { title: 'ضعف القدرة القلبية الوعائية', sub: 'VO2 max كنسبة من خط الأساس مقابل يوم المهمة',       insight: 'بدون تمرين، تنخفض القدرة الهوائية بنحو 1% يوميًا. بروتوكولات التمرين في المحطة الدولية تحد من ذلك إلى 15% تقريبًا — لا تزال كافية لإحداث دوار عند العودة.' },
        icp:       { title: 'الضغط داخل الجمجمة',       sub: 'نسبي مقارنةً بخط الأساس الأرضي (1.0)',              insight: 'تحول السوائل نحو الرأس يرفع الضغط داخل الجمجمة بشكل مزمن. هذا مرتبط مباشرةً بضعف البصر الذي يصيب ~40% من رواد الفضاء طويلي الأمد.' },
      }
    },
    sensation: { eyebrow: 'تجربة بضمير المتكلم', title: 'ماذا <em>يشعر</em> الإنسان', sub: 'التجربة الحسية والعاطفية للرحلة الفضائية — من الإطلاق إلى انعدام الجاذبية الممتد، كما وصفها رواد الفضاء.' },
    compare: { eyebrow: 'مقارنة جنبًا إلى جنب', title: 'الأرض <em>مقابل</em> الفضاء', sub: 'كل فرق فيزيولوجي رئيسي بين الحياة على الأرض ومهمة فضائية مدتها 6 أشهر.' },
    vostok:  { eyebrow: '12 أبريل 1961 · أول مركبة فضائية مأهولة', title: 'فوستوك <em>1</em>', sub: 'المركبة الفضائية التي حملت يوري غاغارين إلى المدار. اسحب للتدوير · مرّر للتكبير.' },
  },

  // Sensation nav
  sensationNav: {
    launch: 'الإطلاق',
    orbit: 'دخول المدار',
    weightless: 'انعدام الجاذبية',
    sick: 'دوار الفضاء',
    adapt: 'التكيّف',
    view: 'رؤية الأرض',
    return: 'العودة للأرض',
  },

  // Clock
  clock: {
    dayPrefix: 'اليوم ',
    rangeLabel: '0 ← 180 يومًا',
    marks: ['ي1','أ1','ش1','ش2','ش3','ش4','ش5','ش6'],
    phases: [
      { name: 'يوم الإطلاق', text: 'تنطلق الصاروخ وتسحقك قوى الجاذبية في المقعد. ثم: التوقف، الصمت، وكل شيء غير مربوط يطفو. لقد دخل الجسم بيئة غريبة تمامًا. بدأت السوائل بالفعل في الانتقال نحو الرأس. المعدة تحتج بشدة.' },
      { name: 'التكيّف المبكر', text: 'يبلغ دوار الفضاء ذروته في اليومين الثاني والثالث ثم يبدأ في التراجع. الدماغ يعيد رسم نموذجه المكاني، يتجاهل إشارات الأذن الداخلية لصالح الإشارات البصرية. معظم رواد الفضاء يشعرون بتحسن ملحوظ بحلول اليوم الرابع. الارتفاع في القامة وصل إلى حده الأقصى تقريبًا — العمود الفقري تمدد بالكامل. الوجه منتفخ بوضوح.' },
      { name: 'الأسبوعان الأولان', text: 'تكيّف الجسم إلى حد بعيد مع بيئة انعدام الوزن. اختفى الغثيان وبدأ رواد الفضاء يصفون شعورًا بالخفة والسرعة والقدرة. فقدان العظام وضمور العضلات جاريان لكنهما ليسا حادَّين بعد. بدأ التمرين اليومي بجدية. النوم سيئ — دورة الشمس الستة عشر تعطل الساعة البيولوجية باستمرار.' },
      { name: 'الشهر الأول', text: 'كثافة العظام تتراجع بشكل ملحوس. عضلات الساقين أضعف بشكل واضح رغم ساعتين من التمرين اليومي. استقر حجم الدم عند مستواه الجديد المنخفض. الجهاز القلبي الوعائي فقد لياقته بشكل كبير. يؤدي رواد الفضاء تجارب علمية معقدة وسيرًا في الفضاء — الجسم تكيّف، لكن بتكلفة فيزيولوجية تتراكم.' },
      { name: 'الشهر الثاني', text: 'كثافة العظام لا تزال تتراجع. قد يتغير البصر بشكل خفي مع استمرار الضغط داخل الجمجمة عند مستوى مرتفع. وظيفة المناعة مضطربة؛ الفيروسات الكامنة في حالة تأهب. الجسم يراكم نوعًا من الديون الفيزيولوجية التي ستحتاج إلى أشهر من إعادة التأهيل بعد المهمة.' },
      { name: 'الأشهر 3-5', text: 'منتصف المهمة وما بعده. الجسم في حالة مستقرة لكن متدهورة. خسائر العظام والعضلات كبيرة. عضلات الجذع التي كانت تدعم العمود الفقري الممتد ضمرت بشكل كبير — مما يخلق سيناريو يكون فيه العودة للجاذبية محفوفًا بمخاطر حقيقية. يتكيف رواد الفضاء نفسيًا مع العزل والانفصال.' },
      { name: 'الشهر السادس — الاقتراب من العودة', text: 'مع اقتراب العودة إلى الأرض، يشتد التمرين التحضيري. يُنبَّه رواد الفضاء عما ينتظرهم: الإحساس الساحق الغريب بالجاذبية. الوقوف سيبدو ثقيلًا بشكل مستحيل. المشي سيكون متذبذبًا ومرهقًا. كل تغيير فيزيولوجي تراكم على مدى 180 يومًا سيواجه 9.8 م/ث² دفعة واحدة.' },
    ],
  },

  // Metric statuses
  metricStatus: {
    ok: 'طبيعي', warn: 'تحذير', danger: 'خطر',
    height: { name: 'التغيّر في الطول', unit: 'سم مكتسبة' },
    bones:  { name: 'كثافة العظام',    unit: '٪ مفقودة' },
    muscle: { name: 'كتلة العضلات',   unit: '٪ مفقودة (الساقان)' },
    fluids: { name: 'سوائل الرأس',    unit: 'تحوّل نسبي' },
    cardio: { name: 'لياقة القلب',     unit: '٪ من الخط الأساسي' },
    immune: { name: 'المناعة',         unit: '٪ اضطراب' },
    metricStat: {
      height: { ok: 'ضئيل', warn: 'في الازدياد', danger: 'أقصى تمدد' },
      bones:  { ok: 'طبيعي', warn: 'يتناقص', danger: 'حرج' },
      muscle: { ok: 'طبيعي', warn: 'ضمور', danger: 'شديد' },
      fluids: { ok: 'طبيعي', warn: 'متحوّل', danger: 'انتفاخ الوجه' },
      cardio: { ok: 'طبيعي', warn: 'يتراجع', danger: 'منخفض' },
      immune: { ok: 'طبيعي', warn: 'مجهَد', danger: 'مضطرب' },
    }
  },

  // Systems
  systems: {
    brain: {
      title: 'الدماغ والحواس', category: 'عصبي',
      desc: `في انعدام الجاذبية، يتلقى الدماغ إشارات متضاربة. الأذن الداخلية — الجهاز الدهليزي — تطورت تحديدًا لاكتشاف الجاذبية وإرسال "أي اتجاه هو الأسفل" إلى الدماغ. أزِل الجاذبية وسترسل بيانات مربكة ومتناقضة بينما تُبلّغ العيون بشيء مختلف تمامًا. يعجز الدماغ عن التوفيق بين هذه الإشارات فيستجيب بارتباك شديد وغثيان وتشوش مكاني. بعد يومين إلى أربعة أيام، يُجري الدماغ معايرة مذهلة: يتجاهل إشارات الجهاز الدهليزي ويعتمد أكثر على الرؤية للتوجه المكاني. بعد هذا التكيّف، يصف معظم رواد الفضاء شعورًا عميقًا بالوضوح الذهني والهدوء — بل النشوة.`,
      bars: [
        { name: 'الارتباك المكاني (الأيام 1-3)', val: 90, color: '#4a9eff', label: 'شديد' },
        { name: 'تعارض الجهاز الدهليزي', val: 85, color: '#4a9eff', label: 'مرتفع' },
        { name: 'سرعة إعادة المعايرة', val: 70, color: '#4ecb8d', label: '2-4 أيام' },
        { name: 'الأثر المعرفي بعيد المدى', val: 15, color: '#4ecb8d', label: 'خفيف' },
      ],
      pills: [
        { color: '#4a9eff', text: 'الأذن الداخلية تفقد مرجعية الجاذبية' },
        { color: '#ff6b6b', text: '~٧٠٪ يعانون من دوار الفضاء' },
        { color: '#4ecb8d', text: 'الدماغ يعيد رسم خارطته الحسية في 72 ساعة' },
        { color: '#f0a030', text: 'نشوة تتبع التكيّف الناجح' },
        { color: '#9f7aff', text: 'القشرة البصرية تصبح مهيمنة' },
      ]
    },
    eyes: {
      title: 'العيون والرؤية', category: 'طب العيون',
      desc: `من أكثر اكتشافات رحلات الفضاء الطويلة إثارة للقلق أنها قد تغيّر شكل عيني رائد الفضاء بشكل دائم. الآلية تبدأ بتحوّل السوائل نحو الرأس: عندما لا تحبس الجاذبية الدم والسائل الدماغي الشوكي في الجزء السفلي من الجسم، فإنهما يتحركان نحو الرأس، مما يرفع الضغط داخل الجمجمة ويضغط على الأعصاب البصرية ويُفلطح الجزء الخلفي من كل عين فعليًا. نحو ٤٠٪ من رواد الفضاء في المهام الطويلة على محطة الفضاء الدولية يعودون إلى المنزل بحاجة إلى نظارات أو وصفة طبية محدّثة.`,
      bars: [
        { name: 'ارتفاع الضغط داخل الجمجمة', val: 65, color: '#c06ee8', label: 'معتدل' },
        { name: 'خطر تورم العصب البصري', val: 50, color: '#ff9f6b', label: 'مرتفع' },
        { name: 'معدل ضعف الرؤية القريبة', val: 40, color: '#ff6b6b', label: '٤٠٪ من الطاقم' },
        { name: 'التعافي بعد المهمة', val: 60, color: '#4ecb8d', label: 'في الغالب نعم' },
      ],
      pills: [
        { color: '#c06ee8', text: 'مقلة العين تتسطح فعليًا' },
        { color: '#ff6b6b', text: 'تورم القرص البصري يُلاحظ بالتصوير' },
        { color: '#f0a030', text: 'تتطور تدريجيًا خلال مهمة 6 أشهر' },
        { color: '#4ecb8d', text: 'تتحسن الرؤية عادةً بعد المهمة' },
        { color: '#4a9eff', text: 'مخاوف رئيسية لمهام الفضاء العميق' },
      ]
    },
    heart: {
      title: 'القلب والجهاز الوعائي', category: 'قلبي وعائي',
      desc: `القلب من أكثر الأعضاء استجابةً لانعدام الجاذبية. على الأرض، يعمل القلب باستمرار ضد الجاذبية — يضخ الدم إلى أعلى نحو الدماغ. في الفضاء، تختفي هذه المعركة. ينتقل الدم في البداية إلى الجزء العلوي من الجسم ويتلقى القلب دمًا أكثر من المعتاد. على مدى أسابيع، يعوّض القلب بتقليص حجمه — يمكن أن تنكمش البطين الأيسر بنسبة تصل إلى ٢٥٪. يتغير شكله أيضًا، ليصبح أكثر كروية. يعود رواد الفضاء كثيرًا يعانون من عدم تحمل الوضع الانتصابي — الدوار أو الإغماء عند الوقوف.`,
      bars: [
        { name: 'انخفاض كتلة القلب (6 أشهر)', val: 25, color: '#ff6b6b', label: 'حتى ٢٥٪' },
        { name: 'انخفاض حجم الدم', val: 15, color: '#f0a030', label: '~١٥٪' },
        { name: 'عدم تحمل الوضع الانتصابي عند العودة', val: 80, color: '#ff6b6b', label: 'شائع جدًا' },
        { name: 'التعافي مع التمرين', val: 70, color: '#4ecb8d', label: 'جيد' },
      ],
      pills: [
        { color: '#ff6b6b', text: 'القلب يصبح أكثر كروية' },
        { color: '#f0a030', text: 'حجم الدم ينخفض ~١٥٪' },
        { color: '#4a9eff', text: 'الشرايين تفقد استجابتها للضغط' },
        { color: '#4ecb8d', text: '٢ ساعة تمرين يومي: الحل الرئيسي' },
        { color: '#9f7aff', text: 'خطر الإغماء عند العودة للأرض' },
      ]
    },
    spine: {
      title: 'العمود الفقري والطول', category: 'عضلي هيكلي',
      desc: `العمود الفقري من أكثر قصص فيزيولوجيا الفضاء إثارة للدهشة. في انعدام الجاذبية، يختفي الضغط على الأقراص الفقرية فيمتد العمود الفقري. يمكن أن يزداد طول رواد الفضاء من 3 إلى 5 سنتيمترات خلال الـ 48 ساعة الأولى. لكن العضلات التي تثبّت العمود الفقري — والتي كانت تعمل كل ساعة يقظة على الأرض — لم يعد لها ما تفعله فتضمر. يمكن أن تنخفض كتلة العضلات الداعمة للعمود الفقري بنحو ٢٠٪. عند العودة إلى الأرض، يواجه العمود الفقري المنضغط عضلاتٍ ضعيفةً، مما يخلق نافذة خطورة مرتفعة للإصابة.`,
      bars: [
        { name: 'زيادة الطول في المدار', val: 100, color: '#f0a030', label: 'حتى +٥ سم' },
        { name: 'فقدان عضلات دعم العمود', val: 19, color: '#ff6b6b', label: '~١٩٪' },
        { name: 'خطر انزلاق الغضروف بعد المهمة', val: 100, color: '#ff6b6b', label: '٤× أعلى' },
        { name: 'آلام الظهر أثناء المهمة', val: 52, color: '#f0a030', label: 'شائع' },
      ],
      pills: [
        { color: '#f0a030', text: 'معظم الطول يُكتسب في أول 24 ساعة' },
        { color: '#4a9eff', text: 'يعود الطول للطبيعي في 10 أيام من العودة' },
        { color: '#ff6b6b', text: 'خطر الانزلاق الغضروفي ٤ أضعاف' },
        { color: '#4ecb8d', text: 'نفس آلية طول الصباح عند الإنسان العادي' },
        { color: '#9f7aff', text: 'إعادة التأهيل تستهدف عضلات العمود أولًا' },
      ]
    },
    fluids: {
      title: 'سوائل الجسم', category: 'دوراني',
      desc: `الجاذبية هي السبب في أن جسمك يحتفظ بنحو ٧٠٪ من دمه وسوائله في النصف السفلي. في اللحظة التي تختفي فيها تلك الجاذبية، تتوزع السوائل بحرية وتساوٍ في جميع أنحاء الجسم — وينتهي المطاف بكمية كبيرة منها في الصدر والرقبة والرأس. التأثير فوري وملحوظ: ينتفخ الوجه، وتتكدس الجيوب الأنفية، وتصبح الساقان أنحف بشكل لافت — مما أكسبها لقب "أرجل الطيور".`,
      bars: [
        { name: 'تحوّل السوائل نحو الرأس', val: 75, color: '#ff9f6b', label: 'كبير' },
        { name: 'انخفاض حجم الدم الكلي', val: 15, color: '#f0a030', label: '~١٥٪' },
        { name: 'انتفاخ الوجه (الأسبوعان الأولان)', val: 85, color: '#ff9f6b', label: 'مرتفع جدًا' },
        { name: 'ارتفاع الضغط داخل الجمجمة', val: 55, color: '#ff6b6b', label: 'معتدل-مرتفع' },
      ],
      pills: [
        { color: '#ff9f6b', text: 'الوجه ينتفخ في غضون ساعات من الإطلاق' },
        { color: '#ff6b6b', text: 'احتقان أنفي مزمن طوال المهمة' },
        { color: '#4a9eff', text: 'الجسم يتخلص من السوائل الزائدة عبر الكلى' },
        { color: '#4ecb8d', text: 'تتغير حاستا الشم والتذوق' },
        { color: '#9f7aff', text: 'أجهزة الضغط السفلي قيد الاختبار كحل' },
      ]
    },
    bones: {
      title: 'كثافة العظام', category: 'هيكلي',
      desc: `العظم ليس هيكلًا ثابتًا كما يبدو. إنه نسيج حي في حالة إعادة بناء مستمرة. الخلايا البانية للعظم تبني مصفوفة عظمية جديدة بينما تذيب خلايا الارتشاف العظام القديمة. المحفّز الذي يبقي الخلايا البانية نشطةً هو الإجهاد الميكانيكي: قوى الضغط والشد التي تنتقل عبر العظام عند المشي والوقوف وحمل الأوزان. أزِل هذه القوى في انعدام الجاذبية وسيتلاشى إشارة بناء العظم. مهمة مدتها 6 أشهر قد تترك عظام الورك بكثافة تعادل عقدًا من الشيخوخة الطبيعية.`,
      bars: [
        { name: 'فقدان العظام شهريًا (الورك)', val: 20, color: '#ff6b6b', label: '١-٢٪/شهر' },
        { name: 'إجمالي الفقدان بعد 6 أشهر', val: 80, color: '#ff6b6b', label: 'حتى ١٠٪' },
        { name: 'ارتفاع خطر حصى الكلى', val: 45, color: '#f0a030', label: 'مرتفع' },
        { name: 'مدة التعافي', val: 60, color: '#4ecb8d', label: '2-3 سنوات' },
      ],
      pills: [
        { color: '#ff6b6b', text: 'الورك والعمود الفقري يفقدان أكثر' },
        { color: '#f0a030', text: 'الكالسيوم يتسرب إلى مجرى الدم' },
        { color: '#4a9eff', text: 'خطر الكسر مرتفع بعد المهمة' },
        { color: '#4ecb8d', text: 'تمارين المقاومة: الحل الأفضل' },
        { color: '#9f7aff', text: 'يعادل ~١٠ سنوات من الشيخوخة في 6 أشهر' },
      ]
    },
    muscles: {
      title: 'العضلات', category: 'عضلي هيكلي',
      desc: `الجهاز العضلي البشري يعتمد بشكل صارم على الاستخدام. العضلات التي لا تُحمَّل بانتظام تبدأ بالضمور في غضون أيام. في الفضاء، عضلات الوضعية — تلك التي تقضي كل ساعة يقظة في دعم الهيكل العظمي ومقاومة الجاذبية — لم يعد لها وظيفة. تضمر تقريبًا فورًا. عضلات الساقين هي الأشد تضررًا لأنها تحمل وزن الجسم كله مع كل خطوة على الأرض. بدون تدخل، يمكن لرائد الفضاء أن يفقد ٢٠٪ من عضلات الساق في شهر واحد.`,
      bars: [
        { name: 'فقدان عضلات الساق (6 أشهر)', val: 20, color: '#ff6b6b', label: 'حتى ٢٠٪' },
        { name: 'انخفاض قوة الفخذين', val: 30, color: '#ff6b6b', label: 'حتى ٣٠٪' },
        { name: 'مع التمرين اليومي على محطة الفضاء', val: 40, color: '#f0a030', label: 'لا تزال ~١٠٪' },
        { name: 'مدة التعافي', val: 50, color: '#4ecb8d', label: '3-6 أشهر' },
      ],
      pills: [
        { color: '#ff6b6b', text: 'الساقان والظهر الأشد تضررًا' },
        { color: '#f0a030', text: 'أكثر من ساعتين تمرين مقاومة يوميًا مطلوب' },
        { color: '#4a9eff', text: 'تغيير في نوع ألياف العضلات: سريع → بطيء' },
        { color: '#4ecb8d', text: 'جهاز ARED على محطة الفضاء الدولية: أفضل حل' },
        { color: '#9f7aff', text: 'المشي بعد مهام 6 أشهر صعب' },
      ]
    },
    immune: {
      title: 'الجهاز المناعي', category: 'مناعي',
      desc: `الجهاز المناعي في الفضاء يواجه هجومًا متعدد الجبهات. انعدام الجاذبية يغيّر سلوك خلايا المناعة: الخلايا اللمفاوية التائية تُظهر نشاطًا مخفضًا، والخلايا القاتلة الطبيعية أقل فاعلية. في الوقت ذاته، يرفع الإجهاد الشديد والحرمان من النوم والعزل مستويات الكورتيزول بشكل مزمن — والكورتيزول يقمع المناعة. النتيجة المركّبة: حوالي ٤٧٪ من رواد الفضاء يعانون من إعادة تنشيط فيروسات كامنة من عائلة الهيربس خلال المهام الطويلة.`,
      bars: [
        { name: 'معدل إعادة تنشيط الفيروسات الكامنة', val: 47, color: '#ff6b6b', label: '~٤٧٪' },
        { name: 'انخفاض نشاط الخلايا التائية', val: 60, color: '#d4c010', label: 'معتدل' },
        { name: 'اضطراب الاستجابة الالتهابية', val: 55, color: '#f0a030', label: 'مرتفع' },
        { name: 'تلف الحمض النووي من الإشعاع', val: 40, color: '#ff6b6b', label: 'كبير' },
      ],
      pills: [
        { color: '#d4c010', text: 'نشاط الخلايا التائية ينخفض بشكل ملحوظ' },
        { color: '#ff6b6b', text: '٤٧٪ إعادة تنشيط فيروسات الهيربس' },
        { color: '#f0a030', text: 'الكورتيزول المزمن يقمع المناعة' },
        { color: '#4a9eff', text: 'الإشعاع الكوني يتلف الحمض النووي للخلايا المناعية' },
        { color: '#9f7aff', text: 'فاعلية اللقاحات قد تقل في الفضاء' },
      ]
    },
    sleep: {
      title: 'النوم والإيقاع اليومي', category: 'بيولوجيا الزمن',
      desc: `على متن محطة الفضاء الدولية، تشرق الشمس وتغرب كل 90 دقيقة — 16 مرة في اليوم. هذا يضرب الساعة البيولوجية، الإيقاع الداخلي الذي يحكم النوم وإطلاق الهرمونات ودرجة حرارة الجسم وعشرات العمليات الأيضية. الساعة تُعايَر بدورات الضوء والظلام، و16 شروق يوميًا لا يعطيها ما تتمسك به. يصف رواد الفضاء النوم المتقطع والإرهاق المزمن باستمرار، وحوالي ٧٥٪ منهم يتناولون أدوية للنوم طوال المهمة.`,
      bars: [
        { name: 'متوسط مدة النوم (مقارنة بـ ٨.٥ ساعة)', val: 70, color: '#9f7aff', label: '~٦ ساعات/ليلة' },
        { name: 'اضطراب الإيقاع البيولوجي', val: 80, color: '#ff6b6b', label: 'شديد' },
        { name: 'انخفاض الأداء المعرفي', val: 20, color: '#f0a030', label: 'معتدل' },
        { name: 'معدل استخدام أدوية النوم', val: 75, color: '#9f7aff', label: '~٧٥٪ من الطاقم' },
      ],
      pills: [
        { color: '#9f7aff', text: '١٦ شروقًا في اليوم على محطة الفضاء' },
        { color: '#ff6b6b', text: 'عجز نوم مزمن بأكثر من ساعتين كل ليلة' },
        { color: '#f0a030', text: '~٧٥٪ من رواد الفضاء يتناولون دواء للنوم' },
        { color: '#4a9eff', text: 'الميلاتونين والعلاج الضوئي كحلول' },
        { color: '#4ecb8d', text: 'جودة النوم تتحسن بعد الأسابيع الأولى' },
      ]
    },
  },

  // Gagarin steps
  gagarin: {
    title: 'أول <em>إنسان</em> في الفضاء',
    eyebrow: '12 أبريل 1961',
    sub: 'رواية دقيقة بدقيقة لرحلة يوري غاغارين التي استمرت 108 دقائق — أعظم رحلة في تاريخ البشرية.',
    dossier: {
      title: 'بيانات المهمة · فوستوك 1',
      name: 'يوري أليكسيفيتش غاغارين',
      role: 'طيار القوات الجوية السوفيتية · رائد فضاء',
      fields: [
        ['العمر', '27 عامًا'],
        ['المركبة', 'فوستوك 1'],
        ['المدة', '108 دقائق'],
        ['عدد المدارات', '1'],
        ['الارتفاع الأقصى', '327 كم'],
        ['السرعة', '27,400 كم/س'],
        ['معدل نبضات القلب', '64 نبضة/دقيقة (هادئ)'],
        ['مكان الهبوط', 'ساراتوف، روسيا'],
      ],
      quote: '"الأرض زرقاء. يا له من شيء رائع. إنه مذهل."',
      quoteCite: '— في المدار، 12 أبريل 1961',
    },
    bodyDataTitle: 'بيانات الجسم أثناء الرحلة',
    bodyData: [
      ['معدل النبض عند الإطلاق', '~100 نبضة/دقيقة'],
      ['معدل النبض في المدار', '64 نبضة/دقيقة'],
      ['معدل التنفس', 'طبيعي'],
      ['الشعور بانعدام الوزن', 'كأنك معلّق في الهواء'],
      ['الأكل والشرب', 'أكل وشرب بشكل طبيعي'],
      ['قوة الإطلاق', '4-5 جي'],
      ['قوة إعادة الدخول', '8 جي (لفترة قصيرة)'],
    ],
    steps: [
      { time: 'ما قبل الإطلاق · 5:00 صباحًا', title: 'الاستعدادات الأخيرة', text: 'يستيقظ غاغارين في الساعة الخامسة صباحًا. يساعده المهندسون في ارتداء بدلة الضغط SK-1 — برتقالية اللون الصارخ حتى يمكن العثور عليه بسرعة إذا كان الهبوط خارج المسار. في منصة الإطلاق، يستقل المصعد إلى قمة صاروخ R-7. قبل أن يصعد، يتوقف ليتبول على إطار الحافلة — تقليد لا يزال يلتزم به رواد الفضاء الروس قبل كل إطلاق. يبلغ من العمر 27 عامًا. يصعد إلى كبسولة فوستوك الكروية ويُغلق الفتحة.' },
      { time: '09:07 بتوقيت موسكو — الإطلاق', title: 'الاشتعال', text: 'تشتعل محركات صاروخ R-7 بارتجاجة تمتص كامل الهيكل. يبث غاغارين في راديوه: <em>"بويخالي!"</em> — "هيا بنا!" يرتفع الصاروخ. تتصاعد قوى الجاذبية بسرعة مع تسارع المركبة عبر الغلاف الجوي السفلي. نبضه يرتفع. الضجيج جسدي — لا يُسمع بل يُحسّ في القص والأسنان والجمجمة. يظل تنفسه وصوته ثابتَين، يُبلّغ مركز التحكم كل 60 ثانية.' },
      { time: '+9 دقائق 7 ثوانٍ — المدار', title: 'أول إنسان في الفضاء', text: 'تنفصل المرحلة الثالثة. تنطفئ المحركات. كل شيء كان يتذبذب ويضغط ويدوّي يتوقف في صمت تام، مستحيل. يرتفع جسم غاغارين عن المقعد. دفاتره وأقلامه وكل ما لم يُثبَّت يطفو أمام وجهه. يختبر الإحساس الذي لم يشعر به أي إنسان من قبل: انعدام الوزن الحقيقي، المستمر، في مدار حول الأرض. أول وصف له: <em>"شعور انعدام الوزن كان غير مألوف بعض الشيء... تشعر كأنك معلّق في الهواء."</em>' },
      { time: '+46 دقيقة — فوق المحيط الهادئ', title: 'رؤية الأرض لأول مرة', text: 'من خلال النافذة الصغيرة، يراقب غاغارين انحناء الأرض تحته. الغلاف الجوي يبدو كغشاء أزرق رفيع يتمسك بالسطح. يُبث رسالته الشهيرة: <em>"الأرض زرقاء. يا له من شيء رائع. إنه مذهل."</em> يمكنه رؤية الأعاصير والمحيطات الزرقاء والضباب الخفيف عند الأفق حيث تلتقي الأرض بالفضاء.' },
      { time: '+60 دقيقة — تسلسل إعادة الدخول', title: 'اشتعال محرك التراجع', text: 'يشتعل محرك التراجع في موعده المحدد، مما يبطئ الكبسولة بما يكفي للخروج من المدار. لكن عطلًا يجعل وحدة الخدمة تفشل في الانفصال النظيف عن كبسولة الهبوط — تبقى متصلة بالكابلات، مما يجعل المركبة تدور بسرعة لعشر دقائق مرعبة عند دخول الغلاف الجوي. لا يُبلّغ غاغارين بذلك بصوت عالٍ. تحترق الكابلات في نهاية المطاف ويحدث الانفصال.' },
      { time: '+98 دقيقة — كرة نار إعادة الدخول', title: '"أنا أحترق. وداعًا يا رفاق."', text: 'مع اندفاع الكبسولة في الغلاف الجوي، يسخّن الاحتكاك الدرع الواقي إلى أكثر من 5,000 درجة مئوية. تتشكل غمامة بلازما حول الكبسولة تقطع الاتصال اللاسلكي تمامًا. من النافذة، يرى غاغارين ألسنة اللهب. لا يعلم أن هذا طبيعي في إعادة الدخول الجوي. يعتقد حقًا أنه يحترق حتى الموت. يُرسل: <em>"أنا أحترق. وداعًا يا رفاق."</em> لا يسمع مركز التحكم إلا تشويشًا. هو، في الواقع، بخير.' },
      { time: '+108 دقائق — الهبوط', title: 'عودة إلى الأرض', text: 'على ارتفاع 7,000 متر، تنفجر فتحة الخروج ويقفز غاغارين بالمظلة منفصلًا عن الكبسولة كما هو مصمم. يهبط في حقل بالقرب من نهر الفولغا في منطقة ساراتوف بروسيا. امرأة تدعى آنا تاختاروفا وحفيدتها البالغة من العمر ست سنوات أول بشر يراهم. يسألهم إن كان عندهم هاتف — يحتاج للاتصال بموسكو. في غضون ساعات، يصبح أشهر إنسان حي على وجه الأرض. الرحلة الفضائية الأولى استغرقت بالضبط 108 دقائق.' },
    ]
  },

  // Sensation
  sensation: {
    launch:    { label: 'الإطلاق',              title: 'نار ورعد',            lead: 'تختفي الأرض بطريقة لم تشعر بها قط من قبل.', body: ['الإحساس الأول هو الاهتزاز. يبدأ في المقعد، يسري في الأرضية، في هيكل الصاروخ، في جسمك. كل شيء يتذبذب في آنٍ واحد. الضجيج جسدي — لا يُسمع بل يُحسّ في القص والأسنان والجمجمة.', 'ثم تتصاعد قوى الجاذبية. في الضغط الديناميكي الأقصى، نحو 90 ثانية من الإطلاق، أنت مثبّت في مقعدك بخمسة أضعاف وزنك. التنفس عسير. وجهك يتهدّل. كل كيلوغرام من جسمك يشعر وكأنه خمسة. ثم: تنقطع المحركات. كل شيء يتوقف. كل اهتزاز، كل صوت، كل قوة تختفي في آنٍ معًا، وفي مكانها — لا شيء. الكتب والأقلام تطفو. ذراعاك تطفوان.'], quotes: [{ text: 'هيا بنا! اهتز الصاروخ، ثم هدأ، ثم شعرت بقوة هائلة تضغط عليّ. لكنني كنت أتنفس بشكل طبيعي.', cite: 'يوري غاغارين، 1961' }, { text: 'عندما قُطعت المحركات الرئيسية، شعر الأمر كأن المركبة توقفت. تنتقل من ضجيج هائل إلى صمت تام في لحظة واحدة.', cite: 'رائد فضاء يصف دخول المدار' }] },
    orbit:     { label: 'دخول المدار',           title: 'صمت الفضاء',          lead: 'لا يوجد خط تعبره. لا بوابة، لا علامة، لا انتقال تدريجي.', body: ['إدراج المدار ليس حدثًا درامياً. ببساطة يتخفف الغلاف الجوي حتى مستوى لا يمكن اكتشافه بينما تحقق المركبة السرعة الأمامية الدقيقة — نحو 7.7 كم/ثانية — التي تنحني عندها الأرض بعيدًا بنفس معدل سحب الجاذبية نحوها. أنت تسقط بنفس المعدل الذي تبتعد به الأرض عنك.', 'الشيء الأول الذي يفعله معظم رواد الفضاء هو النظر من النافذة. ليس إلى الأجهزة، وليس إلى قوائم المهام — إلى الأرض. الأثر البصري يُوصف بشكل متسق عبر الثقافات والأعمار والجنسيات: شعور بأن الكوكب يبدو جميلًا بشكل لا يصدق، هشًا بشكل لا يُحتمل، وصغيرًا بشكل مقلق.', 'خط أزرق رفيع يفصل العالم عن سواد الفضاء. ذلك الخط هو الغلاف الجوي بأكمله — كل الهواء الذي تنفسه كل كائن حي منذ الأزل، كل الطقس، كل السماء الزرقاء التي رأيتها يومًا — مضغوط في غشاء يبدو من المدار مثل طلاء الزجاج على كرة زجاجية.'], quotes: [{ text: 'ما فاجأني أكثر هو كم يبدو الغلاف الجوي رقيقًا. مجرد شريحة. يبدو هشًا بشكل لا يصدق.', cite: 'رائد فضاء على محطة الفضاء الدولية' }, { text: 'تدخل المدار وتنظر إلى الأرض وتدرك أن الخط الأزرق الرفيع هو كل ما بين الحياة والفراغ.', cite: 'مقابلة ما بعد المهمة' }] },
    weightless:{ label: 'انعدام الجاذبية',       title: 'طافٍ إلى الأبد',      lead: 'كل إنسان عاش على وجه الأرض شعر بالجاذبية في كل ثانية من حياته. في الفضاء، يتوقف ذلك.', body: ['انعدام الوزن لا يشبه السقوط. على الأقل ليس مثل الإحساس بانقلاب المعدة في لفة أو مصعد. إنه يشعر، كما يصف معظم رواد الفضاء، بلا شيء. كحالة محايدة. كأن الافتراض الأساسي للوجود قد تغيّر. لا إحساس بالشد. لا ثقل في الجسم. ذراعاك لا تتدليان — تطفوان في أي وضع تتركهما فيه.', 'في غضون ساعات، يبدأ الجسم في إدراك ما يعنيه ذلك فيزيولوجيًا. تمتلئ الجيوب الأنفية. الوجه ينتفخ. هناك إحساس مستمر بالامتلاء خلف العينين، صداع خفيف يتلاشى خلال أيام. يؤلم أسفل الظهر مع تمدد العمود الفقري — أحيانًا بشدة في أول 24 ساعة.', 'من أغرب التأثيرات: لا تشعر بأن ساقيك تنتميان لجسمك بالطريقة المعتادة. بدون وزن، تتغير حاسة الإحساس بموضع الأعضاء. يُبلّغ رواد الفضاء أنهم يضطرون إلى النظر إلى ساقيهم لتأكيد موضعهما، خاصة عند النوم.'], quotes: [{ text: 'يشعر الأمر كأنك معلّق في وسط الهواء تمامًا. يمكنك الطفو في أي اتجاه ولا يتطلب الأمر أي جهد على الإطلاق.', cite: 'عضو بعثة محطة الفضاء الدولية' }, { text: 'عندما أغمض عيني، لا أستطيع تحديد أيهما أعلى. لا يوجد أعلى. جسمي في حيرة تامة.', cite: 'رائد فضاء لأول مرة، اليوم الأول من المهمة' }] },
    sick:      { label: 'دوار الفضاء',           title: 'عندما يثور الجسم',    lead: 'نحو ٧٠٪ من رواد الفضاء يعانون من شكل من أشكال دوار الفضاء. بالنسبة للكثيرين، يكون شديدًا.', body: ['دوار الفضاء — المعروف رسميًا بمتلازمة تكيّف الفضاء — ينجم عن التعارض بين ما تراه العيون وما يُبلّغه الجهاز الدهليزي. على الأرض، تؤكد الأذن الداخلية باستمرار اتجاه الجاذبية. في الفضاء، ترسل إشارات لا معنى لها بينما تقول العيون "أرى أرضية، أرى سقفًا" — لكن هذه تصنيفات اعتباطية في بيئة لا يوجد فيها أعلى أو أسفل حقيقيان.', 'الدماغ، الذي يتلقى بيانات متضاربة لا يستطيع التوفيق بينها، يفسر الموقف على أنه تسمم — نفس الاستجابة للسموم العصبية التي تشوّه الواقع الحسي. يستجيب وفق ذلك: قيء وغثيان وتعرق وارتباك. بالنسبة لبعض رواد الفضاء يكون هذا خفيفًا ويمر في ساعات. بالنسبة لآخرين، يُعجزهم لمدة يومين أو ثلاثة أيام.', 'التحدي العملي: الغثيان والقيء داخل بدلة فضائية أثناء سير في الفضاء — الذي قد يكون مجدولًا في أول أيام المهمة — خطر حقيقي. القيء يمكن أن يسد مجرى الهواء أو يحجب الرؤية داخل خوذة مغلقة.'], quotes: [{ text: 'كنت مريضًا لمدة يومين ونصف. كان بالضبط كأسوأ دوار حركة أصابك على الإطلاق، لكنه مستمر، بدون راحة من الاستلقاء، لأن الاستلقاء لا يفيد في شيء.', cite: 'رائد فضاء على محطة الفضاء الدولية' }, { text: 'كنت أفكر — لو أنني مضطر للقيام بتمشية فضائية الآن، لا أستطيع. جسديًا لا أستطيع. وكان ذلك مخيفًا.', cite: 'رائد فضاء يصف اليوم الثاني من المهمة' }] },
    adapt:     { label: 'التكيّف',              title: 'الدماغ يعيد برمجة نفسه', lead: 'بعد 3-5 أيام، يتغير شيء ما. يرتفع الارتباك. تعلّم الجسم العيش في الفضاء.', body: ['تكيّف الدماغ مع انعدام الجاذبية من أكثر التظاهرات البارزة للمرونة العصبية. الجهاز الدهليزي يستمر في إرسال إشارات مربكة، لكن الدماغ يتعلم تجاهلها وتصفيتها. الإدراك البصري يصبح مهيمنًا للتوجه المكاني. يبني الدماغ نموذجًا جديدًا — مبنيًا على البصر واللمس وحاسة الإحساس بالوضع بدلًا من الجاذبية.', 'الحالة الناتجة تُوصف باستمرار بالهدوء والخفة — وكثيرًا — النشوة. السهولة الجسدية للتحرك في الجاذبية الصفرية متعة حقيقية بمجرد اكتمال التكيّف. الدفع من جدار والطفو عبر وحدة، القفزات المعكوسة بلا جهد، شرب كرات ماء عائمة، النوم في أي اتجاه — يصف رواد الفضاء هذه التجارب بفرح لا يخطئه القارئ.', 'لكن النوم يظل صعبًا طوال المهمة. لا مرساة للساعة البيولوجية في بيئة تشرق فيها الشمس وتغرب كل 90 دقيقة. مكملات الميلاتونين والتعرض المنظم للضوء الساطع يساعدان، لكن معظم أطقم محطة الفضاء الدولية ينامون نحو 6 ساعات في الليلة مقابل 8.5 موصى بها.'], quotes: [{ text: 'بعد نحو أربعة أيام، استيقظت وكان الأمر... مريحًا. كأن جسمي قرر أن هذا طبيعي. كان كأجمل صباح في حياتي. شعرت بارتياح تام.', cite: 'عضو طاقم طويل الأمد في محطة الفضاء الدولية' }, { text: 'تتوقف عن المقاومة. تتوقف عن محاولة الحفاظ على توجه معين. تترك نفسك تعيش في ثلاثة أبعاد بالتساوي.', cite: 'رائد فضاء حول التكيف مع انعدام الوزن' }] },
    view:      { label: 'رؤية الأرض',           title: 'تأثير النظرة الشاملة',  lead: 'هناك ظاهرة نفسية موثّقة تصيب معظم رواد الفضاء عندما يرون الأرض من الفضاء لأول مرة. يسميها العلماء تأثير النظرة الشاملة.', body: ['تأثير النظرة الشاملة ليس روحانيًا. إنه إدراكي. عندما ترى الأرض من ارتفاع 400 كيلومتر، غياب الحدود الوطنية، رقة الغلاف الجوي، صغر العالم كله في اتساع الفضاء — هذه الحقائق، التي عرفها البشر دائمًا فكريًا، تصبح حقيقية بشكل حشوي، قاطع، بطريقة لم تكن من قبل.', 'الأوصاف الأكثر شيوعًا: شعور عميق بهشاشة الكوكب؛ عجز عن الاهتمام بالانقسامات بين الأمم أو المجموعات؛ شعور بالانتماء لكل الحياة البشرية في آنٍ واحد؛ ورغبة ساحقة في حماية الخط الأزرق الرفيع من الغلاف الجوي الذي يُديم كل ذلك.', 'رواد فضاء من عشرات الدول والأنظمة السياسية والأديان وصفوا نفس التجربة الجوهرية. قناديل سوفيتيون ورواد فضاء أمريكيون في زمن الحرب الباردة وصفوها. ضباط عسكريون وعلماء يصفونها. يبدو تأثير النظرة الشاملة استجابة بشرية كونية لرؤية الأرض كاملة، من الخارج، لأول مرة.'], quotes: [{ text: 'تطور لديك وعي عالمي فوري، توجه نحو الإنسان، عدم رضا حاد عن حال العالم، وإلحاح للقيام بشيء حيال ذلك.', cite: 'إدغار ميتشل، رائد فضاء أبوللو 14' }, { text: 'تريد أن تمسك سياسيًا من تلابيبه وتسحبه ربع مليون ميل وتقول: "انظر إلى ذلك. ما الذي يستحق القتال من أجله؟"', cite: 'رون غاران، رائد فضاء محطة الفضاء الدولية' }] },
    return:    { label: 'العودة للأرض',          title: 'تعود الجاذبية',        lead: 'بعد أشهر من انعدام الوزن، الهبوط على الأرض ليس عودة إلى الوطن. إنه تكيّف ثانٍ — ويمكن أن يكون قاسيًا.', body: ['تصطدم كبسولة إعادة الدخول بالأرض وكل شيء لا وزن له يكتسب وزنه فجأة. بالنسبة لرواد الفضاء العائدين من مهمة محطة الفضاء الدولية مدتها ستة أشهر، يُوصف الإحساس الجسدي بعودة الجاذبية بأنه ساحق وغريب وساحق. تكيّف الجسم مع انعدام الوزن بشكل كامل لدرجة أن قوة G الواحدة تبدو كقوة غريبة.', 'التحديات الفورية: الوقوف صعب وقد يكون مستحيلًا بدون مساعدة. المشي غير مستقر — الجهاز الدهليزي، الذي أهمل الجاذبية، يتلقاها من جديد ويجب أن يعيد المعايرة من جديد. الرأس، الذي كان يُحمل بضغط السوائل، يتدلى الآن بشكل ثقيل على الرقبة.', 'على مدى أسابيع وأشهر من إعادة التأهيل، يتكيّف الجسم من جديد. كثافة العظام تتعافى على مدى 2-3 سنوات. كتلة العضلات وقوتها تعودان مع التمرين الموجَّه على مدى 3-6 أشهر. الرؤية تتحسن عادةً. لكن الأقراص الفقرية تنضغط من جديد والعضلات الداعمة الضعيفة يجب أن تحمل وزن العمود الفقري مرة أخرى — تحمل هذه النافذة خطرًا مرتفعًا أربعة أضعاف لانزلاق الغضروف.'], quotes: [{ text: 'كان كل شيء ثقيلًا جدًا. ذراعاي كانتا ثقيلتَين جدًا للرفع بسهولة. رأسي كان ثقيلًا. بعد ستة أشهر من اللاوزن، شعرت قوة G الواحدة كعقوبة.', cite: 'رائد فضاء بعد مهمة 6 أشهر' }, { text: 'حاولت الوقوف ولم أستطع. ليس حقًا. كان يجب أن يُرفعوني. وعندما وقفت، كنت أشعر بكل كيلوغرام من جسمي بشكل منفرد.', cite: 'رائد فضاء حول التكيف بعد المهمة' }] },
  },

  // Compare
  compare: {
    headers: ['الجهاز', '🌍 على الأرض', '🚀 في الفضاء (6 أشهر)'],
    rows: [
      { icon:'📏', label:'الطول', earth:'الخط الأساسي الطبيعي', space:'من 3 إلى 5 سم+ (العمود الفقري يتمدد بالكامل)', tag:'better', tagText:'أطول مؤقتًا' },
      { icon:'🦴', label:'كثافة العظام', earth:'مستقرة مع النشاط اليومي الطبيعي', space:'من 1 إلى 2٪ شهريًا في الورك والعمود الفقري — حتى 10٪ إجمالًا في 6 أشهر', tag:'worse', tagText:'فقدان مستمر كبير' },
      { icon:'💪', label:'كتلة العضلات', earth:'تُحافَظ عليها بالمشي والوقوف والحركة اليومية', space:'حتى 20٪ في عضلات الساقين بدون تمرين مكثف يومي', tag:'worse', tagText:'ضمور سريع' },
      { icon:'🫀', label:'القلب', earth:'بيضاوي الشكل قليلًا، يضخ للأعلى ضد الجاذبية', space:'يصبح أكثر كروية؛ ينكمش حتى 25٪؛ حجم الدم ينخفض 15٪', tag:'worse', tagText:'تغييرات هيكلية' },
      { icon:'💧', label:'توزيع السوائل', earth:'70٪ من سوائل الجسم في النصف السفلي', space:'السوائل تتوزع نحو الجزء العلوي: وجه منتفخ، أنف محتقن، ساقان أنحف', tag:'worse', tagText:'تحوّل سوائل دائم' },
      { icon:'👁️', label:'الرؤية (القريبة)', earth:'طبيعية، مستقرة طوال حياة البالغين', space:'تتدهور لدى ~40٪ من رواد الفضاء بسبب ارتفاع الضغط داخل الجمجمة', tag:'worse', tagText:'ضعف بصري' },
      { icon:'🧠', label:'التوجه المكاني', earth:'واضح ومستمر — الجاذبية تحدد "الأسفل" دائمًا', space:'مرتبك لمدة 2-4 أيام؛ الدماغ يعيد البرمجة ويتجاهل الإشارات الدهليزية', tag:'neutral', tagText:'يتكيّف مع الوقت' },
      { icon:'😴', label:'النوم', earth:'منظم بدورة ضوء/ظلام واحدة مدتها 24 ساعة', space:'16 شروقًا يوميًا؛ نوم ~6 ساعات مزمن مقابل 8.5 ساعة موصى بها', tag:'worse', tagText:'اضطراب بيولوجي' },
      { icon:'☢️', label:'التعرض للإشعاع', earth:'~3 ميلي سيفرت سنويًا (مستوى السطح)', space:'~80-180 ميلي سيفرت سنويًا على محطة الفضاء الدولية', tag:'worse', tagText:'27-60 ضعف' },
      { icon:'🛡️', label:'الجهاز المناعي', earth:'يعمل بشكل طبيعي؛ الفيروسات الكامنة خاملة', space:'~47٪ معدل إعادة تنشيط الفيروسات؛ نشاط الخلايا التائية منخفض', tag:'worse', tagText:'خلل مناعي' },
      { icon:'🦷', label:'خطر آلام الظهر', earth:'خطر السكان الأساسي', space:'خطر الانزلاق الغضروفي 4 أضعاف خلال إعادة التكيّف مع الجاذبية', tag:'worse', tagText:'نافذة خطر بعد المهمة' },
      { icon:'🌡️', label:'المزاج', earth:'خط أساسي، يتأثر بضغوط الأرض', space:'غثيان وارتباك ← ثم هدوء ونشوة بعد التكيف', tag:'neutral', tagText:'يتحسن بعد اليوم 4' },
      { icon:'🏃', label:'القدرة على التمرين', earth:'اللياقة الهوائية الأساسية', space:'~15٪ انخفاض في الحد الأقصى للأكسجين حتى مع ساعتين يوميًا', tag:'worse', tagText:'تدهور مستمر' },
      { icon:'👃', label:'الطعم والشم', earth:'حدة طبيعية', space:'يضعف — السوائل تملأ الجيوب الأنفية مما يقلل إدراك النكهة', tag:'worse', tagText:'بسبب الاحتقان' },
    ]
  }
};

// ════════════════════════════════════════════
// VOSTOK 1 — 3D MODEL (Three.js)
// ════════════════════════════════════════════
let vostokReady = false;
let vostokRenderer, vostokScene, vostokCamera, vostokShip, vostokEarth, vostokEngineGlow;
let vostokAnimId = null;
let vostokDrag = { active: false, prevX: 0, prevY: 0 };
let vostokRot = { x: 0.18, y: 0.6 };
let vostokZoom = 7;
let vostokAutoSpin = true;
let vostokLastTouchDist = 0;
let vostokClock = 0;

function initVostok() {
  if (vostokReady) { if (vostokAnimId === null) vostokAnimate(); return; }
  if (typeof THREE === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = initVostok; document.head.appendChild(s); return;
  }
  vostokReady = true;

  const canvas = document.getElementById('vostok-canvas');
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();
  const W = rect.width || 600;
  const H = rect.height || 500;

  vostokRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  vostokRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  vostokRenderer.setSize(W, H);
  vostokRenderer.shadowMap.enabled = true;
  vostokRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  vostokRenderer.outputEncoding = THREE.sRGBEncoding;
  vostokRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  vostokRenderer.toneMappingExposure = 1.15;

  vostokScene = new THREE.Scene();

  // ── Environment map (gives metallic surfaces realistic reflections) ──
  (function () {
    const S = 512;
    const ec = document.createElement('canvas');
    ec.width = S * 4; ec.height = S * 2;
    const ctx = ec.getContext('2d');
    ctx.fillStyle = '#020408'; ctx.fillRect(0, 0, S * 4, S * 2);
    // Sun disc
    const sg = ctx.createRadialGradient(S * 3.1, S * 0.55, 0, S * 3.1, S * 0.55, S * 0.35);
    sg.addColorStop(0, 'rgba(255,248,210,1)'); sg.addColorStop(0.08, 'rgba(255,230,140,0.9)'); sg.addColorStop(0.3, 'rgba(255,200,80,0.35)'); sg.addColorStop(1, 'rgba(255,180,50,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, S * 4, S * 2);
    // Earth glow from lower-left
    const eg = ctx.createRadialGradient(S * 0.4, S * 1.65, 0, S * 0.4, S * 1.65, S * 0.9);
    eg.addColorStop(0, 'rgba(30,90,255,0.55)'); eg.addColorStop(0.4, 'rgba(20,60,180,0.2)'); eg.addColorStop(1, 'rgba(10,30,100,0)');
    ctx.fillStyle = eg; ctx.fillRect(0, 0, S * 4, S * 2);
    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * S * 4, y = Math.random() * S * 2, r = 0.4 + Math.random() * 1.2;
      ctx.globalAlpha = 0.25 + Math.random() * 0.75;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const et = new THREE.CanvasTexture(ec);
    et.mapping = THREE.EquirectangularReflectionMapping;
    vostokScene.environment = et;
    vostokScene.background = et;
  })();

  // ── Earth ──
  (function () {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
    const ctx = c.getContext('2d');
    // Deep ocean with variation
    const og = ctx.createLinearGradient(0, 0, 0, 1024);
    og.addColorStop(0, '#061228'); og.addColorStop(0.5, '#0e2050'); og.addColorStop(1, '#061228');
    ctx.fillStyle = og; ctx.fillRect(0, 0, 2048, 1024);
    // Subtle ocean shimmer
    ctx.strokeStyle = 'rgba(40,80,180,0.06)'; ctx.lineWidth = 0.8;
    for (let i = 0; i <= 24; i++) { ctx.beginPath(); ctx.moveTo(i * 2048/24, 0); ctx.lineTo(i * 2048/24, 1024); ctx.stroke(); }
    for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(0, i * 1024/12); ctx.lineTo(2048, i * 1024/12); ctx.stroke(); }
    // Land masses
    function land(x, y, rx, ry, col, rot) {
      ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(rx, ry); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.restore(); ctx.fill();
    }
    // Eurasia
    land(1060,295,275,100,'#1e5228',0); land(1260,258,140,75,'#245f30',0.1); land(1380,290,105,65,'#1e5228',0);
    land(1100,240,100,50,'#2a6836',0); land(900,330,80,55,'#1e5228',0);
    // Africa
    land(970,490,88,155,'#1e5228',0); land(980,440,62,55,'#245f30',0.05);
    // N America
    land(395,280,115,145,'#1e5228',-0.12); land(355,215,75,55,'#245f30',0);
    // S America
    land(445,590,68,135,'#1e5228',0.15);
    // Australia
    land(1450,600,90,62,'#1e5228',0.05);
    // Antarctica
    land(1024,960,400,70,'rgba(200,220,255,0.85)',0);
    // Greenland
    land(638,68,88,55,'rgba(200,220,255,0.75)',0);
    // Ice caps
    const np = ctx.createLinearGradient(0,0,0,110); np.addColorStop(0,'rgba(195,215,255,0.88)'); np.addColorStop(1,'rgba(195,215,255,0)'); ctx.fillStyle=np; ctx.fillRect(0,0,2048,110);
    const sp = ctx.createLinearGradient(0,920,0,1024); sp.addColorStop(0,'rgba(195,215,255,0)'); sp.addColorStop(1,'rgba(195,215,255,0.92)'); ctx.fillStyle=sp; ctx.fillRect(0,920,2048,104);
    // Cloud wisps
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    [[380,230,180,25],[820,165,220,22],[1500,215,165,28],[240,460,195,22],[1240,640,185,24],[680,760,160,20],[1800,390,140,18]].forEach(([x,y,w,h]) => { ctx.beginPath(); ctx.ellipse(x,y,w,h,(Math.random()-0.5)*0.4,0,Math.PI*2); ctx.fill(); });
    const eR = 25;
    vostokEarth = new THREE.Group();
    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(eR, 80, 80), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), roughness: 0.8, metalness: 0, envMapIntensity: 0.3 }));
    vostokEarth.add(earthMesh);
    // Inner atmosphere
    vostokEarth.add(new THREE.Mesh(new THREE.SphereGeometry(eR * 1.018, 64, 64), new THREE.MeshPhongMaterial({ color: 0x1a55ff, transparent: true, opacity: 0.13, side: THREE.BackSide, depthWrite: false })));
    // Outer limb glow
    vostokEarth.add(new THREE.Mesh(new THREE.SphereGeometry(eR * 1.05, 64, 64), new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.05, side: THREE.BackSide, depthWrite: false })));
    vostokEarth.position.set(-12, -36, -42);
    vostokEarth.rotation.z = 0.26;
    vostokScene.add(vostokEarth);
  })();

  // ── Background planets ──
  (function () {
    // Moon — grey cratered sphere, far upper-right
    const moonC = document.createElement('canvas'); moonC.width = 512; moonC.height = 512;
    const mc = moonC.getContext('2d');
    mc.fillStyle = '#888'; mc.fillRect(0,0,512,512);
    mc.fillStyle = 'rgba(60,60,60,0.6)';
    [[80,120,28],[200,80,18],[310,200,22],[140,340,15],[380,300,12],[250,420,10],[60,430,8],[440,140,9]].forEach(([x,y,r]) => { mc.beginPath(); mc.arc(x,y,r,0,Math.PI*2); mc.fill(); });
    mc.fillStyle = 'rgba(140,140,140,0.3)';
    [[80,120,26],[200,80,16],[310,200,20]].forEach(([x,y,r]) => { mc.beginPath(); mc.arc(x,y,r,0,Math.PI*2); mc.fill(); });
    const moonTex = new THREE.CanvasTexture(moonC);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 40, 40), new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.96, metalness: 0, envMapIntensity: 0.1 }));
    moon.position.set(55, 28, -90);
    vostokScene.add(moon);

    // Saturn — ringed gas giant, left-mid background
    const satC = document.createElement('canvas'); satC.width = 512; satC.height = 512;
    const sc = satC.getContext('2d');
    const sg = sc.createLinearGradient(0,0,0,512);
    sg.addColorStop(0,'#c8a96e'); sg.addColorStop(0.3,'#e0c080'); sg.addColorStop(0.5,'#d4a850'); sg.addColorStop(0.7,'#c89040'); sg.addColorStop(1,'#a87828');
    sc.fillStyle = sg; sc.fillRect(0,0,512,512);
    sc.strokeStyle = 'rgba(120,80,30,0.4)'; sc.lineWidth = 6;
    for (let y = 80; y < 512; y += 28) { sc.beginPath(); sc.moveTo(0,y); sc.lineTo(512,y); sc.stroke(); }
    const satTex = new THREE.CanvasTexture(satC);
    const saturn = new THREE.Group();
    saturn.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 48), new THREE.MeshStandardMaterial({ map: satTex, roughness: 0.75, metalness: 0 })));
    // Rings (flat torus, semi-transparent)
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4a840, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    [13.5, 16, 18.5, 20.5].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.9 + i*0.3, 4, 80), ringMat);
      ring.rotation.x = Math.PI/2; saturn.add(ring);
    });
    saturn.position.set(-70, 8, -110);
    saturn.rotation.x = 0.32; saturn.rotation.z = 0.18;
    vostokScene.add(saturn);

    // Mars — rusty red, small, far right
    const marC = document.createElement('canvas'); marC.width = 256; marC.height = 256;
    const marc = marC.getContext('2d');
    const mg = marc.createLinearGradient(0,0,256,256);
    mg.addColorStop(0,'#c1440e'); mg.addColorStop(0.5,'#d4561a'); mg.addColorStop(1,'#8c2c05');
    marc.fillStyle = mg; marc.fillRect(0,0,256,256);
    marc.fillStyle = 'rgba(80,20,5,0.35)';
    [[60,80,22],[140,50,18],[190,160,14],[100,200,10]].forEach(([x,y,r]) => { marc.beginPath(); marc.arc(x,y,r,0,Math.PI*2); marc.fill(); });
    const mars = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(marC), roughness: 0.9, metalness: 0 }));
    mars.position.set(80, -18, -75);
    vostokScene.add(mars);
  })();

  // ── Camera ──
  vostokCamera = new THREE.PerspectiveCamera(40, W / H, 0.1, 800);
  vostokCamera.position.set(0, 0, vostokZoom);

  // ── Lighting ──
  vostokScene.add(new THREE.AmbientLight(0x0a1828, 3.5));
  const sun = new THREE.DirectionalLight(0xfff5e0, 5.5);
  sun.position.set(10, 12, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 50;
  vostokScene.add(sun);
  const earthLight = new THREE.PointLight(0x2255cc, 1.8, 80);
  earthLight.position.set(-8, -22, -18);
  vostokScene.add(earthLight);
  const rimLight = new THREE.PointLight(0x3366ff, 0.6, 40);
  rimLight.position.set(-10, -4, -6);
  vostokScene.add(rimLight);

  // ── Procedural surface textures ──
  function makeSphTex() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c8bfa8'; ctx.fillRect(0, 0, 1024, 1024);
    // Panel seam grid
    ctx.strokeStyle = 'rgba(60,50,40,0.35)'; ctx.lineWidth = 1.2;
    for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(i*1024/12,0); ctx.lineTo(i*1024/12,1024); ctx.stroke(); }
    for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(0,i*1024/12); ctx.lineTo(1024,i*1024/12); ctx.stroke(); }
    // Rivets at intersections
    ctx.fillStyle = 'rgba(80,65,55,0.5)';
    for (let x = 1024/24; x < 1024; x += 1024/12) for (let y = 1024/24; y < 1024; y += 1024/12) { ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill(); }
    // Subtle thermal protection mottling
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < 80; i++) { ctx.beginPath(); ctx.arc(Math.random()*1024,Math.random()*1024,5+Math.random()*20,0,Math.PI*2); ctx.fill(); }
    return new THREE.CanvasTexture(c);
  }
  function makeModTex() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    // Silver-gray base with slight gradient
    const g = ctx.createLinearGradient(0,0,0,512);
    g.addColorStop(0,'#909888'); g.addColorStop(0.5,'#b0b8a8'); g.addColorStop(1,'#888e80');
    ctx.fillStyle = g; ctx.fillRect(0,0,1024,512);
    // Panel seams
    ctx.strokeStyle = 'rgba(30,35,28,0.45)'; ctx.lineWidth = 1.5;
    for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(i*1024/16,0); ctx.lineTo(i*1024/16,512); ctx.stroke(); }
    for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(0,i*512/8); ctx.lineTo(1024,i*512/8); ctx.stroke(); }
    // "CCCP" marking in red
    ctx.save(); ctx.font = 'bold 42px monospace'; ctx.fillStyle = '#cc2200'; ctx.fillText('C C C P', 395, 160); ctx.restore();
    // Rivets
    ctx.fillStyle = 'rgba(50,55,45,0.5)';
    for (let x = 1024/32; x < 1024; x += 1024/16) for (let y = 512/16; y < 512; y += 512/8) { ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill(); }
    // Thermal patch zones (slightly darker rectangles)
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    [0,2,4,6,8,10,12,14].forEach(i => ctx.fillRect(i*1024/16+4, 220, 1024/16-8, 100));
    return new THREE.CanvasTexture(c);
  }
  function makeNozzleTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0,0,0,256);
    g.addColorStop(0,'#2a2a2a'); g.addColorStop(0.5,'#3c3c3c'); g.addColorStop(1,'#1a1a1a');
    ctx.fillStyle = g; ctx.fillRect(0,0,512,256);
    // Circumferential machining marks
    ctx.strokeStyle = 'rgba(80,80,80,0.4)'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 40; i++) { const y = i*256/40; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(512,y); ctx.stroke(); }
    return new THREE.CanvasTexture(c);
  }

  // ── Materials ──
  const mCapsule  = new THREE.MeshStandardMaterial({ map: makeSphTex(), color: 0xd0c8b0, roughness: 0.28, metalness: 0.45, envMapIntensity: 1.2 });
  const mHeat     = new THREE.MeshStandardMaterial({ color: 0x1a1006, roughness: 0.96, metalness: 0.02, envMapIntensity: 0 });
  const mHeatRim  = new THREE.MeshStandardMaterial({ color: 0x552208, roughness: 0.85, metalness: 0.05 });
  const mModule   = new THREE.MeshStandardMaterial({ map: makeModTex(), color: 0xa8b098, roughness: 0.55, metalness: 0.35, envMapIntensity: 0.8 });
  const mPanel    = new THREE.MeshStandardMaterial({ color: 0x0c1a66, roughness: 0.18, metalness: 0.6, envMapIntensity: 1.5 });
  const mPanel2   = new THREE.MeshStandardMaterial({ color: 0x1a2a88, roughness: 0.22, metalness: 0.55 });
  const mNozzle   = new THREE.MeshStandardMaterial({ map: makeNozzleTex(), color: 0x404040, roughness: 0.4, metalness: 0.82, envMapIntensity: 1.4 });
  const mNozzleIn = new THREE.MeshStandardMaterial({ color: 0x100400, roughness: 0.92, metalness: 0.15, emissive: 0x301000, emissiveIntensity: 0.8 });
  const mRing     = new THREE.MeshStandardMaterial({ color: 0x9aabbc, roughness: 0.2, metalness: 0.88, envMapIntensity: 1.6 });
  const mAntenna  = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.15, metalness: 0.9, envMapIntensity: 1.8 });
  const mWindow   = new THREE.MeshStandardMaterial({ color: 0x0e2a5a, roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.78, emissive: 0x0c2040, emissiveIntensity: 0.6 });
  const mGlass    = new THREE.MeshStandardMaterial({ color: 0x88aadd, roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.25, envMapIntensity: 2.0 });
  const mStrut    = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.5, metalness: 0.7 });
  const mThruster = new THREE.MeshStandardMaterial({ color: 0x383830, roughness: 0.45, metalness: 0.75 });
  const mOrange   = new THREE.MeshStandardMaterial({ color: 0xd44400, roughness: 0.65, metalness: 0.2 });
  const mSeal     = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.1 });

  // ── BUILD VOSTOK 1 ──
  const ship = new THREE.Group();
  const Y0 = new THREE.Vector3(0, 1, 0);

  function addMesh(geo, mat, px, py, pz, rx, ry, rz) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    if (px !== undefined) m.position.set(px, py, pz);
    if (rx !== undefined) m.rotation.set(rx, ry, rz);
    ship.add(m); return m;
  }

  // ═══ DESCENT MODULE (Sharik) ═══
  addMesh(new THREE.SphereGeometry(1.15, 96, 96), mCapsule, 0, 1.85, 0);
  // Charred heat shield (bottom hemisphere)
  addMesh(new THREE.SphereGeometry(1.158, 64, 32, 0, Math.PI*2, Math.PI*0.505, Math.PI*0.495), mHeat, 0, 1.85, 0);
  // Heat rim glow (reentry scorching)
  addMesh(new THREE.TorusGeometry(1.05, 0.052, 12, 80), mHeatRim, 0, 1.22, 0, Math.PI/2, 0, 0);
  // Parachute dome + crown
  addMesh(new THREE.SphereGeometry(0.38, 32, 16, 0, Math.PI*2, 0, Math.PI*0.5), mModule, 0, 2.78, 0);
  addMesh(new THREE.TorusGeometry(0.38, 0.025, 8, 48), mRing, 0, 2.78, 0, Math.PI/2, 0, 0);
  // Antenna crown ring
  addMesh(new THREE.TorusGeometry(0.42, 0.032, 10, 64), mRing, 0, 2.9, 0, Math.PI/2, 0, 0);

  // Porthole — triple-ring assembly
  const pDir = new THREE.Vector3(0.88, 0.22, 0.42).normalize();
  const pCtr = new THREE.Vector3(0, 1.85, 0);
  const pSurf = pCtr.clone().add(pDir.clone().multiplyScalar(1.16));
  const outerRim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32), mNozzle);
  outerRim.position.copy(pSurf.clone().sub(pDir.clone().multiplyScalar(0.02)));
  outerRim.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Y0, pDir));
  ship.add(outerRim);
  const midRim = new THREE.Mesh(new THREE.RingGeometry(0.19, 0.255, 32), mRing);
  midRim.position.copy(pSurf); midRim.lookAt(pSurf.clone().add(pDir)); ship.add(midRim);
  const innerRim = new THREE.Mesh(new THREE.RingGeometry(0.155, 0.19, 32), mSeal);
  innerRim.position.copy(pSurf.clone().add(pDir.clone().multiplyScalar(0.008))); innerRim.lookAt(pSurf.clone().add(pDir)); ship.add(innerRim);
  const glassDisc = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), mWindow);
  glassDisc.position.copy(pSurf.clone().add(pDir.clone().multiplyScalar(0.01))); glassDisc.lookAt(pSurf.clone().add(pDir)); ship.add(glassDisc);
  const glare = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), mGlass);
  glare.position.copy(pSurf.clone().add(pDir.clone().multiplyScalar(0.015))); glare.lookAt(pSurf.clone().add(pDir)); ship.add(glare);

  // ═══ SEPARATION COLLAR ═══
  addMesh(new THREE.CylinderGeometry(0.58, 0.63, 0.25, 48), mRing, 0, 0.62, 0);
  addMesh(new THREE.CylinderGeometry(0.63, 0.68, 0.1, 48), mRing, 0, 0.47, 0);
  for (let i = 0; i < 20; i++) {
    const a = (i/20)*Math.PI*2;
    const b = addMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.14, 8), mNozzle, Math.cos(a)*0.62, 0.62, Math.sin(a)*0.62);
    b.rotation.x = Math.PI/2; b.rotation.z = -a;
    addMesh(new THREE.SphereGeometry(0.028, 7, 7), mNozzle, Math.cos(a)*0.62, 0.62+0.07, Math.sin(a)*0.62);
  }

  // ═══ INSTRUMENT / EQUIPMENT MODULE ═══
  addMesh(new THREE.CylinderGeometry(0.62, 1.16, 1.6, 64), mModule, 0, -0.28, 0);
  addMesh(new THREE.CylinderGeometry(1.16, 1.24, 0.88, 64), mModule, 0, -1.28, 0);
  addMesh(new THREE.CylinderGeometry(1.25, 1.22, 0.08, 48), mRing, 0, -1.76, 0);
  // Instrument bands
  addMesh(new THREE.TorusGeometry(1.2, 0.048, 10, 80), mRing, 0, -1.05, 0, Math.PI/2, 0, 0);
  addMesh(new THREE.TorusGeometry(0.85, 0.03, 8, 64), mRing, 0, -0.05, 0, Math.PI/2, 0, 0);
  // 12 instrument ports
  for (let i = 0; i < 12; i++) {
    const a = (i/12)*Math.PI*2 + 0.1;
    const port = addMesh(new THREE.CylinderGeometry(0.038, 0.038, 0.08, 10), mNozzle, Math.cos(a)*1.22, -1.05, Math.sin(a)*1.22);
    port.rotation.z = Math.PI/2; port.rotation.y = a;
    addMesh(new THREE.SphereGeometry(0.04, 8, 8), i%3===0 ? mOrange : mNozzle, Math.cos(a)*1.265, -1.05, Math.sin(a)*1.265);
  }
  // Thermal control panels with cells
  for (let i = 0; i < 10; i++) {
    const a = (i/10)*Math.PI*2 + 0.18, r = 1.0;
    const mat = i%2===0 ? mPanel : mPanel2;
    const panel = addMesh(new THREE.BoxGeometry(0.06, 1.45, 0.23), mat, Math.cos(a)*r, -0.28, Math.sin(a)*r);
    panel.rotation.y = -a;
    const frame = addMesh(new THREE.BoxGeometry(0.055, 1.5, 0.016), mRing, Math.cos(a)*(r+0.036), -0.28, Math.sin(a)*(r+0.036));
    frame.rotation.y = -a;
    [0.495, -1.06].forEach(y => { const cap = addMesh(new THREE.BoxGeometry(0.065, 0.016, 0.235), mRing, Math.cos(a)*r, y, Math.sin(a)*r); cap.rotation.y = -a; });
    [0.5, -0.06].forEach(dy => { const cell = addMesh(new THREE.BoxGeometry(0.055, 0.62, 0.21), i%2===0 ? mPanel2 : mPanel, Math.cos(a)*r, -0.28+dy, Math.sin(a)*r); cell.rotation.y = -a; });
  }
  // 4 attitude control clusters
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2 + Math.PI/4;
    const bx = Math.cos(a)*0.75, bz = Math.sin(a)*0.75;
    addMesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mStrut, bx, 0.18, bz);
    [-0.055, 0.055].forEach(off => {
      const nx = bx+Math.cos(a+Math.PI/2)*off, nz = bz+Math.sin(a+Math.PI/2)*off;
      const thr = addMesh(new THREE.CylinderGeometry(0.025, 0.04, 0.18, 10), mThruster, nx, 0.18, nz);
      thr.rotation.z = Math.PI/2; thr.rotation.y = a;
    });
  }

  // ═══ 4 EXTERNAL SPHERICAL FUEL TANKS (Vostok's signature feature) ═══
  // Vostok had 4 large spherical propellant tanks attached to the outside
  // of the equipment module at 90° intervals — very visually distinctive
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2 + Math.PI/4;
    const tankR = 0.48;
    const tankX = Math.cos(a) * 1.66, tankZ = Math.sin(a) * 1.66;
    const tankY = -0.82;
    // Main spherical tank body
    const tank = addMesh(new THREE.SphereGeometry(tankR, 40, 40), mModule, tankX, tankY, tankZ);
    // Tank equatorial band
    addMesh(new THREE.TorusGeometry(tankR*0.98, 0.022, 8, 48), mRing, tankX, tankY, tankZ, Math.PI/2, 0, 0);
    // Upper mounting strut to module body
    const strutLen = 0.55;
    const strutX = Math.cos(a)*1.2, strutZ = Math.sin(a)*1.2;
    const strut = addMesh(new THREE.CylinderGeometry(0.025, 0.025, strutLen, 8), mStrut, Math.cos(a)*1.44, tankY+0.36, Math.sin(a)*1.44);
    strut.rotation.z = Math.PI/2 - 0.35;
    strut.rotation.y = -a;
    // Lower mounting strut
    const strut2 = addMesh(new THREE.CylinderGeometry(0.025, 0.025, strutLen*0.75, 8), mStrut, Math.cos(a)*1.44, tankY-0.28, Math.sin(a)*1.44);
    strut2.rotation.z = Math.PI/2 + 0.3;
    strut2.rotation.y = -a;
    // Fuel line from tank to central body
    const lineDir = new THREE.Vector3(-Math.cos(a)*0.55, 0.12, -Math.sin(a)*0.55).normalize();
    const line = addMesh(new THREE.CylinderGeometry(0.013, 0.013, 0.62, 6), mStrut, Math.cos(a)*1.36, tankY+0.05, Math.sin(a)*1.36);
    line.rotation.z = Math.PI/2 - 0.18;
    line.rotation.y = -a;
    // Valve/fitting on tank
    addMesh(new THREE.SphereGeometry(0.055, 10, 10), mRing, tankX + Math.cos(a)*tankR*0.72, tankY + tankR*0.55, tankZ + Math.sin(a)*tankR*0.72);
    addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), mNozzle, tankX + Math.cos(a)*tankR*0.55, tankY + tankR*0.72, tankZ + Math.sin(a)*tankR*0.55);
  }

  // ═══ RETROROCKET (TDU-1) ═══
  addMesh(new THREE.CylinderGeometry(1.22, 0.96, 0.55, 48), mNozzle, 0, -1.97, 0);
  // 4 support struts with cross-braces
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2;
    const st = addMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.65, 8), mStrut, Math.cos(a)*0.68, -2.02, Math.sin(a)*0.68);
    st.rotation.z = 0.28; st.rotation.y = a;
    const cb = addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 6), mStrut, Math.cos(a)*0.48, -2.22, Math.sin(a)*0.48);
    cb.rotation.z = 0.55; cb.rotation.y = a + Math.PI/2;
  }
  // Main nozzle assembly
  addMesh(new THREE.CylinderGeometry(0.52, 0.68, 0.42, 40), mNozzle, 0, -2.38, 0);
  addMesh(new THREE.CylinderGeometry(0.18, 0.52, 0.58, 40), mNozzle, 0, -2.76, 0);
  addMesh(new THREE.TorusGeometry(0.5, 0.034, 8, 48), mRing, 0, -3.04, 0, Math.PI/2, 0, 0);
  addMesh(new THREE.CylinderGeometry(0.155, 0.175, 0.12, 24), mNozzleIn, 0, -3.04, 0);
  // 4 vernier (steering) engines at 90° — gives the TDU-1 its distinctive cross profile
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2;
    const vx = Math.cos(a)*0.62, vz = Math.sin(a)*0.62;
    // Vernier body
    addMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.35, 14), mNozzle, vx, -2.5, vz);
    // Vernier bell (flared)
    addMesh(new THREE.CylinderGeometry(0.055, 0.135, 0.3, 14), mNozzle, vx, -2.72, vz);
    // Vernier lip
    addMesh(new THREE.TorusGeometry(0.135, 0.018, 6, 28), mRing, vx, -2.87, vz, Math.PI/2, 0, 0);
    // Vernier interior glow
    addMesh(new THREE.CylinderGeometry(0.042, 0.05, 0.05, 10), mNozzleIn, vx, -2.87, vz);
    // Mounting bracket from retrorocket body
    const brk = addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 6), mStrut, Math.cos(a)*0.35, -2.28, Math.sin(a)*0.35);
    brk.rotation.z = Math.PI/2 - 0.15; brk.rotation.y = a;
    // Gimbal ring around vernier
    addMesh(new THREE.TorusGeometry(0.1, 0.016, 6, 24), mRing, vx, -2.5, vz, Math.PI/2, 0, 0);
  }
  // Engine glow point light
  vostokEngineGlow = new THREE.PointLight(0xff5500, 0.0, 5);
  vostokEngineGlow.position.set(0, -3.15, 0);
  ship.add(vostokEngineGlow);
  // 4 vernier glow lights
  const vernierGlows = [];
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2;
    const vgl = new THREE.PointLight(0xff6622, 0.0, 2.5);
    vgl.position.set(Math.cos(a)*0.62, -2.95, Math.sin(a)*0.62);
    ship.add(vgl);
    vernierGlows.push(vgl);
  }

  // ═══ EXHAUST PARTICLE SYSTEM ═══
  // Dormant plume of particles drifting below the main nozzle
  const PARTICLE_COUNT = 320;
  const pPos2 = new Float32Array(PARTICLE_COUNT * 3);
  const pCol2 = new Float32Array(PARTICLE_COUNT * 3);
  const pVel  = new Float32Array(PARTICLE_COUNT * 3);
  const pLife = new Float32Array(PARTICLE_COUNT);
  function resetParticle(i) {
    const spread = 0.12;
    pPos2[i*3]   = (Math.random()-0.5)*spread;
    pPos2[i*3+1] = -3.1 - Math.random()*0.15;
    pPos2[i*3+2] = (Math.random()-0.5)*spread;
    pVel[i*3]    = (Math.random()-0.5)*0.008;
    pVel[i*3+1]  = -(0.018 + Math.random()*0.025);
    pVel[i*3+2]  = (Math.random()-0.5)*0.008;
    pLife[i]     = Math.random();
    const t = pLife[i];
    pCol2[i*3]   = 1.0; pCol2[i*3+1] = 0.45-t*0.3; pCol2[i*3+2] = 0.0;
  }
  for (let i = 0; i < PARTICLE_COUNT; i++) { resetParticle(i); pPos2[i*3+1] -= Math.random()*2.0; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos2, 3));
  pGeo.setAttribute('color',    new THREE.Float32BufferAttribute(pCol2, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.08, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.0, depthWrite: false });
  const particles = new THREE.Points(pGeo, pMat);
  ship.add(particles);
  // Store refs for animate loop
  ship.userData.particles = { geo: pGeo, vel: pVel, life: pLife, col: pCol2, mat: pMat, reset: resetParticle, count: PARTICLE_COUNT };

  // ═══ EXTRA DETAIL ═══
  // Umbilical connector panel on capsule side
  const umbDir = new THREE.Vector3(-0.75, -0.1, 0.66).normalize();
  const umbSurf = new THREE.Vector3(0, 1.85, 0).clone().add(umbDir.clone().multiplyScalar(1.17));
  const umb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.06), mNozzle);
  umb.position.copy(umbSurf); umb.lookAt(umbSurf.clone().add(umbDir)); ship.add(umb);
  // 3 connector pins
  for (let i = -1; i <= 1; i++) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6), mRing);
    pin.position.copy(umbSurf.clone().add(umbDir.clone().multiplyScalar(0.04)).add(new THREE.Vector3(i*0.045, 0, 0)));
    pin.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Y0, umbDir));
    ship.add(pin);
  }

  // 3 horizontal ribbing bands on upper equipment module
  [-0.05, 0.28, 0.62].forEach(y => {
    addMesh(new THREE.TorusGeometry(0.72 - y*0.18, 0.018, 6, 64), mRing, 0, y, 0, Math.PI/2, 0, 0);
  });

  // Access hatch on the equipment module side
  const hatchX = 1.17, hatchY = -0.55, hatchZ = 0.0;
  addMesh(new THREE.BoxGeometry(0.08, 0.38, 0.22), mModule, hatchX, hatchY, hatchZ);
  addMesh(new THREE.BoxGeometry(0.09, 0.42, 0.015), mRing, hatchX+0.01, hatchY, 0.115);
  addMesh(new THREE.BoxGeometry(0.09, 0.42, 0.015), mRing, hatchX+0.01, hatchY, -0.115);
  // Hatch latch
  addMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8), mNozzle, hatchX+0.05, hatchY+0.12, 0);

  // Retrorocket longitudinal stringers (4 vertical ribs on the body)
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2 + Math.PI/8;
    const rib = addMesh(new THREE.BoxGeometry(0.018, 0.42, 0.045), mStrut, Math.cos(a)*0.88, -2.22, Math.sin(a)*0.88);
    rib.rotation.y = -a;
  }

  // Solar sensor balls (3 small white spheres on capsule) — navigation references
  [
    new THREE.Vector3(0, -1, 0).normalize(),
    new THREE.Vector3(0.7, 0.1, 0.7).normalize(),
    new THREE.Vector3(-0.7, 0.1, -0.7).normalize(),
  ].forEach(dir => {
    const p = new THREE.Vector3(0, 1.85, 0).add(dir.clone().multiplyScalar(1.18));
    addMesh(new THREE.SphereGeometry(0.055, 10, 10), mWindow, p.x, p.y, p.z);
    addMesh(new THREE.TorusGeometry(0.055, 0.015, 6, 20), mNozzle, p.x, p.y, p.z, Math.PI/2, 0, 0);
  });

  // ═══ ANTENNA ARRAY ═══
  const sCtr = new THREE.Vector3(0, 1.85, 0);
  [
    new THREE.Vector3(0.5, 1, 0.5).normalize(),
    new THREE.Vector3(-0.5, 1, 0.5).normalize(),
    new THREE.Vector3(0.5, 1, -0.5).normalize(),
    new THREE.Vector3(-0.5, 1, -0.5).normalize(),
  ].forEach(dir => {
    const len = 1.2;
    const surf = sCtr.clone().add(dir.clone().multiplyScalar(1.15));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.08, 8), mRing);
    base.position.copy(surf.clone().sub(dir.clone().multiplyScalar(0.04)));
    base.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Y0, dir));
    ship.add(base);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.004, len, 6), mAntenna);
    ant.position.copy(surf.clone().add(dir.clone().multiplyScalar(len/2)));
    ant.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Y0, dir));
    ship.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 7, 7), mAntenna);
    tip.position.copy(surf.clone().add(dir.clone().multiplyScalar(len)));
    ship.add(tip);
  });
  // 2 VHF comm antennas from module
  [[-0.9], [0.9]].forEach(([side]) => {
    const dir = new THREE.Vector3(side*0.7, 0.4, 0.6).normalize();
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.003, 0.85, 6), mAntenna);
    ant.position.set(side*0.38, 0.32, 0.55);
    ant.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(Y0, dir));
    ship.add(ant);
  });

  vostokShip = ship;
  vostokScene.add(ship);

  // Labels
  VOSTOK_LABEL_POINTS = [
    { pos: new THREE.Vector3(0, 3.25, 0),       en: 'Descent Module (Sharik)',   ar: 'كبسولة الهبوط (شاريك)',   side: 'r' },
    { pos: new THREE.Vector3(0, -0.55, 1.4),    en: 'Instrument Module',         ar: 'وحدة الأجهزة',             side: 'r' },
    { pos: new THREE.Vector3(0, -2.78, 0.7),    en: 'TDU-1 Retrorocket',         ar: 'محرك التراجع TDU-1',       side: 'r' },
    { pos: new THREE.Vector3(-1.45, 3.0, 0),    en: 'Antenna Array',             ar: 'مصفوفة الهوائيات',         side: 'l' },
    { pos: new THREE.Vector3(1.45, 1.85, 0),    en: 'Porthole Window',           ar: 'نافذة الكوة',              side: 'r' },
    { pos: new THREE.Vector3(0.9, 0.62, 1.0),   en: 'Separation Collar',         ar: 'حلقة الفصل',               side: 'r' },
    { pos: new THREE.Vector3(-1.35, -1.1, 0),   en: 'Thermal Panels',            ar: 'لوحات التحكم الحراري',     side: 'l' },
    { pos: new THREE.Vector3(2.15, -0.82, 0),   en: 'Propellant Tanks',          ar: 'خزانات الوقود',            side: 'r' },
    { pos: new THREE.Vector3(0.72, -2.62, 0.62),en: 'Vernier Engines',           ar: 'محركات التوجيه',           side: 'r' },
  ];

  // ── Controls ──
  canvas.addEventListener('mousedown', e => { vostokDrag.active=true; vostokDrag.prevX=e.clientX; vostokDrag.prevY=e.clientY; vostokAutoSpin=false; });
  window.addEventListener('mouseup', () => { vostokDrag.active=false; });
  window.addEventListener('mousemove', e => {
    if (!vostokDrag.active) return;
    vostokRot.y += (e.clientX-vostokDrag.prevX)*0.007; vostokRot.x += (e.clientY-vostokDrag.prevY)*0.007;
    vostokRot.x = Math.max(-1.3, Math.min(1.3, vostokRot.x));
    vostokDrag.prevX=e.clientX; vostokDrag.prevY=e.clientY;
  });
  canvas.addEventListener('wheel', e => { e.preventDefault(); vostokZoom=Math.max(3,Math.min(14,vostokZoom+e.deltaY*0.012)); }, {passive:false});
  canvas.addEventListener('touchstart', e => {
    vostokAutoSpin=false;
    if (e.touches.length===1) { vostokDrag.active=true; vostokDrag.prevX=e.touches[0].clientX; vostokDrag.prevY=e.touches[0].clientY; }
    else if (e.touches.length===2) { const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY; vostokLastTouchDist=Math.sqrt(dx*dx+dy*dy); }
  }, {passive:true});
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length===1 && vostokDrag.active) {
      vostokRot.y+=(e.touches[0].clientX-vostokDrag.prevX)*0.007; vostokRot.x+=(e.touches[0].clientY-vostokDrag.prevY)*0.007;
      vostokRot.x=Math.max(-1.3,Math.min(1.3,vostokRot.x)); vostokDrag.prevX=e.touches[0].clientX; vostokDrag.prevY=e.touches[0].clientY;
    } else if (e.touches.length===2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY, dist=Math.sqrt(dx*dx+dy*dy);
      if (vostokLastTouchDist) vostokZoom*=vostokLastTouchDist/dist;
      vostokZoom=Math.max(3,Math.min(14,vostokZoom)); vostokLastTouchDist=dist;
    }
  }, {passive:false});
  canvas.addEventListener('touchend', () => { vostokDrag.active=false; vostokLastTouchDist=0; });
  window.addEventListener('resize', () => {
    const r=wrap.getBoundingClientRect(), nW=r.width||600, nH=r.height||500;
    if (!nW||!nH) return;
    vostokRenderer.setSize(nW,nH); vostokCamera.aspect=nW/nH; vostokCamera.updateProjectionMatrix();
  });

  vostokAnimate();
}

function vostokAnimate() {
  vostokAnimId = requestAnimationFrame(vostokAnimate);
  vostokClock += 0.016;
  if (vostokAutoSpin) vostokRot.y += 0.0038;
  vostokShip.rotation.x = vostokRot.x;
  vostokShip.rotation.y = vostokRot.y;
  vostokCamera.position.set(0, 0, vostokZoom);
  vostokCamera.lookAt(0, 0, 0);
  if (vostokEarth) vostokEarth.rotation.y += 0.0004;
  // Engine glow pulse
  if (vostokEngineGlow) {
    const g = 0.14 + Math.sin(vostokClock * 2.3) * 0.08;
    vostokEngineGlow.intensity = g;
  }
  // Particle exhaust
  if (vostokShip && vostokShip.userData.particles) {
    const pd = vostokShip.userData.particles;
    const pos = pd.geo.attributes.position.array;
    const col = pd.geo.attributes.color.array;
    for (let i = 0; i < pd.count; i++) {
      pd.life[i] -= 0.016;
      if (pd.life[i] <= 0) { pd.reset(i); }
      pos[i*3]   += pd.vel[i*3];
      pos[i*3+1] += pd.vel[i*3+1];
      pos[i*3+2] += pd.vel[i*3+2];
      // fade orange→red→transparent
      const t = Math.max(0, pd.life[i]);
      col[i*3]   = 1.0; col[i*3+1] = t * 0.5; col[i*3+2] = 0;
    }
    pd.geo.attributes.position.needsUpdate = true;
    pd.geo.attributes.color.needsUpdate = true;
    pd.mat.opacity = 0.55 + Math.sin(vostokClock * 3.1) * 0.15;
  }
  updateVostokLabels();
  vostokRenderer.render(vostokScene, vostokCamera);
}

// Initialized lazily inside initVostok() after THREE is loaded
let VOSTOK_LABEL_POINTS = [];

function updateVostokLabels() {
  const labelsDiv = document.getElementById('vostok-labels');
  if (!labelsDiv || !vostokCamera) return;
  const canvas = document.getElementById('vostok-canvas');
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  labelsDiv.innerHTML = VOSTOK_LABEL_POINTS.map(lp => {
    const worldPt = lp.pos.clone().applyEuler(vostokShip.rotation);
    const projected = worldPt.clone().project(vostokCamera);
    const x = (projected.x * 0.5 + 0.5) * W;
    const y = (-projected.y * 0.5 + 0.5) * H;
    if (projected.z > 1) return '';
    const isLeft = lp.side === 'l';
    const text = lang === 'ar' ? lp.ar : lp.en;
    return `<div class="v-label" style="left:${x}px;top:${y}px;transform:translate(${isLeft ? '-100%' : '0'},-50%);flex-direction:${isLeft ? 'row-reverse' : 'row'}">
      <div class="v-label-line"></div>
      <span>${text}</span>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════
// LANGUAGE SWITCHING
// ════════════════════════════════════════════
let currentLang = 'en';

const langBtn = document.getElementById('langBtn');
langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  applyLanguage(currentLang);
});

function applyLanguage(lang) {
  const root = document.documentElement;
  root.setAttribute('lang', lang);
  root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Sync mobile nav
  document.querySelectorAll('.mobile-nav').forEach(n => n.innerHTML = '');

  if (lang === 'ar') {
    langBtn.textContent = AR.nav.langSwitch;
    applyArabic();
  } else {
    langBtn.textContent = '🌐 العربية';
    applyEnglish();
  }

  // Rebuild ALL panels so every panel is translated, not just the active one
  ['systems','timeline','gagarin','charts','sensation','compare','vostok'].forEach(id => {
    rebuildPanel(id, lang);
  });

  // Rebuild mobile nav
  document.querySelectorAll('.navlink').forEach(l => {
    const clone = l.cloneNode(true);
    clone.addEventListener('click', () => showPanel(clone.dataset.panel));
    document.getElementById('mobileNav').appendChild(clone);
  });
}

function applyArabic() {
  // Nav links
  const labels = {
    systems: AR.nav.systems, timeline: AR.nav.timeline,
    gagarin: AR.nav.gagarin, charts: AR.nav.charts,
    sensation: AR.nav.sensation, compare: AR.nav.compare,
    vostok: AR.nav.vostok,
  };
  document.querySelectorAll('.navlink').forEach(l => {
    const span = l.querySelectorAll('span')[1];
    if (span && labels[l.dataset.panel]) span.textContent = labels[l.dataset.panel];
  });
  document.querySelector('.sidenav-logo span').textContent = AR.nav.logo;
  // Preserve the logo img in topbar
  const topbarLogo = document.querySelector('.topbar-logo');
  const topbarImg = topbarLogo.querySelector('img');
  topbarLogo.textContent = ' ' + AR.nav.logo;
  if (topbarImg) topbarLogo.prepend(topbarImg);
  // Theme button
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  themeBtn.textContent = isDark ? AR.nav.themeDark : AR.nav.themeLight;
}

function applyEnglish() {
  const labels = {
    systems: 'Body Systems', timeline: 'Mission Clock',
    gagarin: 'First Human', charts: 'Data & Charts',
    sensation: 'The Sensation', compare: 'Earth vs Space',
    vostok: 'Vostok 1',
  };
  document.querySelectorAll('.navlink').forEach(l => {
    const span = l.querySelectorAll('span')[1];
    if (span && labels[l.dataset.panel]) span.textContent = labels[l.dataset.panel];
  });
  document.querySelector('.sidenav-logo span').textContent = 'Space Biology';
  // Preserve the logo img in topbar
  const topbarLogo = document.querySelector('.topbar-logo');
  const topbarImg = topbarLogo.querySelector('img');
  topbarLogo.textContent = ' Space Biology';
  if (topbarImg) topbarLogo.prepend(topbarImg);
  // Theme button
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  themeBtn.textContent = isDark ? '☽ Dark' : '☀ Light';
}

function rebuildPanel(id, lang) {
  // Update panel header
  const T = lang === 'ar' ? AR.panels[id] : null;
  if (T) {
    const ph = document.querySelector(`#panel-${id} .panel-header`);
    if (ph) {
      ph.querySelector('.ph-eyebrow').textContent = T.eyebrow;
      ph.querySelector('.ph-title').innerHTML = T.title;
      ph.querySelector('.ph-sub').textContent = T.sub;
    }
  } else {
    // Reset panel headers to English
    const EN = {
      systems:   { eyebrow: 'Interactive Explorer',     title: 'The <em>Human Body</em> in Space',          sub: 'Click any glowing point on the body to explore what microgravity does to that system — in detail.' },
      timeline:  { eyebrow: 'Interactive Timeline',     title: 'Mission <em>Clock</em>',                    sub: 'Drag the slider to move through a 6-month mission. Watch how each body system degrades — and what the daily consequences are.' },
      gagarin:   { eyebrow: 'April 12, 1961',           title: 'The <em>First Human</em> in Space',         sub: 'A minute-by-minute account of Yuri Gagarin\'s 108-minute flight — the most significant journey in human history.' },
      charts:    { eyebrow: 'Research Data',            title: '<em>Charts</em> &amp; Data',                sub: 'Visualized data from ISS long-duration missions showing how each body system changes over time.' },
      sensation: { eyebrow: 'First-Person Experience',  title: 'What It <em>Feels Like</em>',               sub: 'The sensory and emotional experience of spaceflight — from launch through long-duration weightlessness, told as astronauts have described it.' },
      compare:   { eyebrow: 'Side-by-Side Comparison',  title: 'Earth <em>vs.</em> Space',                  sub: 'Every major physiological difference between life on Earth and a 6-month space mission.' },
      vostok:    { eyebrow: 'April 12, 1961 · First Crewed Spacecraft', title: 'Vostok <em>1</em>',          sub: 'The spacecraft that carried Yuri Gagarin into orbit. Drag to rotate · Scroll to zoom · Pinch on mobile.' },
    };
    const E = EN[id];
    if (E) {
      const ph = document.querySelector(`#panel-${id} .panel-header`);
      if (ph) {
        ph.querySelector('.ph-eyebrow').textContent = E.eyebrow;
        ph.querySelector('.ph-title').innerHTML = E.title;
        ph.querySelector('.ph-sub').textContent = E.sub;
      }
    }
  }

  // Rebuild panel-specific content
  if (id === 'systems') {
    // Clear active system and rebuild empty state
    document.querySelectorAll('.hs').forEach(h => h.classList.remove('active'));
    document.getElementById('sys-content').style.display = 'none';
    document.getElementById('sys-empty').style.display = '';
    document.getElementById('env-badge').textContent = lang === 'ar' ? '🌍 على الأرض' : '🌍 On Earth';
    document.getElementById('env-badge').classList.remove('space');
    if (lang === 'ar') {
      document.getElementById('sys-empty').querySelector('h3').textContent = 'اختر جهازًا من أجهزة الجسم';
      document.getElementById('sys-empty').querySelector('p').textContent = 'انقر على أي نقطة متوهجة على الشكل البشري لاستكشاف ما يفعله انعدام الجاذبية بذلك الجزء من الجسم';
      // Translate hint chips
      const hintMap = { Brain:'الدماغ', Eyes:'العيون', Heart:'القلب', Spine:'العمود الفقري', Fluids:'السوائل', Bones:'العظام', Muscles:'العضلات', Immune:'المناعة', Sleep:'النوم' };
      document.querySelectorAll('.se-hints span').forEach(s => { s.textContent = hintMap[s.textContent] || s.textContent; });
      // Translate figure hint
      const fh = document.querySelector('.figure-hint');
      if (fh) fh.textContent = '↑ ٩ أجهزة للاستكشاف';
      // Translate SVG hotspot labels
      const svgLabelMap = { Brain:'الدماغ', Eyes:'العيون', Heart:'القلب', Spine:'العمود', Fluids:'السوائل', Bones:'العظام', Muscles:'العضلات', Immune:'المناعة', Sleep:'النوم' };
      document.querySelectorAll('.hs-label').forEach(el => { el.textContent = svgLabelMap[el.textContent] || el.textContent; });
    } else {
      document.getElementById('sys-empty').querySelector('h3').textContent = 'Select a body system';
      document.getElementById('sys-empty').querySelector('p').textContent = 'Click any glowing point on the human figure to the left to explore what microgravity does to that part of the body';
      // Restore hint chips
      const hintMap = { 'الدماغ':'Brain', 'العيون':'Eyes', 'القلب':'Heart', 'العمود الفقري':'Spine', 'السوائل':'Fluids', 'العظام':'Bones', 'العضلات':'Muscles', 'المناعة':'Immune', 'النوم':'Sleep' };
      document.querySelectorAll('.se-hints span').forEach(s => { s.textContent = hintMap[s.textContent] || s.textContent; });
      // Restore figure hint
      const fh = document.querySelector('.figure-hint');
      if (fh) fh.textContent = '↑ 9 systems to explore';
      // Restore SVG hotspot labels
      const svgLabelMap = { 'الدماغ':'Brain', 'العيون':'Eyes', 'القلب':'Heart', 'العمود':'Spine', 'السوائل':'Fluids', 'العظام':'Bones', 'العضلات':'Muscles', 'المناعة':'Immune', 'النوم':'Sleep' };
      document.querySelectorAll('.hs-label').forEach(el => { el.textContent = svgLabelMap[el.textContent] || el.textContent; });
    }
  }

  if (id === 'timeline') {
    const slider = document.getElementById('mission-slider');
    // Translate clock marks
    const markLabels = lang === 'ar'
      ? AR.clock.marks
      : ['D1','W1','M1','M2','M3','M4','M5','M6'];
    document.querySelectorAll('.clock-marks span').forEach((el, i) => {
      if (markLabels[i] !== undefined) el.textContent = markLabels[i];
    });
    updateTimelineAr(parseInt(slider.value), lang);
  }

  if (id === 'gagarin') {
    document.getElementById('gg-story')._built = false;
    buildGagarin(lang);
  }

  if (id === 'charts') {
    const ar = lang === 'ar';
    const set = (elId, txt) => { const el = document.getElementById(elId); if (el) el.textContent = txt; };
    const cards = ar ? AR.panels.charts.cards : null;
    const EN_CARDS = {
      bone:      { title: 'Bone Density Loss',                sub: 'Hip & spine, % lost vs. mission day',             insight: 'Bone loss accelerates — hip bones lose ~1% density per month. Without countermeasures, a 6-month mission equals roughly a decade of normal age-related bone loss.' },
      muscle:    { title: 'Muscle Mass Loss',                 sub: 'Leg muscles, % remaining vs. mission day',         insight: 'Leg muscles begin atrophying within days of launch. Without 2+ hours of daily resistive exercise, an astronaut can lose up to 20% of lower body muscle by month 3.' },
      height:    { title: 'Height Change',                    sub: 'Spinal elongation in cm, vs. mission day',         insight: 'Height gains peak within the first 2 weeks as spinal discs fully decompress. The 5 cm gain disappears within 10 days of returning to Earth — but the weakened spinal muscles persist for months.' },
      radiation: { title: 'Radiation Exposure',               sub: 'Cumulative dose in mSv (ISS orbit)',               insight: 'ISS astronauts absorb ~0.5 mSv per day — about 27× the average Earth surface rate. A Mars mission would expose astronauts to 3–5× higher doses, raising lifetime cancer risk significantly.' },
      cardio:    { title: 'Cardiovascular Deconditioning',    sub: 'VO2 max % of baseline vs. mission day',            insight: 'Without exercise, aerobic capacity drops roughly 1% per day. Daily exercise protocols on the ISS limit this to about a 15% reduction — still enough to cause dizziness on return to Earth.' },
      icp:       { title: 'Intracranial Pressure',            sub: 'Relative to Earth baseline (1.0)',                 insight: 'Fluid shifts toward the head elevate intracranial pressure chronically during long missions. This is directly linked to the visual impairment seen in ~40% of long-duration astronauts.' },
    };
    Object.keys(EN_CARDS).forEach(k => {
      const d = ar ? cards[k] : EN_CARDS[k];
      set(`ct-${k}`, d.title); set(`cs-${k}`, d.sub); set(`ci-${k}`, d.insight);
    });
    // Redraw charts with translated series labels
    chartsDrawn = false;
    if (ar) { drawAllChartsAr(); } else { drawAllCharts(); }
  }

  if (id === 'vostok') {
    const ar = lang === 'ar';
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('vi-specs-title',  ar ? 'مواصفات المهمة'              : 'Mission Specs');
    set('vi-parts-title',  ar ? 'المكونات الرئيسية'           : 'Key Components');
    set('vi-s1',           ar ? 'تاريخ الإطلاق'               : 'Launch date');
    set('vi-s2',           ar ? 'الكتلة الإجمالية'            : 'Total mass');
    set('vi-s3',           ar ? 'الطول الكلي'                 : 'Total length');
    set('vi-s4',           ar ? 'قطر الكبسولة'                : 'Capsule diameter');
    set('vi-s5',           ar ? 'ارتفاع المدار'               : 'Orbit altitude');
    set('vi-s6',           ar ? 'دورة المدار'                 : 'Orbital period');
    set('vi-s7',           ar ? 'مدة المهمة'                  : 'Mission duration');
    set('vi-s8',           ar ? 'المصمم الرئيسي'              : 'Chief designer');
    set('vi-p1-name',      ar ? 'كبسولة الهبوط (شاريك)'      : 'Descent Module (Sharik)');
    set('vi-p1-desc',      ar ? 'كبسولة كروية قطرها 2.3 م. درع حراري وقاها أثناء إعادة الدخول عند 8 جي. قفز غاغارين بالمظلة بشكل منفصل.' : 'Spherical capsule, 2.3 m diameter. Ablative heat shield protected it during reentry at 8G. Gagarin ejected and parachuted separately.');
    set('vi-p2-name',      ar ? 'وحدة الأجهزة'               : 'Instrument Module');
    set('vi-p2-desc',      ar ? 'تحتوي على خزانات الوقود ودعم الحياة والبطاريات وأنظمة الاتصالات. تُطلق قبل إعادة الدخول وتحترق في الغلاف الجوي.' : 'Houses fuel tanks, life support, batteries, and communication systems. Jettisoned before reentry and burns up in the atmosphere.');
    set('vi-p3-name',      ar ? 'محرك التراجع TDU-1'         : 'TDU-1 Retrorocket');
    set('vi-p3-desc',      ar ? 'اشتعل لمدة 42 ثانية لإبطاء المركبة للخروج من المدار. أنتج ~1,600 كجم دفعًا. تسبب عطل في دوران مرعب لمدة 10 دقائق أثناء إعادة الدخول.' : 'Fired for 42 seconds to slow the craft for deorbit. Produced ~1,600 kg thrust. A malfunction caused a terrifying 10-minute spin on reentry.');
    set('vi-p4-name',      ar ? 'مصفوفة الهوائيات'           : 'Antenna Array');
    set('vi-p4-desc',      ar ? 'أربعة هوائيات جلد للاتصال الصوتي مع مركز التحكم. أتاحت المراقبة الفورية لعلامات غاغارين الحيوية.' : 'Four whip antennas for voice communication with ground control and telemetry. Allowed real-time monitoring of Gagarin\'s vitals.');
    set('vi-fact-label',   ar ? 'سر مصنف لسنوات:'            : 'Classified secret for years:');
    const factEl = document.getElementById('vi-fact-text');
    if (factEl) factEl.innerHTML = ar
      ? `<strong id="vi-fact-label">سر مصنف لسنوات:</strong> قفز غاغارين من الكبسولة على ارتفاع 7,000 م وهبط بالمظلة بشكل منفصل. لم يكن بإمكان الكبسولة الهبوط بأمان مع الطيار داخلها — لكن كان يجب إخفاء ذلك لتأهيل الرحلة وفق سجلات الطيران.`
      : `<strong id="vi-fact-label">Classified secret for years:</strong> Gagarin ejected from the capsule at 7,000 m altitude and parachuted separately. The capsule couldn't safely land with a pilot inside — but this had to be kept quiet to qualify the flight under aviation records.`;
    const hint = document.getElementById('vostok-hint');
    if (hint) hint.textContent = ar ? '⟳ اسحب للتدوير · مرّر للتكبير' : '⟳ Drag to rotate · Scroll to zoom';
  }

  if (id === 'sensation') {
    showSensation(document.querySelector('.sn-btn.active')?.dataset.sense || 'launch', lang);
    // Update nav buttons
    document.querySelectorAll('.sn-btn').forEach(b => {
      const key = b.dataset.sense;
      b.textContent = lang === 'ar' ? (AR.sensationNav[key] || b.textContent) : {
        launch:'Launch', orbit:'Entering Orbit', weightless:'Weightlessness',
        sick:'Space Sickness', adapt:'Adaptation', view:'Seeing Earth', return:'Coming Home'
      }[key];
    });
  }

  if (id === 'compare') {
    document.getElementById('compare-grid')._built = false;
    buildCompare(lang);
  }
}

// Patch updateTimeline to support Arabic
const _origUpdate = updateTimeline;
window.updateTimeline = function(val) {
  updateTimelineAr(parseInt(val), currentLang);
};

function updateTimelineAr(d, lang) {
  document.getElementById('clock-day').textContent = (lang === 'ar' ? AR.clock.dayPrefix : 'Day ') + d;
  if (lang === 'ar') {
    const phase = AR.clock.phases.find((_, i) => {
      const PHASE_DAYS = [1,3,8,21,60,90,150];
      const end = PHASE_DAYS[i+1] || 180;
      return d >= PHASE_DAYS[i] && d <= end;
    }) || AR.clock.phases[AR.clock.phases.length - 1];
    document.getElementById('clock-phase').textContent = phase.name;
    document.getElementById('clock-narrative').textContent = phase.text;
  } else {
    const phase = getPhase(d);
    document.getElementById('clock-phase').textContent = phase.name;
    document.getElementById('clock-narrative').textContent = phase.text;
  }
  buildMetricGrid(d, lang);
}

// Patch selectSystem to use Arabic data
const _origRenderSys = renderSystem;
window.renderSystem = function(id) {
  if (currentLang !== 'ar') { _origRenderSys(id); return; }
  const data = AR.systems[id] || SYSTEMS[id];
  const content = document.getElementById('sys-content');
  const empty   = document.getElementById('sys-empty');
  empty.style.display = 'none';
  content.style.display = 'block';
  const base = SYSTEMS[id];
  content.innerHTML = `
    <div class="sc-hero">
      <div class="sc-top">
        <div class="sc-icon-wrap" style="background:${base.color}20">${base.icon}</div>
        <div class="sc-title-area">
          <div class="sc-title">${data.title}</div>
          <span class="sc-badge" style="background:${base.color}1a;color:${base.color}">${data.category}</span>
        </div>
      </div>
      <p class="sc-desc">${data.desc}</p>
    </div>
    <div class="sc-body">
      <div class="sc-bars">
        ${data.bars.map(b => `
          <div class="sb-item">
            <div class="sb-row">
              <span class="sb-name">${b.name}</span>
              <span class="sb-val">${b.label}</span>
            </div>
            <div class="sb-row">
              <div class="sb-track"><div class="sb-fill" data-width="${b.val}" style="background:${b.color}"></div></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="sc-pills">
        ${data.pills.map(p => `
          <div class="sc-pill">
            <div class="dot" style="background:${p.color}"></div>
            ${p.text}
          </div>`).join('')}
      </div>
    </div>`;
  requestAnimationFrame(() => {
    content.querySelectorAll('.sb-fill').forEach(el => { el.style.width = el.dataset.width + '%'; });
  });
};

// Patch buildGagarin
const _origGagarin = buildGagarin;
window.buildGagarin = function(lang) {
  lang = lang || currentLang;
  const container = document.getElementById('gg-story');
  if (container._built) return;
  container._built = true;
  const steps = lang === 'ar' ? AR.gagarin.steps : STEPS;
  container.innerHTML = steps.map((s, i) => `
    <div class="gg-step ${i === 0 ? 'active' : ''}" onclick="activateStep(this)">
      <div class="ggs-marker">
        <div class="ggs-dot"></div>
        ${i < steps.length - 1 ? '<div class="ggs-line"></div>' : ''}
      </div>
      <div class="ggs-body">
        <div class="ggs-time">${s.time}</div>
        <div class="ggs-title">${s.title}</div>
        <div class="ggs-text">${s.text}</div>
      </div>
    </div>`).join('');

  // Update aside dossier
  const aside = document.querySelector('.gg-aside');
  if (lang === 'ar') {
    const d = AR.gagarin.dossier;
    if (aside) {
      aside.querySelector('.gg-dossier-title') && (aside.querySelector('.gg-dossier-title').textContent = d.title);
      aside.querySelector('.gg-name').textContent = d.name;
      aside.querySelector('.gg-role').textContent = d.role;
      aside.querySelector('.gg-quote-card blockquote').textContent = d.quote;
      aside.querySelector('.gg-quote-card cite').textContent = d.quoteCite;
      aside.querySelector('.gg-context-title').textContent = AR.gagarin.bodyDataTitle;
      const factsEl = aside.querySelector('.gg-facts');
      if (factsEl) factsEl.innerHTML = d.fields.map(([k,v]) => `<div class="gg-fact"><span>${k}</span><strong>${v}</strong></div>`).join('');
      const bdEl = aside.querySelector('.gg-body-data');
      if (bdEl) bdEl.innerHTML = AR.gagarin.bodyData.map(([k,v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('');
    }
  } else {
    // Restore English aside
    if (aside) {
      aside.querySelector('.gg-name').textContent = 'Yuri Alekseyevich Gagarin';
      aside.querySelector('.gg-role').textContent = 'Soviet Air Force Pilot · Cosmonaut';
      aside.querySelector('.gg-quote-card blockquote').innerHTML = 'The Earth is blue.<br>How wonderful.<br>It is amazing.';
      aside.querySelector('.gg-quote-card cite').textContent = '— In orbit, April 12, 1961';
      aside.querySelector('.gg-context-title').textContent = 'Body data during flight';
      const factsEl = aside.querySelector('.gg-facts');
      if (factsEl) factsEl.innerHTML = [
        ['Age','27 years'],['Spacecraft','Vostok 1'],['Duration','108 minutes'],
        ['Orbits','1'],['Altitude','327 km'],['Speed','27,400 km/h'],
        ['Heart rate','64 bpm (calm)'],['Landing','Saratov, Russia']
      ].map(([k,v]) => `<div class="gg-fact"><span>${k}</span><strong>${v}</strong></div>`).join('');
      const bdEl = aside.querySelector('.gg-body-data');
      if (bdEl) bdEl.innerHTML = [
        ['Heart rate at launch','~100 bpm'],['Heart rate in orbit','64 bpm'],
        ['Breathing rate','Normal'],['Weightlessness felt','Like being suspended'],
        ['Food/drink','Ate and drank normally'],['G-force at launch','4–5 G'],
        ['Re-entry G-force','8 G (briefly)']
      ].map(([k,v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('');
    }
  }
};

// Patch showSensation
const _origSensation = showSensation;
window.showSensation = function(id, lang) {
  lang = lang || currentLang;
  document.querySelectorAll('.sn-btn').forEach(b => b.classList.toggle('active', b.dataset.sense === id));
  const data = lang === 'ar' ? AR.sensation[id] : SENSATIONS[id];
  const content = document.getElementById('sensation-content');
  content.innerHTML = `
    <div class="sense-card">
      <div class="sense-hero">
        <div class="sense-label">${data.label}</div>
        <div class="sense-title">${data.title}</div>
        <p class="sense-lead">${data.lead}</p>
      </div>
      <div class="sense-body">
        ${data.body.map(p => `<p>${p}</p>`).join('')}
      </div>
      <div class="sense-quotes">
        ${data.quotes.map(q => `
          <div class="sense-q">${q.text}<cite>— ${q.cite}</cite></div>`).join('')}
      </div>
    </div>`;
};

// Patch buildCompare
const _origCompare = buildCompare;
window.buildCompare = function(lang) {
  lang = lang || currentLang;
  const grid = document.getElementById('compare-grid');
  grid._built = true;
  if (lang === 'ar') {
    const H = AR.compare.headers;
    grid.innerHTML = `
      <div class="cmp-header-row">
        <div style="color:var(--mid)">${H[0]}</div>
        <div>${H[1]}</div>
        <div>${H[2]}</div>
      </div>` +
      AR.compare.rows.map(r => `
        <div class="cmp-row">
          <div class="cmp-label"><span class="clabel-icon">${r.icon}</span>${r.label}</div>
          <div class="cmp-earth">${r.earth}</div>
          <div class="cmp-space">
            ${r.space}
            <br><span class="cmp-tag tag-${r.tag}">${r.tagText}</span>
          </div>
        </div>`).join('');
  } else {
    grid._built = false;
    _origCompare();
  }
};

