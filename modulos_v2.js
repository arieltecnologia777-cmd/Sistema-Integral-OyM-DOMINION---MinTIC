// =======================
// CONFIGURACIÓN PRINCIPAL
// =======================

// IDs confirmados vía Graph (NO CAMBIAN)
const DRIVE_ID = "b!qDLeuVb8dE-_ocg255wGZSbL4Q0zxaNDvZnBorHVVnQq_CH66fH5Q6vXRgtmy0ua";
const MCI_SALIDAS_FOLDER_ID = "01IWRV3SZ7VKZ6DTAIUNDZ4GDTQ7RDSN34";

// URL base de Graph
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// =======================
// LISTAR ARCHIVOS
// =======================

export async function listarArchivosMCI(token) {
    const url = `${GRAPH_BASE}/drives/${DRIVE_ID}/items/${MCI_SALIDAS_FOLDER_ID}/children`;

    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error al listar archivos: ${response.status}`);
    }

    const data = await response.json();
    return data.value.map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        lastModifiedDateTime: item.lastModifiedDateTime,
        downloadUrl: `${GRAPH_BASE}/drives/${DRIVE_ID}/items/${item.id}/content`
    }));
}

// =======================
// DESCARGAR ARCHIVO
// =======================

export async function descargarArchivo(token, fileId) {
    const url = `${GRAPH_BASE}/drives/${DRIVE_ID}/items/${fileId}/content`;

    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error al descargar archivo: ${response.status}`);
    }

    return response;
}

// =======================
// UTILIDADES DE FORMATO
// =======================

export function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}
