/* ======================================================================
   APP_V2.JS — Panel Auditor
   Controlador principal del sistema
   ====================================================================== */

import {
  obtenerModulo,
  MODULOS
} from "./modulos_v2.js";

import { cargarDesdeCarpeta } from "./graph_v2.js";
import { iniciarSesion, usuarioActual, cerrarSesion, obtenerToken } from "./auth.js";

/* ======================================================================
   ESTADO GLOBAL
   ====================================================================== */
let moduloActivo = null;
let datosActuales = [];
window.__archivoActual = null;

/* ======================================================================
   1) INICIALIZACIÓN
   ====================================================================== */
window.addEventListener("DOMContentLoaded", async () => {
  if (!usuarioActual()) await iniciarSesion();
  prepararSidebar();
  seleccionarModulo("inicio");
});

/* ======================================================================
   2) SIDEBAR
   ====================================================================== */
function prepararSidebar() {
  const botones = document.querySelectorAll(".sb-item");

  botones.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (btn.classList.contains("logout")) {
        cerrarSesion();
        return;
      }

      botones.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      seleccionarModulo(btn.dataset.mod);
    });
  });
}

/* ======================================================================
   3) CAMBIAR MÓDULO
   ====================================================================== */
async function seleccionarModulo(mod) {
  const contenedor = document.getElementById("contenedor-modulo");
  contenedor.innerHTML = "";

  if (mod === "inicio") {
    moduloActivo = null;
    contenedor.innerHTML = `
      <div style="padding:20px; font-size:16px;">
        Bienvenido al <strong>Panel Auditor</strong>.<br>
        Selecciona un módulo en la barra lateral para comenzar.
      </div>`;
    return;
  }

  moduloActivo = obtenerModulo(mod);
  contenedor.innerHTML = generarTablaHTML(moduloActivo);
  await cargarDatosModulo();
}

/* ======================================================================
   4) GENERAR TABLA
   ====================================================================== */
function generarTablaHTML(modulo) {
  const ths = modulo.columnas.map(c => `<th>${c.label}</th>`).join("");

  return `
    <div class="tabla-box">
      <table class="tabla">
        <thead><tr>${ths}<th>Acciones</th></tr></thead>
        <tbody id="tbodyDatos">
          <tr><td colspan="${modulo.columnas.length + 1}" style="text-align:center;padding:20px;">Cargando…</td></tr>
        </tbody>
      </table>
    </div>`;
}

/* ======================================================================
   5) CARGAR DATOS
   ====================================================================== */
async function cargarDatosModulo() {
  if (!moduloActivo.pendientes) {
    document.getElementById("tbodyDatos").innerHTML = `
      <tr><td colspan="99" style="padding:20px;text-align:center;">
        No hay ruta configurada para este módulo.
      </td></tr>`;
    return;
  }

  datosActuales = await cargarDesdeCarpeta(moduloActivo);
  renderTabla();
}

/* ======================================================================
   6) RENDER TABLA
   ====================================================================== */
function renderTabla() {
  const tbody = document.getElementById("tbodyDatos");

  if (!datosActuales.length) {
    tbody.innerHTML = `
      <tr><td colspan="99" style="text-align:center;padding:20px;">
        No hay informes pendientes.
      </td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  datosActuales.forEach((item, idx) => {
    const tds = moduloActivo.columnas.map(col => `<td>${item[col.id]}</td>`).join("");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      ${tds}
      <td>
        <button class="btn-ver" data-idx="${idx}" style="margin-right:6px;">Ver</button>
        <button class="btn-aprobar" data-idx="${idx}">Aprobar</button>
      </td>`;

    tbody.appendChild(tr);
  });

  prepararEventosTabla();
}

/* ======================================================================
   7) EVENTOS DE TABLA
   ====================================================================== */
function prepararEventosTabla() {
  document.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", async () => {
      await verArchivo(datosActuales[btn.dataset.idx]);
    });
  });

  document.querySelectorAll(".btn-aprobar").forEach(btn => {
    btn.addEventListener("click", async () => {
      await aprobarArchivo(datosActuales[btn.dataset.idx]);
    });
  });
}

/* ======================================================================
   ✅ 8) VER ARCHIVO - EMBEBIDO
   ====================================================================== */
async function verArchivo(item) {
  document.getElementById("contenedor-modulo").style.display = "none";
  document.getElementById("modalVisor").style.display = "block";

  window.__archivoActual = item;

  const token = await obtenerToken();

  const resp = await fetch(
    `https://graph.microsoft.com/v1.0${item.archivo.ruta}`,
    { headers: { "Authorization": `Bearer ${token}` } }
  );

  const data = await resp.json();
  if (!data?.webUrl) return alert("No se pudo obtener URL del informe");

  const encoded = encodeURIComponent(data.webUrl);

  const embedUrl = 
    `https://excel.officeapps.live.com/x/_layouts/15/WopiFrame2.aspx?embed=1&src=${encoded}`;

  document.getElementById("visorIframe").innerHTML = `
    <iframe src="${embedUrl}" width="100%" height="100%" frameborder="0"></iframe>
  `;
}

/* ======================================================================
   ✅ 9) VOLVER
   ====================================================================== */
document.getElementById("visorVolver").addEventListener("click", () => {
  document.getElementById("modalVisor").style.display = "none";
  document.getElementById("contenedor-modulo").style.display = "block";
  document.getElementById("visorIframe").innerHTML = "";
});
