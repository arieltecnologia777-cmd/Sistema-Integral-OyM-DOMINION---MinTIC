function cargarScript(path, type = "module") {
  const script = document.createElement("script");
  script.type = type;
  script.src = path + "?v=" + window.APP_VERSION;
  document.body.appendChild(script);
}
