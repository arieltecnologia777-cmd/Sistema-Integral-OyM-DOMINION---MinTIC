/* ======================================================================
   AUTH.JS — Panel Auditor
   Gestión de sesión con MSAL 2.0
   ====================================================================== */

const msalConfig = {
  auth: {
    clientId: "f3976bc3-91bb-4fd7-9195-eba9a96886f5",
    authority: "https://login.microsoftonline.com/e4e1bc33-e283-4312-bb37-89010224b7fe",
    redirectUri:
      "https://arieltecnologia777-cmd.github.io/Sistema-Integral-OyM-DOMINION-MinTIC/Modulo_Auditor.html"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const graphScopes = {
  scopes: ["Files.ReadWrite.All", "User.Read"]
};

export const msalInstance = new msal.PublicClientApplication(msalConfig);

// =====================================================================
// LOGIN
// =====================================================================
export async function iniciarSesion() {
  try {
    const loginResp = await msalInstance.loginPopup(graphScopes);

    msalInstance.setActiveAccount(loginResp.account);

    // ✅ NO guardamos token aquí porque loginPopup NO devuelve accessToken

    return loginResp.account;

  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    alert("No se pudo iniciar sesión.");
  }
}

// =====================================================================
// OBTENER TOKEN REAL
// =====================================================================
export async function obtenerToken() {
  const account = msalInstance.getActiveAccount();

  if (!account) return null;

  try {
    const silent = await msalInstance.acquireTokenSilent({
      ...graphScopes,
      account
    });

    sessionStorage.setItem("token", silent.accessToken);
    return silent.accessToken;

  } catch (e) {
    const popup = await msalInstance.acquireTokenPopup(graphScopes);

    sessionStorage.setItem("token", popup.accessToken);
    return popup.accessToken;
  }
}

export function usuarioActual() {
  return msalInstance.getActiveAccount();
}

export function cerrarSesion() {
  const account = msalInstance.getActiveAccount();
  if (!account) return;

  msalInstance.logoutPopup({
    account,
    postLogoutRedirectUri: window.location.origin
  });
}
