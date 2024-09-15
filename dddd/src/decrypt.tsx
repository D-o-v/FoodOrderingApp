import CryptoJS from "crypto-js";

export const decrypt = (message: string, customKey?: string, customIV?: string) => {
  const key = customKey || import.meta.env.VITE_ENCRYPTION_KEY;
  const ivSave = customIV || import.meta.env.VITE_IV;
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


// import CryptoJS from "crypto-js";

// export const decrypt = (message:any) => {
//   const key = import.meta.env.VITE_ENCRYPTION_KEY
//   const ivSave = import.meta.env.VITE_IV
//     let iv = CryptoJS.enc.Utf8.parse(ivSave);
//     let newkey = CryptoJS.enc.Utf8.parse(key);
//     const decryptedData = CryptoJS.AES.decrypt(message, newkey, {
//         iv: iv,
//         mode: CryptoJS.mode.CBC,
//       }).toString(CryptoJS.enc.Utf8);
//       console.log(typeof(decryptedData), decryptedData,JSON.parse(decryptedData))
//     if(decryptedData &&decryptedData !== "" && typeof(decryptedData)==="string"){
//     // const parsedData = JSON.parse(decryptedData)
//       // return parsedData
//       return decryptedData
//     }else if (decryptedData && decryptedData !== "" && typeof(decryptedData)!=="string"){
//         return decryptedData
//     }
// };

// export const decrypt = (message: any) => {
//   const key = import.meta.env.VITE_ENCRYPTION_KEY;
//   const ivSave = import.meta.env.VITE_IV;
//   let iv = CryptoJS.enc.Utf8.parse(ivSave);
//   let newkey = CryptoJS.enc.Utf8.parse(key);
//   const decryptedData = CryptoJS.AES.decrypt(message, newkey, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//   }).toString(CryptoJS.enc.Utf8);

//   try {
//     // Parse decrypted JSON string into a JavaScript object
//     const parsedData = JSON.parse(decryptedData);
//     return parsedData;
//   } catch (error) {
//     console.error('Error parsing decrypted data:', error);
//     return null; // Return null if decryption fails
//   }
// };

