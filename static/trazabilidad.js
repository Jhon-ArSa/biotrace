/* ===== TRAZABILIDAD FORESTAL — Frontend JS ===== */

let currentUser = null;
let allTrozos = [];
let allPedidos = [];

// ─── DEMO LOGIN ────────────────────────────────────────────
function fillDemo(email, pass) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = pass;
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  const res = await api('/api/traz/login', { method: 'POST', body: { email, password } });
  if (res.success) {
    currentUser = res.usuario;
    showDashboard(currentUser.rol);
  } else {
    errEl.textContent = res.error || 'Credenciales incorrectas';
    errEl.classList.remove('hidden');
  }
});

function showDashboard(rol) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (rol === 'titular') {
    document.getElementById('screen-titular').classList.add('active');
    document.getElementById('titular-nombre').textContent = currentUser.nombre;
    loadTrozos();
    loadStats();
  } else if (rol === 'chofer') {
    document.getElementById('screen-chofer').classList.add('active');
    document.getElementById('chofer-nombre').textContent = currentUser.nombre;
    document.getElementById('chofer-nombre2').textContent = currentUser.nombre;
    document.getElementById('chofer-placa').textContent = currentUser.placa || '—';
    document.getElementById('chofer-dni').textContent = currentUser.dni || '—';
    document.getElementById('chofer-empresa').textContent = currentUser.empresa || '—';
    loadGuias();
  } else if (rol === 'centro_transformacion') {
    document.getElementById('screen-centro').classList.add('active');
    document.getElementById('centro-nombre').textContent = currentUser.nombre;
    loadPedidos();
  }
}

function logout() {
  currentUser = null;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-login').classList.add('active');
}

// ─── NAV TABS ──────────────────────────────────────────────
function titularTab(tab) {
  setTab('titular', tab, ['censo','trozos','stats']);
  if (tab === 'trozos') loadTrozos();
  if (tab === 'stats') loadStats();
}
function choferTab(tab) {
  setTab('chofer', tab, ['registro','guias','escanear']);
  if (tab === 'guias') loadGuias();
}
function centroTab(tab) {
  setTab('centro', tab, ['verificar','pedidos','subir']);
  if (tab === 'pedidos') loadPedidos();
}
function setTab(role, tab, allTabs) {
  allTabs.forEach(t => {
    document.getElementById(`tab-${role}-${t}`).classList.remove('active');
    const btn = document.getElementById(`nav-${role}-${t}`);
    if (btn) btn.classList.remove('active');
  });
  document.getElementById(`tab-${role}-${tab}`).classList.add('active');
  const activeBtn = document.getElementById(`nav-${role}-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// ─── FOTO PREVIEW ──────────────────────────────────────────
function previewFoto(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const el = document.getElementById(previewId);
    el.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
}

function previewChoferFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('chofer-avatar').innerHTML = `<img src="${e.target.result}" alt="Foto" />`;
  };
  reader.readAsDataURL(file);
}

// ─── TITULAR: CENSO ────────────────────────────────────────
document.getElementById('form-censo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('censo-error');
  errEl.classList.add('hidden');

  const formData = new FormData();
  formData.append('titular_id', currentUser.id);
  formData.append('numero_parcela', document.getElementById('censo-parcela').value);
  formData.append('especie', document.getElementById('censo-especie').value);
  formData.append('nombre_cientifico', document.getElementById('censo-cientifico').value);
  formData.append('dap_cm', document.getElementById('censo-dap').value);
  formData.append('longitud_troza', document.getElementById('censo-longitud').value);
  formData.append('volumen_m3', document.getElementById('censo-volumen').value);
  formData.append('latitud', document.getElementById('censo-lat').value || '0');
  formData.append('longitud', document.getElementById('censo-lon').value || '0');
  formData.append('plan_manejo', document.getElementById('censo-plan').value);
  formData.append('observaciones', document.getElementById('censo-obs').value);

  const fileCorte = document.getElementById('file-corte').files[0];
  const fileTroza = document.getElementById('file-troza').files[0];
  if (fileCorte) formData.append('foto_corte', fileCorte);
  if (fileTroza) formData.append('foto_troza', fileTroza);

  const res = await apiFetch('/api/traz/censo', { method: 'POST', body: formData });
  if (res.success) {
    mostrarModalQR(res.trozo);
    document.getElementById('form-censo').reset();
    document.getElementById('prev-corte').innerHTML = `<div class="foto-placeholder"><span class="foto-icon">📷</span><p>Foto del corte<br><strong>transversal</strong></p></div>`;
    document.getElementById('prev-troza').innerHTML = `<div class="foto-placeholder"><span class="foto-icon">🪵</span><p>Foto de la<br><strong>troza completa</strong></p></div>`;
  } else {
    errEl.textContent = res.error || 'Error al registrar';
    errEl.classList.remove('hidden');
  }
});

function obtenerGPS() {
  if (!navigator.geolocation) return alert('GPS no disponible');
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('censo-lat').value = pos.coords.latitude.toFixed(6);
    document.getElementById('censo-lon').value = pos.coords.longitude.toFixed(6);
  });
}

// ─── TITULAR: TROZOS ───────────────────────────────────────
async function loadTrozos() {
  const container = document.getElementById('trozos-list');
  container.innerHTML = '<div class="loading-spinner">⏳ Cargando...</div>';
  const res = await api(`/api/traz/trozos/${currentUser.id}`);
  if (!res.success) { container.innerHTML = '<div class="loading-spinner">Error al cargar</div>'; return; }
  allTrozos = res.trozos;
  renderTrozos(allTrozos, container);
}

function renderTrozos(trozos, container) {
  if (!trozos.length) { container.innerHTML = '<div class="loading-spinner">No hay trozos registrados aún.</div>'; return; }
  container.innerHTML = trozos.map(t => `
    <div class="trozo-card">
      <div class="card-header-row">
        <span class="card-code">${t.codigo_unico_trozo}</span>
        <span class="status-badge status-${t.estado}">${t.estado.replace('_',' ')}</span>
      </div>
      <div class="card-especie">${t.especie}</div>
      <div class="card-cientifico">${t.nombre_cientifico || ''}</div>
      <div class="card-meta">
        <span class="meta-chip">📍 Parcela ${t.numero_parcela}</span>
        <span class="meta-chip">📏 DAP ${t.dap_cm} cm</span>
        ${t.volumen_m3 ? `<span class="meta-chip">📦 ${t.volumen_m3} m³</span>` : ''}
        <span class="meta-chip">🗓 ${t.fecha_hora ? t.fecha_hora.substring(0,10) : ''}</span>
      </div>
      <button class="card-qr-btn" onclick="mostrarModalQRDesdeCard(${t.id})">📱 Ver / Mostrar QR</button>
    </div>
  `).join('');
}

// ─── STATS ─────────────────────────────────────────────────
async function loadStats() {
  const container = document.getElementById('stats-grid');
  const res = await api('/api/traz/stats');
  if (!res.success) return;
  const s = res.stats;
  container.innerHTML = `
    <div class="stat-card"><div class="stat-icon">🪵</div><div class="stat-value">${s.total_trozos}</div><div class="stat-label">Trozos Registrados</div></div>
    <div class="stat-card"><div class="stat-icon">🚛</div><div class="stat-value">${s.en_transito}</div><div class="stat-label">En Tránsito</div></div>
    <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">${s.verificados}</div><div class="stat-label">Verificados</div></div>
    <div class="stat-card"><div class="stat-icon">🏭</div><div class="stat-value">${s.aprobados}</div><div class="stat-label">Aprobados</div></div>
    <div class="stat-card"><div class="stat-icon">🌳</div><div class="stat-value">${s.total_arboles}</div><div class="stat-label">Árboles en OSINFOR</div></div>
    <div class="stat-card"><div class="stat-icon">🗺️</div><div class="stat-value">${s.total_planes}</div><div class="stat-label">Planes Vigentes</div></div>
  `;
}

// ─── CHOFER: GUÍAS ─────────────────────────────────────────
document.getElementById('form-guia').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('guia-error');
  errEl.classList.add('hidden');
  const res = await api('/api/traz/guia', {
    method: 'POST',
    body: {
      chofer_id: currentUser.id,
      codigo_trozo: document.getElementById('guia-codigo').value,
      placa: currentUser.placa || 'S/P',
      origen: document.getElementById('guia-origen').value,
      destino: document.getElementById('guia-destino').value,
      observaciones: document.getElementById('guia-obs').value
    }
  });
  if (res.success) {
    alert(`✅ Guía generada: ${res.numero_guia}`);
    document.getElementById('form-guia').reset();
  } else {
    errEl.textContent = res.error || 'Error al generar guía';
    errEl.classList.remove('hidden');
  }
});

async function loadGuias() {
  const container = document.getElementById('guias-list');
  container.innerHTML = '<div class="loading-spinner">⏳ Cargando...</div>';
  const res = await api(`/api/traz/guias/${currentUser.id}`);
  if (!res.success) { container.innerHTML = '<div class="loading-spinner">Error al cargar</div>'; return; }
  const guias = res.guias;
  if (!guias.length) { container.innerHTML = '<div class="loading-spinner">No hay guías registradas.</div>'; return; }
  container.innerHTML = guias.map(g => `
    <div class="trozo-card guia-card">
      <div class="card-header-row">
        <span class="card-code">${g.numero_guia}</span>
        <span class="status-badge status-${g.estado === 'EN_RUTA' ? 'EN_TRANSITO' : g.estado || 'REGISTRADO'}">${g.estado || 'PENDIENTE'}</span>
      </div>
      <div class="card-especie">${g.especie}</div>
      <div class="card-meta">
        <span class="meta-chip">🪵 ${g.codigo_unico_trozo}</span>
        <span class="meta-chip">📍 ${g.origen} → ${g.destino}</span>
        <span class="meta-chip">👤 ${g.titular_nombre}</span>
      </div>
    </div>
  `).join('');
}

// ─── CHOFER/CENTRO: BUSCAR TROZO ───────────────────────────
async function buscarTrozo() {
  const codigo = document.getElementById('scan-codigo').value.trim();
  if (!codigo) return alert('Ingrese un código');
  const res = await api(`/api/traz/trozo/${encodeURIComponent(codigo)}`);
  const container = document.getElementById('scan-result');
  if (!res.success || !res.trozo) {
    container.innerHTML = renderResult({ valido: false, motivo: 'Trozo no encontrado' }, null);
    return;
  }
  const t = res.trozo;
  container.innerHTML = renderTrozoInfo(t);
}

function renderTrozoInfo(t) {
  return `
    <div class="trozo-card" style="margin-top:16px">
      <div class="card-code">${t.codigo_unico_trozo}</div>
      <div class="card-especie">${t.especie}</div>
      <div class="card-cientifico">${t.nombre_cientifico || ''}</div>
      <div class="card-meta">
        <span class="meta-chip">📍 Parcela ${t.numero_parcela}</span>
        <span class="meta-chip">📏 DAP ${t.dap_cm} cm</span>
        <span class="meta-chip">👤 ${t.titular_nombre}</span>
        <span class="meta-chip">📋 ${t.plan_manejo_referencia || 'Sin plan'}</span>
      </div>
    </div>`;
}

// ─── CENTRO: VERIFICAR QR ──────────────────────────────────
async function verificarQR() {
  const codigo = document.getElementById('centro-codigo').value.trim();
  if (!codigo) return alert('Ingrese el código del trozo');
  const res = await api(`/api/traz/verificar/${encodeURIComponent(codigo)}`);
  const container = document.getElementById('verify-result');
  container.classList.remove('hidden');
  if (!res.success) {
    container.innerHTML = renderResult({ valido: false, motivo: res.error || 'Error al verificar' }, null);
    return;
  }
  container.innerHTML = renderResult(res.verificacion, res.verificacion.trozo);
  // Animate bar
  setTimeout(() => {
    const bar = container.querySelector('.similitud-fill');
    if (bar) bar.style.width = (res.verificacion.similitud_porcentaje || 0) + '%';
  }, 100);
}

function renderResult(v, trozo) {
  const ok = v.valido;
  const pct = v.similitud_porcentaje || 0;
  return `
    <div class="verify-result ${ok ? 'result-approved' : 'result-rejected'}">
      <div class="result-header">
        <span class="result-icon">${ok ? '✅' : '❌'}</span>
        <div>
          <div class="result-title">${ok ? 'MADERA LEGAL' : 'NO VERIFICADO'}</div>
          <div class="result-subtitle">${v.motivo}</div>
        </div>
      </div>
      <div class="result-body">
        ${trozo ? `
          <div class="result-row"><span class="result-key">Código:</span><span class="result-val">${trozo.codigo_unico_trozo}</span></div>
          <div class="result-row"><span class="result-key">Especie:</span><span class="result-val">${trozo.especie}</span></div>
          <div class="result-row"><span class="result-key">Parcela:</span><span class="result-val">${trozo.numero_parcela}</span></div>
          <div class="result-row"><span class="result-key">DAP:</span><span class="result-val">${trozo.dap_cm} cm</span></div>
          <div class="result-row"><span class="result-key">Volumen:</span><span class="result-val">${trozo.volumen_m3 || '—'} m³</span></div>
          <div class="result-row"><span class="result-key">Titular:</span><span class="result-val">${trozo.titular_nombre || '—'}</span></div>
          <div class="result-row"><span class="result-key">Plan de Manejo:</span><span class="result-val">${trozo.plan_manejo_referencia || '—'}</span></div>
          <div class="result-row"><span class="result-key">GPS:</span><span class="result-val">${trozo.coordenadas_gps || '—'}</span></div>
        ` : ''}
        ${ok ? `
          <div class="result-row">
            <span class="result-key">Coincidencia legal:</span>
            <span class="result-val">${pct}%</span>
          </div>
          <div class="similitud-bar"><div class="similitud-fill" style="width:0%"></div></div>
        ` : ''}
      </div>
    </div>`;
}

// ─── CENTRO: PEDIDOS ───────────────────────────────────────
async function loadPedidos() {
  const container = document.getElementById('pedidos-list');
  container.innerHTML = '<div class="loading-spinner">⏳ Cargando...</div>';
  const res = await api(`/api/traz/pedidos/${currentUser.id}`);
  if (!res.success) { container.innerHTML = '<div class="loading-spinner">Error al cargar</div>'; return; }
  allPedidos = res.pedidos;
  renderPedidos(allPedidos);
}

function renderPedidos(pedidos) {
  const container = document.getElementById('pedidos-list');
  if (!pedidos.length) { container.innerHTML = '<div class="loading-spinner">No hay pedidos registrados.</div>'; return; }
  container.innerHTML = pedidos.map(p => {
    const ok = p.resultado_verificacion === 'APROBADO';
    return `
      <div class="trozo-card" style="border-left-color:${ok ? 'var(--green-main)' : 'var(--red)'}">
        <div class="card-header-row">
          <span class="card-code">${p.codigo_unico_trozo}</span>
          <span class="status-badge" style="background:${ok?'#dcfce7':'#ffe4e6'};color:${ok?'#166534':'#991b1b'}">${p.resultado_verificacion}</span>
        </div>
        <div class="card-especie">${p.especie}</div>
        <div class="card-meta">
          <span class="meta-chip">📍 Parcela ${p.numero_parcela}</span>
          <span class="meta-chip">📊 ${p.similitud_porcentaje || 0}% coincidencia</span>
          <span class="meta-chip">👤 ${p.titular_nombre}</span>
          <span class="meta-chip">🗓 ${p.fecha_recepcion ? p.fecha_recepcion.substring(0,10) : ''}</span>
        </div>
      </div>`;
  }).join('');
}

function filtrarPedidos() {
  const q = document.getElementById('pedidos-search').value.toLowerCase();
  const filtrados = allPedidos.filter(p =>
    p.especie.toLowerCase().includes(q) ||
    p.codigo_unico_trozo.toLowerCase().includes(q) ||
    (p.titular_nombre || '').toLowerCase().includes(q)
  );
  renderPedidos(filtrados);
}

// ─── CENTRO: REGISTRAR CORTEZA ─────────────────────────────
async function registrarCorteza() {
  const codigo = document.getElementById('corteza-codigo').value.trim();
  const obs = document.getElementById('corteza-obs').value;
  const errEl = document.getElementById('corteza-error');
  const resEl = document.getElementById('corteza-result');
  errEl.classList.add('hidden');
  resEl.classList.add('hidden');

  if (!codigo) { errEl.textContent = 'Ingrese el código del trozo'; errEl.classList.remove('hidden'); return; }

  const formData = new FormData();
  formData.append('centro_id', currentUser.id);
  formData.append('codigo_trozo', codigo);
  formData.append('observaciones', obs);
  const fileCorteza = document.getElementById('file-corteza').files[0];
  if (fileCorteza) formData.append('foto_corteza', fileCorteza);

  const res = await apiFetch('/api/traz/recepcion', { method: 'POST', body: formData });
  if (res.success) {
    resEl.classList.remove('hidden');
    resEl.innerHTML = renderResult(res.verificacion, res.verificacion.trozo);
    setTimeout(() => {
      const bar = resEl.querySelector('.similitud-fill');
      if (bar) bar.style.width = (res.verificacion.similitud_porcentaje || 0) + '%';
    }, 100);
  } else {
    errEl.textContent = res.error || 'Error al registrar';
    errEl.classList.remove('hidden');
  }
}

// ─── QR MODAL ──────────────────────────────────────────────
let currentQRData = null;

function mostrarModalQR(trozo) {
  currentQRData = trozo;
  const qrText = JSON.stringify({
    codigo: trozo.codigo_unico_trozo,
    especie: trozo.especie,
    parcela: trozo.numero_parcela,
    dap: trozo.dap_cm,
    volumen: trozo.volumen_m3,
    lat: trozo.latitud,
    lon: trozo.longitud,
    plan: trozo.plan_manejo_referencia,
    fecha: trozo.fecha_hora
  });

  const container = document.getElementById('qr-image-container');
  container.innerHTML = '';
  new QRCode(container, { text: qrText, width: 200, height: 200, colorDark: '#0d3b2e' });

  document.getElementById('qr-data-container').innerHTML = `
    <div class="qr-data-row"><span class="qr-data-key">Código:</span><span class="qr-data-val">${trozo.codigo_unico_trozo}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Especie:</span><span class="qr-data-val">${trozo.especie}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Parcela:</span><span class="qr-data-val">${trozo.numero_parcela}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">DAP:</span><span class="qr-data-val">${trozo.dap_cm} cm</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Volumen:</span><span class="qr-data-val">${trozo.volumen_m3 || '—'} m³</span></div>
    <div class="qr-data-row"><span class="qr-data-key">GPS:</span><span class="qr-data-val">${trozo.coordenadas_gps || '—'}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Plan:</span><span class="qr-data-val">${trozo.plan_manejo_referencia || '—'}</span></div>
    <div class="qr-data-row"><span class="qr-data-key">Fecha:</span><span class="qr-data-val">${(trozo.fecha_hora || '').substring(0,10)}</span></div>
  `;
  document.getElementById('modal-qr').classList.remove('hidden');
}

async function mostrarModalQRDesdeCard(trozoId) {
  const res = await api(`/api/traz/trozo-by-id/${trozoId}`);
  if (res.success && res.trozo) mostrarModalQR(res.trozo);
}

function cerrarModalQR() {
  document.getElementById('modal-qr').classList.add('hidden');
  document.getElementById('qr-image-container').innerHTML = '';
}

function descargarQR() {
  const canvas = document.querySelector('#qr-image-container canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `QR-${currentQRData?.codigo_unico_trozo || 'trozo'}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// ─── API HELPERS ───────────────────────────────────────────
async function api(url, opts = {}) {
  try {
    const fetchOpts = { method: opts.method || 'GET', headers: {} };
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      fetchOpts.headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(opts.body);
    } else if (opts.body) {
      fetchOpts.body = opts.body;
    }
    const r = await fetch(url, fetchOpts);
    return await r.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function apiFetch(url, opts = {}) {
  return api(url, opts);
}
