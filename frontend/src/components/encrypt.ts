import CryptoJS from "crypto-js";


export const encrypt = (dataToBeEncrypted: any, customKey?: string, customIV?: string) => {
  const key = customKey || import.meta.env.VITE_ENCRYPTION_KEY;
  const ivSave = customIV || import.meta.env.VITE_IV;
  // export const encrypt =(dataToBeEncrypted:any) =>{
    
//     const key = import.meta.env.VITE_ENCRYPTION_KEY
//     const ivSave = import.meta.env.VITE_IV
      let newmessage = JSON.stringify(dataToBeEncrypted)
    let iv = CryptoJS.enc.Utf8.parse(ivSave);
    let newKey = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.AES.encrypt(newmessage, newKey, { iv: iv, mode: CryptoJS.mode.CBC });
    let newEncrypted = encrypted.toString();
    const data = {"message":newEncrypted}
    return data;
}