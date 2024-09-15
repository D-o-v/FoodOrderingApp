import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  setUser: (username: string) => void;
  setCustomIV: (iv: string) => void;
  setCustomKey: (key: string) => void;
}

const Login: React.FC<LoginProps> = ({ setUser, setCustomIV, setCustomKey }) => {
  const defaultUsername = import.meta.env.VITE_USERNAME;
  const defaultPassword = import.meta.env.VITE_PASSWORD;
  const defaultIV = import.meta.env.VITE_IV;
  const defaultKey = import.meta.env.VITE_ENCRYPTION_KEY;

  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [iv, setIV] = useState('');
  const [key, setKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username?.toLowerCase() === defaultUsername && password?.toLowerCase() === defaultPassword) {
      setUser(username);
      if (useCustom) {
        setCustomIV(iv || defaultIV);
        setCustomKey(key || defaultKey);
      } else {
        setCustomIV(defaultIV);
        setCustomKey(defaultKey);
      }
      navigate('/decrypt-encrypt');
    } else {
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div className="loginbody">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
              />
              Use custom IV and Key
            </label>
          </div>
          {useCustom && (
            <>
              <div className="form-group">
                <label htmlFor="iv">Custom IV (optional):</label>
                <input
                  type="text"
                  id="iv"
                  value={iv}
                  onChange={(e) => setIV(e.target.value)}
                  placeholder="Leave blank to use default"
                />
              </div>
              <div className="form-group">
                <label htmlFor="key">Custom Key (optional):</label>
                <input
                  type="text"
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Leave blank to use default"
                />
              </div>
            </>
          )}
          <button type="submit">Login</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Login;























// // Login.js
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Import useHistory for redirection

// const Login = ({setUser}:any) => {
    
//   const name = import.meta.env.VITE_USERNAME
//   const pass = import.meta.env.VITE_PASSWORD
//   const navigate =useNavigate() // Create a history object for redirection
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleSubmit = (e:any) => {
//     e.preventDefault();
//     // Here you can add your login logic to validate the username and password
//     // For simplicity, let's assume the username is "user" and password is "password"
//     if (username?.toLowerCase() === name && password?.toLowerCase() === pass) {
//       // Successful login, redirect to DecryptEncrypt page
//       setUser(username)
//       navigate('/decrypt-encrypt');
//     } else {
//       // Invalid credentials
//       setErrorMessage('Invalid username or password');
//     }
//   };

//   return (
//     <div className="loginbody">
//     <div className="login-container">
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="username">Username:</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Login</button>
//       </form>
//       {errorMessage && <p className="error-message">{errorMessage}</p>}
//     </div>
//     </div>
//   );
// };

// export default Login;
