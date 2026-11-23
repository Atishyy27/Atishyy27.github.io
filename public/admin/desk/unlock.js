// Runs in app.html before the Desk app. The unlock page left the decrypted data in this
// tab's sessionStorage; without it, go back and ask for the passphrase.
(function () {
  var raw = sessionStorage.getItem("oss-desk");
  if (!raw) { location.replace("./"); return; }
  window.__DESK__ = JSON.parse(raw);
})();
