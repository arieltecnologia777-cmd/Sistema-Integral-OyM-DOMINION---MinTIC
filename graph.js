import { obtenerToken } from "./auth.js";

/* ============================================================
   Helper: Fetch autenticado a Microsoft Graph
   ============================================================ */
async function graphFetch(url, method = "GET", body = null) {
  const token = await obtenerToken();
  if (!token) {
    console.error("❌ No se pudo obtener el token de acceso.");
    return null;
  }

  const options = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  if (body) options.body = JSON.stringify(body);

  const resp = await fetch(url, options);

  if (!resp.ok) {
    console.error("❌ Error en Graph:", resp.status, await resp.text());
    return null;
  }

  return resp.json();
}

/* ============================================================
   1) LISTAR ARCHIVOS — USANDO driveId REAL
   ============================================================ */
export async function listarArchivos(rutaCarpeta) {
  if (!rutaCarpeta) {
    console.warn("⚠️ Ruta vacía.");
    return [];
  }

  // ✅ Ruta correcta sin /me
  const url = `https://graph.microsoft.com/v1.0${rutaCarpeta}:/children`;

  const data = await graphFetch(url);
  if (!data || !data.value) return [];

  return data.value.filter(item => item.file);
}

/* ============================================================
   2) OBTENER ARCHIVO (blob)
   ============================================================ */
export async function obtenerArchivo(rutaArchivo) {
  const token = await obtenerToken();
  if (!token) return null;

  const url = `https://graph.microsoft.com/v1.0${rutaArchivo}:/content`;

  const resp = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!resp.ok) {
    console.error("❌ No se pudo descargar archivo:", resp.status);
    return null;
  }

  return resp.blob();
}

/* ============================================================
   3) MOVER ARCHIVO (APROBAR)
   ============================================================ */
export async function moverArchivo(rutaOrigen, rutaDestino) {

  const nombre = rutaDestino.split("/").pop();
  const carpetaDestino = rutaDestino.replace(`/${nombre}`, "");

  const body = {
    parentReference: { path: carpetaDestino },
    name: nombre
  };

  const url = `https://graph.microsoft.com/v1.0${rutaOrigen}`;

  const resp = await graphFetch(url, "PATCH", body);

  if (!resp) {
    console.error("❌ Error moviendo archivo.");
    return false;
  }

  console.log("✅ Archivo movido");
  return true;
}

/* ============================================================
   4) CARGAR ARCHIVOS NORMALIZADOS
   ============================================================ */
export async function cargarDesdeCarpeta(modulo, esAprobados = false) {
  const ruta = esAprobados ? modulo.aprobados : modulo.pendientes;

  const archivos = await listarArchivos(ruta);
  if (!archivos || archivos.length === 0) return [];

  return archivos.map(file =>
    modulo.normalizar({
      nombre: file.name,
      ruta: `${ruta}/${file.name}`,
      modificado: file.lastModifiedDateTime ?? "—",
      tamano: file.size ?? "—",
      tipo: file.file?.mimeType ?? "—"
    })
  );
}

/* ============================================================
   5) URL TEMPORAL PARA PREVIEW
   ============================================================ */
export async function obtenerURLTemporal(rutaArchivo) {
  const blob = await obtenerArchivo(rutaArchivo);
  if (!blob) return null;

  return URL.createObjectURL(blob);
}
