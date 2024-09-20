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
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Sign Up</h2>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {loading ? <span className="loading loading-spinner loading-md"></span> : "Sign Up"}
        </button>
        <p className="mt-4">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;


























// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { signUp } from './api';
// import { toast } from 'react-toastify';

// function SignUp({ setIsAuthenticated }:any) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       toast.info('Passwords do not match');
//       return;
//     }
//     try {
//       setLoading(true);
//       const { token } = await signUp(username, password);
//       sessionStorage.setItem('token', token);
//       setIsAuthenticated(true);
//       navigate('/order');
//     } catch (error) {
//       toast.error('Sign up failed');
//     }finally{
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
//         {loading?<span className="loading loading-spinner loading-md"></span>:"Sign Up"}
//         </button>
//         <p className="mt-4">
//           Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default SignUp;