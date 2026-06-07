/* ============================================================
   Sistema Notarial — app.js
   Módulos: Boletas, Escrituras, Usuarios
   ============================================================ */

'use strict';

/* ── Datos iniciales ─────────────────────────────────────── */

const BOLETAS_DATA = [
  { id: 'ESC-2025-0418', fecha: '10 Jul 2025', valor: '$1.240.000', estado: 'Liquidado' },
  { id: 'ESC-2025-0395', fecha: '05 Jul 2025', valor: '$890.000',   estado: 'Liquidado' },
  { id: 'ESC-2025-0372', fecha: '28 Jun 2025', valor: '$2.690.000', estado: 'Liquidado' },
  { id: 'ESC-2025-0351', fecha: '15 Jun 2025', valor: '$430.000',   estado: 'Pagado'    },
  { id: 'ESC-2025-0318', fecha: '01 Jun 2025', valor: '$760.000',   estado: 'Pagado'    },
];

const ESCRITURAS_DATA = [
  { num: 'ESC-2025-0418', acto: 'Compraventa',      proto: 'Juan Pérez',   estado: 'Validado por Notario', cedC: '10203040', cedV: '50607080' },
  { num: 'ESC-2025-0412', acto: 'Hipoteca',          proto: 'María Gómez',  estado: 'Escaneado',            cedC: '11223344', cedV: '55667788' },
  { num: 'ESC-2025-0407', acto: 'Sucesión',           proto: 'Carlos Ruiz',  estado: 'Devuelto',             cedC: '99887766', cedV: '44332211' },
  { num: 'ESC-2025-0401', acto: 'Poder especial',     proto: 'Ana Torres',   estado: 'Validado por Notario', cedC: '12345678', cedV: '87654321' },
  { num: 'ESC-2025-0398', acto: 'Constitución SAS',   proto: 'Juan Pérez',   estado: 'Escaneado',            cedC: '11112222', cedV: '33334444' },
  { num: 'ESC-2025-0385', acto: 'Compraventa',        proto: 'María Gómez',  estado: 'Devuelto',             cedC: '55556666', cedV: '77778888' },
];

const USUARIOS_DATA = [
  { nombres: 'Roberto Navarro', ini: 'RN', correo: 'r.navarro@notaria.co',  rol: 'Notario',            activo: true,  bgColor: '#E6F1FB', txColor: '#0C447C' },
  { nombres: 'Juan Pérez',      ini: 'JP', correo: 'j.perez@notaria.co',    rol: 'Protocolista',       activo: true,  bgColor: '#E6F1FB', txColor: '#0C447C' },
  { nombres: 'María Gómez',     ini: 'MG', correo: 'm.gomez@notaria.co',    rol: 'Liquidador',         activo: true,  bgColor: '#EAF3DE', txColor: '#3B6D11' },
  { nombres: 'Ana Torres',      ini: 'AT', correo: 'a.torres@notaria.co',   rol: 'Protocolista',       activo: true,  bgColor: '#E6F1FB', txColor: '#0C447C' },
  { nombres: 'Carlos Ruiz',     ini: 'CR', correo: 'c.ruiz@notaria.co',     rol: 'Operador de Escáner', activo: false, bgColor: '#F1EFE8', txColor: '#5F5E5A' },
];

/* ── Estado de la aplicación ─────────────────────────────── */
let boletas    = [...BOLETAS_DATA];
let escrituras = [...ESCRITURAS_DATA];
let usuarios   = [...USUARIOS_DATA];
let escCounter = 419;

const AVATAR_COLORS = [
  { bg: '#E6F1FB', tx: '#0C447C' },
  { bg: '#EAF3DE', tx: '#3B6D11' },
  { bg: '#FAEEDA', tx: '#633806' },
  { bg: '#F1EFE8', tx: '#5F5E5A' },
];

/* ── Utilidades de DOM ───────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ── Navegación entre pantallas ──────────────────────────── */
function showScreen(id, btn) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $$('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  btn.classList.add('active');
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

// Cerrar modal al hacer clic en el overlay
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Cerrar con Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    $$('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ── Toast ───────────────────────────────────────────────── */
let toastTimer = null;

function showToast(msg, type = '') {
  const t = $('#toast');
  const icon = type === 'success' ? 'ti-circle-check' : type === 'error' ? 'ti-alert-circle' : 'ti-info-circle';
  t.innerHTML = `<i class="ti ${icon}" aria-hidden="true"></i>${msg}`;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

/* ── Badges ─────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════
   MÓDULO: BOLETAS
   ══════════════════════════════════════════════════════════ */

function renderBoletas(data) {
  const tbody = $('#tbody-boletas');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <i class="ti ti-inbox" aria-hidden="true"></i>
      No se encontraron boletas con ese criterio.
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(b => {
    const isPagado = b.estado === 'Pagado';
    const accion = isPagado
      ? `<span style="font-size:12px;color:var(--text-hint)">— Pagado</span>`
      : `<button class="btn-pse">Pagar en línea (PSE)</button>`;

    return `<tr>
      <td>${b.id}</td>
      <td>${b.fecha}</td>
      <td>${b.valor}</td>
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

function buscarBoletas() {
  const numQ   = $('#f-boleta').value.trim().toLowerCase();
  const fechaQ = $('#f-fecha').value.trim();

  if (!numQ && !fechaQ) {
    showToast('Ingresa al menos un criterio de búsqueda', 'error');
    return;
  }

  const resultado = boletas.filter(b => {
    const matchNum = !numQ || b.id.toLowerCase().includes(numQ);
    return matchNum;
  });

  // Mostrar resultados en modal
  const body = $('#boletas-result-body');
  if (!resultado.length) {
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
            ${resultado.map(b => `<tr>
              <td>${b.id}</td>
              <td>${b.fecha}</td>
              <td>${b.valor}</td>
              <td>${badgeEstado(b.estado)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  openModal('modal-boletas-result');
}

function limpiarBoletas() {
  $('#f-boleta').value = '';
  $('#f-fecha').value  = '';
  renderBoletas(boletas);
  showToast('Filtros limpiados');
}

/* ══════════════════════════════════════════════════════════
   MÓDULO: ESCRITURAS
   ══════════════════════════════════════════════════════════ */

function renderEscrituras(data) {
  const tbody = $('#tbody-escrituras');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <i class="ti ti-file-search" aria-hidden="true"></i>
      No se encontraron escrituras con esos criterios.
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(e => `<tr>
    <td>${e.num}</td>
    <td>${e.acto}</td>
    <td>${e.proto}</td>
    <td>${badgeEstado(e.estado)}</td>
    <td>
      <div class="icon-btn" title="Vista previa del documento" aria-label="Vista previa">
        <i class="ti ti-eye" aria-hidden="true"></i>
      </div>
    </td>
  </tr>`).join('');
}

function buscarEscrituras() {
  const num   = $('#s-num').value.trim().toLowerCase();
  const anio  = $('#s-anio').value.trim();
  const proto = $('#s-proto').value.trim().toLowerCase();
  const ced   = $('#s-cedula').value.trim();

  if (!num && !anio && !proto && !ced) {
    showToast('Ingresa al menos un criterio de búsqueda', 'error');
    return;
  }

  const res = escrituras.filter(e => {
    const mNum   = !num   || e.num.toLowerCase().includes(num);
    const mAnio  = !anio  || e.num.includes(anio);
    const mProto = !proto || e.proto.toLowerCase().includes(proto);
    const mCed   = !ced   || (e.cedC && e.cedC.includes(ced)) || (e.cedV && e.cedV.includes(ced));
    return mNum && mAnio && mProto && mCed;
  });

  renderEscrituras(res);

  if (!res.length) {
    showToast('Sin resultados. Ajusta los filtros.', 'error');
  } else {
    showToast(`Se encontraron ${res.length} escritura(s)`, 'success');
  }
}

function abrirModalEscritura() {
  escCounter++;
  $('#e-num').value   = `ESC-2025-0${escCounter}`;
  $('#e-fecha').value = new Date().toISOString().slice(0, 10);
  // Limpiar campos
  ['e-acto','e-proto','e-comprador','e-vendedor','e-obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  $('#e-error').style.display = 'none';
  openModal('modal-escritura');
}

function radicarEscritura() {
  const acto   = $('#e-acto').value;
  const proto  = $('#e-proto').value;
  const errEl  = $('#e-error');

  if (!acto || !proto) {
    errEl.textContent   = 'El tipo de acto y el protocolista son obligatorios.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';

  const nueva = {
    num:   `ESC-2025-0${escCounter}`,
    acto,
    proto,
    estado: 'Escaneado',
    cedC:  $('#e-comprador').value || '—',
    cedV:  $('#e-vendedor').value  || '—',
  };

  escrituras.unshift(nueva);
  renderEscrituras(escrituras);
  closeModal('modal-escritura');
  showToast(`Escritura ${nueva.num} radicada exitosamente`, 'success');
}

/* ══════════════════════════════════════════════════════════
   MÓDULO: USUARIOS
   ══════════════════════════════════════════════════════════ */

function renderUsuarios() {
  const tbody = $('#tbody-usuarios');
  tbody.innerHTML = usuarios.map((u, i) => {
    const rolBadge = u.rol === 'Notario'
      ? `<span class="badge badge-blue">${u.rol}</span>`
      : `<span class="badge badge-gray">${u.rol}</span>`;

    const estadoBadge = u.activo
      ? badgeEstado('Activo')
      : badgeEstado('Inactivo');

    const accionBtn = u.activo
      ? `<button class="btn btn-danger" onclick="toggleUsuario(${i})">
           <i class="ti ti-user-off" aria-hidden="true"></i>Desactivar
         </button>`
      : `<button class="btn btn-success" onclick="toggleUsuario(${i})">
           <i class="ti ti-user-check" aria-hidden="true"></i>Activar
         </button>`;

    return `<tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar" style="background:${u.bgColor};color:${u.txColor}">${u.ini}</div>
          ${u.nombres}
        </div>
      </td>
      <td style="color:var(--text-secondary)">${u.correo}</td>
      <td>${rolBadge}</td>
      <td>${estadoBadge}</td>
      <td>${accionBtn}</td>
    </tr>`;
  }).join('');
}

function abrirModalUsuario() {
  ['u-nombres','u-apellidos','u-correo','u-rol'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  $('#u-error').style.display = 'none';
  openModal('modal-usuario');
}

function crearUsuario() {
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

  const colores = AVATAR_COLORS[usuarios.length % AVATAR_COLORS.length];
  const ini     = (nombres[0] + (apellidos[0] || '')).toUpperCase();

  usuarios.push({
    nombres:  `${nombres} ${apellidos}`,
    ini,
    correo,
    rol,
    activo:   true,
    bgColor:  colores.bg,
    txColor:  colores.tx,
  });

  renderUsuarios();
  closeModal('modal-usuario');
  showToast(`${nombres} ${apellidos} creado correctamente`, 'success');
}

function toggleUsuario(index) {
  usuarios[index].activo = !usuarios[index].activo;
  renderUsuarios();
  const u      = usuarios[index];
  const accion = u.activo ? 'activado' : 'desactivado';
  showToast(`${u.nombres} ${accion}`, u.activo ? 'success' : '');
}

/* ── Inicialización ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  renderBoletas(boletas);
  renderEscrituras(escrituras);
  renderUsuarios();
});
