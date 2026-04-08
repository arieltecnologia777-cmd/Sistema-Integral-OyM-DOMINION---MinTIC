// ======================================================
// graph_v2.js — Operaciones contra Microsoft Graph
// (SharePoint, sin OneDrive)
// ======================================================

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// ======================================================
// OBTENER URL TEMPORAL DEL ARCHIVO (opcional)
// ======================================================
export async function obtenerURLTemporal(token, rutaGraph) {
  const url = `${GRAPH_BASE}${rutaGraph}/content`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    console.error("❌ Error obteniendo URL temporal");
    return null;
  }

  return res.url;
}

// ======================================================
// MOVER ARCHIVO (ej: Generados → Aprobados)
// ======================================================
// rutaOrigen: /sites/.../drives/.../items/{id}
// rutaDestino: /sites/.../drives/.../root:/carpeta/archivo.xlsx
// ======================================================
export async function moverArchivo(token, rutaOrigen, rutaDestino) {

  const url = `${GRAPH_BASE}${rutaOrigen}`;

  const body = {
    parentReference: {
      path: rutaDestino.substring(0, rutaDestino.lastIndexOf("/"))
    },
    name: rutaDestino.substring(rutaDestino.lastIndexOf("/") + 1)
  };

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    console.error("❌ Error moviendo archivo:", await res.text());
    return false;
  }

  return true;
}
