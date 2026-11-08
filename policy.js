/* Local file rules: keep data attachments within practical browser storage limits. */
window.NX = window.NX || {};
NX.filePolicy = Object.freeze({
  maxAttachments: 8,
  maxAttachmentBytes: 2 * 1024 * 1024,
  maxAttachmentBatchBytes: 2.5 * 1024 * 1024,
  maxAudioBytes: 2 * 1024 * 1024,
  storedBytes(data) {
    if (typeof data !== 'string') return 0;
    const separator = data.indexOf(',');
    if (separator < 0) return 0;
    const payload = data.slice(separator + 1);
    return Math.floor(payload.length * 3 / 4) - (payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0);
  },
  allowedAttachmentType(type) {
    return /^(?:image\/(?:jpeg|png|webp|gif)|audio\/[\w.+-]+|video\/[\w.+-]+|application\/(?:pdf|json|vnd\.[\w.+-]+)|text\/(?:plain|markdown|csv))$/i.test(String(type || ''));
  },
  validateAttachments(existing, selected) {
    if (existing.length + selected.length > this.maxAttachments) return 'count';
    if (selected.some(file => !this.allowedAttachmentType(file.type))) return 'type';
    if (selected.some(file => file.size > this.maxAttachmentBytes)) return 'file-size';
    const total = existing.reduce((sum, file) => sum + (Number(file.size) || this.storedBytes(file.data)), 0)
      + selected.reduce((sum, file) => sum + (Number(file.size) || 0), 0);
    if (total > this.maxAttachmentBatchBytes) return 'total-size';
    return null;
  },
  validateAudio(type, size) {
    if (!String(type || '').startsWith('audio/')) return 'type';
    if (size > this.maxAudioBytes) return 'file-size';
    return null;
  },
});