/* ============================================================
   MODULOS.JS
   Configuración de módulos del Panel Auditor
   ============================================================ */

export const MODULOS = {

  /* ============================================================
     ✅ MÓDULO MCI
     ============================================================ */
  MCI: {
    id: "mci",
    nombre: "Auditor — MCI",

    pendientes: "/drive/root:/Documents/Base MCI - Proyecto automatización/MCI_Salidas",
    aprobados: "/drive/root:/Documents/Base MCI - Proyecto automatización/MCI_Aprobados",

    columnas: [
      { id: "tecnico",   label: "Técnico" },
      { id: "fecha",     label: "Fecha" },
      { id: "cliente",   label: "Cliente" },
      { id: "ubicacion", label: "Ubicación" }
    ],

    normalizar(item) {
  return {
    tecnico: item.nombre ?? "—",
    fecha: item.modificado || "—",
    cliente: "—",
    ubicacion: "—",
    archivo: {
      nombre: item.nombre,
      ruta: item.ruta,
      tamano: item.tamano,
      tipo: item.tipo
    }
  };
}
  },

  /* ============================================================
     ✅ MÓDULO MPR
     ============================================================ */
  MPR: {
    id: "mpr",
    nombre: "Auditor — MPR",

    pendientes: null,
    aprobados: null,

    columnas: [
      { id: "tecnico",   label: "Técnico" },
      { id: "fecha",     label: "Fecha" },
      { id: "proyecto",  label: "Proyecto" },
      { id: "zona",      label: "Zona" }
    ],

    normalizar(item) {
  return {
    tecnico: item.nombre ?? "—",
    fecha: item.modificado || "—",
    cliente: "—",
    ubicacion: "—",
    archivo: {
      nombre: item.nombre,
      ruta: item.ruta,
      tamano: item.tamano,
      tipo: item.tipo
    }
  };
}

};

/* ============================================================
   🔧 FUNCIÓN AUXILIAR
   ============================================================ */
export function obtenerModulo(id) {
  return MODULOS[id.toUpperCase()] ?? null;
}
