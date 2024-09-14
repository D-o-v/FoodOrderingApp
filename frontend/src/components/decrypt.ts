import CryptoJS from "crypto-js";
const key = import.meta.env.VITE_ENCRYPTION_KEY;
const ivSave =  import.meta.env.VITE_IV;

export const decrypt = (message: string) => {
 
// export const decrypt = (message: string) => {
//   const key = import.meta.env.VITE_ENCRYPTION_KEY;
//   const ivSave = import.meta.env.VITE_IV;
  let iv = CryptoJS.enc.Utf8.parse(ivSave);
  let newkey = CryptoJS.enc.Utf8.parse(key);
  const decryptedData = CryptoJS.AES.decrypt(message, newkey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Utf8);

  try {
    // Attempt to parse the decrypted data as JSON
    return JSON.parse(decryptedData);
  } catch (e) {
    // If parsing fails, return the raw decrypted string
    return decryptedData;
  }
};