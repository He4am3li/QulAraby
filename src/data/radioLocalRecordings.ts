type Recording = { blob: Blob; name: string };

// Browser storage only, no HTTP requests, Firebase writes or AI services.
export async function radioRecordingStore(
  key: string, action: 'get' | 'put' | 'delete', recording?: Recording
): Promise<Recording | undefined> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('qul-radio-local-recordings', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('recordings');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('recordings', action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('recordings');
      const request = action === 'get' ? store.get(key)
        : action === 'put' ? store.put(recording, key) : store.delete(key);
      transaction.oncomplete = () => resolve(action === 'get' ? request.result : undefined);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
}

export async function validateRadioRecording(file: File): Promise<void> {
  if (!file.size || file.size > 30 * 1024 * 1024 ||
    !(/^(audio\/|video\/mp4)/i.test(file.type) || /\.(mp3|m4a|wav|ogg|webm|aac)$/i.test(file.name))) {
    throw new Error('invalid-audio');
  }
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      const done = (error?: Error) => {
        clearTimeout(timer); audio.onloadedmetadata = null; audio.onerror = null;
        audio.removeAttribute('src'); audio.load();
        if (error) reject(error); else resolve();
      };
      const timer = setTimeout(() => done(new Error('invalid-audio')), 8000);
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => audio.duration > 0 ? done() : done(new Error('invalid-audio'));
      audio.onerror = () => done(new Error('invalid-audio'));
      audio.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}
