/* ======================================================================
   AUTH.JS — Panel Auditor
   Gestión de sesión usando MSAL 2.0 (SPA)
   Autenticación contra Azure AD (tu tenant Dominion)
   Ariel-friendly: limpio, comentado y modular
   ====================================================================== */

// =====================================================================
// CONFIGURACIÓN MSAL
// =====================================================================

const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",     // ← Ariel, luego me das este valor
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // ← tu tenant Dominion
    redirectUri: window.location.origin // regresa a index.html
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

// Scopes necesarios para leer/mover archivos de OneDrive
export const graphScopes = {
  scopes: ["Files.ReadWrite.All", "User.Read"]
};

// Inicializa MSAL
export const msalInstance = new msal.PublicClientApplication(msalConfig);


// =====================================================================
// LOGIN
// =====================================================================

/**
 * Mostrar popup de login
 */
export async function iniciarSesion() {
  try {
    const loginResp = await msalInstance.loginPopup(graphScopes);
    console.log("✅ Sesión iniciada:", loginResp.account.username);

    // Establecer cuenta activa
    msalInstance.setActiveAccount(loginResp.account);

    return loginResp.account;
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    alert("No se pudo iniciar sesión en el Panel Auditor.");
  }
}


// =====================================================================
// OBTENER TOKEN DE ACCESO
// =====================================================================

/**
 * Devuelve un token válido para consumir Microsoft Graph.
 * Intenta primero renovar en silencio → si falla, usa popup.
 */
export async function obtenerToken() {
  const account = msalInstance.getActiveAccount();

  if (!account) {
    console.warn("⚠️ No hay usuario activo. Debes iniciar sesión.");
    return null;
  }

  try {
    // Intento silencioso
    const silent = await msalInstance.acquireTokenSilent({
      ...graphScopes,
      account
    });

    return silent.accessToken;

  } catch (e) {
    console.warn("🔄 Intento silencioso falló. Probando popup…");

    try {
      const popup = await msalInstance.acquireTokenPopup(graphScopes);
      return popup.accessToken;

    } catch (err) {
      console.error("❌ Error al obtener token:", err);
      return null;
    }
  }
}


// =====================================================================
// OBTENER USUARIO ACTIVO
// =====================================================================

export function usuarioActual() {
  return msalInstance.getActiveAccount();
}


// =====================================================================
// LOGOUT
// =====================================================================

export function cerrarSesion() {
  const account = msalInstance.getActiveAccount();
  if (!account) return;

  msalInstance.logoutPopup({
    account,
    postLogoutRedirectUri: window.location.origin
  });
}