
import { useState } from 'react';
import { decrypt } from './decrypt';
import { encrypt } from './encrypt';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './login';
import { toast } from 'react-toastify';

interface EncryptedData {
  message: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [user, setUser] = useState('');
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);
  const [error, setError] = useState('');
  const [customIV, setCustomIV] = useState('');
  const [customKey, setCustomKey] = useState('');

  const handleDecrypt = () => {
    if (!input) {
      setError('Please enter the data to decrypt.');
      return;
    }

    try {
      // const decrypted = decrypt(input);
      const decrypted = decrypt(input, customKey, customIV);
      if(!decrypted){
        toast.error('Error decrypting data');
throw new Error
      }else{
        setDecryptedData(decrypted);
        setError('');
      }
    } catch (error:any) {
      toast.error('Error decrypting data:', error);
      setError('Error decrypting data. Please check your input.');
    }
  };

  const handleEncrypt = () => {
    if (!input) {
      setError('Please enter the data to encrypt.');
      return;
    }

    try {
      // const encrypted = encrypt(input);
      const encrypted = encrypt(input, customKey, customIV);
      setEncryptedData(encrypted);
      setError('');
    } catch (error) {
      console.error('Error encrypting data:', error);
      setError('Error encrypting data. Please check your input.');
    }
  };

  const handleCopyData = (data: any) => {
    const stringData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    navigator.clipboard.writeText(stringData)
      .then(() => alert('Data copied to clipboard'))
      .catch(error => console.error('Error copying data:', error));
  };

  const formatData = (data: any): string => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />} />
      {/* <Route path='/login' element={<Login setUser={setUser} />} /> */}
      <Route path='/login' element={<Login setUser={setUser} setCustomIV={setCustomIV} setCustomKey={setCustomKey} />} />
      <Route
        path='/decrypt-encrypt'
        element={
          user && user !== '' ? (
            <div className="container">
              <h1 className="title">Encrypt/Decrypt Data</h1>
              <div className="input-container">
                <label htmlFor="dataInput" className="label">Enter Data to Encrypt/Decrypt:</label>
                <textarea
                  id="dataInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="input"
                  rows={5}
                />
              </div>
              <div className="button-container">
                <button onClick={handleEncrypt} className="encrypt-btn">Encrypt</button>
                <button onClick={handleDecrypt} className="decrypt-btn">Decrypt</button>
              </div>
              {error && <div className="error-message">{error}</div>}
              {decryptedData !== null && (
                <div className="result-container">
                  <h2 className="result-title">Decrypted Data:</h2>
                  <pre className="result">{formatData(decryptedData)}</pre>
                  <button onClick={() => handleCopyData(decryptedData)} className="copy-btn">Copy Decrypted Data</button>
                </div>
              )}
              {encryptedData && (
                <div className="result-container">
                  <h2 className="result-title">Encrypted Data:</h2>
                  <pre className="result">{encryptedData.message}</pre>
                  <button onClick={() => handleCopyData(encryptedData.message)} className="copy-btn">Copy Encrypted Data</button>
                </div>
              )}
            </div>
          ) : <Navigate to='/login' replace />
        }
      />
    </Routes>
  );
}








// import { useState } from 'react';
// import { decrypt } from './decrypt';
// import { encrypt } from './encrypt';
// import {  Navigate, Route, Routes } from 'react-router-dom';
// import Login from './login';
// interface EncryptedData {
//   message: string;
// }

// export default function App() {
//   const [input, setInput] = useState('');
//   const [user,setUser] =useState('');
//   const [decryptedData, setDecryptedData] = useState<EncryptedData | null | any>(null);
//   const [encryptedData, setEncryptedData] = useState<EncryptedData | null | any>(null);

//   const handleDecrypt = () => {
//     if (!input) {
//       alert('Please enter the data to decrypt.');
//       return;
//     }

//     try {
//       const decrypted = decrypt(input);
//       setDecryptedData(decrypted);
//     } catch (error) {
//       console.error('Error decrypting data:', error);
//       alert('Error decrypting data. Please check your input.');
//     }
//   };

//   const handleEncrypt = () => {
//     if (!input) {
//       alert('Please enter the data to encrypt.');
//       return;
//     }

//     try {
//       const encrypted = encrypt(input);
//       setEncryptedData(encrypted);
//     } catch (error) {
//       console.error('Error encrypting data:', error);
//       alert('Error encrypting data. Please check your input.');
//     }
//   };

//   const handleCopyDecryptedData = () => {
//     if (decryptedData) {
//       navigator.clipboard.writeText(decryptedData.toString())
//         // navigator.clipboard.writeText(decryptedData.toString())
//         .then(() => alert('Data copied to clipboard'))
//         .catch(error => console.error('Error copying data:', error));
//     }
//   };
//   const handleCopyEncryptedData = () => {
//     if (encryptedData) {
//       navigator.clipboard.writeText(encryptedData.message)
//         .then(() => alert('Data copied to clipboard'))
//         .catch(error => console.error('Error copying data:', error));
//     }
//   };

//   return (
//       <Routes>
//         <Route path='/' element={<Navigate to='/login' replace />} />
//         <Route path='/login' element={<Login setUser={setUser}/>} />

//         <Route path='/decrypt-encrypt'
//           element={

//             user&&user !==''?<div className="container">
//             <h1 className="title">Encrypt/Decrypt Data</h1>
//             <div className="input-container">
//               <label htmlFor="dataInput" className="label">Enter Data to Encrypt/Decrypt:</label>
//               <input
//                 type="text"
//                 id="dataInput"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 className="input"
//               />
//             </div>
//             <button onClick={handleEncrypt} className="encrypt-btn">Encrypt</button>
//             <button onClick={handleDecrypt} className="decrypt-btn">Decrypt</button>
//             {decryptedData && (
//               <div className="result-container">
//                 <h2 className="result-title">Decrypted Data:</h2>
//                 {/* Add onClick handler to copy decrypted data */}
//                 <pre className="result" onClick={handleCopyDecryptedData} style={{ cursor: "pointer" }}>{decryptedData.toString()}</pre>
//               </div>
//             )}

//             {encryptedData && (
//               <div className="result-container">
//                 <h2 className="result-title">Encrypted Data:</h2>
//                 <pre className="result" onClick={handleCopyEncryptedData} style={{ cursor: "pointer" }}>{JSON.stringify(encryptedData, null, 2)}</pre>
//               </div>
//             )}
//           </div>:<Navigate to='/login' replace />}
//         />
//       </Routes>
//   );
// }
// import  { useState } from 'react';
// import { decrypt } from './decrypt';
// import { encrypt } from './encrypt';
// import { Navigate, Route, Routes } from 'react-router-dom';
// import Login from './login';

// interface EncryptedData {
//   message: string;
// }

// export default function App() {
//   const [input, setInput] = useState('');
//   const [user, setUser] = useState('');
//   const [decryptedData, setDecryptedData] = useState<string | null>(null);
//   const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);
//   const [error, setError] = useState('');

//   const handleDecrypt = () => {
//     if (!input) {
//       setError('Please enter the data to decrypt.');
//       return;
//     }

//     try {
//       const decrypted:any = decrypt(input);
//       setDecryptedData(decrypted);
//       setError('');
//     } catch (error) {
//       console.error('Error decrypting data:', error);
//       setError('Error decrypting data. Please check your input.');
//     }
//   };

//   const handleEncrypt = () => {
//     if (!input) {
//       setError('Please enter the data to encrypt.');
//       return;
//     }

//     try {
//       const encrypted = encrypt(input);
//       setEncryptedData(encrypted);
//       setError('');
//     } catch (error) {
//       console.error('Error encrypting data:', error);
//       setError('Error encrypting data. Please check your input.');
//     }
//   };

//   const handleCopyData = (data: string) => {
//     navigator.clipboard.writeText(data)
//       .then(() => alert('Data copied to clipboard'))
//       .catch(error => console.error('Error copying data:', error));
//   };

//   const formatJSON = (data: string): string => {
//     try {
//       const parsedData = JSON.parse(data);
//       return JSON.stringify(parsedData, null, 2);
//     } catch {
//       return data; // Return original data if it's not valid JSON
//     }
//   };

//   return (
//     <Routes>
//       <Route path='/' element={<Navigate to='/login' replace />} />
//       <Route path='/login' element={<Login setUser={setUser} />} />
//       <Route
//         path='/decrypt-encrypt'
//         element={
//           user && user !== '' ? (
//             <div className="container">
//               <h1 className="title">Encrypt/Decrypt Data</h1>
//               <div className="input-container">
//                 <label htmlFor="dataInput" className="label">Enter Data to Encrypt/Decrypt:</label>
//                 <textarea
//                   id="dataInput"
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   className="input"
//                   rows={5}
//                 />
//               </div>
//               <div className="button-container">
//                 <button onClick={handleEncrypt} className="encrypt-btn">Encrypt</button>
//                 <button onClick={handleDecrypt} className="decrypt-btn">Decrypt</button>
//               </div>
//               {error && <div className="error-message">{error}</div>}
//               {decryptedData && (
//                 <div className="result-container">
//                   <h2 className="result-title">Decrypted Data:</h2>
//                   <pre className="result">{formatJSON(decryptedData)}</pre>
//                   <button onClick={() => handleCopyData(formatJSON(decryptedData))} className="copy-btn">Copy Decrypted Data</button>
//                 </div>
//               )}
//               {encryptedData && (
//                 <div className="result-container">
//                   <h2 className="result-title">Encrypted Data:</h2>
//                   <pre className="result">{JSON.stringify(encryptedData, null, 2)}</pre>
//                   <button onClick={() => handleCopyData(JSON.stringify(encryptedData))} className="copy-btn">Copy Encrypted Data</button>
//                 </div>
//               )}
//             </div>
//           ) : <Navigate to='/login' replace />
//         }
//       />
//     </Routes>
//   );
// }
