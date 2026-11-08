/* =========================================================
   VAULT — encrypted storage for OUR WORLD.
   Your password is never stored. It is turned into an AES-256 key
   (PBKDF2, 250k rounds) that encrypts the Our World records.
   Without the password the stored data is unreadable noise.
   ========================================================= */
NX.VAULT = 'nexus.vault';
NX.vault = { key: null, records: null };

const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

NX.vaultExists = () => !!localStorage.getItem(NX.VAULT);

async function encryptedVault(records, key, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(records)));
  return { salt: b64(salt), iv: b64(iv), data: b64(data) };
}

NX.vaultWrite = async () => {
  const stored = JSON.parse(localStorage.getItem(NX.VAULT) || '{}');
  const payload = await encryptedVault(NX.vault.records, NX.vault.key, unb64(stored.salt));
  localStorage.setItem(NX.VAULT, JSON.stringify(payload));
};

NX.vaultCreate = async password => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  // move any old (unencrypted) v1 OUR WORLD records into the vault
  const old = NX.data.records.filter(r => r.type === 'shared');
  const payload = await encryptedVault(old, key, salt);
  localStorage.setItem(NX.VAULT, JSON.stringify(payload));
  NX.vault.key = key;
  NX.vault.records = old;
  NX.data.records = NX.data.records.filter(r => r.type !== 'shared');
  NX.save();
};

NX.vaultUnlock = async password => {
  const s = JSON.parse(localStorage.getItem(NX.VAULT));
  const key = await deriveKey(password, unb64(s.salt));
  try {
    const plain = s.data ? await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(s.iv) }, key, unb64(s.data)) : enc.encode('[]');
    NX.vault.key = key; NX.vault.records = JSON.parse(dec.decode(plain));
    return true;
  } catch (e) { return false; }   // wrong password → decryption fails
};

NX.vaultLock = () => { NX.vault.key = null; NX.vault.records = null; };

// Re-key the vault without exposing plaintext outside this browser session.
NX.vaultChangePassword = async (oldPassword, newPassword) => {
  if (!(await NX.vaultUnlock(oldPassword))) return false;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(newPassword, salt);
  const payload = await encryptedVault(NX.vault.records, key, salt);
  localStorage.setItem(NX.VAULT, JSON.stringify(payload));
  NX.vault.key = key;
  return true;
};
