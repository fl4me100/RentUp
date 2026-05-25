/* ════════════════════════════════════════════════════════════
   RENTUP — script.js
   Lógica completa: LocalStorage, Auth, Listagens, UI
════════════════════════════════════════════════════════════ */

/* ── Constantes ──────────────────────────────────────────── */
const CATS = [
  { id: 'all',         label: 'Todos',       emoji: '🏷️' },
  { id: 'Ferramentas', label: 'Ferramentas', emoji: '🔧' },
  { id: 'Desporto',    label: 'Desporto',    emoji: '⚽' },
  { id: 'Jardim',      label: 'Jardim',      emoji: '🌿' },
  { id: 'Tecnologia',  label: 'Tecnologia',  emoji: '💻' },
  { id: 'Música',      label: 'Música',      emoji: '🎸' },
  { id: 'Camping',     label: 'Camping',     emoji: '⛺' },
  { id: 'Eventos',     label: 'Eventos',     emoji: '🎉' },
  { id: 'Viagem',      label: 'Viagem',      emoji: '✈️' },
  { id: 'Casa',        label: 'Casa',        emoji: '🏠' },
  { id: 'Outro',       label: 'Outro',       emoji: '📦' },
];
const EMOJI = Object.fromEntries(CATS.map(c => [c.id, c.emoji]));

/* Coordenadas por distrito */
const DISTRICT_COORDS = {
  'Lisboa':           [38.7169, -9.1399],
  'Porto':            [41.1579, -8.6291],
  'Braga':            [41.5503, -8.4200],
  'Coimbra':          [40.2033, -8.4103],
  'Faro':             [37.0194, -7.9322],
  'Setúbal':          [38.5244, -8.8882],
  'Aveiro':           [40.6405, -8.6538],
  'Viseu':            [40.6566, -7.9122],
  'Évora':            [38.5714, -7.9076],
  'Leiria':           [39.7436, -8.8071],
  'Santarém':         [39.2369, -8.6860],
  'Viana do Castelo': [41.6935, -8.8341],
  'Bragança':         [41.8061, -6.7589],
  'Vila Real':        [41.3006, -7.7457],
  'Guarda':           [40.5374, -7.2684],
  'Castelo Branco':   [39.8222, -7.4914],
  'Portalegre':       [39.2967, -7.4281],
  'Beja':             [38.0150, -7.8636],
};

/* Chaves do LocalStorage */
const LS = {
  USERS:        'ru_users',
  CURRENT:      'ru_current',
  LISTINGS:     'ru_listings',
  FAVORITES:    'ru_favorites',
  RESERVATIONS: 'ru_reservations',
  THEME:        'ru_theme',
};

/* ── Estado global ───────────────────────────────────────── */
let users           = lsParse(LS.USERS)    || [];
let listings        = lsParse(LS.LISTINGS) || [];
let currentUser     = lsParse(LS.CURRENT)  || null;
let activeCat       = 'all';
let photob64        = null;
let currentDetailId = null;
let detailMap       = null;
let detailMarker    = null;

/* Calendar state */
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();
let calStart = null;
let calEnd   = null;

/* ── Helpers LocalStorage ────────────────────────────────── */
function lsParse(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}
function lsSave(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* ════════════════════════════════════════════════════════════
   SEED — dados de exemplo (só na 1.ª visita)
════════════════════════════════════════════════════════════ */
function seedIfEmpty() {
  if (listings.length > 0) return;

  const demoUser = {
    id: 'demo', name: 'Demo RentUp', email: 'demo@rentup.pt',
    password: 'demo123', region: 'Lisboa',
  };
  if (!users.find(u => u.id === 'demo')) {
    users.push(demoUser);
    lsSave(LS.USERS, users);
  }

  const seeds = [
    { title: 'Furadeira Bosch 18V Professional',   category: 'Ferramentas', description: 'Furadeira percutora profissional com 2 baterias e mala de transporte. Excelente estado, pouco usada.', price: 8,  region: 'Lisboa',  photo: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop' },
    { title: 'Bicicleta Montanha Trek Marlin 5',    category: 'Desporto',    description: '21 velocidades, quadro alumínio, travões a disco hidráulicos. Capacete incluído. Perfeita para trilhos.', price: 15, region: 'Porto',   photo: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&auto=format&fit=crop' },
    { title: 'Tenda Campismo 4 Pessoas Quechua',    category: 'Camping',     description: 'Tenda familiar impermeável (3000mm HH). Fácil montagem em 10 min. Estacas e cordas incluídas.', price: 12, region: 'Braga',   photo: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop' },
    { title: 'Drone DJI Mini 3 Pro',                category: 'Tecnologia',  description: 'Câmara 4K, autonomia 38 min, sem necessidade de registo. 2 baterias e carregador incluídos.', price: 35, region: 'Lisboa',  photo: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&auto=format&fit=crop' },
    { title: 'Guitarra Fender Stratocaster',        category: 'Música',      description: 'Guitarra elétrica em perfeito estado. Cabo P10 e amplificador Fender de 15W incluídos.', price: 20, region: 'Coimbra', photo: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop' },
    { title: 'Cortador Relva Bosch Elétrico 1800W', category: 'Jardim',      description: 'Corte de 43cm, reservatório de 50L. Cabo de extensão 25m incluído. Ideal para jardins até 800m².', price: 18, region: 'Faro',    photo: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=600&auto=format&fit=crop' },
    { title: 'Projetor Epson Full HD 3300lm',       category: 'Eventos',     description: '3300 lúmens, resolução Full HD, HDMI e WiFi. Écran 100" incluído. Perfeito para apresentações.', price: 25, region: 'Porto',   photo: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop' },
    { title: 'Kit Escalada Completo Black Diamond', category: 'Desporto',    description: 'Arnês, capacete, mosquetões, corda 60m, sacos de magnésio. Tudo certificado CE e em bom estado.', price: 22, region: 'Aveiro',  photo: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&auto=format&fit=crop' },
    { title: 'Câmara Sony A7III + 24-70mm',         category: 'Tecnologia',  description: 'Full-frame mirrorless, 24MP. Objectiva 24-70mm f/2.8 incluída. Ideal para eventos e retratos.', price: 55, region: 'Lisboa',  photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop' },
  ];

  seeds.forEach((s, i) => {
    listings.push({
      id: 'seed_' + i,
      userId: 'demo',
      ...s,
      createdAt: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
    });
  });
  lsSave(LS.LISTINGS, listings);
}

/* ════════════════════════════════════════════════════════════
   NAVEGAÇÃO ENTRE PÁGINAS
════════════════════════════════════════════════════════════ */
function gotoPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
  syncDarkToggles();

  if (name === 'home') {
    renderNav();
    renderCats();
    renderGrid();
    updateStats();
  }
  if (name === 'profile') {
    if (!currentUser) { gotoPage('home'); return; }
    renderProfile();
    renderNavProfile();
  }
}

/* ════════════════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════════════════ */
function renderNav() {
  const el = document.getElementById('nav-actions');
  if (!el) return;

  if (currentUser) {
    el.innerHTML = `
      <button class="btn-nav btn-nav-ghost" onclick="gotoPage('about')" style="width:auto;">Quem somos</button>
      <button class="btn-nav btn-nav-solid" onclick="openCreate()">+ Publicar</button>
      <div class="user-chip" onclick="gotoPage('profile')">
        <div class="avatar-sm">${currentUser.name[0].toUpperCase()}</div>
        <span class="chip-name">${currentUser.name.split(' ')[0]}</span>
      </div>`;
  } else {
    el.innerHTML = `
      <button class="btn-nav btn-nav-ghost" onclick="gotoPage('about')" style="width:auto;">Quem somos</button>
      <button class="btn-nav btn-nav-ghost" onclick="openAuth('login')">Entrar</button>
      <button class="btn-nav btn-nav-solid" onclick="openAuth('register')">Criar conta</button>`;
  }
}

function renderNavProfile() {
  const el = document.getElementById('nav-actions-profile');
  if (!el || !currentUser) return;
  el.innerHTML = `
    <div class="user-chip">
      <div class="avatar-sm">${currentUser.name[0].toUpperCase()}</div>
      <span class="chip-name">${currentUser.name.split(' ')[0]}</span>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   CATEGORIAS
════════════════════════════════════════════════════════════ */
function renderCats() {
  const bar = document.getElementById('cats-bar');
  if (!bar) return;
  bar.innerHTML = CATS.map(c => `
    <button class="cat-btn ${c.id === activeCat ? 'active' : ''}" onclick="selectCat('${c.id}')">
      ${c.emoji} ${c.label}
    </button>`
  ).join('');
}

function selectCat(id) {
  activeCat = id;
  const titleEl = document.getElementById('listings-title');
  if (titleEl) {
    const found = CATS.find(c => c.id === id);
    titleEl.textContent = found ? (id === 'all' ? 'Todos os anúncios' : found.emoji + ' ' + found.label) : 'Anúncios';
  }
  renderCats();
  renderGrid();
}

/* ════════════════════════════════════════════════════════════
   GRELHA DE ANÚNCIOS
════════════════════════════════════════════════════════════ */
function getFiltered() {
  const q      = (document.getElementById('nav-search')?.value || '').toLowerCase().trim();
  const region = document.getElementById('f-region-select')?.value || '';
  const minP   = parseFloat(document.getElementById('f-min')?.value) || 0;
  const maxP   = parseFloat(document.getElementById('f-max')?.value) || Infinity;

  return listings.filter(l => {
    const catOk = activeCat === 'all' || l.category === activeCat;
    const qOk   = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.category.toLowerCase().includes(q);
    const regOk = !region || l.region === region;
    const priOk = l.price >= minP && l.price <= maxP;
    return catOk && qOk && regOk && priOk;
  });
}

function renderGrid() {
  const filtered = getFiltered();
  const grid     = document.getElementById('main-grid');
  const countEl  = document.getElementById('listings-count');
  if (!grid) return;

  if (countEl) countEl.textContent = filtered.length + ' anúncio' + (filtered.length !== 1 ? 's' : '');

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="ico">🔍</div>
        <h3>Sem resultados</h3>
        <p>Tenta alterar os filtros ou a pesquisa.<br>Ou sê o primeiro a publicar nesta categoria!</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(l => {
    const emoji   = EMOJI[l.category] || '📦';
    const imgHtml = l.photo
      ? `<img src="${l.photo}" alt="${escHtml(l.title)}" loading="lazy">`
      : `<span>${emoji}</span>`;
    const dateStr = new Date(l.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
    const heart   = isFavorited(l.id) ? '❤️' : '🤍';
    const [euros, cents] = (+l.price).toFixed(2).split('.');

    return `
      <div class="card" onclick="openDetail('${l.id}')">
        <div class="card-img">
          ${imgHtml}
          <span class="card-badge">${escHtml(l.category)}</span>
          <button class="card-fav" data-id="${l.id}" onclick="toggleFav(event,'${l.id}')" title="Favoritar">${heart}</button>
        </div>
        <div class="card-body">
          <div class="card-cat">${emoji} ${escHtml(l.category)}</div>
          <div class="card-title">${escHtml(l.title)}</div>
          <div class="card-price">${euros}<span class="card-cents">.${cents}€</span><small> / dia</small></div>
          <div class="card-meta">
            <span>📍 ${escHtml(l.region)}</span>
            <span>${dateStr}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

function applyFilters() { renderGrid(); }

/* ── Favorites ───────────────────────────────────────────── */
function isFavorited(listingId) {
  if (!currentUser) return false;
  const favs = lsParse(LS.FAVORITES) || {};
  return (favs[currentUser.id] || []).includes(listingId);
}

function toggleFav(e, listingId) {
  e.stopPropagation();
  if (!currentUser) { openAuth('login'); showToast('⚠️ Entra para guardar favoritos.'); return; }
  const favs     = lsParse(LS.FAVORITES) || {};
  const userFavs = favs[currentUser.id]  || [];
  const idx      = userFavs.indexOf(listingId);
  if (idx === -1) { userFavs.push(listingId); showToast('❤️ Adicionado aos favoritos!'); }
  else            { userFavs.splice(idx, 1);  showToast('🤍 Removido dos favoritos.'); }
  favs[currentUser.id] = userFavs;
  lsSave(LS.FAVORITES, favs);
  const btn = e.currentTarget;
  if (btn) btn.textContent = idx === -1 ? '❤️' : '🤍';
}

/* ── Profile search ──────────────────────────────────────── */
function profileSearch() {
  const val = document.getElementById('nav-search-profile')?.value || '';
  const main = document.getElementById('nav-search');
  if (main) main.value = val;
  gotoPage('home');
}

/* ── Dark Mode ───────────────────────────────────────────── */
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next   = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(LS.THEME, next);
  syncDarkToggles();
}

function syncDarkToggles() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon   = isDark ? '☀️' : '🌙';
  ['dark-toggle','dark-toggle-profile','dark-toggle-about'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.textContent = icon;
  });
}

function updateStats() {
  const elL = document.getElementById('stat-listings');
  const elU = document.getElementById('stat-users');
  if (elL) elL.textContent = listings.length;
  if (elU) elU.textContent = users.filter(u => u.id !== 'demo').length;
}

/* ════════════════════════════════════════════════════════════
   PESQUISA HERO
════════════════════════════════════════════════════════════ */
function heroSearch() {
  const q = document.getElementById('hero-search')?.value || '';
  const navSearch = document.getElementById('nav-search');
  if (navSearch) navSearch.value = q;
  window.scrollTo({ top: 400, behavior: 'smooth' });
  renderGrid();
}

/* ════════════════════════════════════════════════════════════
   AUTH — Login / Registo
════════════════════════════════════════════════════════════ */
function openAuth(tab) {
  openModal('auth-overlay');
  switchAuthTab(tab);
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('section-' + tab).classList.add('active');
  const titleEl = document.getElementById('auth-modal-title');
  if (titleEl) titleEl.textContent = tab === 'login' ? 'Entrar' : 'Criar conta';
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const pass  = document.getElementById('l-pass').value;
  const err   = document.getElementById('err-login');

  const u = users.find(u => u.email === email && u.password === pass);
  if (!u) { err.classList.add('show'); return; }

  err.classList.remove('show');
  currentUser = u;
  lsSave(LS.CURRENT, u);
  closeModal('auth-overlay');
  renderNav();
  updateStats();
  showToast('👋 Bem-vindo/a de volta, ' + u.name.split(' ')[0] + '!');
}

function doRegister() {
  const name   = document.getElementById('r-name').value.trim();
  const email  = document.getElementById('r-email').value.trim().toLowerCase();
  const pass   = document.getElementById('r-pass').value;
  const region = document.getElementById('r-region').value;
  const err    = document.getElementById('err-register');

  if (!name || !email || pass.length < 6 || !region) {
    err.textContent = 'Preenche todos os campos (palavra-passe ≥ 6 caracteres).';
    err.classList.add('show'); return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    err.textContent = 'Introduz um email válido.';
    err.classList.add('show'); return;
  }
  if (users.find(u => u.email === email)) {
    err.textContent = 'Já existe uma conta com este email.';
    err.classList.add('show'); return;
  }

  err.classList.remove('show');
  const u = {
    id: 'u_' + Date.now(),
    name, email, password: pass, region,
    createdAt: new Date().toISOString(),
  };
  users.push(u);
  lsSave(LS.USERS, users);
  currentUser = u;
  lsSave(LS.CURRENT, u);
  closeModal('auth-overlay');
  renderNav();
  updateStats();
  showToast('🎉 Conta criada! Bem-vindo/a ao RentUp, ' + name.split(' ')[0] + '!');
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem(LS.CURRENT);
  gotoPage('home');
  showToast('Sessão terminada. Até já! 👋');
}

/* ════════════════════════════════════════════════════════════
   CRIAR ANÚNCIO
════════════════════════════════════════════════════════════ */
function openCreate() {
  if (!currentUser) {
    openAuth('login');
    showToast('⚠️ Tens de entrar para publicar um anúncio.');
    return;
  }
  /* reset form */
  photob64 = null;
  ['c-title', 'c-desc', 'c-price'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const catEl = document.getElementById('c-cat');
  if (catEl) catEl.value = '';
  const regionEl = document.getElementById('c-region');
  if (regionEl) regionEl.value = currentUser.region;
  const prev = document.getElementById('photo-preview');
  if (prev) { prev.style.display = 'none'; prev.src = ''; }
  const hint = document.getElementById('photo-hint');
  if (hint) hint.style.display = 'flex';
  const fileInput = document.getElementById('photo-input');
  if (fileInput) fileInput.value = '';
  const err = document.getElementById('err-create');
  if (err) err.classList.remove('show');

  openModal('create-overlay');
}

function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  /* limite visual: ficheiros > 5MB são aceites mas comprimidos */
  const reader = new FileReader();
  reader.onload = ev => {
    photob64 = ev.target.result;
    const prev = document.getElementById('photo-preview');
    const hint = document.getElementById('photo-hint');
    if (prev) { prev.src = photob64; prev.style.display = 'block'; }
    if (hint) hint.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function doCreate() {
  const title = document.getElementById('c-title')?.value.trim() || '';
  const cat   = document.getElementById('c-cat')?.value || '';
  const desc  = document.getElementById('c-desc')?.value.trim() || '';
  const price = parseFloat(document.getElementById('c-price')?.value || '0');
  const err   = document.getElementById('err-create');

  if (!title || !cat || !desc || isNaN(price) || price <= 0) {
    if (err) { err.textContent = 'Preenche todos os campos obrigatórios (*).'; err.classList.add('show'); }
    return;
  }
  if (err) err.classList.remove('show');

  const listing = {
    id:          'l_' + Date.now(),
    userId:      currentUser.id,
    title, category: cat,
    description: desc,
    price,
    region:      currentUser.region,
    photo:       photob64,
    createdAt:   new Date().toISOString(),
  };

  listings.unshift(listing);
  lsSave(LS.LISTINGS, listings);

  closeModal('create-overlay');
  renderGrid();
  updateStats();
  showToast('✅ Anúncio "' + title + '" publicado com sucesso!');
}

/* ════════════════════════════════════════════════════════════
   DETALHE DO ANÚNCIO
════════════════════════════════════════════════════════════ */
function openDetail(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;
  currentDetailId = id;
  const seller = users.find(u => u.id === l.userId);
  const emoji  = EMOJI[l.category] || '📦';
  const date   = new Date(l.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });

  setText('det-cat',         emoji + ' ' + l.category);
  setText('det-cat2',        l.category);
  setText('det-title',       l.title);
  setText('det-price',       (+l.price).toFixed(2) + '€');
  setText('det-region',      '📍 ' + l.region);
  setText('det-desc',        l.description);
  setText('det-date',        date);
  setText('det-seller-name', seller?.name || 'Utilizador RentUp');
  setText('det-seller-reg',  '📍 ' + (seller?.region || l.region));
  setText('det-avatar',      (seller?.name?.[0] || '?').toUpperCase());
  setText('det-emoji',       emoji);

  const img = document.getElementById('det-img');
  const emo = document.getElementById('det-emoji');
  if (img && emo) {
    if (l.photo) {
      img.src = l.photo;
      img.style.display = 'block';
      emo.style.display = 'none';
    } else {
      img.style.display = 'none';
      emo.style.display = '';
    }
  }

  openModal('detail-overlay');

  /* Mapa com pin do distrito */
  setTimeout(() => {
    const coords = DISTRICT_COORDS[l.region] || [39.5, -8.0];
    if (!detailMap) {
      detailMap = L.map('det-map', { zoomControl: true, scrollWheelZoom: false }).setView(coords, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(detailMap);
      detailMarker = L.marker(coords).addTo(detailMap).bindPopup(l.region).openPopup();
    } else {
      if (detailMarker) detailMap.removeLayer(detailMarker);
      detailMap.setView(coords, 10);
      detailMarker = L.marker(coords).addTo(detailMap).bindPopup(l.region).openPopup();
      detailMap.invalidateSize();
    }
  }, 150);
}

/* ════════════════════════════════════════════════════════════
   CALENDÁRIO DE RESERVA
════════════════════════════════════════════════════════════ */
function openCalendar() {
  if (!currentUser) { openAuth('login'); showToast('⚠️ Entra para pedir uma reserva.'); return; }
  closeModal('detail-overlay');
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  calStart = null;
  calEnd   = null;

  const l = listings.find(x => x.id === currentDetailId);
  const info = document.getElementById('cal-listing-info');
  if (info && l) info.innerHTML = `<strong>${escHtml(l.title)}</strong> &nbsp;·&nbsp; <span style="color:var(--accent);font-weight:700;">${(+l.price).toFixed(2)}€/dia</span>`;

  renderCalendar();
  openModal('calendar-overlay');
}

function prevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}
function nextMonth() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

function getBookedDates(listingId) {
  const reservations = lsParse(LS.RESERVATIONS) || [];
  const dates = new Set();
  reservations.filter(r => r.listingId === listingId).forEach(r => {
    const d = new Date(r.startDate);
    const end = new Date(r.endDate);
    while (d <= end) {
      dates.add(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
  });
  return dates;
}

function renderCalendar() {
  const label = document.getElementById('cal-month-label');
  if (label) label.textContent = MONTHS_PT[calMonth] + ' ' + calYear;

  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const booked  = getBookedDates(currentDetailId);
  const today   = new Date(); today.setHours(0,0,0,0);
  const days    = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  let html      = days.map(d => `<div class="cal-day-hdr">${d}</div>`).join('');

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) html += '<div></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const date    = new Date(calYear, calMonth, d);
    const dateStr = date.toISOString().split('T')[0];
    const isPast  = date < today;
    const isBook  = booked.has(dateStr);
    const isSel   = dateStr === calStart || dateStr === calEnd;
    const inRange = calStart && calEnd && dateStr > calStart && dateStr < calEnd;

    let cls = 'cal-day';
    if (isPast || isBook) cls += ' cal-day-disabled';
    else                  cls += ' cal-day-avail';
    if (isBook)   cls += ' cal-day-booked';
    if (isSel)    cls += ' cal-day-sel';
    if (inRange)  cls += ' cal-day-range';

    const click = (!isPast && !isBook) ? `onclick="selectCalDay('${dateStr}')"` : '';
    html += `<div class="${cls}" ${click}>${d}</div>`;
  }
  grid.innerHTML = html;
  updateCalSummary();
}

function selectCalDay(dateStr) {
  if (!calStart || (calStart && calEnd)) {
    calStart = dateStr; calEnd = null;
  } else {
    if (dateStr <= calStart) { calStart = dateStr; calEnd = null; }
    else {
      // Check no booked days in range
      const booked = getBookedDates(currentDetailId);
      let check = new Date(calStart); check.setDate(check.getDate() + 1);
      const endD = new Date(dateStr);
      let blocked = false;
      while (check < endD) {
        if (booked.has(check.toISOString().split('T')[0])) { blocked = true; break; }
        check.setDate(check.getDate() + 1);
      }
      if (blocked) { showToast('⚠️ Existem datas reservadas nesse intervalo.'); }
      else { calEnd = dateStr; }
    }
  }
  renderCalendar();
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

function updateCalSummary() {
  const summary = document.getElementById('cal-summary');
  const btn     = document.getElementById('cal-confirm-btn');
  if (!summary) return;
  if (!calStart) {
    summary.innerHTML = '<p style="color:var(--text-3);font-size:13px;">Clica num dia para escolher a data de início.</p>';
    if (btn) btn.disabled = true;
  } else if (!calEnd) {
    summary.innerHTML = `<p style="color:var(--text-2);font-size:13px;">Início: <strong>${formatDate(calStart)}</strong> &nbsp;— agora clica na data de fim.</p>`;
    if (btn) btn.disabled = true;
  } else {
    const days  = Math.round((new Date(calEnd) - new Date(calStart)) / 86400000);
    const l     = listings.find(x => x.id === currentDetailId);
    const total = days * (+l?.price || 0);
    summary.innerHTML = `
      <div class="cal-summary-box">
        <span>📅 ${formatDate(calStart)} → ${formatDate(calEnd)}</span>
        <span><strong>${days} dia${days>1?'s':''}</strong> &nbsp;·&nbsp; <strong style="color:var(--accent)">${total.toFixed(2)}€</strong></span>
      </div>`;
    if (btn) btn.disabled = false;
  }
}

function confirmReservation() {
  if (!calStart || !calEnd || !currentUser) return;
  const reservations = lsParse(LS.RESERVATIONS) || [];
  reservations.push({
    id:        'r_' + Date.now(),
    listingId: currentDetailId,
    userId:    currentUser.id,
    startDate: calStart,
    endDate:   calEnd,
  });
  lsSave(LS.RESERVATIONS, reservations);
  closeModal('calendar-overlay');
  const l = listings.find(x => x.id === currentDetailId);
  showToast(`✅ Reserva confirmada para "${l?.title || 'anúncio'}"!`);
  calStart = null; calEnd = null;
}

/* ════════════════════════════════════════════════════════════
   PERFIL
════════════════════════════════════════════════════════════ */
function renderProfile() {
  if (!currentUser) return;
  const mine = listings.filter(l => l.userId === currentUser.id);

  setText('p-avatar',      currentUser.name[0].toUpperCase());
  setText('p-name',        currentUser.name);
  setText('p-sub',         '📍 ' + currentUser.region + '  ·  Membro RentUp');
  setText('ps-listings',   mine.length.toString());

  const emailEl = document.getElementById('p-email-display');
  if (emailEl) emailEl.value = currentUser.email;

  const listEl = document.getElementById('my-listings-list');
  if (!listEl) return;

  if (!mine.length) {
    listEl.innerHTML = `
      <div class="empty-state" style="padding:36px 0;">
        <div class="ico">📦</div>
        <h3>Ainda sem anúncios</h3>
        <p>Publica o teu primeiro objeto e começa a ganhar!</p>
      </div>`;
    return;
  }

  listEl.innerHTML = mine.map(l => {
    const emoji = EMOJI[l.category] || '📦';
    const thumb = l.photo
      ? `<img src="${l.photo}" alt="${escHtml(l.title)}">`
      : emoji;
    return `
      <div class="my-listing-row">
        <div class="my-listing-thumb" onclick="openDetail('${l.id}')">${thumb}</div>
        <div class="my-listing-info" onclick="openDetail('${l.id}')">
          <div class="my-listing-name">${escHtml(l.title)}</div>
          <div class="my-listing-price">${(+l.price).toFixed(2)}€ / dia</div>
          <div class="my-listing-region">📍 ${escHtml(l.region)}</div>
        </div>
        <button class="del-btn" onclick="deleteListing('${l.id}')">🗑 Eliminar</button>
      </div>`;
  }).join('');

  /* ── Favoritos ── */
  const favEl = document.getElementById('my-favorites-list');
  if (!favEl) return;
  const favs    = lsParse(LS.FAVORITES) || {};
  const favIds  = favs[currentUser.id]  || [];
  const favList = listings.filter(l => favIds.includes(l.id));

  if (!favList.length) {
    favEl.innerHTML = `
      <div class="empty-state" style="padding:28px 0;">
        <div class="ico">🤍</div>
        <h3>Ainda sem favoritos</h3>
        <p>Clica no coração num anúncio para o guardar aqui.</p>
      </div>`;
    return;
  }

  favEl.innerHTML = favList.map(l => {
    const emoji = EMOJI[l.category] || '📦';
    const thumb = l.photo
      ? `<img src="${l.photo}" alt="${escHtml(l.title)}">`
      : emoji;
    return `
      <div class="my-listing-row">
        <div class="my-listing-thumb" onclick="openDetail('${l.id}')">${thumb}</div>
        <div class="my-listing-info" onclick="openDetail('${l.id}')">
          <div class="my-listing-name">${escHtml(l.title)}</div>
          <div class="my-listing-price">${(+l.price).toFixed(2)}€ / dia</div>
          <div class="my-listing-region">📍 ${escHtml(l.region)}</div>
        </div>
        <button class="del-btn" style="background:#fee2e2;color:#c53030;"
                onclick="removeFav('${l.id}')">🤍 Remover</button>
      </div>`;
  }).join('');
}

function deleteListing(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;
  if (!confirm('Tens a certeza que queres eliminar "' + l.title + '"?\nEsta ação não pode ser desfeita.')) return;
  listings = listings.filter(x => x.id !== id);
  lsSave(LS.LISTINGS, listings);
  renderProfile();
  showToast('🗑️ Anúncio eliminado com sucesso.');
}

function removeFav(listingId) {
  if (!currentUser) return;
  const favs     = lsParse(LS.FAVORITES) || {};
  const userFavs = (favs[currentUser.id] || []).filter(id => id !== listingId);
  favs[currentUser.id] = userFavs;
  lsSave(LS.FAVORITES, favs);
  renderProfile();
  showToast('🤍 Removido dos favoritos.');
}

/* ════════════════════════════════════════════════════════════
   MODAIS
════════════════════════════════════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

/* Fechar ao clicar no fundo do overlay */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
/* Fechar com Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
  }
});

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ════════════════════════════════════════════════════════════
   UTILITÁRIOS
════════════════════════════════════════════════════════════ */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ════════════════════════════════════════════════════════════
   BOOT — ponto de entrada
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Restore dark mode preference */
  const savedTheme = localStorage.getItem(LS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  seedIfEmpty();
  gotoPage('home');
  syncDarkToggles();
});