/* ============================================================
   Sistema Notarial — app.js  (versión Java + MySQL)
   Todos los datos ahora provienen de la API REST en /api/...
   ============================================================ */

'use strict';

/* ── URL base de la API ──────────────────────────────────── */
const API = '';   // Vacío = mismo origen (Spring Boot sirve el HTML)

/* ── Utilidades de DOM ───────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ── Navegación entre pantallas ──────────────────────────── */
function showScreen(id, btn) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $$('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  btn.classList.add('active');

  // Recargar datos al cambiar de pantalla
  if (id === 'boletas')    cargarBoletas();
  if (id === 'escrituras') cargarEscrituras();
  if (id === 'usuarios')   cargarUsuarios();
}

/* ── Modales ─────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    $$('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ── Toast ───────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, type = '') {
  const t = $('#toast');
  const icon = type === 'success'
    ? 'ti-circle-check'
    : type === 'error'
      ? 'ti-alert-circle'
      : 'ti-info-circle';
  t.innerHTML = `<i class="ti ${icon}" aria-hidden="true"></i>${msg}`;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

/* ── Badges de estado ───────────────────────────────────── */
function badgeEstado(estado) {
  const map = {
    'Validado por Notario': 'badge-green',
    'Escaneado':            'badge-blue',
    'Devuelto':             'badge-red',
    'Liquidado':            'badge-amber',
    'Pagado':               'badge-green',
    'Activo':               'badge-green',
    'Inactivo':             'badge-red',
  };
  const cls = map[estado] || 'badge-gray';
  return `<span class="badge ${cls}">${estado}</span>`;
}

/* ── Fetch helper con manejo de errores ─────────────────── */
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(API + url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  } catch (e) {
    showToast(e.message || 'Error de conexión con el servidor', 'error');
    throw e;
  }
}

/* ══════════════════════════════════════════════════════════
   MÓDULO: BOLETAS
   ══════════════════════════════════════════════════════════ */

async function cargarBoletas() {
  try {
    const boletas = await apiFetch('/api/boletas');
    renderBoletas(boletas);
    await cargarResumenBoletas();
  } catch (e) { /* ya mostrado en apiFetch */ }
}

async function cargarResumenBoletas() {
  try {
    const resumen = await apiFetch('/api/boletas/resumen');
    // Actualizar tarjetas de stats
    const cards = $$('.stat-card .stat-number');
    if (cards.length >= 3) {
      cards[0].textContent = resumen.total;
      cards[1].textContent = resumen.porVencer;
      // Formatear como moneda colombiana
      cards[2].textContent = '$' + resumen.totalPendiente
        .toLocaleString('es-CO', { maximumFractionDigits: 0 });
    }
  } catch (e) { /* silencioso */ }
}

function renderBoletas(data) {
  const tbody = $('#tbody-boletas');
  if (!data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <i class="ti ti-inbox" aria-hidden="true"></i>
      No hay boletas registradas.
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(b => {
    const isPagado = b.estado === 'Pagado';
    const fecha = b.fechaLiquidacion
      ? new Date(b.fechaLiquidacion + 'T00:00:00').toLocaleDateString('es-CO', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
      : '—';
    const valor = b.valor
      ? '$' + Number(b.valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })
      : '—';
    const accion = isPagado
      ? `<span style="font-size:12px;color:var(--text-hint)">— Pagado</span>`
      : `<button class="btn-pse" onclick="pagarBoleta(${b.id})">Pagar en línea (PSE)</button>`;

    return `<tr>
      <td>${b.numEscritura}</td>
      <td>${fecha}</td>
      <td>${valor}</td>
      <td>${badgeEstado(b.estado)}</td>
      <td>
        <div class="action-row">
          <div class="icon-btn" title="Descargar PDF" aria-label="Descargar PDF">
            <i class="ti ti-file-type-pdf" aria-hidden="true"></i>
          </div>
          ${accion}
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function buscarBoletas() {
  const q = $('#f-boleta').value.trim();
  if (!q) {
    showToast('Ingresa al menos un criterio de búsqueda', 'error');
    return;
  }
  try {
    const resultado = await apiFetch(`/api/boletas?q=${encodeURIComponent(q)}`);

    const body = $('#boletas-result-body');
    if (!resultado || !resultado.length) {
      body.innerHTML = `<div class="empty-state">
        <i class="ti ti-file-off" aria-hidden="true"></i>
        No se encontraron boletas con ese criterio.
      </div>`;
    } else {
      body.innerHTML = `
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
          <strong>${resultado.length}</strong> resultado(s) encontrado(s)
        </p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>No. Escritura</th><th>Fecha</th><th>Valor</th><th>Estado</th></tr></thead>
            <tbody>
              ${resultado.map(b => {
                const fecha = b.fechaLiquidacion
                  ? new Date(b.fechaLiquidacion + 'T00:00:00').toLocaleDateString('es-CO')
                  : '—';
                const valor = b.valor
                  ? '$' + Number(b.valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })
                  : '—';
                return `<tr>
                  <td>${b.numEscritura}</td>
                  <td>${fecha}</td>
                  <td>${valor}</td>
                  <td>${badgeEstado(b.estado)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
    }
    openModal('modal-boletas-result');
  } catch (e) { /* ya manejado */ }
}

function limpiarBoletas() {
  $('#f-boleta').value = '';
  $('#f-fecha').value  = '';
  cargarBoletas();
  showToast('Filtros limpiados');
}

async function pagarBoleta(id) {
  try {
    await apiFetch(`/api/boletas/${id}/pagar`, { method: 'PUT' });
    showToast('Boleta marcada como pagada', 'success');
    cargarBoletas();
  } catch (e) { /* ya manejado */ }
}

/* ══════════════════════════════════════════════════════════
   MÓDULO: ESCRITURAS
   ══════════════════════════════════════════════════════════ */

async function cargarEscrituras() {
  try {
    const escrituras = await apiFetch('/api/escrituras');
    renderEscrituras(escrituras);
  } catch (e) { /* ya manejado */ }
}

function renderEscrituras(data) {
  const tbody = $('#tbody-escrituras');
  if (!data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <i class="ti ti-file-search" aria-hidden="true"></i>
      No se encontraron escrituras con esos criterios.
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(e => `<tr>
    <td>${e.numero}</td>
    <td>${e.acto}</td>
    <td>${e.protocolista}</td>
    <td>${badgeEstado(e.estado)}</td>
    <td>
      <div class="icon-btn" title="Vista previa del documento" aria-label="Vista previa">
        <i class="ti ti-eye" aria-hidden="true"></i>
      </div>
    </td>
  </tr>`).join('');
}

async function buscarEscrituras() {
  const numero = $('#s-num').value.trim();
  const anio   = $('#s-anio').value.trim();
  const proto  = $('#s-proto').value.trim();
  const cedula = $('#s-cedula').value.trim();

  if (!numero && !anio && !proto && !cedula) {
    showToast('Ingresa al menos un criterio de búsqueda', 'error');
    return;
  }

  try {
    const params = new URLSearchParams();
    if (numero) params.set('numero', numero);
    if (anio)   params.set('anio',   anio);
    if (proto)  params.set('proto',  proto);
    if (cedula) params.set('cedula', cedula);

    const resultado = await apiFetch(`/api/escrituras/buscar?${params}`);
    renderEscrituras(resultado);

    if (!resultado || !resultado.length) {
      showToast('Sin resultados. Ajusta los filtros.', 'error');
    } else {
      showToast(`Se encontraron ${resultado.length} escritura(s)`, 'success');
    }
  } catch (e) { /* ya manejado */ }
}

function abrirModalEscritura() {
  ['e-acto', 'e-proto', 'e-comprador', 'e-vendedor', 'e-obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  $('#e-num').value   = '(Autogenerado)';
  $('#e-fecha').value = new Date().toISOString().slice(0, 10);
  $('#e-error').style.display = 'none';
  openModal('modal-escritura');
}

async function radicarEscritura() {
  const acto   = $('#e-acto').value;
  const proto  = $('#e-proto').value;
  const errEl  = $('#e-error');

  if (!acto || !proto) {
    errEl.textContent   = 'El tipo de acto y el protocolista son obligatorios.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';

  const payload = {
    acto,
    protocolista:  proto,
    cedComprador:  $('#e-comprador').value || null,
    cedVendedor:   $('#e-vendedor').value  || null,
    observaciones: $('#e-obs').value       || null,
    fechaRadicacion: $('#e-fecha').value,
  };

  try {
    const nueva = await apiFetch('/api/escrituras', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    closeModal('modal-escritura');
    showToast(`Escritura ${nueva.numero} radicada exitosamente`, 'success');
    cargarEscrituras();
  } catch (e) {
    errEl.textContent   = e.message || 'Error al radicar la escritura.';
    errEl.style.display = 'block';
  }
}

/* ══════════════════════════════════════════════════════════
   MÓDULO: USUARIOS
   ══════════════════════════════════════════════════════════ */

const AVATAR_COLORS = [
  { bg: '#E6F1FB', tx: '#0C447C' },
  { bg: '#EAF3DE', tx: '#3B6D11' },
  { bg: '#FAEEDA', tx: '#633806' },
  { bg: '#F1EFE8', tx: '#5F5E5A' },
];

async function cargarUsuarios() {
  try {
    const usuarios = await apiFetch('/api/usuarios');
    renderUsuarios(usuarios);
  } catch (e) { /* ya manejado */ }
}

function renderUsuarios(usuarios) {
  const tbody = $('#tbody-usuarios');
  tbody.innerHTML = usuarios.map((u, i) => {
    const colores    = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const iniciales  = u.iniciales || ((u.nombres?.[0] || '') + (u.apellidos?.[0] || '')).toUpperCase();
    const nombreCompleto = u.nombreCompleto || `${u.nombres} ${u.apellidos}`;

    const rolBadge = u.rol === 'Notario'
      ? `<span class="badge badge-blue">${u.rol}</span>`
      : `<span class="badge badge-gray">${u.rol}</span>`;

    const estadoBadge = u.activo ? badgeEstado('Activo') : badgeEstado('Inactivo');

    const accionBtn = u.activo
      ? `<button class="btn btn-danger" onclick="toggleUsuario(${u.id})">
           <i class="ti ti-user-off" aria-hidden="true"></i>Desactivar
         </button>`
      : `<button class="btn btn-success" onclick="toggleUsuario(${u.id})">
           <i class="ti ti-user-check" aria-hidden="true"></i>Activar
         </button>`;

    const editBtn   = `<button class="icon-btn" title="Editar" onclick="abrirEdicion(${u.id})" aria-label="Editar usuario">
                         <i class="ti ti-pencil" aria-hidden="true"></i>
                       </button>`;
    const deleteBtn = `<button class="icon-btn" title="Eliminar" onclick="confirmarEliminar(${u.id}, '${nombreCompleto.replace(/'/g, "\\'")}')"
                              aria-label="Eliminar usuario" style="color:#dc2626">
                         <i class="ti ti-trash" aria-hidden="true"></i>
                       </button>`;

    return `<tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar" style="background:${colores.bg};color:${colores.tx}">${iniciales}</div>
          ${nombreCompleto}
        </div>
      </td>
      <td style="color:var(--text-secondary)">${u.correo}</td>
      <td>${rolBadge}</td>
      <td>${estadoBadge}</td>
      <td>
        <div class="action-row">
          ${editBtn}
          ${deleteBtn}
          ${accionBtn}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function abrirModalUsuario() {
  ['u-nombres', 'u-apellidos', 'u-correo', 'u-rol'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  $('#u-error').style.display = 'none';
  openModal('modal-usuario');
}

async function crearUsuario() {
  const nombres   = $('#u-nombres').value.trim();
  const apellidos = $('#u-apellidos').value.trim();
  const correo    = $('#u-correo').value.trim();
  const rol       = $('#u-rol').value;
  const errEl     = $('#u-error');

  if (!nombres || !apellidos || !correo || !rol) {
    errEl.textContent   = 'Todos los campos son obligatorios.';
    errEl.style.display = 'block';
    return;
  }
  if (!correo.includes('@')) {
    errEl.textContent   = 'Ingresa un correo electrónico válido.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';

  try {
    await apiFetch('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify({ nombres, apellidos, correo, rol }),
    });
    closeModal('modal-usuario');
    showToast(`${nombres} ${apellidos} creado correctamente`, 'success');
    cargarUsuarios();
  } catch (e) {
    errEl.textContent   = e.message || 'Error al crear el usuario.';
    errEl.style.display = 'block';
  }
}

async function toggleUsuario(id) {
  try {
    const u      = await apiFetch(`/api/usuarios/${id}/toggle`, { method: 'PUT' });
    const nombre = u.nombreCompleto || `${u.nombres} ${u.apellidos}`;
    const accion = u.activo ? 'activado' : 'desactivado';
    showToast(`${nombre} ${accion}`, u.activo ? 'success' : '');
    cargarUsuarios();
  } catch (e) { /* ya manejado */ }
}

/* ── Editar usuario ──────────────────────────────────────── */
async function abrirEdicion(id) {
  try {
    const u = await apiFetch(`/api/usuarios/${id}`);
    $('#eu-id').value        = u.id;
    $('#eu-nombres').value   = u.nombres;
    $('#eu-apellidos').value = u.apellidos;
    $('#eu-correo').value    = u.correo;
    // Seleccionar el rol correcto en el <select>
    const rolVal = u.rol.replace(/ /g, '_');
    const opt = [...$$('#eu-rol option')].find(o => o.value === rolVal || o.textContent.trim() === u.rol);
    if (opt) opt.selected = true;
    $('#eu-error').style.display = 'none';
    openModal('modal-editar-usuario');
  } catch (e) { /* ya manejado */ }
}

async function guardarEdicion() {
  const id        = $('#eu-id').value;
  const nombres   = $('#eu-nombres').value.trim();
  const apellidos = $('#eu-apellidos').value.trim();
  const correo    = $('#eu-correo').value.trim();
  const rolSelect = $('#eu-rol');
  const rolVal    = rolSelect.value;
  const errEl     = $('#eu-error');

  if (!nombres || !apellidos || !correo || !rolVal) {
    errEl.textContent   = 'Todos los campos son obligatorios.';
    errEl.style.display = 'block';
    return;
  }
  if (!correo.includes('@')) {
    errEl.textContent   = 'Ingresa un correo electrónico válido.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';

  try {
    await apiFetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombres, apellidos, correo, rol: rolVal }),
    });
    closeModal('modal-editar-usuario');
    showToast(`${nombres} ${apellidos} actualizado correctamente`, 'success');
    cargarUsuarios();
  } catch (e) {
    errEl.textContent   = e.message || 'Error al actualizar el usuario.';
    errEl.style.display = 'block';
  }
}

/* ── Eliminar usuario ────────────────────────────────────── */
function confirmarEliminar(id, nombre) {
  $('#del-nombre-usuario').textContent = nombre;
  const btnConfirmar = $('#btn-confirmar-eliminar');
  // Reemplazar handler para capturar el id correcto
  const nuevoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);
  nuevoBtn.addEventListener('click', () => eliminarUsuario(id, nombre));
  openModal('modal-confirmar-eliminar');
}

async function eliminarUsuario(id, nombre) {
  try {
    await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    closeModal('modal-confirmar-eliminar');
    showToast(`${nombre} eliminado correctamente`, 'success');
    cargarUsuarios();
  } catch (e) { /* ya manejado */ }
}

/* ── Inicialización ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  cargarBoletas();
  cargarEscrituras();
  cargarUsuarios();
});
