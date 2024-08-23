import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await login(username, password);
      sessionStorage.setItem('token', token);
      navigate('/make-order');
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl mb-4">Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Login
          </button>
          <p className="mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;






// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { login } from './api';

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();
//     try {
//       await login(username, password);
//       // Assuming login sets some sort of auth token or state
//       navigate('/make-order');
//     } catch (error) {
//       alert('Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="max-w-md w-full">
//         <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
//           <h2 className="text-2xl mb-4">Login</h2>
//           <input
//             type="text"
//             placeholder="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full p-2 mb-4 border rounded"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 mb-4 border rounded"
//           />
//           <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
//             Login
//           </button>
//           <p className="mt-4">
//             Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Login;