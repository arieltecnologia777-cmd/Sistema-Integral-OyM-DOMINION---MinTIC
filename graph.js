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
   1) LISTAR ARCHIVOS — usando driveId  
   NOTA: ¡NO SE USA /me!
   ============================================================ */
export async function listarArchivos(rutaCarpeta) {
  if (!rutaCarpeta) {
    console.warn("⚠️ Ruta vacía.");
    return [];
  }

  // ✅ Ruta correcta
  const url = `https://graph.microsoft.com/v1.0${rutaCarpeta}:/children`;

  const data = await graphFetch(url);
  if (!data || !data.value) return [];

  return data.value.filter(item => item.file);
}

/* ============================================================
   2) OBTENER ARCHIVO
   ============================================================ */
export async function obtenerArchivo(rutaArchivo) {
  const token = await obtenerToken();
  if (!token) return null;

  const url = `https://graph.microsoft.com/v1.0${rutaArchivo}:/content`;

  const resp = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!resp.ok) {
    console.error("❌ No se pudo obtener el archivo:", resp.status);
    return null;
  }

  return resp.blob();
}

/* ============================================================
   3) MOVER ARCHIVO (APROBAR)
   ============================================================ */
export async function moverArchivo(rutaOrigen, rutaDestino) {

  const nombre = rutaDestino.split("/").
