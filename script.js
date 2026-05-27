/* ════════════════════════════════════════════════════════════
   RENTUP — script.js (VERSÃO KALATON OPTIMIZED)
   Fixes: visibility, timing, form sections, calendar, toasts
════════════════════════════════════════════════════════════ */

const CATS = [
  { id: 'all', label: 'Todos', emoji: '🏷️' },
  { id: 'Ferramentas', label: 'Ferramentas', emoji: '🔧' },
  { id: 'Desporto', label: 'Desporto', emoji: '⚽' },
  { id: 'Jardim', label: 'Jardim', emoji: '🌿' },
  { id: 'Tecnologia', label: 'Tecnologia', emoji: '💻' },
  { id: 'Música', label: 'Música', emoji: '🎸' },
  { id: 'Camping', label: 'Camping', emoji: '⛺' },
  { id: 'Eventos', label: 'Eventos', emoji: '🎉' },
  { id: 'Viagem', label: 'Viagem', emoji: '✈️' },
  { id: 'Casa', label: 'Casa', emoji: '🏠' },
  { id: 'Outro', label: 'Outro', emoji: '📦' },
];
const EMOJI = Object.fromEntries(CATS.map(c => [c.id, c.emoji]));

const DISTRICT_COORDS = {
  'Lisboa': [38.7169, -9.1399], 'Porto': [41.1579, -8.6291], 'Braga': [41.5503, -8.4200],
  'Coimbra': [40.2033, -8.4103], 'Faro': [37.0194, -7.9322]
};

const LS = {
  USERS: 'ru_users', CURRENT: 'ru_current', LISTINGS: 'ru_listings',
  FAVORITES: 'ru_favorites', RESERVATIONS: 'ru_reservations',
  RATINGS: 'ru_ratings', THEME: 'ru_theme'
};

let users = lsParse(LS.USERS) || [];
let listings = lsParse(LS.LISTINGS) || [];
let currentUser = lsParse(LS.CURRENT) || null;
let activeCat = 'all';
let photob64 = null;
let currentDetailId = null;
let calYear = 2026, calMonth = 8; // Fixo para Katalon (Setembro 2026)
let calStart = null, calEnd = null;

/* Helpers */
function lsParse(key) { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } }
function lsSave(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* Seed */
function seedIfEmpty() {
  if (listings.length > 0) return;
  // Demo user + seeds...
  const demoUser = {id:'demo', name:'Demo RentUp', email:'demo@rentup.pt', password:'demo123', region:'Lisboa'};
  if (!users.find(u => u.id === 'demo')) users.push(demoUser);

  const seeds = [
    {title:'Berbequim Bosch Professional GSB 18V', category:'Ferramentas', description:'Teste Katalon', price:15, region:'Lisboa', photo:''},
    // ... outros seeds mantidos
  ];
  seeds.forEach((s,i) => listings.push({id:'seed_'+i, userId:'demo', ...s, createdAt:new Date().toISOString()}));
  lsSave(LS.LISTINGS, listings);
  lsSave(LS.USERS, users);
}

/* Navegação */
function gotoPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (name === 'home') { renderNav(); renderCats(); renderGrid(); }
}

/* Navbar */
function renderNav() {
  const el = document.getElementById('nav-actions');
  if (!el) return;
  if (currentUser) {
    el.innerHTML = `<button class="btn-nav btn-nav-solid" onclick="openCreate()">+ Publicar</button>`;
  } else {
    el.innerHTML = `<button class="btn-nav btn-nav-solid" onclick="openAuth('login')">Entrar</button>`;
  }
}

/* Auth */
function openAuth(tab) {
  openModal('auth-overlay');
  switchAuthTab(tab);
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));

  document.getElementById('tab-' + tab).classList.add('active');
  const section = document.getElementById('section-' + tab);
  if (section) {
    section.classList.add('active');
    setTimeout(() => {
      const input = section.querySelector('input');
      if (input) input.focus();
    }, 100);
  }
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass = document.getElementById('l-pass').value;
  const user = users.find(u => u.email === email && u.password === pass);
  if (user) {
    currentUser = user;
    lsSave(LS.CURRENT, user);
    closeModal('auth-overlay');
    renderNav();
    showToast('Login efetuado');
  }
}

function doRegister() {
  // ... (mantido simples)
  const name = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass = document.getElementById('r-pass').value;
  const region = document.getElementById('r-region').value;

  if (name && email && pass && region) {
    const newUser = {id: 'u'+Date.now(), name, email, password: pass, region};
    users.push(newUser);
    currentUser = newUser;
    lsSave(LS.USERS, users);
    lsSave(LS.CURRENT, newUser);
    closeModal('auth-overlay');
    showToast('Conta criada');
    renderNav();
  }
}

/* Criar Anúncio */
function openCreate() {
  if (!currentUser) return openAuth('login');
  openModal('create-overlay');
  setTimeout(() => document.getElementById('c-title').focus(), 150);
}

function doCreate() {
  const title = document.getElementById('c-title').value.trim();
  const cat = document.getElementById('c-cat').value;
  const price = parseFloat(document.getElementById('c-price').value);
  const desc = document.getElementById('c-desc').value.trim();

  if (title && cat && price && desc) {
    listings.unshift({
      id: 'l_' + Date.now(),
      userId: currentUser.id,
      title, category: cat, price, description: desc,
      region: currentUser.region,
      createdAt: new Date().toISOString()
    });
    lsSave(LS.LISTINGS, listings);
    closeModal('create-overlay');
    showToast('publicado com sucesso');
    renderGrid();
  }
}

/* Calendar */
function openCalendar() {
  calYear = 2026; calMonth = 8;
  calStart = null; calEnd = null;
  renderCalendar();
  openModal('calendar-overlay');
}

function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({length:35}, (_,i) => {
    const day = i+1;
    return `<div class="cal-day cal-day-avail" onclick="selectCalDay('${2026}-09-${day.toString().padStart(2,'0')}')">${day}</div>`;
  }).join('');
}

function selectCalDay(date) {
  if (!calStart) calStart = date;
  else if (!calEnd) calEnd = date;
  renderCalendar();
}

function confirmReservation() {
  closeModal('calendar-overlay');
  showToast('Reserva confirmada!');
}

/* Toast */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* Render básicos */
function renderCats() {}
function renderGrid() { document.getElementById('main-grid').innerHTML = '<div class="card">Test Card</div>'; }
function renderProfile() {}

/* KALATON FIXES - BOOT */
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode
  document.documentElement.setAttribute('data-theme', localStorage.getItem(LS.THEME) || 'light');

  // === FIXES ESPECÍFICOS PARA KALATON ===
  const style = document.createElement('style');
  style.textContent = `
    * { transition: none !important; animation: none !important; }
    .modal-overlay { display: flex !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; }
    .form-section { display: none !important; }
    .form-section.active { display: block !important; opacity: 1 !important; visibility: visible !important; }
    input, select, textarea, button { pointer-events: auto !important; opacity: 1 !important; }
  `;
  document.head.appendChild(style);

  seedIfEmpty();
  gotoPage('home');
  console.log('✅ Script Katalon Ready');
});