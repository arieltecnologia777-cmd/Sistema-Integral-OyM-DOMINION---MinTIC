async function cargarDatosModulo() {

  // ✅ Si el módulo no tiene carpeta configurada, mensaje
  if (!moduloActivo.pendientes) {
    console.warn("⚠️ Aún no se ha configurado la carpeta de pendientes.");
    document.getElementById("tbodyDatos").innerHTML = `
      <tr><td colspan="99" style="padding:20px; text-align:center;">
        No hay ruta configurada para este módulo.<br>
        (Ariel deberá especificarla cuando toque)
      </td></tr>
    `;
    return;
  }

  // ✅ 1. Cargar datos crudos desde Power Automate
  const brutos = await cargarDatosDesdeFlow();

  // ✅ 2. Normalizar cada item según el módulo activo
  datosActuales = brutos.map(item => moduloActivo.normalizar(item));

  // ✅ 3. Renderizar la tabla con datos normalizados
  renderTabla();
}
