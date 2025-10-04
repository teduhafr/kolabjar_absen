// A simple obfuscation function using Base64.
// NOTE: This is not strong encryption but prevents storing sensitive data like API keys in plain text.
const simpleEncrypt = (text) => {
    try {
        // The 'key' is just used to make the Base64 string less obvious.
        const saltedText = `__SALT__${text}`;
        return btoa(saltedText);
    } catch (e) {
        console.error("Failed to encrypt data:", e);
        return text; // Fallback to plain text on error
    }
};

const simpleDecrypt = (encryptedText) => {
    try {
        const decryptedText = atob(encryptedText);
        return decryptedText.replace(/^__SALT__/, ''); // Remove the salt
    } catch (e) {
        console.error("Failed to decrypt data:", e);
        return encryptedText; // Fallback to encrypted text on error
    }
};

const STORAGE_KEY = 'kolabjar_absen_credentials';

export function saveCredentials(credentials) {
    const dataToStore = {
        user: simpleEncrypt(credentials.user || ''),
        password: simpleEncrypt(credentials.password || ''),
        url: simpleEncrypt(credentials.url || ''),
        apiKey: simpleEncrypt(credentials.apiKey || ''),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
}

export function loadCredentials() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    const parsedData = JSON.parse(storedData);
    return {
        user: simpleDecrypt(parsedData.user || ''),
        password: simpleDecrypt(parsedData.password || ''),
        url: simpleDecrypt(parsedData.url || ''),
        apiKey: simpleDecrypt(parsedData.apiKey || ''),
    };
}