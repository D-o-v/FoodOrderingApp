// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { signUp } from './api';
// import { toast } from 'react-toastify';

// interface SignUpProps {
//   setIsAuthenticated: (value: boolean) => void;
//   setUserType: (value: string) => void;
// }

// function SignUp({ setIsAuthenticated, setUserType }: SignUpProps) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       toast.info('Passwords do not match');
//       return;
//     }
//     try {
//       setLoading(true);
//       const { token, userType } = await signUp(username?.toLowerCase(), password);
//       sessionStorage.setItem('token', token);
//       sessionStorage.setItem('userType', userType);
//       setIsAuthenticated(true);
//       setUserType(userType);
//       navigate('/order');
//     } catch (error) {
//       toast.error('Sign up failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
//         <h2 className="text-2xl mb-4">Sign Up</h2>
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//         />
//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//         />
//         <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
//           {loading ? <span className="loading loading-spinner loading-md"></span> : "Sign Up"}
//         </button>
//         <p className="mt-4">
//           Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default SignUp;



















import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from './api';
import { toast } from 'react-toastify';

interface SignUpProps {
  setIsAuthenticated: (value: boolean) => void;
  setUserType: (value: string) => void;
}

function SignUp({ setIsAuthenticated, setUserType }: SignUpProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.info('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const { token, userType } = await signUp(username?.toLowerCase(), password);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userType', userType);
      setIsAuthenticated(true);
      setUserType(userType);
      navigate('/order');
    } catch (error) {
      toast.error('Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-50 p-4">
      <div className="max-w-md w-full backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/30 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">Create Your Account</h2>
          <p className="text-orange-100 text-center mt-2">Join us and start ordering delicious food</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300"
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign Up"
            )}
          </button>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Already have an account? <span className="underline">Login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
