// The one decrypt routine for the OSS Desk, shared by the unlock page and the test.
// data.enc.json is written each night by cnc/OSS/tools/desk_publish.mjs:
// {v:1, kdf:"PBKDF2-SHA256", iter, salt, iv, ct} with base64 fields, AES-256-GCM.
// GCM checks integrity, so a wrong passphrase throws instead of returning garbage.
(function () {
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function deskDecrypt(box, passphrase) {
    if (!box || box.v !== 1) throw new Error("unknown file version");
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: b64(box.salt), iterations: box.iter },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(box.iv) }, key, b64(box.ct));
    return new TextDecoder().decode(plain);
  }
  globalThis.deskDecrypt = deskDecrypt;
})();
