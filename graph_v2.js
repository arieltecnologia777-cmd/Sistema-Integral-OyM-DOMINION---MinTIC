// ============================================================
// ✅ IMPORTS NECESARIOS
// ============================================================
import { DRIVE_ID } from "./modulos_v2.js";


// ============================================================
// ✅ FUNCIÓN BASE PARA LLAMAR A GRAPH
// ============================================================
async function graphFetch(url, token, method = "GET", body = null) {

  const options = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const resp = await fetch(url, options);

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("❌ Error en Graph:", resp.status, errText);
    throw new Error(`Graph error ${resp.status}: ${errText}`);
  }

  return resp.json();
}



// ============================================================
// ✅ 1) LISTAR ARCHIVOS DE UNA CARPETA (pendientes)
// Siempre usa: drives/{driveId}/items/{folderId}/children
// ============================================================
export async function listarArchivos(folderId, token) {

  if (!folderId) {
    console.warn("⚠️ folderId vacío.");
    return [];
  }

  const url = `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${folderId}/children`;

  const data = await graphFetch(url, token);

  return data.value.map(item => ({
    id: item.id,
    nombre: item.name,
    fecha: item.lastModifiedDateTime,
    tamano: item.size,
    archivo: {
      ruta: `/drives/${DRIVE_ID}/items/${item.id}`,
      nombre: item.name
    }
  }));
}



// ============================================================
// ✅ 2) OBTENER URL TEMPORAL PARA PREVIEW
// ============================================================
export async function obtenerURLTemporal(rutaArchivo, token) {

  if (!rutaArchivo) {
    console.error("❌ obtenerURLTemporal: rutaArchivo vacío.");
    return null;
  }

  const url = `https://graph.microsoft.com/v1.0${rutaArchivo}`;

  // Graph: /driveItem/createLink
  const resp = await graphFetch(`${url}/createLink`, token, "POST", {
    type: "view",
    scope: "anonymous"
  });

  return resp?.link?.webUrl || null;
}



// ============================================================
// ✅ 3) MOVER ARCHIVO ENTRE CARPETAS (aprobar)
// ============================================================
export async function moverArchivo(rutaOrigen, rutaDestino, token) {

  if (!rutaOrigen || !rutaDestino) {
    console.error("❌ moverArchivo: rutas inválidas.");
    return false;
  }

  // Origen
  const origenUrl = `https://graph.microsoft.com/v1.0${rutaOrigen}`;

  // Carpeta destino
  const nombreArchivo = rutaDestino.split("/").pop();
  const carpetaDestino = rutaDestino.replace(`/${nombreArchivo}`, "");

  const destinoFolderUrl =
    `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${carpetaDestino}`;

  // Ejecutar movimiento
  const body = {
    parentReference: {
      driveId: DRIVE_ID,
      id: carpetaDestino
    },
    name: nombreArchivo
  };

  try {
    await graphFetch(origenUrl, token, "PATCH", body);
    return true;

  } catch (err) {
    console.error("❌ Error moviendo archivo:", err);
    return false;
  }
}



// ============================================================
// ✅ 4) CARGA COMPLETA DESDE UNA CARPETA (NORMALIZADO)
// ============================================================
export async function cargarDesdeCarpeta(modulo, incluirAprobados = false) {

  const token = sessionStorage.getItem("token");

  const folderId = incluirAprobados ? modulo.aprobados : modulo.pendientes;

  const archivos = await listarArchivos(folderId, token);

  return archivos.map(a => ({
    nombre: a.nombre,
    fecha: new Date(a.fecha).toLocaleString("es-CO"),
    tamano: a.tamano,
    archivo: a.archivo
  }));
}
