import sodium from "libsodium-wrappers";

let isReady = false;

export async function initSodium() {
  if (!isReady) {
    await sodium.ready;
    isReady = true;
  }
  return sodium;
}

export async function generateKeypair() {
  await initSodium();
  const keypair = sodium.crypto_kx_keypair();
  return {
    publicKey: sodium.to_base64(keypair.publicKey),
    privateKey: sodium.to_base64(keypair.privateKey),
  };
}

export async function deriveSharedKey(
  myPrivateKeyB64: string,
  theirPublicKeyB64: string,
  isSender: boolean
): Promise<string> {
  await initSodium();
  
  const myPrivateKey = sodium.from_base64(myPrivateKeyB64);
  const theirPublicKey = sodium.from_base64(theirPublicKeyB64);
  
  // For consistent key derivation, we need to know who is sender/receiver
  // Use crypto_kx to derive shared keys
  const myPublicKey = sodium.crypto_scalarmult_base(myPrivateKey);
  
  const keys = isSender
    ? sodium.crypto_kx_client_session_keys(myPublicKey, myPrivateKey, theirPublicKey)
    : sodium.crypto_kx_server_session_keys(myPublicKey, myPrivateKey, theirPublicKey);
  
  // Use transmit key when sending, receive key when receiving
  return sodium.to_base64(isSender ? keys.sharedTx : keys.sharedRx);
}

export async function encryptMessage(
  sharedKeyB64: string,
  message: string
): Promise<{ ciphertext: string; nonce: string }> {
  await initSodium();
  
  const sharedKey = sodium.from_base64(sharedKeyB64);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const messageBytes = sodium.from_string(message);
  const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, sharedKey);
  
  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
  };
}

export async function decryptMessage(
  sharedKeyB64: string,
  ciphertextB64: string,
  nonceB64: string
): Promise<string> {
  await initSodium();
  
  const sharedKey = sodium.from_base64(sharedKeyB64);
  const ciphertext = sodium.from_base64(ciphertextB64);
  const nonce = sodium.from_base64(nonceB64);
  
  const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, sharedKey);
  return sodium.to_string(decrypted);
}

// Store keys in IndexedDB for persistence
const DB_NAME = "EncryptedChatKeys";
const STORE_NAME = "keys";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function storePrivateKey(userId: number, privateKey: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(privateKey, `user_${userId}_private_key`);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPrivateKey(userId: number): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(`user_${userId}_private_key`);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function clearPrivateKey(userId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(`user_${userId}_private_key`);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
