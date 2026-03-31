/* ============================================================
   AUTH.JS — Login simple sin scopes (NO pide consentimiento)
   ============================================================ */

const msalConfig = {
  auth: {
    clientId: "f3976bc3-91bb-4fd7-9195-eba9a96886f5",
    authority: "https://login.microsoftonline.com/e4e1bc33-e283-4312-bb37-89010224b7fe",
    redirectUri: "https://arieltecnologia777-cmd.github.io/Sistema-Integral-OyM-DOMINION-MinTIC/Modulo_Auditor.html"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const msalInstance = new msal.PublicClientApplication(msalConfig);

/* ✅ Login sin scopes, sin User.Read */
export async function iniciarSesion() {
  try {
    const resp = await msalInstance.loginPopup({
      scopes: []   // <— SIN User.Read NI GRAPH NI NADA
    });

    msalInstance.setActiveAccount(resp.account);
    return resp.account;

  } catch (err) {
    console.error("Error al iniciar sesión:", err);
  }
}

export function usuarioActual() {
  return msalInstance.getActiveAccount();
}

export function cerrarSesion() {
  const acc = msalInstance.getActiveAccount();
  if (!acc) return;

  msalInstance.logoutPopup({
    account: acc
  });
}
